// Rebuilds every file of the published design system from the current code into
// design-system/dist/project/. Usage: npm run design-system:build [-- --skip-render]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DIST, OUT, BUILD, ensure } from './lib.mjs';

const skipRender = process.argv.includes('--skip-render');
fs.rmSync(DIST, { recursive: true, force: true });
ensure(OUT);
ensure(BUILD);

const steps = [
  ['tokens.json + tokens.css', 'build-tokens.mjs'],
  ['icons, logos, component guidelines', 'build-docs-assets.mjs'],
  ['bundle.js, bundle.css, index.d.ts, React libs', 'build-bundle.mjs'],
  ['render check (story picks + card heights)', 'render-check.mjs', skipRender ? ['--skip'] : []],
  ['component previews', 'build-previews.mjs'],
  ['index, cover, pending uploads', 'build-index.mjs'],
];
for (const [label, script, args = []] of steps) {
  console.log(`\n▸ ${label}`);
  execFileSync(process.execPath, [path.join(import.meta.dirname, script), ...args], { stdio: 'inherit' });
}

let count = 0;
(function walk(d) { for (const f of fs.readdirSync(d)) { const q = path.join(d, f); if (fs.statSync(q).isDirectory()) walk(q); else count++; } })(OUT);
console.log(`\nDone: ${count} files under ${path.relative(process.cwd(), OUT) || OUT}. Ask Claude to re-sync the design system from this folder (see design-system/README.md).`);
