#!/usr/bin/env node
// Generates the description and documentation link of every Figma component set from the code-side sources,
// so Figma, Storybook and the skill docs say the same thing.
//
// Sources (edit these, never the Figma description):
//   ad-design-kit-design-system/references/figma-summaries.json   one-line purpose per Figma set (+ its React component and role)
//   ad-design-kit-design-system/references/components/*.md        "Use … / Don't …" and "A11y:" lines per component
//   ad-design-kit-design-system/references/components.json        Figma node ↔ React component, prop map, storybookUrl
//   src/components/ui/*.stories.tsx                                Storybook titles → docs page ids
//
// Output: ../generated/figma-descriptions.json  { storybookUrl, sets: [{ node, figmaName, react, role, description, docUrl }] }
// Apply it with scripts/figma-apply-descriptions.js through use_figma (see SKILL.md, section C).
//
// Usage: node build-figma-descriptions.mjs [--check]   (--check exits 1 when the committed output is stale)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skills = path.resolve(here, '../..');
const refs = path.join(skills, 'ad-design-kit-design-system/references');
const root = path.resolve(skills, '../..');
const uiDir = path.join(root, 'src/components/ui');
const outFile = path.join(skills, 'ad-design-kit-figma-sync/generated/figma-descriptions.json');

const read = (p) => fs.readFileSync(p, 'utf8');
const registryFile = JSON.parse(read(path.join(refs, 'components.json')));
const registry = registryFile.components;
const summaries = JSON.parse(read(path.join(refs, 'figma-summaries.json'))).sets;
const storybookUrl = (registryFile.storybookUrl || '').replace(/\/+$/, '') || null;

const slug = (h) => h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Markdown → the plain text Figma shows in its description panel.
const plain = (s) =>
  s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Doc sections keyed by "<file>#<slug>".
const sections = {};
for (const f of fs.readdirSync(path.join(refs, 'components'))) {
  if (!f.endsWith('.md')) continue;
  for (const part of read(path.join(refs, 'components', f)).split(/(?=^## )/m)) {
    if (!part.startsWith('## ')) continue;
    sections[`${f}#${slug(part.split('\n')[0].slice(3))}`] = part;
  }
}
const sectionFor = (doc) => {
  const [file, anchor] = doc.split('#');
  const key = Object.keys(sections).find((k) => k === `${file}#${anchor}`) || Object.keys(sections).find((k) => k.startsWith(`${file}#${anchor}`));
  return key ? sections[key] : '';
};

/** Usage, misuse and accessibility lines of one doc section. */
function guidance(body) {
  const lines = body.split('\n');
  let use = '';
  let dont = '';
  const when = /\*\*When to use\*\*:\s*(.+)/.exec(body);
  const whenNot = /\*\*When not to use\*\*:\s*(.+)/.exec(body);
  if (when) use = `Use: ${plain(when[1])}`;
  if (whenNot) dont = `Don't: ${plain(whenNot[1])}`;
  if (!use) {
    const line = lines.find((l) => l.includes('**Use**'));
    if (line) {
      const [u, d] = line.slice(line.indexOf('**Use**')).split(/\*\*Don['’]t\*\*/);
      use = plain(u);
      if (d) dont = plain(`Don't${d}`);
    }
  }
  if (!dont) {
    const line = lines.find((l) => /\*\*Don['’]t\*\*/.test(l));
    if (line) dont = plain(line.slice(line.search(/\*\*Don['’]t\*\*/)));
  }
  const a11y = lines.filter((l) => /^A11y:/.test(l)).map((l) => plain(l.replace(/^A11y:\s*/, ''))).join(' ');
  return { use, dont, a11y: a11y ? `Accessibility: ${a11y}` : '' };
}

/** "<Button color size iconOnly …>" from the registry prop map. */
function signature(c) {
  const props = [];
  for (const m of Object.values(c.propMap || {})) {
    if (!m || m.css || m.slot || !m.prop || m.prop === 'children' || props.includes(m.prop)) continue;
    props.push(m.prop);
  }
  return `<${c.react}${props.length ? ' ' + props.join(' ') : ''}>`;
}

// Storybook docs page id per component file, from each story file's title (Storybook's own id rule).
function docUrlFor(c) {
  if (!storybookUrl) return null;
  const file = path.join(uiDir, path.basename(c.template || `${c.react}.tsx`).replace(/\.tsx$/, '.stories.tsx'));
  if (!fs.existsSync(file)) return null;
  // The meta title; story args can contain their own `title:` keys, so match the Components/ prefix.
  const title = /title:\s*['"](Components\/[^'"]+)['"]/.exec(read(file))?.[1];
  if (!title) return null;
  return `${storybookUrl}/?path=/docs/${slug(title)}--docs`;
}

const problems = [];
const sets = [];
for (const s of summaries) {
  const c = registry.find((r) => r.react === s.react);
  if (!c) {
    problems.push(`${s.figmaName} (${s.node}): React component "${s.react}" is not in components.json`);
    continue;
  }
  const docUrl = docUrlFor(c);
  const blocks = [s.summary];
  if (s.role === 'main') {
    const g = guidance(sectionFor(c.doc));
    for (const [k, v] of Object.entries(g)) if (!v) problems.push(`${c.react}: doc section ${c.doc} has no ${k} line`);
    blocks.push([g.use, g.dont, g.a11y].filter(Boolean).join('\n'));
    blocks.push(`Code: ${signature(c)}`);
  } else if (s.role === 'part') {
    blocks.push(`In code: part of <${c.react}>.`);
  } else {
    blocks.push(`In code: built from <${c.react}>.`);
  }
  if (docUrl) blocks[blocks.length - 1] += `\nDocs: ${docUrl}`;
  sets.push({ node: s.node, figmaName: s.figmaName, react: c.react, role: s.role, description: blocks.join('\n\n'), docUrl });
}

const out = JSON.stringify({ $comment: 'Generated by build-figma-descriptions.mjs. Do not edit.', storybookUrl, sets }, null, 1) + '\n';
for (const p of problems) console.error(`! ${p}`);
if (process.argv.includes('--check')) {
  const current = fs.existsSync(outFile) ? read(outFile) : '';
  if (current !== out) {
    console.error('figma-descriptions.json is stale: run node .claude/skills/ad-design-kit-figma-sync/scripts/build-figma-descriptions.mjs');
    process.exit(1);
  }
  console.log(`${sets.length} Figma descriptions · up to date`);
} else {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, out);
  console.log(`Wrote ${path.relative(root, outFile)} — ${sets.length} sets (${sets.filter((s) => s.role === 'main').length} main), docs links: ${storybookUrl ? 'on' : 'off (set "storybookUrl" in components.json)'}`);
}
if (problems.length) process.exit(2);
