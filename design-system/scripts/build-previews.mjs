// Writes components/<Comp>/preview.html for every component; heights from render-check.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { BUILD, OUT as PROJECT, system, readJson } from './lib.mjs';

const OUT = path.join(PROJECT, 'components');
const { categories } = readJson(path.join(BUILD, 'components.json'));
const heights = readJson(path.join(BUILD, 'heights.json'));
const picks = readJson(path.join(BUILD, 'story-picks.json'));

export const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Serif:wght@400;500;600;700&display=swap" rel="stylesheet">`;
export const STYLE = `<style>
.ds-stories{display:flex;flex-direction:column;gap:var(--spacing-6);padding:var(--spacing-4);min-width:0}
.ds-story-caption{margin:0 0 var(--spacing-2);font-size:11px;line-height:16px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--adk-text-body-subtle)}
.ds-story-body{min-width:0}
</style>`;

const entries = Object.entries(picks);
for (const [comp, names] of entries) {
  const group = categories[comp] ?? 'Forms';
  const h = Math.max(96, Math.min(4000, heights[comp] ?? 240));
  const html = `<!-- @dsCard group="${group}" height=${h} -->
<!doctype html>
<html lang="en" data-theme="modern">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${FONTS}
${STYLE}
</head>
<body class="bg-neutral-primary text-body antialiased">
<div id="root"></div>
<script>
window.${system.namespace}.renderStories(${JSON.stringify(comp === 'Label' || comp === 'HelperText' ? 'Input' : comp)}, document.getElementById('root'), ${JSON.stringify(names)});
</script>
</body>
</html>
`;
  fs.mkdirSync(path.join(OUT, comp), { recursive: true });
  fs.writeFileSync(path.join(OUT, comp, 'preview.html'), html);
}
console.log('previews', entries.length);
