// Writes the system's index (design-system.json), records the component sources in tokens.json,
// copies the cover, and lists the SVG assets that still need uploading.
import fs from 'node:fs';
import path from 'node:path';
import { DS, BUILD, OUT, system, sha, repoSlug, readJson, writeJson, ensure } from './lib.mjs';

const now = new Date().toISOString();
const assetsMap = readJson(path.join(DS, 'assets-map.json')).files;

// every SVG the build produced under assets/<Group>/…
const assetsDir = path.join(OUT, 'assets');
const svgs = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const q = path.join(d, f);
    if (fs.statSync(q).isDirectory()) walk(q);
    else if (f.endsWith('.svg')) svgs.push(path.relative(assetsDir, q).split(path.sep).join('/'));
  }
})(assetsDir);
svgs.sort();

const assetGroups = {};
const pending = [];
for (const rel of svgs) {
  const group = rel.split('/')[0];
  const name = rel.slice(group.length + 1);
  assetGroups[group] ||= { name: group, tile: group === 'Logos' ? 'l' : 'xs', order: [], files: {} };
  const rec = assetsMap[rel];
  if (rec) assetGroups[group].files[name] = { name, blob: rec.blob, size: rec.size, type: rec.type };
  else pending.push(rel);
  assetGroups[group].order.push(name);
}
// a group's uploaded files only: an SVG not yet uploaded has no record and is listed in pending-uploads.json
for (const g of Object.values(assetGroups)) g.order = g.order.filter((n) => g.files[n]);
if (assetGroups.Logos) assetGroups.Logos.order.sort((a, b) => (a === 'ad-design-kit.svg' ? -1 : b === 'ad-design-kit.svg' ? 1 : a.localeCompare(b)));
const removed = Object.keys(assetsMap).filter((rel) => !svgs.includes(rel));
const groups = Object.keys(assetGroups).sort((a, b) => (a === 'Logos' ? -1 : b === 'Logos' ? 1 : a.localeCompare(b)));

const index = {
  v: 3,
  layout: 'files',
  createdOnFiles: system.createdOnFiles,
  title: system.title,
  namespace: system.namespace,
  libraries: [
    { name: 'react', version: fs.readFileSync(path.join(BUILD, 'react-version.txt'), 'utf8').trim(), global: 'React', file: 'components/lib/react.js' },
    { name: 'react-dom', version: fs.readFileSync(path.join(BUILD, 'react-version.txt'), 'utf8').trim(), global: 'ReactDOM', file: 'components/lib/react-dom.js' },
  ],
  sections: {},
  groups,
  assetGroups,
  blobs: {},
  docs: { readme: 'project/README.md', sections: [] },
  lastChange: { by: system.by ?? 'Claude', at: now, via: `GitHub · ${repoSlug()}@${sha()}`, note: `Rebuilt by design-system/scripts/build.mjs at ${sha()}` },
};
writeJson(path.join(OUT, 'design-system.json'), index);

const tokens = readJson(path.join(OUT, 'tokens.json'));
tokens.meta.components = readJson(path.join(BUILD, 'components.json')).comps;
writeJson(path.join(OUT, 'tokens.json'), tokens);

ensure(path.join(OUT, 'components/Cover'));
fs.copyFileSync(path.join(DS, 'cover.html'), path.join(OUT, 'components/Cover/preview.html'));
fs.copyFileSync(path.join(DS, 'brand-book.md'), path.join(OUT, 'README.md'));

writeJson(path.join(BUILD, 'pending-uploads.json'), { upload: pending, removed });
console.log(`index: ${svgs.length} assets (${pending.length} not yet uploaded, ${removed.length} uploaded but no longer in the code)`);
