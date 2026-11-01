#!/usr/bin/env node
// AD Design Kit composition checker: proves a screen was composed from existing components only.
//
//   node check-composition.mjs <file-or-dir>... [--json]
//
// Besides the findings it prints what each file is built from (the AD Design Kit components it renders and the gaps it
// marks), so a report can show "components only" as a fact instead of a claim. --json returns the same as
// { files, errors, warnings, inventory: { <file>: { components: { Button: 3, … }, gaps: ['tinted-summary'] } } };
// Storybook → Guides → Figma sync renders it for every screen under src/features.
//
// Errors (exit 1):
//   raw-control        <button>/<input>/<select>/<textarea>/<dialog>/<table…>/<details>/<progress>/<datalist>/<svg>
//                      written by hand → use Button, Input, Select, Textarea, Modal/Drawer, Table, Accordion, Progress,
//                      Autocomplete, the Figma icons
//   custom-surface     a plain element (div, section, dl, span, a…) styled to look like a component: a background
//                      (bg-*), a shadow, or a rounded full border. That is a Card, Alert, Badge… drawn by hand. Use the
//                      component, or record a gap (references/gaps.json) and mark the stand-in. Dividers (border-t…),
//                      text colours, focus rings, the page background (bg-neutral-primary) and the dashed
//                      "Needs AD Design Kit component" placeholder are fine.
//   unknown-gap        `// ad-design-kit-gap: <id>` names a gap that is not in references/gaps.json
//   new-ui-component   a file under src/components/ui that is not in the AD Design Kit registry
//   style-override     className on an AD Design Kit component that changes its look (bg-, text colour/size, padding, height,
//                      radius, shadow, font, hover:) — a component in disguise; only layout utilities may be passed
//   inline-typography  style={{ fontFamily | fontSize | fontWeight | lineHeight | letterSpacing }} — the theme owns type
//   font-import        a font loaded from feature code (Google Fonts link, @font-face, font CSS import); only index.html
//                      loads the theme fonts
//   token              findings from the AD Design Kit token linter (ad-design-kit-review/scripts/lint-tokens.mjs)
// Warnings:
//   variant-map        a `Record<…, string>` of Tailwind classes in feature code — usually a component in disguise
//   foreign-import     a component imported from somewhere other than components/ui, components/icons or lib
//
// A line may carry `// ad-design-kit-compose-allow: <reason>` to silence a false positive on a layout element. It is
// not for controls: a hand-rolled button stays a hand-rolled button whatever the comment says.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skills = path.resolve(here, '..', '..');
const root = path.resolve(skills, '..', '..');
const argv = process.argv.slice(2);
const json = argv.includes('--json');
const targets = argv.filter((a) => !a.startsWith('--'));
if (!targets.length) {
  console.error('usage: check-composition.mjs <file-or-dir>... [--json]');
  process.exit(2);
}

const registry = JSON.parse(fs.readFileSync(path.join(skills, 'ad-design-kit-design-system', 'references', 'components.json'), 'utf8'));
const registryFiles = new Set(registry.components.map((c) => path.basename(c.template || `${c.react}.tsx`)));

const files = [];
const walk = (p) => {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const e of fs.readdirSync(p, { withFileTypes: true })) {
      if (/node_modules|dist|\.git|storybook-static/.test(e.name)) continue;
      walk(path.join(p, e.name));
    }
  } else if (/\.(tsx|jsx|css)$/.test(p)) files.push(p);
};
for (const t of targets) walk(path.resolve(t));

const findings = [];
const inventory = {};
const add = (level, rule, file, line, detail) => findings.push({ level, rule, file: path.relative(root, file), line, detail });

const RAW = /<(button|input|select|textarea|dialog|table|thead|tbody|tfoot|tr|th|td|details|summary|progress|meter|datalist|svg)\b/;
const gaps = JSON.parse(fs.readFileSync(path.join(here, '..', 'references', 'gaps.json'), 'utf8')).gaps;
const gapIds = new Set(gaps.map((g) => g.id));
const GAP = /ad-design-kit-gap:\s*([a-z0-9-]+)/g;
const PLACEHOLDER = /Needs AD Design Kit component/;

/** Classes on a plain element that draw a surface: fills, shadows (not focus rings) and rounded full borders. */
function surfaceClasses(classes) {
  const base = (c) => c.replace(/^(?:[a-z0-9-]+:)+/, '');
  const bases = classes.map(base);
  const rounded = bases.some((b) => /^rounded/.test(b));
  const fullBorder = bases.some((b) => /^border(-[0-9])?$/.test(b));
  return classes.filter((c, i) => {
    const b = bases[i];
    // bg-neutral-primary is the page background (cheat sheet), set once on the app or page root.
    if (/^bg-/.test(b)) return b !== 'bg-neutral-primary' && !/^bg-(transparent|none|clip|origin|fixed|local|scroll|cover|contain|center|repeat|no-repeat)/.test(b);
    if (/^shadow/.test(b)) return b !== 'shadow-none' && !/^shadow-focus/.test(b);
    return rounded && fullBorder && (/^rounded/.test(b) || /^border(-[0-9])?$/.test(b));
  });
}
// className tokens that only place or size a component in the layout. Everything else restyles it.
const LAYOUT_OK =
  /^(-?)(w-|min-w-|max-w-|h-full$|h-dvh$|h-screen$|min-h-|max-h-|flex|grid|col-|row-|gap-|m[xytblrse]?-|self-|shrink|grow|basis-|justify-|items-|content-|order-|hidden$|block$|inline|sr-only$|overflow-|sticky$|relative$|absolute$|fixed$|inset-|top-|bottom-|start-|end-|z-|truncate$|text-(start|end|center|wrap|nowrap|ellipsis)$|whitespace-|border-[tbse]$|border-default|divide-|place-|aspect-|(sm|md|lg|xl|2xl):)/;

/** Components imported from src/components/ui in this file, e.g. { Button, Input }. */
function uiComponents(src) {
  const names = new Set();
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*'[^']*components\/ui\/[^']+'/g)) {
    for (const part of m[1].split(',')) {
      const name = part.replace(/^\s*type\s+/, '').split(/\s+as\s+/).pop().trim();
      if (/^[A-Z]/.test(name)) names.add(name);
    }
  }
  return names;
}

/** `const headCell = 'bg-dark text-white'` style aliases, so classes hidden behind a variable are still seen. */
function stringConsts(src) {
  const map = new Map();
  for (const m of src.matchAll(/\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(?:cn\()?\s*(['"`])([\s\S]*?)\2/g)) map.set(m[1], m[3]);
  return map;
}

/** Splits a JSX opening tag's attribute text into its own props: [{ name, value }], value = raw `"…"` or `{…}` text. */
function topLevelProps(attrs) {
  const props = [];
  let i = 0;
  while (i < attrs.length) {
    const m = /^\s*([A-Za-z_$][\w$-]*)\s*=\s*/.exec(attrs.slice(i));
    if (!m) { i++; continue; }
    i += m[0].length;
    let value = '';
    if (attrs[i] === '"' || attrs[i] === "'") {
      const q = attrs[i];
      const end = attrs.indexOf(q, i + 1);
      value = attrs.slice(i, end + 1);
      i = end + 1;
    } else if (attrs[i] === '{') {
      let depth = 0, quote = null, j = i;
      for (; j < attrs.length; j++) {
        const ch = attrs[j];
        if (quote) { if (ch === quote && attrs[j - 1] !== '\\') quote = null; continue; }
        if (ch === '"' || ch === "'" || ch === '`') quote = ch;
        else if (ch === '{') depth++;
        else if (ch === '}' && --depth === 0) break;
      }
      value = attrs.slice(i, j + 1);
      i = j + 1;
    }
    props.push({ name: m[1], value });
  }
  return props;
}

/** Yields { name, line, classes, index } for every tag accepted by `want` that has a className (or *ClassName) prop. */
function* tagClassNames(src, want) {
  const consts = stringConsts(src);
  const re = /<([A-Za-z][A-Za-z0-9]*)\b/g;
  let m;
  while ((m = re.exec(src))) {
    if (!want(m[1])) continue;
    // Walk to the end of the opening tag, honouring {…} and quotes.
    let i = re.lastIndex, depth = 0, quote = null;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (quote) { if (ch === quote && src[i - 1] !== '\\') quote = null; continue; }
      if (ch === '"' || ch === "'" || ch === '`') quote = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === '>' && depth === 0) break;
    }
    const attrs = src.slice(re.lastIndex, i);
    // className and any *ClassName prop (containerClassName, wrapperClassName…) are style surfaces. Only the tag's own
    // top-level props count: JSX nested inside another prop (header={<a className=…>}) belongs to that element.
    let literal = '';
    for (const { name: prop, value } of topLevelProps(attrs)) {
      if (!/[cC]lassName$/.test(prop)) continue;
      literal += ' ' + [...value.matchAll(/['"`]([^'"`]*)['"`]/g)].map((x) => x[1]).join(' ');
      for (const id of value.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) if (consts.has(id[1])) literal += ' ' + consts.get(id[1]);
    }
    if (!literal.trim()) continue;
    yield { name: m[1], line: src.slice(0, m.index).split('\n').length, classes: literal.split(/\s+/).filter(Boolean), index: m.index };
  }
}
const ALLOW = /ad-design-kit-compose-allow:/;
const VARIANT_MAP = /Record<[^>]+,\s*string>\s*=\s*\{/;
const INLINE_TYPE = /\b(fontFamily|fontSize|fontWeight|lineHeight|letterSpacing)\s*:/;
const FONT_IMPORT = /fonts\.googleapis\.com|fonts\.gstatic\.com|@font-face|@import\s+url\([^)]*font|\.(woff2?|ttf|otf)["']/i;
const IMPORT = /import\s+(?:[\w{},\s*]+)\s+from\s+'([^']+)'/g;

for (const file of files) {
  const rel = path.relative(root, file);
  const src = fs.readFileSync(file, 'utf8');
  const isStory = /\.stories\.(tsx|jsx)$/.test(file);
  if (file.endsWith('.css')) {
    src.split('\n').forEach((line, i) => {
      if (/\bfont-family\s*:/.test(line) && !/var\(--adk-font-base\)/.test(line)) add('error', 'inline-typography', file, i + 1, 'font-family in feature CSS; the theme token --adk-font-base is the only font source.');
      if (FONT_IMPORT.test(line)) add('error', 'font-import', file, i + 1, 'font loaded from feature CSS; only index.html loads the theme fonts.');
    });
    continue;
  }
  const inUi = rel.split(path.sep).join('/').includes('src/components/ui/');

  if (inUi && !isStory && !registryFiles.has(path.basename(file))) {
    add('error', 'new-ui-component', file, 1, `${path.basename(file)} is not an AD Design Kit registry component. New components start in Figma, then ad-design-kit-figma-sync section B.`);
    continue;
  }
  if (inUi) continue; // the system's own components legitimately contain raw elements

  src.split('\n').forEach((line, i) => {
    if (ALLOW.test(line)) return;
    const m = RAW.exec(line);
    if (m) add('error', 'raw-control', file, i + 1, `<${m[1]}> written by hand — use the AD Design Kit component (${hint(m[1])}).`);
    if (INLINE_TYPE.test(line) && /style\s*=|\bstyle\b\s*:/.test(src.slice(Math.max(0, src.indexOf(line) - 200), src.indexOf(line) + line.length))) {
      add('error', 'inline-typography', file, i + 1, 'inline font style; the theme sets the family and the classes text-xxs…6xl / font-normal…extrabold set size and weight.');
    }
    if (FONT_IMPORT.test(line)) add('error', 'font-import', file, i + 1, 'font loaded from feature code; only index.html loads the theme fonts (see setup.md).');
    if (VARIANT_MAP.test(line) && /(bg|text|border|rounded|shadow)-/.test(src.slice(src.indexOf(line), src.indexOf(line) + 600))) {
      add('warning', 'variant-map', file, i + 1, 'Record<…, string> of Tailwind classes: this looks like a component variant map living outside components/ui.');
    }
  });

  const names = uiComponents(src);
  const lines = src.split('\n');
  const allowed = (line) => ALLOW.test(lines[line - 1] || '') || ALLOW.test(lines[line - 2] || '');
  for (const { name, line, classes } of tagClassNames(src, (n) => names.has(n))) {
    const bad = classes.filter((c) => !LAYOUT_OK.test(c));
    if (bad.length) add('error', 'style-override', file, line, `<${name} className="…${bad.join(' ')}…"> restyles a system component. Use a variant or prop, keep only layout utilities, or report a gap.`);
  }
  for (const { name, line, classes, index } of tagClassNames(src, (n) => /^[a-z]/.test(n))) {
    const bad = surfaceClasses(classes);
    if (!bad.length || allowed(line) || PLACEHOLDER.test(src.slice(index, index + 400))) continue;
    add('error', 'custom-surface', file, line, `<${name} className="…${bad.join(' ')}…"> draws its own surface — a component made by hand. Use Card / Alert / Badge / … or record a gap and mark the stand-in.`);
  }

  // What the file is built from: rendered AD Design Kit components and the gaps it marks.
  const used = {};
  for (const n of names) {
    const count = (src.match(new RegExp(`<${n}\\b`, 'g')) || []).length;
    if (count) used[n] = count;
  }
  const marked = [...new Set([...src.matchAll(GAP)].map((g) => g[1]))];
  for (const id of marked) if (!gapIds.has(id)) add('error', 'unknown-gap', file, 1, `ad-design-kit-gap: ${id} is not in ad-design-kit-compose/references/gaps.json — record the gap there first.`);
  if (!isStory) inventory[path.relative(root, file)] = { components: used, gaps: marked };

  for (const m of src.matchAll(IMPORT)) {
    const spec = m[1];
    if (!spec.startsWith('.')) continue;
    const resolved = path.resolve(path.dirname(file), spec).split(path.sep).join('/');
    const ok = /\/src\/components\/ui\//.test(resolved) || /\/src\/components\/icons/.test(resolved) || /\/src\/lib\//.test(resolved) || resolved.startsWith(path.dirname(file).split(path.sep).join('/'));
    if (!ok && /\/components\//.test(resolved)) add('warning', 'foreign-import', file, 1, `imports ${spec}; screens compose from src/components/ui only.`);
  }
}

// Token linter from the review skill (it already knows every semantic class).
const lint = spawnSync(process.execPath, [path.join(skills, 'ad-design-kit-review', 'scripts', 'lint-tokens.mjs'), ...targets, '--json'], { encoding: 'utf8' });
let tokenCount = 0;
try {
  const parsed = JSON.parse(lint.stdout);
  const list = Array.isArray(parsed) ? parsed : parsed.findings || parsed.results || [];
  for (const f of list) {
    if ((f.severity || f.level) === 'error' || f.severity === undefined) {
      tokenCount++;
      add('error', 'token', path.resolve(root, f.file || ''), f.line || 1, f.message || JSON.stringify(f));
    }
  }
} catch {
  // Older linter output: fall back to its exit code and text.
  if (lint.status && lint.status !== 0) {
    tokenCount++;
    add('error', 'token', path.resolve(root, targets[0]), 1, (lint.stdout || lint.stderr || '').trim().split('\n').slice(-1)[0]);
  }
}

const errors = findings.filter((f) => f.level === 'error');
const warnings = findings.filter((f) => f.level === 'warning');
if (json) console.log(JSON.stringify({ files: files.length, errors, warnings, inventory }, null, 2));
else {
  for (const f of findings) console.log(`${f.level === 'error' ? 'ERROR' : 'warn '}  ${f.rule.padEnd(17)} ${f.file}:${f.line}  ${f.detail}`);
  // Built from: the evidence for "composed from AD Design Kit components only".
  const totals = {};
  for (const { components } of Object.values(inventory)) for (const [n, c] of Object.entries(components)) totals[n] = (totals[n] || 0) + c;
  const marked = [...new Set(Object.values(inventory).flatMap((i) => i.gaps))];
  const handMade = findings.filter((f) => ['raw-control', 'custom-surface', 'style-override', 'new-ui-component'].includes(f.rule)).length;
  console.log(`\nBuilt from ${Object.keys(totals).length} AD Design Kit components: ${Object.entries(totals).sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n} ×${c}`).join(', ') || 'none'}`);
  console.log(`Hand-made controls or surfaces: ${handMade}`);
  console.log(`Gaps marked in code: ${marked.length ? marked.map((id) => `${id} (${gaps.find((g) => g.id === id)?.status ?? 'unknown'})`).join(', ') : 'none'}`);
  console.log(`\n${files.length} file(s) · ${errors.length} error(s) · ${warnings.length} warning(s)${tokenCount ? ` · ${tokenCount} from the token linter` : ''}`);
  if (!errors.length) console.log('Composition OK: no hand-rolled controls or surfaces, no new components, tokens clean.');
}
process.exit(errors.length ? 1 : 0);

function hint(tag) {
  return {
    button: 'Button, or buttonVariants() on an <a> for navigation',
    input: 'Input / SearchInput / NumberInput / Checkbox / Radio / Toggle',
    select: 'Select or Autocomplete',
    textarea: 'Textarea',
    dialog: 'Modal or Drawer',
    table: 'Table', thead: 'TableHead', tbody: 'TableBody', tfoot: 'TableBody', tr: 'TableRow', th: 'TableHeaderCell', td: 'TableCell',
    details: 'Accordion', summary: 'Accordion', progress: 'Progress', meter: 'Progress',
    datalist: 'Autocomplete', svg: 'an icon from src/components/icons (a missing icon is a gap: add it to the Figma Icons page)',
  }[tag] || 'the matching AD Design Kit component';
}
