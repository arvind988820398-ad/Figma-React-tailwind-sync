#!/usr/bin/env node
// Writes the component styling snapshot (references/figma-specs.json) that the changelog compares between versions.
//
//   node build-specs.mjs --sets              print the [react, node] batches to paste into figma-export-specs.js
//   node build-specs.mjs <export.jsonl>      merge the batches' results into references/figma-specs.json
//
// The snapshot holds, per component set, how many variants use each value of: corner radius (r), padding (pad),
// gap, fill, border (st), effect style (fx), height (h) and text style (tx). A Figma change to any of them (Button's
// corners moving from rounded-base to rounded, a new padding step) shows up in `npm run changelog`.

import fs from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
const refs = path.resolve(here, '../../ad-design-kit-design-system/references');
const registry = JSON.parse(fs.readFileSync(path.join(refs, 'components.json'), 'utf8')).components;
const out = path.join(refs, 'figma-specs.json');
const arg = process.argv[2];

if (arg === '--sets') {
  const sets = registry.map((c) => [c.react, c.node]);
  for (let i = 0; i < sets.length; i += 15) console.log(`const SETS = ${JSON.stringify(sets.slice(i, i + 15))};`);
  process.exit(0);
}
if (!arg) {
  console.error('usage: build-specs.mjs --sets | build-specs.mjs <export.jsonl>');
  process.exit(2);
}

const merged = {};
for (const line of fs.readFileSync(arg, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)) {
  Object.assign(merged, JSON.parse(line.startsWith('"') ? JSON.parse(line) : line));
}
const missing = registry.filter((c) => !merged[c.react] || merged[c.react].missing).map((c) => c.react);
if (missing.length) {
  console.error(`No styling exported for: ${missing.join(', ')}. Run figma-export-specs.js for every batch.`);
  process.exit(1);
}
// Stable order: components as in the registry, properties and values sorted, so the file diffs cleanly.
const sortObj = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
const components = Object.fromEntries(registry.map((c) => [c.react, Object.fromEntries(Object.keys(merged[c.react]).sort().map((p) => [p, sortObj(merged[c.react][p])]))]));
fs.writeFileSync(
  out,
  `${JSON.stringify({ $comment: 'Styling of each Figma component set, counted over its variants. Written by build-specs.mjs from figma-export-specs.js; compared by changelog.mjs. Do not edit by hand.', fileKey: 'TKsoawKvPxaNCff4q43Mli', components }, null, 1)}\n`,
);
console.log(`Wrote ${path.relative(process.cwd(), out)}: ${registry.length} component sets.`);
