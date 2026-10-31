#!/usr/bin/env node
// Prints the DATA array for figma-usage-variants.js: the "Variants" table (Variant · Code · Use when · Don't use when)
// of every main component's doc section, with the component's page id, so the Figma usage frames show the same
// per-variant guidance as Storybook.
// Usage: node build-variant-guidance.mjs [Component …]   (no arguments = every main component)
//        node build-variant-guidance.mjs --check         (exit 1 and list components whose doc has no Variants table)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const refs = path.resolve(here, '../../ad-design-kit-design-system/references');
const read = (p) => fs.readFileSync(p, 'utf8');
const registry = JSON.parse(read(path.join(refs, 'components.json'))).components;
const args = process.argv.slice(2);
const check = args.includes('--check');
const only = args.filter((a) => !a.startsWith('--'));

const slug = (h) => h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sections = {};
for (const f of fs.readdirSync(path.join(refs, 'components'))) {
  if (!f.endsWith('.md')) continue;
  for (const part of read(path.join(refs, 'components', f)).split(/(?=^## )/m)) {
    if (part.startsWith('## ')) sections[`${f}#${slug(part.split('\n')[0].slice(3))}`] = part;
  }
}
const sectionFor = (doc) => {
  const [file, anchor] = doc.split('#');
  const key = Object.keys(sections).find((k) => k === `${file}#${anchor}`) || Object.keys(sections).find((k) => k.startsWith(`${file}#${anchor}`));
  return key ? sections[key] : '';
};
// Markdown cell → the plain text Figma shows.
const plain = (s) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();

/** Rows of the GFM table that follows the "**Variants**" line, without the header and separator. */
function variantRows(body) {
  const lines = body.split('\n');
  const start = lines.findIndex((l) => l.trim() === '**Variants**');
  if (start < 0) return null;
  const rows = [];
  for (const l of lines.slice(start + 1)) {
    if (!l.trim()) { if (rows.length) break; continue; }
    if (!l.trim().startsWith('|')) break;
    rows.push(l.trim().replace(/^\||\|$/g, '').split('|').map((c) => plain(c)));
  }
  return rows.slice(1).filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
}

const data = [];
const missing = [];
for (const c of registry) {
  if (only.length && !only.includes(c.react)) continue;
  let rows = variantRows(sectionFor(c.doc));
  if (!rows || !rows.length) { missing.push(c.react); continue; }
  // A section shared by several components (Label + HelperText) keeps the rows whose code names this one.
  if (registry.filter((o) => o.doc === c.doc).length > 1) {
    const own = rows.filter((r) => (r[1] || '').includes(`<${c.react}`));
    if (own.length) rows = own;
  }
  data.push({ react: c.react, page: c.page, rows });
}
if (check) {
  if (missing.length) { console.error(`No Variants table: ${missing.join(', ')}`); process.exit(1); }
  console.log(`${data.length} components have a Variants table`);
} else process.stdout.write(JSON.stringify(data));
