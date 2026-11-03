// Renders every component's stories headless (Playwright's Chromium, as the repo's tests use),
// picks a few per component, records heights and reports errors. `--skip` writes defaults instead.
import fs from 'node:fs';
import path from 'node:path';
import { BUILD, OUT as PROJECT, system, readJson, writeJson } from './lib.mjs';

const { comps } = readJson(path.join(BUILD, 'components.json'));
if (process.argv.includes('--skip')) {
  writeJson(path.join(BUILD, 'story-picks.json'), Object.fromEntries(Object.keys(comps).map((c) => [c, []])));
  writeJson(path.join(BUILD, 'heights.json'), {});
  console.log('render check skipped: previews show each component\'s first three stories at a default height');
  process.exit(0);
}
const { chromium } = await import('playwright');
const NS = system.namespace;


const harness = `<!doctype html><html lang="en" data-theme="modern"><head><meta charset="utf-8">
<link rel="stylesheet" href="file://${PROJECT}/tokens.css"><link rel="stylesheet" href="file://${PROJECT}/components/bundle.css">
<style>.ds-stories{display:flex;flex-direction:column;gap:24px;padding:16px;min-width:0}.ds-story-caption{margin:0 0 8px;font-size:11px;line-height:16px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--adk-text-body-subtle)}.ds-story-body{min-width:0}</style>
<script src="file://${PROJECT}/components/lib/react.js"></script><script src="file://${PROJECT}/components/lib/react-dom.js"></script><script src="file://${PROJECT}/components/bundle.js"></script>
</head><body class="bg-neutral-primary text-body antialiased"><div id="root"></div></body></html>`;
fs.writeFileSync(path.join(BUILD, 'harness.html'), harness);

let browser;
try {
  browser = await chromium.launch(process.env.DS_CHROMIUM ? { executablePath: process.env.DS_CHROMIUM } : {});
} catch {
  console.warn('render check skipped: Playwright could not launch Chromium (run `npx playwright install chromium`, or set DS_CHROMIUM to a Chromium binary). Previews show each component\'s first three stories at a default height.');
  writeJson(path.join(BUILD, 'story-picks.json'), Object.fromEntries(Object.keys(comps).map((c) => [c, []])));
  writeJson(path.join(BUILD, 'heights.json'), {});
  process.exit(0);
}
const page = await browser.newPage({ viewport: { width: 760, height: 800 } });
await page.addInitScript(`window.__ds = () => window[${JSON.stringify(NS)}];`);
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });

const picks = {};
const heights = {};
const report = {};
const skipRe = /^(All|Matrix|Playground|Figma|Overview)/i;
for (const comp of Object.keys(comps)) {
  const storyComp = comp === 'Label' || comp === 'HelperText' ? 'Input' : comp;
  await page.goto('file://' + path.join(BUILD, 'harness.html'));
  const names = await page.evaluate((c) => Object.keys(window.__ds().stories[c]?.stories ?? {}), storyComp);
  let candidates = names.filter((n) => !skipRe.test(n));
  if (comp === 'Label') candidates = names.filter((n) => /label/i.test(n));
  if (comp === 'HelperText') candidates = names.filter((n) => /helper/i.test(n));
  if (!candidates.length) candidates = names.slice(0, 2);
  const chosen = [];
  let total = 0;
  report[comp] = { stories: names.length, tried: [] };
  for (const n of candidates) {
    if (chosen.length >= 4 || total > 560) break;
    errors.length = 0;
    await page.goto('file://' + path.join(BUILD, 'harness.html'));
    const h = await page.evaluate(async ([c, s]) => {
      const root = document.getElementById('root');
      try { window.__ds().renderStories(c, root, [s]); } catch (e) { return { err: String(e.message) }; }
      await new Promise((r) => setTimeout(r, 250));
      return { h: Math.ceil(root.getBoundingClientRect().height), w: Math.ceil(document.documentElement.scrollWidth), text: root.innerText.length, nodes: root.querySelectorAll('*').length };
    }, [storyComp, n]);
    const errs = errors.filter((e) => !/favicon|net::ERR|Download the React DevTools/.test(e));
    report[comp].tried.push({ story: n, ...h, errors: errs.slice(0, 2) });
    if (h.err || errs.length || h.nodes < 3) continue;
    if (h.h > 1200) continue; // too tall for a card
    if (chosen.length && total + h.h > 900) continue;
    chosen.push(n);
    total += h.h - 32;
  }
  if (!chosen.length && candidates.length) chosen.push(candidates[0]);
  picks[comp] = chosen;
  // measure the chosen set together
  await page.goto('file://' + path.join(BUILD, 'harness.html'));
  const hh = await page.evaluate(async ([c, s]) => {
    try { window.__ds().renderStories(c, document.getElementById('root'), s); } catch { return -1; }
    await new Promise((r) => setTimeout(r, 300));
    return Math.ceil(document.getElementById('root').getBoundingClientRect().height);
  }, [storyComp, chosen]);
  heights[comp] = hh > 0 ? hh + 8 : 240;
  console.log(comp.padEnd(20), String(names.length).padStart(3), '→', chosen.join(', '), '·', heights[comp] + 'px');
}
await browser.close();
writeJson(path.join(BUILD, 'story-picks.json'), picks);
writeJson(path.join(BUILD, 'heights.json'), heights);
writeJson(path.join(BUILD, 'render-report.json'), report);
const bad = Object.entries(report).flatMap(([c, r]) => r.tried.filter((t) => t.err || t.errors?.length).map((t) => `${c}/${t.story}: ${t.err ?? t.errors.join(' | ')}`));
console.log('\nstories with errors:', bad.length ? '\n' + bad.join('\n') : 'none');
