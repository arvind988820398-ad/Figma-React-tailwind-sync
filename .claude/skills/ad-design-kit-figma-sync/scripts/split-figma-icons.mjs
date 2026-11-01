#!/usr/bin/env node
// Turns the Figma Icons page into the committed icon snapshot
// (ad-design-kit-design-system/icons/figma-icons.json), the icon twin of the token snapshots.
//
// Inputs (see SKILL.md, "Icon sync"):
//   <dir>/layout.json      from figma-export-icon-layout.js: [{ id, name, icons: [[name, x, y, w, h], …] }]
//   <dir>/<group-id>.svg   each icon group frame exported as SVG (download_assets, format svg); ":" → "-" in the id
// Usage: node split-figma-icons.mjs <dir> [--out path/to/figma-icons.json]
//
// Each icon becomes { name, group, viewBox, body }: the icon's <g> from the group export, with the frame position
// as the viewBox origin (paths stay byte-for-byte as Figma wrote them), ids dropped, clip paths carried along,
// and the dark icon fills turned into currentColor so icons follow the text colour. Names that repeat get
// "-alt", "-alt-2" … in the order of the layout file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
if (!dir) { console.error('usage: split-figma-icons.mjs <dir> [--out file]'); process.exit(2); }
const outIdx = args.indexOf('--out');
const out = outIdx >= 0 ? args[outIdx + 1] : path.join(here, '../../ad-design-kit-design-system/icons/figma-icons.json');

// Figma's icon ink colours; anything else (e.g. white details) is kept as is.
const INK = ['#101828', '#383838', '#1D293D'];

/** Minimal XML tree: { tag, attrs, children, raw } — enough for Figma's SVG export (no CDATA, no comments). */
function parse(xml) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  for (const m of xml.matchAll(/<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>/g)) {
    const [, closing, tag, attrText, selfClosing] = m;
    if (closing) { stack.pop(); continue; }
    const attrs = Object.fromEntries([...attrText.matchAll(/([\w:-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    const node = { tag, attrs, children: [] };
    stack[stack.length - 1].children.push(node);
    if (!selfClosing) stack.push(node);
  }
  return root;
}
const walk = (n, fn) => { fn(n); n.children.forEach((c) => walk(c, fn)); };
function serialize(n, rename) {
  const attrs = Object.entries(n.attrs)
    .filter(([k]) => k !== 'id' || n.tag === 'clipPath')
    .map(([k, v]) => {
      if ((k === 'fill' || k === 'stroke') && INK.includes(v.toUpperCase())) v = 'currentColor';
      if (k === 'id') v = rename(v);
      if (k === 'clip-path') v = v.replace(/url\(#([^)]+)\)/, (_, id) => `url(#${rename(id)})`);
      return ` ${k}="${v}"`;
    })
    .join('');
  return n.children.length ? `<${n.tag}${attrs}>${n.children.map((c) => serialize(c, rename)).join('')}</${n.tag}>` : `<${n.tag}${attrs}/>`;
}
/** First absolute point in the icon's paths, used to tell repeated names apart by position. */
function firstPoint(g) {
  let p = null;
  walk(g, (n) => { if (!p && n.tag === 'path' && n.attrs.d) { const m = /M\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/.exec(n.attrs.d); if (m) p = [+m[1], +m[2]]; } });
  return p;
}

const layout = JSON.parse(fs.readFileSync(path.join(dir, 'layout.json'), 'utf8'));
const seen = new Map();
const unique = (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const n = seen.get(base) || 0;
  seen.set(base, n + 1);
  return n === 0 ? base : n === 1 ? `${base}-alt` : `${base}-alt-${n}`;
};
const icons = [];
const problems = [];
for (const group of layout) {
  const file = path.join(dir, group.id.replace(':', '-') + '.svg');
  if (!fs.existsSync(file)) { problems.push(`missing export ${file}`); continue; }
  const tree = parse(fs.readFileSync(file, 'utf8'));
  const defs = {};
  walk(tree, (n) => { if (n.tag === 'clipPath' && n.attrs.id) defs[n.attrs.id] = n; });
  const names = new Set(group.icons.map((i) => i[0]));
  // Icon groups are the outermost <g> whose id (minus Figma's "_2" suffix) is an icon name in this frame.
  const found = [];
  const visit = (n) => {
    const id = n.tag === 'g' && n.attrs.id ? n.attrs.id.replace(/_\d+$/, '') : null;
    if (id && names.has(id)) { found.push({ name: id, g: n }); return; }
    n.children.forEach(visit);
  };
  visit(tree);
  if (group.icons.length === 1 && found.length === 0) {
    // A frame that is itself the icon (e.g. the 36px Android mark): everything except the background.
    const svg = tree.children.find((c) => c.tag === 'svg') || tree;
    const unwrap = (nodes) => nodes.flatMap((c) => (c.tag === 'g' && Object.keys(c.attrs).every((k) => k === 'id') ? unwrap(c.children) : [c]));
    const body = { tag: 'g', attrs: {}, children: unwrap(svg.children.filter((c) => c.tag !== 'rect')) };
    found.push({ name: group.icons[0][0], g: body });
  }
  const used = new Set();
  for (const entry of group.icons) {
    const [figmaName, x, y, w, h] = entry;
    const candidates = found.filter((f) => f.name === figmaName && !used.has(f));
    const hit = candidates.find((f) => { const p = firstPoint(f.g); return p && p[0] >= x - 1 && p[0] <= x + w + 1 && p[1] >= y - 1 && p[1] <= y + h + 1; }) || candidates[0];
    if (!hit) { problems.push(`${group.name}: no <g> for "${figmaName}"`); continue; }
    used.add(hit);
    const name = unique(figmaName);
    const rename = (id) => `adk-${name}-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
    const clipIds = [];
    walk(hit.g, (n) => { const m = /url\(#([^)]+)\)/.exec(n.attrs['clip-path'] || ''); if (m) clipIds.push(m[1]); });
    const ownAttrs = Object.keys(hit.g.attrs).some((k) => k !== 'id');
    let body = ownAttrs ? serialize(hit.g, rename) : hit.g.children.map((c) => serialize(c, rename)).join('');
    if (clipIds.length) body = `<defs>${clipIds.filter((id) => defs[id]).map((id) => serialize(defs[id], rename)).join('')}</defs>` + body;
    icons.push({ name, figmaName, group: group.name, viewBox: `${x} ${y} ${w} ${h}`, body });
  }
}
icons.sort((a, b) => a.name.localeCompare(b.name));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ $comment: 'Generated by split-figma-icons.mjs from the Figma Icons page. Do not edit.', source: { fileKey: 'TKsoawKvPxaNCff4q43Mli', page: 'Icons' }, count: icons.length, icons }, null, 1) + '\n');
for (const p of problems) console.error('! ' + p);
const renamed = icons.filter((i) => i.name !== i.figmaName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
console.log(`Wrote ${path.relative(process.cwd(), out)} — ${icons.length} icons${renamed.length ? `; renamed: ${renamed.map((i) => `${i.figmaName}→${i.name}`).join(', ')}` : ''}`);
if (problems.length) process.exit(1);
