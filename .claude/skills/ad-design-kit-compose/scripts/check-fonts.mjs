#!/usr/bin/env node
// AD Design Kit font checker: proves a rendered page uses the theme's font, sizes and weights.
//
//   node check-fonts.mjs <url> [--selector <css>] [--json]
//
// Opens the URL in headless Chromium (the project's Playwright), waits for webfonts, and for every element that renders
// text compares the resolved font-family with the font the AD Design Kit theme in effect for that element defines
// (data-theme on the nearest ancestor; Modern = Inter, Minimal = Open Sans, Enterprise = IBM Plex Serif, Mono =
// IBM Plex Mono — read from the token manifest, never hardcoded). It also flags font sizes outside the text-xxs…6xl
// scale and weights outside normal|medium|semibold|bold|extrabold, and reports whether each theme font really loaded.
// Exit 1 on any mismatch. Use --selector to check one region (e.g. a drawer) instead of the whole page. Storybook story
// URLs (iframe.html?viewMode=story&id=…) are scoped to the story root automatically; docs pages are Storybook chrome
// and not meaningful to check.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skills = path.resolve(here, '..', '..');
const root = path.resolve(skills, '..', '..');
const argv = process.argv.slice(2);
const url = argv.find((a) => !a.startsWith('--'));
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const json = argv.includes('--json');
if (!url) { console.error('usage: check-fonts.mjs <url> [--selector <css>] [--json]'); process.exit(2); }

const manifest = JSON.parse(fs.readFileSync(path.join(skills, 'ad-design-kit-design-system', 'tokens', 'token-manifest.json'), 'utf8'));
const familyFor = {};
for (const t of manifest.themes) familyFor[t] = String(manifest.tokens['font-base']?.values[`${t}-light`] ?? '').split(' (')[0].trim();
const SIZES = [8, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60]; // text-xxs … text-6xl
const WEIGHTS = [400, 500, 600, 700, 800];

const require = createRequire(path.join(root, 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('Playwright is not installed in the project (npm i -D playwright).'); process.exit(2); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(500);

const result = await page.evaluate(async ({ familyFor, selector, SIZES, WEIGHTS }) => {
  await document.fonts.ready;
  // Storybook iframes keep hidden error/docs templates in the DOM: check only the story root unless told otherwise.
  const scope = selector ? document.querySelector(selector) : document.querySelector('#storybook-root') || document.body;
  if (!scope) return { error: `selector "${selector}" not found` };
  const themeOf = (el) => el.closest('[data-theme]')?.getAttribute('data-theme') || document.documentElement.getAttribute('data-theme') || 'modern';
  const findings = [];
  const seen = new Map();
  const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() && n.parentElement ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const describe = (el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.getAttribute('aria-label') ? `[aria-label="${el.getAttribute('aria-label')}"]` : '');
  let checked = 0;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    // Skip anything not actually rendered (hidden ancestors included).
    if (typeof el.checkVisibility === 'function' ? !el.checkVisibility({ visibilityProperty: true, opacityProperty: false }) : el.getClientRects().length === 0) continue;
    const cs = getComputedStyle(el);
    const key = `${describe(el)}|${cs.fontFamily}|${cs.fontSize}|${cs.fontWeight}`;
    if (seen.has(key)) continue;
    seen.set(key, true);
    checked++;
    const theme = themeOf(el);
    const expected = familyFor[theme];
    const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight);
    const text = n.textContent.trim().slice(0, 40);
    if (expected && family !== expected) findings.push({ kind: 'font-family', element: describe(el), text, actual: family, expected: `${expected} (${theme} theme)` });
    if (!SIZES.some((s) => Math.abs(s - size) < 0.6)) findings.push({ kind: 'font-size', element: describe(el), text, actual: `${size}px`, expected: 'text-xxs…text-6xl (8/12/14/16/18/20/24/30/36/48/60px)' });
    if (!WEIGHTS.includes(weight)) findings.push({ kind: 'font-weight', element: describe(el), text, actual: String(weight), expected: 'font-normal|medium|semibold|bold|extrabold' });
  }
  const themesOnPage = [...new Set([...scope.querySelectorAll('[data-theme]'), document.documentElement].map((el) => el.getAttribute('data-theme')).filter(Boolean))];
  const loaded = Object.fromEntries(themesOnPage.map((t) => [t, familyFor[t] ? document.fonts.check(`16px "${familyFor[t]}"`) : null]));
  return { checked, findings, loaded, themesOnPage };
}, { familyFor, selector: opt('--selector'), SIZES, WEIGHTS });
await browser.close();

if (result.error) { console.error(result.error); process.exit(2); }
const notLoaded = Object.entries(result.loaded).filter(([, ok]) => ok === false).map(([t]) => `${t} (${familyFor[t]})`);
if (json) console.log(JSON.stringify({ url, familyFor, ...result, notLoaded }, null, 2));
else {
  for (const f of result.findings) console.log(`ERROR  ${f.kind.padEnd(12)} ${f.element.padEnd(36)} "${f.text}"  got ${f.actual}, expected ${f.expected}`);
  for (const t of notLoaded) console.log(`ERROR  font-missing  theme font not loaded: ${t} — add its Google Fonts <link> (see setup.md)`);
  console.log(`\n${url}\n${result.checked} text element(s) checked · themes on page: ${result.themesOnPage.join(', ')} · ${result.findings.length + notLoaded.length} error(s)`);
  if (!result.findings.length && !notLoaded.length) console.log(`Fonts OK: every element uses its theme font (${result.themesOnPage.map((t) => `${t} → ${familyFor[t]}`).join(', ')}), sizes and weights are on the AD Design Kit scale.`);
}
process.exit(result.findings.length || notLoaded.length ? 1 : 0);
