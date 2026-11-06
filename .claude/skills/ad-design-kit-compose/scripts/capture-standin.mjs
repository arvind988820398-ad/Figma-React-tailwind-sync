#!/usr/bin/env node
// Captures the stand-in a screen uses for a gap, as it renders, for the Gaps for Figma table in Storybook.
//
//   node capture-standin.mjs <url> <selector> <out.png> [--click "<text>"]... [--hover "<text>"] [--width 1440] [--height 900] [--pad 12]
//
// <selector> is a CSS selector, or text:"…" for the smallest element containing that text. Each --click clicks the
// element with that accessible name (button or link) first, in order, e.g. to open the panel that holds the stand-in;
// --hover then rests the pointer on one, to show what appears on hover (a row's menu).
// Saves a 2× PNG cropped to the element plus --pad px. Pair it with the Figma crop of the same region
// (<id>-figma.png, from get_screenshot on the reference node) next to gaps.json.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const clicks = args.flatMap((a, i) => (a === '--click' ? [args[i + 1]] : []));
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
// Stories render inside Storybook's iframe.html, which is fine to pass as <url> directly.
const [url, selector, out] = positional;
if (!url || !selector || !out) {
  console.error('usage: capture-standin.mjs <url> <selector|text:"…"> <out.png> [--click "<name>"]... [--width 1440] [--height 900] [--pad 12]');
  process.exit(2);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const { chromium } = await import(path.join(root, 'node_modules/playwright/index.mjs'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(opt('width', 1440)), height: Number(opt('height', 900)) }, deviceScaleFactor: 2 });
await page.goto(url);
await page.waitForLoadState('networkidle');
for (const name of clicks) {
  await page.getByRole('button', { name }).or(page.getByRole('link', { name })).first().click();
  await page.waitForTimeout(500);
}
const hover = opt('hover');
if (hover) {
  await page.getByRole('link', { name: new RegExp(hover) }).or(page.getByRole('button', { name: new RegExp(hover) })).first().hover();
  await page.waitForTimeout(400);
}
const target = selector.startsWith('text:') ? page.getByText(selector.slice(5).replace(/^"|"$/g, ''), { exact: true }).first().locator('xpath=..') : page.locator(selector).first();
await target.waitFor();
await page.waitForTimeout(600); // let entrance transitions settle
const box = await target.boundingBox();
const pad = Number(opt('pad', 12));
await page.screenshot({ path: out, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + 2 * pad, height: box.height + 2 * pad } });
console.log(`Saved ${out} (${Math.round(box.width)}×${Math.round(box.height)} CSS px at 2×)`);
await browser.close();
