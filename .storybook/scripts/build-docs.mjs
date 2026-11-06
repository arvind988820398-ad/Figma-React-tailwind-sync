#!/usr/bin/env node
// AD Design Kit Storybook docs builder.
//
//   node .storybook/scripts/build-docs.mjs [--check]
//
// Reads the same sources the ad-design-kit-figma-sync skill maintains:
//   .claude/skills/ad-design-kit-design-system/references/components.json      (Figma ⇄ React registry)
//   .claude/skills/ad-design-kit-design-system/references/components/*.md     (usage docs per component)
//   .claude/skills/ad-design-kit-design-system/references/tokens.md           (token usage notes)
//   .claude/skills/ad-design-kit-design-system/references/figma-audit.md      (open Figma inconsistencies)
//   .claude/skills/ad-design-kit-design-system/tokens/token-manifest.json     (resolved token values per mode)
//   .claude/skills/ad-design-kit-design-system/SKILL.md                       (rules + component chooser)
//   .claude/skills/ad-design-kit-compose/references/gaps.json                 (what screens need that Figma lacks)
//   src/features/*                                                            (app screens, via check-composition.mjs)
// and writes .storybook/generated/ad-design-kit-docs.ts, which the Storybook docs pages render.
// It also checks the React sources against the registry's prop maps and reports drift.
//
// --check:  exit 1 when the generated file is stale (run the build); drift is printed as a warning.
// --strict: with --check, also exit 1 when registry ↔ code drift was found.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const skill = path.join(root, '.claude', 'skills', 'ad-design-kit-design-system');
const refs = path.join(skill, 'references');
const uiDir = path.join(root, 'src', 'components', 'ui');
const outFile = path.join(here, '..', 'generated', 'ad-design-kit-docs.ts');
const check = process.argv.includes('--check');
const strict = process.argv.includes('--strict');

const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);

const registry = JSON.parse(read(path.join(refs, 'components.json')));
const manifest = JSON.parse(read(path.join(skill, 'tokens', 'token-manifest.json')));
const skillMd = read(path.join(skill, 'SKILL.md'));
const tokensMd = read(path.join(refs, 'tokens.md'));
const auditMd = read(path.join(refs, 'figma-audit.md'));

const fileKey = registry.fileKey || manifest.generatedFrom.fileKey;
const figmaUrl = (node) => `https://www.figma.com/design/${fileKey}/?node-id=${node.replace(':', '-')}`;

// ---------- markdown helpers ----------
const slug = (s) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-');

/** Split a markdown file into { intro, sections: [{ heading, slug, body }] } on `## ` headings. */
function sections(md) {
  const lines = md.split('\n');
  const out = { intro: [], sections: [] };
  let cur = null;
  for (const line of lines) {
    const m = /^## (.+)$/.exec(line);
    if (m) {
      cur = { heading: m[1].trim(), slug: slug(m[1]), body: [] };
      out.sections.push(cur);
    } else if (cur) cur.body.push(line);
    else out.intro.push(line);
  }
  // Drop the file's `# Title` line from the intro.
  out.intro = out.intro.filter((l) => !/^# /.test(l)).join('\n').trim();
  for (const s of out.sections) s.body = s.body.join('\n').trim();
  return out;
}

/** Extract the body of a `## Heading` section from a markdown string. */
function sectionBody(md, heading) {
  const s = sections(md).sections.find((x) => x.heading.startsWith(heading));
  return s ? s.body : '';
}

/** Parse a GFM table into rows of cells (without the header separator). */
function parseTable(md) {
  const rows = md.split('\n').filter((l) => l.trim().startsWith('|'));
  const cells = rows.map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
  return cells.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
}
const code = (s) => s.replace(/^`|`$/g, '');

// ---------- component docs ----------
const docFiles = {};
for (const f of fs.readdirSync(path.join(refs, 'components'))) {
  if (f.endsWith('.md')) docFiles[f] = sections(read(path.join(refs, 'components', f)));
}

/** Source text of the sibling files a component imports (one level), so shared unions resolve. */
function localImports(source) {
  const out = [];
  for (const m of source.matchAll(/from '\.\/([A-Za-z0-9_]+)'/g)) {
    for (const ext of ['.tsx', '.ts']) {
      const p = path.join(uiDir, m[1] + ext);
      if (exists(p)) { out.push(read(p)); break; }
    }
  }
  return out.join('\n');
}

const warnings = [];
const components = {};
const drift = [];

// Figma property names that are CSS states, not props.
for (const c of registry.components) {
  const [docFile, anchor] = (c.doc || '').split('#');
  const parsed = docFiles[docFile];
  const section = parsed?.sections.find((s) => s.slug === anchor || s.slug.startsWith(anchor));
  if (!section) warnings.push(`${c.react}: doc section "${c.doc}" not found`);
  let body = section?.body || '';
  // The first "Figma: …" line is metadata; show it separately.
  let figmaLine = '';
  const fl = /^Figma:\s*(.+)$/m.exec(body);
  if (fl) {
    figmaLine = fl[1].trim();
    body = body.replace(fl[0], '').trim();
  }
  const category = docFile.replace(/\.md$/, '');
  const templateFile = path.basename(c.template || `${c.react}.tsx`);
  const sourcePath = path.join(uiDir, templateFile);
  const source = exists(sourcePath) ? read(sourcePath) : null;
  const findings = [];
  if (!source) findings.push({ kind: 'missing-source', detail: `src/components/ui/${templateFile} not found` });

  // Drift: every Figma variant value the registry maps to a code value must be a member of that prop's
  // string-literal union in the React source (local imports such as FieldSize from Input.tsx are followed).
  const combined = source ? source + '\n' + localImports(source) : '';
  const resolveLiterals = (type) => {
    for (let hops = 0; hops < 3 && !/['"]/.test(type); hops++) {
      const id = /^([A-Za-z_][A-Za-z0-9_]*)/.exec(type)?.[1];
      const alias = id && new RegExp(`type ${id}(?:<[^>]*>)?\\s*=\\s*([^;\\n]+)`).exec(combined);
      if (!alias) return null; // ReactNode, generics, booleans: nothing to compare
      type = alias[1].trim();
    }
    return /['"]/.test(type) ? [...type.matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]) : null;
  };
  // All declarations of a prop (interfaces and one-line discriminated unions), merged into one literal set.
  const literalsFor = (prop) => {
    if (!combined) return null;
    if (prop === 'children') return null;
    const decls = [...combined.matchAll(new RegExp(`(?:^|[{;,(|])\\s*${prop}\\??:\\s*([^;,}\\n]+)`, 'gm'))];
    if (!decls.length) return undefined; // prop not declared at all
    const literals = new Set();
    let anyLiteral = false;
    for (const d of decls) {
      const found = resolveLiterals(d[1].trim());
      if (found) { anyLiteral = true; for (const v of found) literals.add(v); }
    }
    return anyLiteral ? literals : null;
  };
  const walk = (map, scope) => {
    for (const [figmaProp, m] of Object.entries(map || {})) {
      if (!m || typeof m !== 'object' || Array.isArray(m)) continue;
      const label = scope ? `${scope} › ${figmaProp}` : figmaProp;
      if (m.values && typeof m.values === 'object' && typeof m.prop === 'string') {
        const literals = literalsFor(m.prop);
        if (literals === undefined) findings.push({ kind: 'missing-prop', detail: `Figma "${label}" maps to prop \`${m.prop}\`, which ${templateFile} does not declare` });
        else if (literals)
          for (const [figmaValue, codeValue] of Object.entries(m.values)) {
            if (typeof codeValue !== 'string' || codeValue.startsWith('<') || /[\s=+]/.test(codeValue)) continue; // compositions, not literals
            if (!literals.has(codeValue)) findings.push({ kind: 'missing-value', detail: `Figma ${label}="${figmaValue}" maps to ${m.prop}="${codeValue}", which is not in the \`${m.prop}\` union of ${templateFile}` });
          }
      }
      const comps = typeof m.component === 'string' ? [m.component] : m.component && typeof m.component === 'object' ? Object.values(m.component) : [];
      for (const comp of comps) if (combined && !new RegExp(`(function|const)\\s+${comp}\\b`).test(combined)) findings.push({ kind: 'missing-export', detail: `${comp} (Figma "${label}") is not exported by ${templateFile}` });
      // Parts (e.g. TimepickerInput) nest their own prop maps.
      if (!('prop' in m) && !('values' in m) && !('css' in m) && !('component' in m)) walk(m, label);
    }
  };
  walk(c.propMap);

  const storyFile = path.join(uiDir, `${templateFile.replace(/\.tsx$/, '')}.stories.tsx`);
  // The Storybook title (Components/…), not the first `title:` in the file, which can be a story's sample data.
  const storySrc = exists(storyFile) ? read(storyFile) : '';
  const storyTitle = (/title:\s*'((?:Components|Foundations|Guides)\/[^']+)'/.exec(storySrc) || /title:\s*'([^']+)'/.exec(storySrc) || [])[1];
  if (!storyTitle) findings.push({ kind: 'missing-stories', detail: `${path.basename(storyFile)} not found or has no title` });

  for (const f of findings) drift.push({ component: c.react, ...f });

  components[c.react] = {
    react: c.react,
    category,
    figmaName: c.figmaName || c.react,
    node: c.node,
    page: c.page,
    figmaUrl: c.node ? figmaUrl(c.node) : undefined,
    pageUrl: c.page ? figmaUrl(c.page) : undefined,
    figmaLine,
    specVerified: !!c.specVerified,
    figmaVariants: c.figmaVariants || {},
    propMap: c.propMap || {},
    parts: c.parts || {},
    template: templateFile,
    storyTitle,
    doc: body,
    docHeading: section?.heading || c.react,
    drift: findings,
  };
}

// Registry entries without their own story file (Label, HelperText live in Input.tsx) attach to the host component's docs.
const hosts = {};
for (const entry of Object.values(components)) {
  const key = entry.template.replace(/\.tsx$/, '');
  (hosts[key] ||= []).push(entry);
}
const byStory = {};
for (const [key, entries] of Object.entries(hosts)) {
  const primary = entries.find((e) => e.react === key) || entries[0];
  const extras = entries.filter((e) => e !== primary);
  // De-duplicate extras pointing at the same doc section (Label + HelperText share one).
  const seen = new Set([primary.docHeading]);
  primary.extraDocs = [];
  for (const e of extras) {
    if (seen.has(e.docHeading)) continue;
    seen.add(e.docHeading);
    primary.extraDocs.push({ react: e.react, heading: e.docHeading, figmaLine: e.figmaLine, doc: e.doc, node: e.node, figmaUrl: e.figmaUrl });
  }
  primary.related = extras.map((e) => e.react);
  byStory[key] = primary;
}

const categoryIntro = Object.fromEntries(Object.entries(docFiles).map(([f, p]) => [f.replace(/\.md$/, ''), p.intro]));

// ---------- tokens ----------
const colorTables = {};
for (const [role, heading] of [['bg', 'Backgrounds'], ['text', 'Text & icons'], ['border', 'Borders']]) {
  const rows = parseTable(sectionBody(tokensMd, heading));
  colorTables[role] = rows.slice(1).map(([cls, use, light, dark]) => {
    const name = code(cls);
    const tok = manifest.tokens[name];
    return { cls: name, use, light, dark, cssVar: tok?.cssVar || `--adk-${name}`, values: tok?.values || {} };
  });
}
const radiusRows = parseTable(sectionBody(tokensMd, 'Radius'));
const radius = { themes: radiusRows[0].slice(1), rows: radiusRows.slice(1).map(([cls, ...v]) => ({ cls: code(cls), values: v.map(Number) })) };
const radiusNote = sectionBody(tokensMd, 'Radius').split('\n').filter((l) => !l.trim().startsWith('|')).join('\n').trim();
const shadows = parseTable(sectionBody(tokensMd, 'Shadows')).slice(1).map(([cls, use]) => ({ cls: cls.replace(/`/g, ''), use }));
// Typography mirrors the Figma page "📖 Typography" → "Font variables": one ### subsection per table.
const typographyMd = sectionBody(tokensMd, 'Typography');
const subsection = (title) => { const m = new RegExp('^### ' + title + '\\n([\\s\\S]*?)(?=^### |(?![\\s\\S]))', 'm').exec(typographyMd); return m ? m[1].trim() : ''; };
const rowsOf = (title) => parseTable(subsection(title)).slice(1);
const typography = {
  intro: typographyMd.split(/^### /m)[0].trim(),
  family: rowsOf('Font family').map(([figma, cls, use]) => ({ figma, cls: code(cls), use })),
  weights: rowsOf('Font weight').map(([figma, cls, use]) => ({ figma, cls: code(cls), use })),
  tracking: rowsOf('Letter spacing').map(([figma, cls, value, use]) => ({ figma, cls: code(cls), value, use })),
  sizes: rowsOf('Font size').map(([figma, cls, size, use]) => ({ figma, cls: code(cls), size, use })),
};
const typographyNote = subsection('Line height and text styles');
const fonts = Object.fromEntries(manifest.themes.map((t) => [t, manifest.tokens['font-base']?.values[`${t}-light`] || '']));
const pairingRule = (/^Pairing rule:(.+)$/m.exec(tokensMd) || [])[1]?.trim() || '';

// Token CSS drift: the app's copy must equal the skill's generated file.
const appCss = read(path.join(root, 'src', 'styles', 'ad-design-kit.css'));
const skillCss = read(path.join(skill, 'tokens', 'ad-design-kit.css'));
const cssInSync = appCss === skillCss;
if (!cssInSync) drift.push({ component: 'tokens', kind: 'css-out-of-date', detail: 'src/styles/ad-design-kit.css differs from the generated skill tokens — run `npm run tokens:build`' });
const cssStamp = (/Source: Figma (.+)$/m.exec(appCss) || [])[1] || '';

// ---------- guides ----------
const rules = sectionBody(skillMd, 'Non-negotiable rules');
const cheatSheet = sectionBody(skillMd, 'Token cheat sheet');
const choosing = sectionBody(skillMd, 'Choosing a component');
// "Code ahead of Figma" lives in references/code-ahead.json (rendered as its own table with statuses and screenshots);
// the other open sections of figma-audit.md stay Markdown.
const auditOpen = auditMd.split('\n## ').slice(1).filter((s) => !s.startsWith('Fixed in Figma') && !s.startsWith('Code ahead of Figma')).map((s) => '## ' + s).join('\n\n').trim();
const codeAheadFile = JSON.parse(read(path.join(refs, 'code-ahead.json')));
const statusOrder = { open: 0, 'in-figma': 1, done: 2 };
const codeAheadItems = [...codeAheadFile.items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || Number(b.num) - Number(a.num));

const auditFixed = sectionBody(auditMd, 'Fixed in Figma');

// ---------- app screens & gaps ----------
// Every folder under src/features is a screen. The compose checker reports what it is built from (AD Design Kit
// components and marked gaps) and anything made by hand, so the Figma sync page answers "is this all Figma components?".
const composeDir = path.join(root, '.claude', 'skills', 'ad-design-kit-compose');
const gaps = JSON.parse(read(path.join(composeDir, 'references', 'gaps.json'))).gaps;
const featuresDir = path.join(root, 'src', 'features');
// Export name → the component page that documents it (TableCell → Table, DropdownItem → Dropdown, Label → Input).
const exportHost = {};
for (const f of fs.readdirSync(uiDir).filter((f) => f.endsWith('.tsx') && !f.includes('.stories.'))) {
  const host = f.replace(/\.tsx$/, '');
  for (const m of read(path.join(uiDir, f)).matchAll(/export (?:const|function) ([A-Z]\w*)/g)) exportHost[m[1]] = byStory[host] ? host : undefined;
}
const screens = [];
if (exists(featuresDir)) {
  for (const dir of fs.readdirSync(featuresDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    const rel = `src/features/${dir}`;
    const run = spawnSync(process.execPath, [path.join(composeDir, 'scripts', 'check-composition.mjs'), path.join(root, rel), '--json'], { encoding: 'utf8', cwd: root });
    let result;
    try {
      result = JSON.parse(run.stdout);
    } catch {
      warnings.push(`could not check ${rel}: ${(run.stderr || run.stdout).trim().split('\n').pop()}`);
      continue;
    }
    const components = {};
    const marked = new Set();
    for (const { components: used, gaps: g } of Object.values(result.inventory)) {
      for (const [n, c] of Object.entries(used)) components[n] = (components[n] || 0) + c;
      for (const id of g) marked.add(id);
    }
    const findings = [...result.errors, ...result.warnings]
      .map((f) => ({ level: f.level, rule: f.rule, file: f.file.replace(`${rel}/`, ''), line: f.line, detail: f.detail }))
      .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
    screens.push({
      name: dir,
      path: rel,
      files: result.files,
      components: Object.entries(components).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count, docs: exportHost[name] ?? null })),
      handMade: findings.filter((f) => ['raw-control', 'custom-surface', 'style-override', 'new-ui-component'].includes(f.rule)).length,
      findings,
      gaps: [...marked].sort(),
    });
  }
}
// Where screens use each code-ahead variant: an opening JSX tag of the component that sets the prop (to the value, if given).
const openingTags = (src, name) => {
  const tags = [];
  const re = new RegExp(`<${name}(?=[\\s/>])`, 'g');
  for (let m; (m = re.exec(src)); ) {
    let depth = 0;
    let quote = '';
    let i = m.index + m[0].length;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (quote) { if (ch === quote) quote = ''; continue; }
      if (depth === 0 && (ch === '"' || ch === "'")) { quote = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === '>' && depth === 0) break;
    }
    tags.push(src.slice(m.index, i + 1));
  }
  return tags;
};
const featureFiles = exists(featuresDir)
  ? fs.readdirSync(featuresDir, { recursive: true }).filter((f) => String(f).endsWith('.tsx')).map((f) => path.join(featuresDir, String(f)))
  : [];
const usesVariant = (src, { component, prop, value }) =>
  openingTags(src, component).some((tag) => {
    const attr = new RegExp(`\\s${prop}(?=[\\s=/>])(=(?:"([^"]*)"|\\{["']([^"']*)["']\\}|\\{[^}]*\\}))?`).exec(tag);
    if (!attr) return false;
    return value === undefined || attr[2] === value || attr[3] === value;
  });
const codeAhead = {
  intro: 'Variants that exist in code because a product needed them first. The designer adds each to its Figma set, the next sync confirms it, and the row moves from open → in-figma → done. The list lives in `.claude/skills/ad-design-kit-design-system/references/code-ahead.json`.',
  rows: codeAheadItems.map((it) => {
    const files = featureFiles.filter((f) => (it.usage ?? []).some((u) => usesVariant(read(f), u)));
    const usedIn = [...new Set(files.map((f) => path.relative(root, f).split(path.sep).slice(0, 3).join('/')))].sort();
    const images = Object.fromEntries(Object.entries(it.images ?? {}).filter(([, f]) => exists(path.join(refs, f))));
    for (const f of Object.values(it.images ?? {})) if (!exists(path.join(refs, f))) warnings.push(`code-ahead.json names a missing image: references/${f}`);
    const { usage: _usage, images: _images, ...rest } = it;
    return { ...rest, usedIn, images };
  }),
};

const gapRows = gaps.map((g) => ({
  ...g,
  usedIn: screens.filter((sc) => sc.gaps.includes(g.id)).map((sc) => sc.path),
}));

// ---------- emit ----------
const data = {
  generatedAt: new Date().toISOString().slice(0, 10),
  fileKey,
  fileUrl: `https://www.figma.com/design/${fileKey}/`,
  registrySnapshotAt: registry.snapshotAt,
  tokens: {
    themesExportedAt: manifest.generatedFrom.themesExportedAt,
    primitivesExportedAt: manifest.generatedFrom.primitivesExportedAt,
    themes: manifest.themes,
    modes: manifest.modes,
    cssInSync,
    cssStamp,
    pairingRule,
    colors: colorTables,
    radius,
    radiusNote,
    shadows,
    typography,
    typographyNote,
    fonts,
  },
  guides: { rules, cheatSheet, choosing, auditOpen, auditFixed, codeAhead },
  categoryIntro,
  components: byStory,
  drift,
  screens,
  gaps: gapRows,
};

const header = `// GENERATED by .storybook/scripts/build-docs.mjs — do not edit by hand.
// Sources: AD Design Kit registry, component docs, token manifest and Figma audit under .claude/skills/ad-design-kit-design-system.
// Regenerate: npm run docs:build (runs automatically before \`npm run storybook\`).

export interface ADDesignKitDrift { component?: string; kind: string; detail: string }
export interface ADDesignKitScreen {
  name: string;
  path: string;
  files: number;
  /** docs = the Storybook component page that documents it (TableCell → Table). */
  components: { name: string; count: number; docs: string | null }[];
  handMade: number;
  findings: { level: string; rule: string; file: string; line: number; detail: string }[];
  gaps: string[];
}
export interface ADDesignKitGap { id: string; title: string; status: 'open' | 'in-figma' | 'done'; found: string; screen: string; reference: string; need: string; proposal: string; standIn: string; usedIn: string[]; images?: { figma?: string; code?: string }; source?: { issue: number; url: string; reportedBy: string; project: string; version: string } }
export interface ADDesignKitCodeAhead { id: string; num: string; title: string; status: 'open' | 'in-figma' | 'done'; found: string; closed?: string; component: string; figmaSet: string; node?: string; code: string; proposal: string; resolution?: string; addedFor?: string; usedIn: string[]; images: { figma?: string; code?: string } }
export interface ADDesignKitColorToken { cls: string; use: string; light: string; dark: string; cssVar: string; values: Record<string, string> }
export interface ADDesignKitExtraDoc { react: string; heading: string; figmaLine: string; doc: string; node?: string; figmaUrl?: string }
export interface ADDesignKitComponentDoc {
  react: string;
  category: string;
  figmaName: string;
  node?: string;
  page?: string;
  figmaUrl?: string;
  pageUrl?: string;
  figmaLine: string;
  specVerified: boolean;
  figmaVariants: Record<string, string[]>;
  propMap: Record<string, unknown>;
  parts: Record<string, string>;
  template: string;
  storyTitle?: string;
  doc: string;
  docHeading: string;
  drift: ADDesignKitDrift[];
  extraDocs: ADDesignKitExtraDoc[];
  related: string[];
}
export interface ADDesignKitDocs {
  generatedAt: string;
  fileKey: string;
  fileUrl: string;
  registrySnapshotAt: string;
  tokens: {
    themesExportedAt: string;
    primitivesExportedAt: string;
    themes: string[];
    modes: { figma: string; theme: string; scheme: string }[];
    cssInSync: boolean;
    cssStamp: string;
    pairingRule: string;
    colors: Record<'bg' | 'text' | 'border', ADDesignKitColorToken[]>;
    radius: { themes: string[]; rows: { cls: string; values: number[] }[] };
    radiusNote: string;
    shadows: { cls: string; use: string }[];
    typography: {
      intro: string;
      family: { figma: string; cls: string; use: string }[];
      weights: { figma: string; cls: string; use: string }[];
      tracking: { figma: string; cls: string; value: string; use: string }[];
      sizes: { figma: string; cls: string; size: string; use: string }[];
    };
    typographyNote: string;
    fonts: Record<string, string>;
  };
  guides: { rules: string; cheatSheet: string; choosing: string; auditOpen: string; auditFixed: string; codeAhead: { intro: string; rows: ADDesignKitCodeAhead[] } };
  categoryIntro: Record<string, string>;
  components: Record<string, ADDesignKitComponentDoc>;
  drift: ADDesignKitDrift[];
  screens: ADDesignKitScreen[];
  gaps: ADDesignKitGap[];
}

export const adDesignKitDocs: ADDesignKitDocs = `;

// Keep output stable across runs: generatedAt is the only date, and it only changes when content changes.
const previous = exists(outFile) ? read(outFile) : '';
const prevDate = (/"generatedAt": "([^"]+)"/.exec(previous) || [])[1];
// Gap screenshots (references/gaps/*.png next to gaps.json) are imported so Vite bundles them with the docs.
const gapImageVar = (id, kind) => `gap_${id.replace(/\W/g, '_')}_${kind}`;
const gapImageFiles = gapRows.flatMap((g) => Object.entries(g.images ?? {}).map(([kind, file]) => ({ id: g.id, kind, file })));
for (const { file } of gapImageFiles) if (!exists(path.join(composeDir, 'references', file))) warnings.push(`gaps.json names a missing image: references/${file}`);
const rel = (abs) => path.relative(path.dirname(outFile), abs).split(path.sep).join('/');
const aheadVar = (id, kind) => `codeAhead_${id.replace(/\W/g, '_')}_${kind}`;
const gapImports = [
  ...gapImageFiles.filter(({ file }) => exists(path.join(composeDir, 'references', file))).map(({ id, kind, file }) => `import ${gapImageVar(id, kind)} from '${rel(path.join(composeDir, 'references', file))}';`),
  ...codeAhead.rows.flatMap((r) => Object.entries(r.images).map(([kind, file]) => `import ${aheadVar(r.id, kind)} from '${rel(path.join(refs, file))}';`)),
];
const codeAheadImageMap =
  '\n/** Screenshots per "Code ahead of Figma" row (by its id in code-ahead.json): Figma today and the code that is ahead. */\nexport const adDesignKitCodeAheadImages: Record<string, { figma?: string; code?: string }> = {\n' +
  codeAhead.rows.filter((r) => Object.keys(r.images).length).map((r) => `  ${JSON.stringify(r.id)}: { ${Object.keys(r.images).map((k) => `${k}: ${aheadVar(r.id, k)}`).join(', ')} },`).join('\n') +
  '\n};\n';
const gapImageMap =
  '\n/** Screenshots per gap: the Figma reference and the stand-in as it renders. */\nexport const adDesignKitGapImages: Record<string, { figma?: string; code?: string }> = {\n' +
  gapRows
    .filter((g) => gapImageFiles.some((f) => f.id === g.id && exists(path.join(composeDir, 'references', f.file))))
    .map((g) => `  ${JSON.stringify(g.id)}: { ${Object.keys(g.images).filter((k) => exists(path.join(composeDir, 'references', g.images[k]))).map((k) => `${k}: ${gapImageVar(g.id, k)}`).join(', ')} },`)
    .join('\n') +
  '\n};\n';
const render = (d) => header.replace('\n\nexport interface ADDesignKitDrift', `\n${gapImports.length ? '\n' + gapImports.join('\n') : ''}\n\nexport interface ADDesignKitDrift`) + JSON.stringify(d, null, 2) + ';\n' + gapImageMap + codeAheadImageMap;
let output = render(data);
if (prevDate && render({ ...data, generatedAt: prevDate }) === previous) output = previous;

if (check) {
  const stale = output !== previous;
  if (stale) console.log('Storybook docs are stale — run `npm run docs:build`.');
  for (const d of drift) console.log(`drift  ${(d.component || '').padEnd(20)} ${d.kind.padEnd(16)} ${d.detail}`);
  for (const w of warnings) console.log(`warn   ${w}`);
  for (const sc of screens) console.log(`screen ${sc.path.padEnd(28)} ${sc.components.length} components · ${sc.handMade} hand-made · gaps: ${sc.gaps.join(', ') || 'none'}`);
  console.log(`${Object.keys(byStory).length} documented components · ${drift.length} drift finding(s)${drift.length && !strict ? ' (warning; pass --strict to fail)' : ''} · ${stale ? 'STALE' : 'up to date'}`);
  process.exit(stale || (strict && drift.length) ? 1 : 0);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, output);
console.log(`Wrote ${path.relative(root, outFile)} — ${Object.keys(byStory).length} components, ${Object.values(colorTables).flat().length} color tokens`);
for (const w of warnings) console.log('  warn: ' + w);
if (drift.length) {
  console.log(`${drift.length} drift finding(s) (shown in Storybook → Guides → Figma sync):`);
  for (const d of drift) console.log(`  - ${d.component}: ${d.detail}`);
} else console.log('No Figma ⇄ code drift found.');
for (const sc of screens) console.log(`Screen ${sc.path}: ${sc.components.length} AD Design Kit components · ${sc.handMade} hand-made · gaps: ${sc.gaps.join(', ') || 'none'}`);
const openGaps = gapRows.filter((g) => g.status !== 'done');
if (openGaps.length) console.log(`${openGaps.length} open gap(s) for Figma: ${openGaps.map((g) => g.id).join(', ')}`);
