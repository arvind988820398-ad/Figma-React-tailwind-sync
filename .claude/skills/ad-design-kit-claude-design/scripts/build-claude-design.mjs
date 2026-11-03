#!/usr/bin/env node
// Producer for the AD Design Kit design system in Claude Design (an artifact of the "Design System" type).
// Rebuilds every file the repository owns from the same sources as the code and Storybook, compares each with the
// published copy, and writes only what changed — so a sync never touches what people edited in Claude Design.
//
//   node build-claude-design.mjs --out <dir> --live <dir> [--listing <file>] [--state <file>]
//
//   --live   a folder holding the published files at their system paths (project/tokens.json,
//            project/components/<Comp>/README.md, …), downloaded with the Artifact tool's `read`
//   --out    where to write; the changed files land at <out>/project/<path>, icons to upload at
//            <out>/project/assets/<Group>/<file>, and <out>/plan.json says what to publish
//   --state  the last sync's record (default: ../state.json): which hashes this producer published, so a file whose
//            live copy differs from it was edited in Claude Design and is reported instead of overwritten
//
// Owned (rebuilt) — tokens.json values (usage notes kept), tokens.css, components/bundle.js · bundle.css ·
// index.d.ts, components/<Comp>/README.md, assets/Icons/README.md, icon and logo SVGs.
// Kept as published — README.md (brand book), components/Cover, existing previews, components/lib, usage notes.
// New components get a preview; components no longer in the registry are listed, never deleted.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skill = path.resolve(here, '..');
const root = path.resolve(skill, '../../..');
const ds = path.join(root, '.claude/skills/ad-design-kit-design-system');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : fallback;
};
const outDir = path.resolve(arg('out', ''));
const liveDir = path.resolve(arg('live', ''));
const statePath = path.resolve(arg('state', path.join(skill, 'state.json')));

// --status: is Claude Design behind the code? Compares the last synced commit with HEAD on the paths the system is
// built from. Exit 0 = in sync, 1 = behind (lists the changed paths), 2 = never synced from this repository.
if (process.argv.includes('--status')) {
  if (!fs.existsSync(statePath)) {
    console.log('Claude Design: never synced from this repository (no state.json). Run the ad-design-kit-claude-design skill.');
    process.exit(2);
  }
  const st = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const sha = st.ref.split('@')[1];
  const paths = ['src/components', 'src/styles', 'src/assets/logos', 'public/logo-mark.svg', '.claude/skills/ad-design-kit-design-system', '.storybook/generated', '.storybook/ad-design-kit/figma.ts'];
  const run = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' }).stdout.trim();
  const committed = run('diff', '--name-only', `${sha}..HEAD`, '--', ...paths).split('\n').filter(Boolean);
  const pending = run('status', '--porcelain', '--', ...paths).split('\n').filter(Boolean).map((l) => l.slice(3));
  if (!committed.length && !pending.length) {
    console.log(`Claude Design is in sync with the code (${st.ref}, synced ${st.syncedAt.slice(0, 10)}): ${st.url}`);
    process.exit(0);
  }
  console.log(`Claude Design is BEHIND the code: last synced ${st.ref} on ${st.syncedAt.slice(0, 10)} (${st.url}).`);
  if (committed.length) console.log(`  ${committed.length} changed file(s) since then:\n${committed.slice(0, 20).map((f) => '    ' + f).join('\n')}${committed.length > 20 ? '\n    …' : ''}`);
  if (pending.length) console.log(`  ${pending.length} uncommitted change(s) in those paths (commit before syncing).`);
  console.log('  Run the ad-design-kit-claude-design skill to sync.');
  process.exit(1);
}

// --finalize: after the files were published and the assets uploaded. Writes the index to publish LAST
// (<out>/project/design-system.json: upload records merged, lastChange set, every other key kept) and the state.
//   node build-claude-design.mjs --finalize --out <dir> --live <dir> --url <system url> --by "<name>" [--uploads <json>]
//   --uploads: {"<plan upload key>": {"blob": "<id from /_blob/<id>>", "size": <bytes>}}
if (process.argv.includes('--finalize')) {
  const plan = JSON.parse(fs.readFileSync(path.join(outDir, 'plan.json'), 'utf8'));
  const index = JSON.parse(fs.readFileSync(path.join(liveDir, 'project/design-system.json'), 'utf8'));
  if (!index.createdOnFiles && !index.convertedFrom) throw new Error('design-system.json has no createdOnFiles/convertedFrom marker: not a system index, refusing to write it');
  const uploads = arg('uploads') ? JSON.parse(fs.readFileSync(path.resolve(arg('uploads')), 'utf8')) : {};
  for (const u of plan.uploads) {
    const done = uploads[u.key];
    if (!done) throw new Error(`no upload result for ${u.key}`);
    const grp = (index.assetGroups[u.group] ||= { name: u.group, tile: u.group === 'Icons' ? 'xs' : 'l', order: [], files: {} });
    grp.files[u.name] = { name: u.name, blob: done.blob, size: done.size, type: 'image/svg+xml' };
    if (!grp.order.includes(u.name)) grp.order.push(u.name);
    if (!index.groups.includes(u.group)) index.groups.push(u.group);
  }
  const parts = [];
  if (plan.changed.length) parts.push(`${plan.changed.length} file${plan.changed.length > 1 ? 's' : ''}`);
  if (plan.uploads.length) parts.push(`${plan.uploads.length} asset${plan.uploads.length > 1 ? 's' : ''}`);
  index.lastChange = { by: arg('by', 'Claude'), at: new Date().toISOString(), via: `GitHub · ${spawnSync('git', ['config', '--get', 'remote.origin.url'], { cwd: root, encoding: 'utf8' }).stdout.trim().replace(/^.*github\.com[:/]|\.git$/g, '')}@${plan.ref.split('@')[1]}`, note: `Re-synced from the code to ${plan.ref}: ${parts.join(', ') || 'no changes'}` };
  fs.mkdirSync(path.join(outDir, 'project'), { recursive: true });
  fs.writeFileSync(path.join(outDir, 'project/design-system.json'), JSON.stringify(index, null, 2) + '\n');
  const state = { url: arg('url'), ref: plan.ref, syncedAt: index.lastChange.at, files: plan.fileHashes, assets: plan.assetHashes };
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
  console.log(`Index written to ${path.join(outDir, 'project/design-system.json')} (publish it LAST); state saved to ${path.relative(root, statePath)}.`);
  process.exit(0);
}
if (!arg('out') || !arg('live')) {
  console.error('usage: build-claude-design.mjs --out <dir> --live <dir> [--listing <file>] [--state <file>]');
  process.exit(2);
}

const read = (p) => fs.readFileSync(p, 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const live = (p) => {
  const f = path.join(liveDir, 'project', p);
  return fs.existsSync(f) ? read(f) : null;
};
// --listing: the published paths (one per line, as the Artifact tool's files listing prints them), so the producer
// knows which previews exist without downloading them all.
const listing = arg('listing') ? new Set(read(path.resolve(arg('listing'))).split('\n').map((l) => l.trim().replace(/^- "?|"?\s.*$/g, '')).filter(Boolean)) : null;
const published = (p) => (listing ? listing.has(`project/${p}`) : live(p) !== null);
const state = fs.existsSync(statePath) ? JSON.parse(read(statePath)) : { files: {}, assets: {} };
const NS = 'ADDesignKit';
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' }).stdout.trim();
const ref = `${git('rev-parse', '--abbrev-ref', 'HEAD')}@${git('rev-parse', '--short', 'HEAD')}`;
const dirty = git('status', '--porcelain', '--', 'src', '.claude/skills/ad-design-kit-design-system', '.storybook') !== '';

// ---------- sources ----------
const registry = JSON.parse(read(path.join(ds, 'references/components.json'))).components;
const docsTs = read(path.join(root, '.storybook/generated/ad-design-kit-docs.ts'));
const docs = JSON.parse(docsTs.slice(docsTs.indexOf('= {') + 2).replace(/;\s*$/, ''));
const tokenCss = read(path.join(root, 'src/styles/ad-design-kit.css'));
const icons = JSON.parse(read(path.join(ds, 'icons/figma-icons.json'))).icons;
const categoryLabels = Object.fromEntries(
  [...read(path.join(root, '.storybook/ad-design-kit/figma.ts')).matchAll(/'?([a-z-]+)'?:\s*'([^']+)'/g)].map((m) => [m[1], m[2]]),
);

const outputs = {}; // system path → text
const plan = { ref, dirty, changed: [], unchanged: [], editedInClaudeDesign: [], newComponents: [], removedComponents: [], uploads: [], removedAssets: [], notes: [] };

// ---------- tokens.json: values from the repository, usage notes from Claude Design ----------
/** `--adk-name: value;` declarations of the CSS block whose selector list starts with `selector`. */
function block(selectorStart) {
  const i = tokenCss.indexOf(selectorStart);
  if (i < 0) throw new Error(`token CSS has no block for ${selectorStart}`);
  const body = tokenCss.slice(tokenCss.indexOf('{', i) + 1, tokenCss.indexOf('}', i));
  return Object.fromEntries([...body.matchAll(/--adk-([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}
const primitives = block('/* ---------- Primitives');
const modes = {
  modern: block('/* Modern (light) */'),
  'modern-dark': block('/* Modern (dark) */'),
  enterprise: block('/* Enterprise (light) */'),
  'enterprise-dark': block('/* Enterprise (dark) */'),
};
const NON_COLOR = /^(rounded|text-xxs|font-base)/;
const liveTokens = JSON.parse(live('tokens.json') || '{}');
const usageOf = new Map();
for (const fam of Object.values(liveTokens)) for (const t of fam?.tokens || []) usageOf.set(t.name, t.usage);
for (const g of liveTokens.type?.groups || []) for (const s of g.styles) usageOf.set(`type:${g.name}:${s.name}`, s.usage);
const alias = (v) => {
  const m = /^var\(--adk-([\w-]+)\)$/.exec(v);
  return m ? `{adk-${m[1]}}` : v.toLowerCase();
};
const colorTokens = [];
for (const [name, value] of Object.entries(primitives)) {
  colorTokens.push({ name: `adk-${name}`, value: value.toLowerCase(), usage: usageOf.get(`adk-${name}`) ?? `Primitive \`${name.replace(/-(\d+|alpha-\d+)$/, '/$1')}\` from the Figma Primitives collection. Never use it directly in UI: reference it through a semantic \`adk-bg-*\`, \`adk-text-*\` or \`adk-border-*\` token so themes and dark mode keep working.` });
}
for (const name of Object.keys(modes.modern).filter((n) => !NON_COLOR.test(n))) {
  const value = Object.fromEntries(Object.entries(modes).map(([id, decl]) => [id, alias(decl[name] ?? modes.modern[name])]));
  const per = Object.entries(value).map(([id, v]) => `${id}: ${v.replace(/^\{adk-|\}$/g, '')}`).join(' · ');
  colorTokens.push({ name: `adk-${name}`, value, usage: usageOf.get(`adk-${name}`) ?? `Tailwind class \`${name}\`. Per theme: ${per}.` });
}
// Keep the published order (people may have arranged it); new tokens go at the end of their kind.
const liveOrder = (liveTokens.color?.tokens || []).map((t) => t.name);
colorTokens.sort((a, b) => {
  const ia = liveOrder.indexOf(a.name), ib = liveOrder.indexOf(b.name);
  return (ia < 0 ? 1e6 : ia) - (ib < 0 ? 1e6 : ib);
});
const removedTokens = liveOrder.filter((n) => !colorTokens.some((t) => t.name === n));
if (removedTokens.length) plan.notes.push(`Colour tokens no longer in the code (kept, ask before removing): ${removedTokens.join(', ')}`);
for (const n of removedTokens) colorTokens.push(liveTokens.color.tokens.find((t) => t.name === n));

// Radius: the Modern values (Enterprise overrides live in bundle.css, as each usage note says).
const radius = structuredClone(liveTokens.radius || { tokens: [] });
for (const t of radius.tokens) {
  const v = modes.modern[t.name.replace(/^adk-/, '')];
  if (v) t.value = v;
}
// Shadows: the effect styles from the @theme block, colour-mix → rgba; focus rings per theme from their tokens.
// Unitless lengths get px first (rgba() channels come after, so they never do).
const toRgba = (s) =>
  s
    .replace(/(^|[\s,])(-?\d*\.?\d+)(?=[\s,]|$)/g, '$1$2px')
    .replace(/color-mix\(in srgb, #([0-9a-f]{6}) (\d+(?:\.\d+)?)%, transparent\)/gi, (_, hex, pct) => {
      const n = parseInt(hex, 16);
      return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${+(Number(pct) / 100).toFixed(4)})`;
    });
const themeShadows = Object.fromEntries([...tokenCss.matchAll(/--shadow-([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\/\*.*$/, '').trim()]));
const resolve = (theme, v) => {
  const m = /var\(--adk-([\w-]+)\)/.exec(v);
  if (!m) return v;
  let ref = modes[theme][m[1]] ?? modes.modern[m[1]];
  const p = /^var\(--adk-([\w-]+)\)$/.exec(ref);
  if (p) ref = primitives[p[1]];
  return v.replace(m[0], ref.toLowerCase());
};
const shadow = structuredClone(liveTokens.shadow || { tokens: [] });
for (const t of shadow.tokens) {
  const src = themeShadows[t.name.replace(/^shadow-/, '')];
  if (!src) continue;
  t.value = /var\(/.test(src) ? Object.fromEntries(Object.keys(modes).map((id) => [id, toRgba(resolve(id, src))])) : toRgba(src);
}
const tokensJson = {
  ...liveTokens,
  name: 'AD Design Kit',
  color: { ...(liveTokens.color || {}), themes: liveTokens.color?.themes ?? Object.keys(modes).map((id) => ({ id, name: id })), tokens: colorTokens },
  radius,
  shadow,
};
// The provenance note changes only with the content: an unchanged system keeps its old ref and date.
{
  const strip = (t) => JSON.stringify({ ...t, meta: undefined });
  const components = { ...(liveTokens.meta?.components || {}) };
  for (const c of registry) components[c.react] = `src/components/ui/${path.basename(c.template)}`;
  const changed = strip(tokensJson) !== strip(liveTokens) || Object.keys(components).length !== Object.keys(liveTokens.meta?.components || {}).length;
  tokensJson.meta = changed ? { ...(liveTokens.meta || {}), source: 'github', ref, synced: new Date().toISOString(), components } : liveTokens.meta;
}
{
  // Same content as published (whatever its formatting): keep the published text, so nothing is re-sent.
  const text = JSON.stringify(tokensJson, null, 2) + '\n';
  const current = live('tokens.json');
  outputs['tokens.json'] = current && JSON.stringify(JSON.parse(current)) === JSON.stringify(tokensJson) ? current : text;
}

// tokens.css as the page compiles it (format.md): first theme on :root, a block per further theme, then the rest.
{
  const themes = tokensJson.color.themes.map((t) => t.id);
  const v = (t, id) => (typeof t.value === 'string' ? t.value : t.value[id] ?? t.value[themes[0]]);
  const css = (val) => val.replace(/\{([\w.-]+)\}/g, 'var(--$1)');
  const esc = (n) => n.replace(/\./g, '\\.');
  const lines = [`/* ${tokensJson.name} — generated from tokens.json */`];
  themes.forEach((id, i) => {
    lines.push(i === 0 ? `:root, [data-theme="${id}"] {` : `[data-theme="${id}"] {`);
    for (const t of tokensJson.color.tokens) if (i === 0 || typeof t.value !== 'string') lines.push(`  --${esc(t.name)}: ${css(v(t, id))};`);
    for (const t of tokensJson.shadow.tokens) if (i === 0 || typeof t.value !== 'string') lines.push(`  --${esc(t.name)}: ${v(t, id)};`);
    lines.push('}');
  });
  lines.push(':root {');
  for (const fam of ['spacing', 'radius', 'borderWidth', 'breakpoint']) for (const t of tokensJson[fam]?.tokens || []) lines.push(`  --${esc(t.name)}: ${t.value};`);
  for (const [k, stack] of Object.entries(tokensJson.type?.families || {})) lines.push(`  --font-${k}: ${stack};`);
  lines.push('}');
  // One class per type style, in the style's own family (a group's family when the style has none).
  for (const g of tokensJson.type?.groups || []) {
    for (const st of g.styles) {
      const decl = [`font-family: var(--font-${st.family || g.family})`, `font-size: ${st.fontSize}`];
      if (st.lineHeight !== undefined) decl.push(`line-height: ${st.lineHeight}`);
      if (st.fontWeight !== undefined) decl.push(`font-weight: ${st.fontWeight}`);
      if (st.letterSpacing !== undefined) decl.push(`letter-spacing: ${st.letterSpacing}`);
      lines.push(`.${esc(st.name)} { ${decl.join('; ')}; }`);
    }
  }
  const liveCss = live('tokens.css');
  // The page owns tokens.css; write it only when this compiler reproduces the published one for unchanged tokens.
  const candidate = lines.join('\n') + '\n';
  if (liveCss && liveCss.split('\n').slice(0, 4).join('\n') === candidate.split('\n').slice(0, 4).join('\n')) outputs['tokens.css'] = liveCss === candidate ? liveCss : candidate;
  else plan.notes.push('tokens.css left to the page (its compiled form differs from this producer’s; the page regenerates it from tokens.json).');
}

// ---------- component guidelines ----------
const fmt = (v) => {
  if (typeof v === 'string') return `\`${v}\``;
  if (v && typeof v === 'object' && v.prop) {
    const one = (p, val) => (val === true || val === undefined ? p : `${p}="${val}"`);
    return `\`${[one(v.prop, v.value), ...Object.entries(v.with || {}).map(([p, val]) => one(p, val))].join(' ')}\``;
  }
  return `\`${JSON.stringify(v)}\``;
};
function summary(doc) {
  const when = /\*\*When to use\*\*:?\s+([^\n]*?)(?:\s+\*\*|$)/m.exec(doc);
  const m = /\*\*Use\*\*\s+([^\n]*?)(?:\s+\*\*Don['’]t\*\*|$)/m.exec(doc) || (when && [when[0], `for ${when[1]}`]);
  if (!m) return '';
  let s = m[1].trim().replace(/[;,:]$/, '');
  if (!/[.!]$/.test(s)) s += '.';
  return /^(for|when|to|as|in|on|with)\b/i.test(s) ? `Use ${s}` : `Use ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
}
const hostOf = (c) => path.basename(c.template).replace(/\.tsx$/, '');
for (const c of registry) {
  const host = hostOf(c);
  const d = docs.components[host];
  let text;
  if (!d || host !== c.react) {
    const kind = c.react === 'Label' ? 'is the field caption used above every form control: text, an optional required asterisk, an icon and a hint' : c.react === 'HelperText' ? 'is the line of guidance or validation feedback rendered under a form control' : `is part of ${host}`;
    text = `${c.react} ${kind}.\n\nExported from \`src/components/ui/${host}.tsx\` and documented with ${host}${host === 'Input' ? ' (Figma "Label" and "Helper text" sets on the Forms page). Use it only with the field components of this system; `status="success" | "danger"` colours HelperText with `text-fg-success-strong` / `text-fg-danger-strong`.' : '.'}\n\n`;
  } else {
    const variants = Object.entries(d.figmaVariants || {}).map(([k, vals]) => `**${k}**: ${vals.join(' · ')}`).join('; ');
    // Values map to props; compositions are built from several parts (a list of names = composed in the stories).
    const rows = Object.entries(d.propMap || {}).map(([fig, m]) => {
      const cells = Object.entries(m.values || {}).map(([k, v]) => `${k} → ${fmt(v)}`);
      if (Array.isArray(m.compositions)) cells.push(...m.compositions.map((k) => `${k} (composition)`));
      else cells.push(...Object.entries(m.compositions || {}).map(([k, v]) => `${k} → ${fmt(v)}`));
      if (m.note) cells.push(m.note);
      return `| ${fig} | \`${m.prop || '—'}\` | ${cells.join(', ')} |`;
    });
    text = [
      summary(d.doc),
      '',
      `Mirrors the Figma set **${d.figmaName}** (${d.figmaLine}). Category: ${categoryLabels[d.category] ?? d.category}. Story: \`${d.storyTitle}\`. Source: \`src/components/ui/${host}.tsx\`.`,
      '',
      `Figma variants — ${variants || 'none'}. Interaction states (hover, focus, active, disabled) are CSS states, never props; breakpoints are responsive classes.`,
      '',
      '### Figma property → React prop',
      '',
      '| Figma property | Prop | Values |',
      '|---|---|---|',
      ...rows,
      '',
      d.doc.trim(),
      '',
    ].join('\n');
    const related = registry.filter((o) => o !== c && hostOf(o) === host).map((o) => `\`${o.react}\``);
    if (related.length) text += `\n\n\nRelated: ${related.join(', ')}.\n`;
  }
  outputs[`components/${c.react}/README.md`] = text;
  if (!published(`components/${c.react}/preview.html`)) {
    plan.newComponents.push(c.react);
    const group = categoryLabels[docs.components[host]?.category] ?? 'Components';
    outputs[`components/${c.react}/preview.html`] = `<!-- @dsCard group="${group}" height=400 -->
<!doctype html>
<html lang="en" data-theme="modern">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Serif:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
.ds-stories{display:flex;flex-direction:column;gap:var(--spacing-6);padding:var(--spacing-4);min-width:0}
.ds-story-caption{margin:0 0 var(--spacing-2);font-size:11px;line-height:16px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--adk-text-body-subtle)}
.ds-story-body{min-width:0}
</style>
</head>
<body class="bg-neutral-primary text-body antialiased">
<div id="root"></div>
<script>
window.${NS}.renderStories(${JSON.stringify(host)}, document.getElementById('root'));
</script>
</body>
</html>
`;
  }
}
const liveComponents = (liveTokens.meta && Object.keys(liveTokens.meta.components || {})) || [];
plan.removedComponents = liveComponents.filter((n) => !registry.some((c) => c.react === n));

// ---------- icons and logos ----------
const svgOf = (i) => {
  const [, , w, h] = i.viewBox.split(/\s+/);
  const body = i.body.replace(/currentColor/g, '#4a5565').replace(/<([a-zA-Z]+)([^<>]*?)\s*\/>/g, '<$1$2></$1>');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${i.viewBox}" width="${w}" height="${h}" fill="none">${body}</svg>`;
};
const groupName = (g) => g.replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');
const assets = {};
for (const i of icons) assets[`Icons/${groupName(i.group)}/${i.name}.svg`] = { group: 'Icons', name: `${groupName(i.group)}/${i.name}.svg`, text: svgOf(i) };
for (const [name, src] of [['ad-design-kit.svg', 'src/assets/logos/ad-design-kit.svg'], ['logo-mark.svg', 'public/logo-mark.svg']]) {
  assets[`Logos/${name}`] = { group: 'Logos', name, text: read(path.join(root, src)) };
}
const liveIndex = JSON.parse(live('design-system.json') || '{"assetGroups":{}}');
const firstSync = !state.assets || !Object.keys(state.assets).length;
for (const [key, a] of Object.entries(assets)) {
  const published = liveIndex.assetGroups?.[a.group]?.files?.[a.name];
  const hash = sha(a.text);
  if (published && (firstSync || state.assets[key] === hash)) continue; // already there and unchanged at the source
  plan.uploads.push({ key, group: a.group, name: a.name, path: `project/assets/${a.group}/${a.name}`, hash, replaces: published?.blob ?? null });
  fs.mkdirSync(path.join(outDir, 'project/assets', a.group, path.dirname(a.name)), { recursive: true });
  fs.writeFileSync(path.join(outDir, 'project/assets', a.group, a.name), a.text);
}
for (const [g, grp] of Object.entries(liveIndex.assetGroups || {})) for (const name of Object.keys(grp.files || {})) if (!assets[`${g}/${name}`]) plan.removedAssets.push(`${g}/${name}`);
plan.assetHashes = Object.fromEntries(Object.entries(assets).map(([k, a]) => [k, sha(a.text)]));
// Icons README: the published intro, then one list per Figma group.
{
  const byGroup = {};
  for (const i of icons) (byGroup[groupName(i.group)] ||= []).push(i.name);
  const intro = (live('assets/Icons/README.md') || '').split('\n## ')[0].trim() || `# Icons\n\nThe ${icons.length} icons of the Figma Icons page.`;
  const text = intro.replace(/The \d+ icons/, `The ${icons.length} icons`) + '\n\n' + Object.keys(byGroup).sort().map((g) => `## ${g.replace(/-/g, ' ').replace(/\b\w/, (c) => c.toUpperCase()).replace(/ /g, '-')} (${byGroup[g].length})\n\n${byGroup[g].sort().map((n) => `\`${n}\``).join(' · ')}`).join('\n\n') + '\n\n';
  outputs['assets/Icons/README.md'] = text;
}

// ---------- bundle.js (components + stories as one classic script), bundle.css, index.d.ts ----------
const esbuild = await import(pathToFileURL(path.join(root, 'node_modules/esbuild/lib/main.js')).href);
const uiDir = path.join(root, 'src/components/ui');
const uiFiles = fs.readdirSync(uiDir).filter((f) => /^[A-Z]\w*\.tsx$/.test(f) && !f.includes('.stories.')).sort();
const storyFiles = fs.readdirSync(uiDir).filter((f) => f.endsWith('.stories.tsx')).sort();
const storyOrder = Object.fromEntries(storyFiles.map((f) => [f.replace('.stories.tsx', ''), [...read(path.join(uiDir, f)).matchAll(/^export const (\w+)/gm)].map((m) => m[1])]));
const entry = `
${uiFiles.map((f, i) => `import * as m${i} from ${JSON.stringify(path.join(uiDir, f))};`).join('\n')}
${storyFiles.map((f, i) => `import * as s${i} from ${JSON.stringify(path.join(uiDir, f))};`).join('\n')}
import * as Icons from ${JSON.stringify(path.join(root, 'src/components/icons/index.ts'))};
import * as React from 'react';
import { createRoot } from 'react-dom/client';
const modules = [${uiFiles.map((_, i) => `m${i}`).join(', ')}];
const storyModules = { ${storyFiles.map((f, i) => `${JSON.stringify(f.replace('.stories.tsx', ''))}: s${i}`).join(', ')} };
const storyOrder = ${JSON.stringify(storyOrder)};
const ns = {};
for (const m of modules) for (const [k, v] of Object.entries(m)) if (/^[A-Z]/.test(k) && (typeof v === 'function' || (v && typeof v === 'object' && v.$$typeof))) ns[k] = v;
for (const m of modules) for (const [k, v] of Object.entries(m)) if (typeof v === 'function' && !(k in ns)) ns[k] = v;
ns.Icons = Icons;
const stories = {};
for (const [name, mod] of Object.entries(storyModules)) {
  const meta = mod.default || {}, list = {};
  for (const k of (storyOrder[name] || []).concat(Object.keys(mod))) { const s = mod[k]; if (k !== 'default' && s && typeof s === 'object' && !(k in list)) list[k] = s; }
  stories[name] = { meta, stories: list };
}
ns.stories = stories;
function renderStory(component, storyName) {
  const entry = stories[component];
  if (!entry) throw new Error('no stories for ' + component);
  const meta = entry.meta, story = entry.stories[storyName];
  if (!story) throw new Error('no story ' + storyName + ' in ' + component);
  const args = Object.assign({}, meta.args, story.args), Comp = story.component || meta.component;
  const render = story.render || meta.render || ((a) => React.createElement(Comp, a));
  const ctx = { args, name: storyName, title: meta.title, parameters: Object.assign({}, meta.parameters, story.parameters), globals: {} };
  let Story = () => render(args, ctx);
  for (const dec of [].concat(story.decorators || [], meta.decorators || [])) { const Inner = Story; Story = () => dec(Inner, ctx); }
  return React.createElement(Story);
}
ns.renderStories = function (component, el, names, opts = {}) {
  const entry = stories[component];
  const list = (names && names.length ? names : Object.keys(entry.stories).slice(0, 3)).map((n) =>
    React.createElement('section', { key: n, className: 'ds-story', 'data-story': n },
      opts.captions === false ? null : React.createElement('p', { className: 'ds-story-caption' }, n.replace(/([a-z])([A-Z])/g, '$1 $2')),
      React.createElement('div', { className: 'ds-story-body' }, renderStory(component, n))));
  const r = createRoot(el);
  r.render(React.createElement(React.StrictMode, null, React.createElement('div', { className: 'ds-stories' }, list)));
  return r;
};
window.${NS} = ns;
`;
const globals = {
  name: 'globals',
  setup(b) {
    const shim = {
      react: 'module.exports = window.React;',
      'react-dom': 'module.exports = window.ReactDOM;',
      'react-dom/client': 'module.exports = window.ReactDOM;',
      'react/jsx-runtime': 'const R = window.React; const jsx = (t, p, k) => R.createElement(t, k === undefined ? p : Object.assign({}, p, { key: k })); module.exports = { jsx, jsxs: jsx, Fragment: R.Fragment };',
      'react/jsx-dev-runtime': 'const R = window.React; const jsx = (t, p, k) => R.createElement(t, k === undefined ? p : Object.assign({}, p, { key: k })); module.exports = { jsxDEV: jsx, Fragment: R.Fragment };',
      // Stories' play functions and Storybook-only imports never run in a preview.
      'storybook/test': 'const f = () => { const g = () => {}; return g; }; const noop = () => ({}); const any = new Proxy(function () {}, { get: () => any, apply: () => any }); module.exports = { fn: f, expect: any, userEvent: any, within: any, waitFor: async () => {}, screen: any, fireEvent: any };',
    };
    b.onResolve({ filter: /^(react|react-dom|react-dom\/client|react\/jsx-runtime|react\/jsx-dev-runtime|storybook\/test)$/ }, (a) => ({ path: a.path, namespace: 'shim' }));
    b.onLoad({ filter: /.*/, namespace: 'shim' }, (a) => ({ contents: shim[a.path], loader: 'js' }));
  },
};
const built = await esbuild.build({
  stdin: { contents: entry, resolveDir: root, loader: 'tsx', sourcefile: 'claude-design-entry.tsx' },
  bundle: true,
  write: false,
  format: 'iife',
  minify: true,
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env': '{}' },
  loader: { '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.jpeg': 'dataurl', '.webp': 'dataurl', '.css': 'empty' },
  plugins: [globals],
  logLevel: 'silent',
  target: 'es2020',
});
let js = built.outputFiles[0].text;
if (/<\/script|<!--/i.test(js)) js = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '\\x3C!--');
const header = { format: 4, namespace: NS, components: registry.map((c) => ({ name: c.react })) };
outputs['components/bundle.js'] = `/* @ds-bundle: ${JSON.stringify(header)} */\n${js}`;

// bundle.css: the app's Tailwind build against the token mapping only (the colour values come from tokens.css),
// plus the theme-dependent radius and font the four Claude Design themes need.
{
  const { compile, optimize } = await import(pathToFileURL(path.join(root, 'node_modules/@tailwindcss/node/dist/index.mjs')).href);
  const { Scanner } = await import(pathToFileURL(path.join(root, 'node_modules/@tailwindcss/oxide/index.js')).href);
  const themePart = tokenCss.slice(tokenCss.indexOf('@theme inline'));
  const enterprise = modes.enterprise;
  const adapter = `:root{--adk-font-base:var(--font-sans);--adk-text-xxs:${modes.modern['text-xxs'] ?? '8px'}}
[data-theme="enterprise"],[data-theme="enterprise-dark"]{--adk-font-base:var(--font-serif);${Object.entries(enterprise).filter(([k, v]) => /^rounded/.test(k) && v !== modes.modern[k]).map(([k, v]) => `--adk-${k}:${v}`).join(';')}}
[data-theme="modern-dark"],[data-theme="enterprise-dark"]{color-scheme:dark}`;
  const input = `@import "tailwindcss";\n@custom-variant dark (&:where([data-theme$="-dark"], [data-theme$="-dark"] *));\n${themePart}\n${adapter}\n`;
  const compiler = await compile(input, { base: root, onDependency() {} });
  const scanner = new Scanner({ sources: [{ base: uiDir, pattern: '**/*.tsx', negated: false }, { base: path.join(root, 'src/components/icons'), pattern: '**/*.tsx', negated: false }] });
  const css = compiler.build(scanner.scan());
  outputs['components/bundle.css'] = optimize ? optimize(css, { minify: true }).code : css;
}

// index.d.ts: the declarations TypeScript emits for every component file, concatenated as documentation.
{
  const tmp = fs.mkdtempSync(path.join(outDir, '.dts-'));
  const tsc = spawnSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--declaration', '--emitDeclarationOnly', '--jsx', 'react-jsx', '--target', 'es2022', '--module', 'esnext', '--moduleResolution', 'bundler', '--skipLibCheck', '--allowImportingTsExtensions', '--ignoreConfig', '--noEmit', 'false', '--outDir', tmp, ...uiFiles.map((f) => path.join(uiDir, f))], { encoding: 'utf8', cwd: root });
  const dtsDir = fs.existsSync(path.join(tmp, 'ui')) ? path.join(tmp, 'ui') : fs.existsSync(path.join(tmp, 'components/ui')) ? path.join(tmp, 'components/ui') : tmp;
  const parts = uiFiles
    .map((f) => {
      const p = path.join(dtsDir, f.replace(/\.tsx$/, '.d.ts'));
      if (!fs.existsSync(p)) return null;
      const body = read(p).split('\n').filter((l) => !/^import /.test(l) && l.trim() !== 'export {};').join('\n').replace(/import\("react"\)\./g, 'React.').trim();
      return `// ---- ${f} ----\n${body}`;
    })
    .filter(Boolean);
  fs.rmSync(tmp, { recursive: true, force: true });
  const pascal = (n) => n.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('');
  const iconNames = icons.map((i) => `${pascal(i.name)}Icon`).sort();
  parts.push(
    `// ---- icons (src/components/icons) — ${icons.length} icons, each a 1em SVG component taking IconProps; window.${NS}.Icons.<Name> ----\n` +
      'export interface IconProps extends React.SVGProps<SVGSVGElement> { /** Accessible name; without it the icon is hidden from assistive technology. */ title?: string }\n' +
      iconNames.map((n) => `export declare const ${n}: (props: IconProps) => React.JSX.Element;`).join('\n'),
  );
  if (parts.length > 1) outputs['components/index.d.ts'] = `// AD Design Kit — types of the components in bundle.js (window.${NS}). Generated from src/components/ui/*.tsx; documentation, not a build input.\nimport type * as React from "react";\n\n${parts.join('\n\n')}\n`;
  else plan.notes.push(`index.d.ts not rebuilt: TypeScript emitted no declarations (${(tsc.stderr || tsc.stdout).trim().split('\n')[0]})`);
}

// ---------- previews: every story a preview names must still exist ----------
for (const c of registry) {
  const p = `components/${c.react}/preview.html`;
  const text = live(p);
  if (!text || outputs[p]) continue;
  const m = /renderStories\(("[^"]+"),\s*document\.getElementById\('root'\)(?:,\s*(\[[^\]]*\]))?\)/.exec(text);
  if (!m) continue;
  const host = JSON.parse(m[1]);
  const names = m[2] ? JSON.parse(m[2]) : [];
  const have = storyOrder[host];
  if (!have) {
    plan.notes.push(`${p} renders stories of "${host}", which has no story file any more: fix by hand`);
    continue;
  }
  const kept = names.filter((n) => have.includes(n));
  if (kept.length === names.length) continue;
  const fixed = kept.length ? kept : have.slice(0, 3);
  plan.notes.push(`${p}: stories ${names.filter((n) => !have.includes(n)).join(', ')} no longer exist; preview now shows ${fixed.join(', ')}`);
  outputs[p] = text.replace(m[0], `renderStories(${m[1]}, document.getElementById('root'), ${JSON.stringify(fixed)})`);
}

// ---------- compare and write ----------
for (const [p, text] of Object.entries(outputs)) {
  const current = live(p);
  if (current === text) {
    plan.unchanged.push(p);
    continue;
  }
  const lastPublished = state.files?.[p];
  if (current !== null && lastPublished && sha(current) !== lastPublished && p !== 'tokens.json') {
    plan.editedInClaudeDesign.push(p); // someone changed it in Claude Design since the last sync: ask before overwriting
  }
  plan.changed.push(p);
  fs.mkdirSync(path.dirname(path.join(outDir, 'project', p)), { recursive: true });
  fs.writeFileSync(path.join(outDir, 'project', p), text);
}
plan.fileHashes = Object.fromEntries(Object.entries(outputs).map(([p, t]) => [p, sha(t)]));
plan.facts = { components: registry.length, icons: icons.length, colorTokens: colorTokens.length, themes: Object.keys(modes) };
fs.writeFileSync(path.join(outDir, 'plan.json'), JSON.stringify(plan, null, 2));
console.log(`Claude Design sync plan for ${ref}${dirty ? ' (uncommitted changes in the sources!)' : ''}`);
console.log(`  files changed: ${plan.changed.length}${plan.changed.length ? ' — ' + plan.changed.join(', ') : ''}`);
console.log(`  files unchanged: ${plan.unchanged.length}`);
console.log(`  assets to upload: ${plan.uploads.length}${plan.uploads.length ? ' — ' + plan.uploads.map((u) => u.key).join(', ') : ''}`);
if (plan.newComponents.length) console.log(`  new components (preview generated): ${plan.newComponents.join(', ')}`);
if (plan.removedComponents.length) console.log(`  components no longer in the code (kept): ${plan.removedComponents.join(', ')}`);
if (plan.removedAssets.length) console.log(`  assets no longer in the code (kept): ${plan.removedAssets.join(', ')}`);
if (plan.editedInClaudeDesign.length) console.log(`  EDITED IN CLAUDE DESIGN since the last sync (ask before overwriting): ${plan.editedInClaudeDesign.join(', ')}`);
for (const n of plan.notes) console.log(`  note: ${n}`);
