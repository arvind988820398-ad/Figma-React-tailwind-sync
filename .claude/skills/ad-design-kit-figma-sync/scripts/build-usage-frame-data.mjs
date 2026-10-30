#!/usr/bin/env node
// Prints the DATA array for figma-usage-frame-generic.js: one entry per main component, built from
// generated/figma-descriptions.json (run `npm run figma:descriptions` first) and components.json.
// Usage: node build-usage-frame-data.mjs [Component …]   (no arguments = every main component)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skills = path.resolve(here, '../..');
const registry = JSON.parse(fs.readFileSync(path.join(skills, 'ad-design-kit-design-system/references/components.json'), 'utf8')).components;
const generated = JSON.parse(fs.readFileSync(path.join(skills, 'ad-design-kit-figma-sync/generated/figma-descriptions.json'), 'utf8')).sets;
const only = process.argv.slice(2);

const data = [];
for (const c of registry) {
  if (only.length && !only.includes(c.react)) continue;
  const g = generated.find((s) => s.node === c.node && s.role === 'main');
  if (!g) continue;
  const blocks = g.description.split('\n\n');
  const lines = (blocks[1] || '').split('\n');
  const line = (re) => (lines.find((l) => re.test(l)) || '').replace(/^Use:\s*/, 'Use ').replace(/^Don't:\s*/, "Don't ");
  const a11y = (line(/^Accessibility:/).replace(/^Accessibility:\s*/, '') || '').split(/;\s+/).filter(Boolean).map((s) => (/^[a-z][a-z-]*[\s,]/.test(s) ? s.charAt(0).toUpperCase() + s.slice(1) : s).replace(/\.$/, '') + '.');
  const code = (/Code: (.+)/.exec(g.description) || [])[1] || `<${c.react}>`;
  data.push({ react: c.react, page: c.page, node: c.node, summary: blocks[0], use: line(/^Use/), dont: line(/^Don't/), a11y, code, docUrl: g.docUrl || '' });
}
process.stdout.write(JSON.stringify(data));
