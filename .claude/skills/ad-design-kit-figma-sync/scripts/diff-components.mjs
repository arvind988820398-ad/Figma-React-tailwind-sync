#!/usr/bin/env node
// Compare a fresh Figma component inventory with the AD Design Kit registry.
//
//   node diff-components.mjs <inventory.jsonl> [--registry path/to/components.json] [--src <app dir>] [--json]
//
// inventory.jsonl: one JSON line per page, as returned by figma-export-components.js.
// Reports: new/removed component sets, added/removed variant properties and values,
// and — with --src — code usages of removed prop values (grep on `prop="value"`).
// Exit code 0 = in sync, 3 = drift found.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const invPath = argv.find((a, i) => !a.startsWith('--') && !['--registry', '--src'].includes(argv[i - 1]));
if (!invPath) { console.error('usage: diff-components.mjs <inventory.jsonl> [--registry path] [--src dir] [--json]'); process.exit(2); }
const regPath = opt('--registry', path.join(here, '..', '..', 'ad-design-kit-design-system', 'references', 'components.json'));
const srcDir = opt('--src');

const registry = JSON.parse(fs.readFileSync(regPath, 'utf8'));
const pages = fs.readFileSync(invPath, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l));
const figmaSets = new Map();
for (const p of pages) for (const s of p.sets) figmaSets.set(s.node, { ...s, page: p.page, pageName: p.pageName });

const findings = [];
const add = (kind, component, detail) => findings.push({ kind, component, detail });

const registryNodes = new Map();
for (const c of registry.components) {
  if (c.node) registryNodes.set(c.node, c);
  for (const [part, node] of Object.entries(c.parts || {})) registryNodes.set(node, { react: `${c.react} › ${part}`, part: true });
}
const scannedPages = new Set(pages.map((p) => p.page));

for (const c of registry.components) {
  if (!c.node || !scannedPages.has(c.page)) continue;
  const f = figmaSets.get(c.node);
  if (!f) { add('removed-set', c.react, `Figma set ${c.node} "${c.figmaName}" no longer exists (deleted or detached)`); continue; }
  if (f.name.trim() !== c.figmaName.trim()) add('renamed-set', c.react, `"${c.figmaName}" → "${f.name}"`);
  for (const [prop, values] of Object.entries(c.figmaVariants || {})) {
    if (values.length === 1 && /^\(\d+ .+\)$/.test(values[0])) continue; // summarized (e.g. KBD keys)
    const now = f.variants[prop];
    if (!now) { add('removed-variant-prop', c.react, `Figma property "${prop}" removed`); continue; }
    const gone = values.filter((v) => !now.includes(v));
    const fresh = now.filter((v) => !values.includes(v));
    if (gone.length) add('removed-variant-values', c.react, `${prop}: ${gone.join(', ')}`);
    if (fresh.length) add('added-variant-values', c.react, `${prop}: ${fresh.join(', ')}`);
  }
  for (const prop of Object.keys(f.variants)) {
    if (!(prop in (c.figmaVariants || {}))) add('added-variant-prop', c.react, `"${prop}": ${f.variants[prop].join(', ')}`);
  }
}
for (const [node, f] of figmaSets) {
  if (!registryNodes.has(node)) add('new-set', f.name, `Figma ${node} on page "${f.pageName}" (${f.count} variants: ${Object.keys(f.variants).join(', ')}) is not in the registry`);
}

// Code impact of removed variant values
if (srcDir) {
  const files = [];
  const walk = (p) => { for (const e of fs.readdirSync(p, { withFileTypes: true })) { const fp = path.join(p, e.name); if (e.isDirectory()) { if (!/node_modules|dist|build|\.git/.test(e.name)) walk(fp); } else if (/\.(tsx|jsx|ts|js)$/.test(e.name)) files.push(fp); } };
  walk(srcDir);
  for (const f of findings.filter((x) => x.kind === 'removed-variant-values')) {
    const comp = registry.components.find((c) => c.react === f.component);
    const [prop, list] = f.detail.split(': ');
    const map = comp?.propMap?.[prop];
    if (!map?.prop || !map.values) continue;
    const now = figmaSets.get(comp.node)?.variants?.[prop] || [];
    for (const figmaValue of list.split(', ')) {
      const codeValue = map.values[figmaValue];
      if (!codeValue) continue;
      // Still produced by a current Figma value (e.g. Figma renamed "l" → "lg") — only the propMap needs updating.
      if (now.some((v) => (map.values[v] ?? v.toLowerCase()) === codeValue)) {
        add('propmap-update', comp.react, `${prop}: Figma "${figmaValue}" → "${now.find((v) => (map.values[v] ?? v.toLowerCase()) === codeValue)}" still maps to ${map.prop}="${codeValue}"; update propMap`);
        continue;
      }
      const re = new RegExp(`<${comp.react}\\b[^>]*\\b${map.prop}=["']${codeValue}["']`);
      for (const file of files) {
        const src = fs.readFileSync(file, 'utf8');
        if (re.test(src)) add('code-usage', comp.react, `${path.relative(srcDir, file)} uses ${map.prop}="${codeValue}" (removed in Figma)`);
      }
    }
  }
}

if (argv.includes('--json')) console.log(JSON.stringify(findings, null, 2));
else if (!findings.length) console.log(`Components in sync (${figmaSets.size} Figma sets on ${pages.length} page(s) checked).`);
else {
  for (const f of findings) console.log(`${f.kind.padEnd(22)} ${f.component.padEnd(28)} ${f.detail}`);
  console.log(`\n${findings.length} finding(s) across ${pages.length} page(s).`);
}
process.exit(findings.length ? 3 : 0);
