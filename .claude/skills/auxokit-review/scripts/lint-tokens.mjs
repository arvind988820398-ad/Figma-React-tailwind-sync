#!/usr/bin/env node
// AuxoKit token linter — checks React/Tailwind source against the AuxoKit token manifest.
//
//   node lint-tokens.mjs <file|dir>... [--manifest path] [--json] [--max-warnings N]
//
// Exit code 1 when any error is found (or warnings exceed --max-warnings).
// Suppress a finding on one line with a trailing comment containing `auxokit-lint-ignore`.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const targets = argv.filter((a, i) => !a.startsWith('--') && !['--manifest', '--max-warnings'].includes(argv[i - 1]));
if (!targets.length) { console.error('usage: lint-tokens.mjs <file|dir>... [--manifest path] [--json]'); process.exit(2); }

// ---------- manifest ----------
const manifestCandidates = [
  opt('--manifest'),
  path.join(here, '..', '..', 'auxokit-design-system', 'tokens', 'token-manifest.json'),
  path.join(process.cwd(), '.claude', 'skills', 'auxokit-design-system', 'tokens', 'token-manifest.json'),
  path.join(os.homedir(), '.claude', 'skills', 'auxokit-design-system', 'tokens', 'token-manifest.json'),
].filter(Boolean);
const manifestPath = manifestCandidates.find((p) => fs.existsSync(p));
if (!manifestPath) { console.error('token-manifest.json not found; pass --manifest'); process.exit(2); }
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const C = manifest.classes;
const known = {
  bg: new Set(C.bg), text: new Set(C.text), border: new Set(C.border), ring: new Set(C.ring),
  outline: new Set(C.outline), divide: new Set(C.divide), fill: new Set(C.fill), stroke: new Set(C.stroke),
};
const radiusOk = new Set(C.radius);
const shadowOk = new Set(C.shadow);

// ---------- Tailwind vocab ----------
const PALETTE = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const paletteRe = new RegExp(`^(${PALETTE})-(50|100|200|300|400|500|600|700|800|900|950)(\\/\\d+)?$`);
const colorKeywords = new Set(['transparent', 'current', 'inherit', 'white', 'black', 'none']);
const COLOR_PREFIXES = ['bg', 'text', 'border', 'ring', 'outline', 'divide', 'fill', 'stroke', 'from', 'via', 'to', 'decoration', 'caret', 'accent', 'placeholder', 'ring-offset', 'shadow', 'inset-shadow', 'inset-ring'];
// Non-color utilities that share a color prefix.
const nonColor = {
  text: /^(xxs|xs|sm|base|lg|[2-9]?xl|left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$/,
  bg: /^(fixed|local|scroll|clip-.+|origin-.+|repeat.*|no-repeat|cover|contain|auto|center|top|bottom|left|right|left-.+|right-.+|none|blend-.+|linear-.+|radial.*|conic.*|gradient-to-.+|size-.+|position-.+|bottom-.+|top-.+)$/,
  border: /^(\d+|x|y|t|r|b|l|s|e|x-\d+|y-\d+|[trblse]-\d+|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing.*)$/,
  ring: /^(\d+|inset|offset-\d+)$/,
  outline: /^(\d+|none|hidden|dashed|dotted|double|solid|offset-\d+)$/,
  divide: /^(x|y|x-\d+|y-\d+|x-reverse|y-reverse|solid|dashed|dotted|double|none)$/,
  fill: /^(none)$/,
  stroke: /^(\d+|none)$/,
  from: /^\d+%$/, via: /^\d+%$/, to: /^\d+%$/,
  decoration: /^(\d+|solid|double|dotted|dashed|wavy|auto|from-font|clone|slice)$/,
  caret: /^$/, accent: /^(auto)$/, placeholder: /^$/, 'ring-offset': /^\d+$/,
  // Any effect style in the manifest (shadow-xs, shadow-focus-brand, shadow-top…) is a size, not a color.
  shadow: { test: (rest) => /^(xs|sm|md|lg|xl|2xl|none|inner|focus-.+)$/.test(rest) || shadowOk.has(`shadow-${rest}`) }, 'inset-shadow': /^(xs|sm|none)$/, 'inset-ring': /^\d+$/,
};
const SPACING_PREFIX = /^-?(p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|start|end|w|h|size|min-w|min-h|max-w|max-h|translate-x|translate-y|scroll-m|scroll-p|indent|basis)-(.+)$/;
const FIGMA_HALF_STEPS = new Set(['0.5', '1.5', '2.5', '3.5', '4.5']);

// ---------- suggestions ----------
const primRef = {}; // "gray-900" -> [semantic classes per role]
for (const [cls, t] of Object.entries(manifest.tokens)) {
  const v = t.values?.['modern-light'];
  const m = typeof v === 'string' && /\((?:colors\/)?([a-z]+)\/0?(\d+)\)/.exec(v);
  const ref = m ? `${m[1]}-${m[2]}` : typeof v === 'string' && /\((white|black)\)/.exec(v)?.[1];
  if (!ref) continue;
  (primRef[ref] ||= []).push({ cls, role: t.role });
}
function paletteSuggestion(prefix, name) {
  const [hue, step] = name.split('/')[0].split('-');
  const ref = `${hue === 'blue' ? 'brand' : hue}-${step}`;
  const role = prefix === 'bg' ? 'bg' : ['text', 'fill', 'stroke', 'placeholder', 'decoration', 'caret'].includes(prefix) ? 'text' : 'border';
  const rename = (c) => (role === 'border' && prefix !== 'border' ? c.replace(/^border-/, `${prefix}-`) : c);
  let hits = (primRef[ref] || []).filter((h) => h.role === role).map((h) => rename(h.cls));
  if (!hits.length) {
    // No exact match: closest step of the same hue in this role.
    const h0 = ref.split('-')[0];
    hits = Object.entries(primRef)
      .filter(([r]) => r.startsWith(h0 + '-'))
      .flatMap(([r, hs]) => hs.filter((h) => h.role === role).map((h) => [rename(h.cls), Math.abs(Number(r.split('-')[1]) - Number(step))]))
      .sort((a, b) => a[1] - b[1]).map(([c]) => c);
    hits = [...new Set(hits)];
    if (hits.length) return `closest tokens: ${hits.slice(0, 3).join(' / ')}`;
  }
  return hits.length ? `use ${hits.slice(0, 3).join(' / ')}` : `pick a semantic ${role} token (references/tokens.md)`;
}
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function nearest(cls, pool) {
  return [...pool].map((c) => [c, lev(cls, c)]).sort((x, y) => x[1] - y[1]).slice(0, 3).filter(([, d]) => d <= 6).map(([c]) => c);
}

// ---------- scanning ----------
const EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.html', '.vue', '.svelte', '.astro', '.mdx', '.css']);
function walk(p, out) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    if (/(^|\/)(node_modules|dist|build|\.next|\.git|coverage)$/.test(p)) return;
    for (const f of fs.readdirSync(p)) walk(path.join(p, f), out);
  } else if (EXT.has(path.extname(p)) && !/auxokit\.css$|\.d\.ts$|lint-tokens\.mjs$/.test(p)) out.push(p);
}
const files = [];
for (const t of targets) walk(path.resolve(t), files);

const findings = [];
const add = (file, line, col, severity, rule, cls, message) => findings.push({ file, line, col, severity, rule, class: cls, message });

const STRING_RE = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/gs;
function splitVariants(token) {
  // hover:md:bg-brand -> { variants: ['hover','md'], util: 'bg-brand', important }
  const parts = []; let depth = 0, cur = '';
  for (const ch of token) {
    if (ch === '[') depth++; else if (ch === ']') depth--;
    if (ch === ':' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur);
  let util = parts.pop();
  const important = util.startsWith('!') || util.endsWith('!');
  util = util.replace(/^!|!$/g, '');
  return { variants: parts, util, important };
}

function checkClass(file, line, col, token, isCss) {
  const { variants, util } = splitVariants(token);
  if (!util || /[{}();=<>"]/.test(util)) return;
  const neg = util.startsWith('-');
  const u = neg ? util.slice(1) : util;
  const dark = variants.includes('dark');

  // Color utilities
  for (const prefix of COLOR_PREFIXES.slice().sort((a, b) => b.length - a.length)) {
    if (!u.startsWith(prefix + '-')) continue;
    const rest = u.slice(prefix.length + 1);
    if (nonColor[prefix]?.test(rest)) {
      if (prefix === 'shadow' && !shadowOk.has(u) && u !== 'shadow-inner') add(file, line, col, 'error', 'shadow-off-scale', token, `"${u}" is not an AuxoKit effect style; use ${[...shadowOk].slice(0, 6).join(', ')}…`);
      return checkLayout(file, line, col, token, u);
    }
    if (rest.startsWith('[')) {
      if (prefix === 'text' && /^\[(length:)?[\d.]+(px|rem|em|%)?\]$/.test(rest)) add(file, line, col, 'error', 'arbitrary-text', token, 'Arbitrary font size; use text-xxs…text-6xl');
      else if (prefix === 'shadow' || prefix === 'inset-shadow') add(file, line, col, 'error', 'shadow-off-scale', token, 'Arbitrary shadow; use an AuxoKit effect style (shadow-xs … shadow-2xl, shadow-focus-*)');
      else if (/^(border|ring|outline|divide|stroke)$/.test(prefix) && /^\[(length:)?[\d.]+(px|rem)?\]$/.test(rest)) add(file, line, col, 'error', 'arbitrary-width', token, 'Arbitrary width; use border / border-2 / border-4 / border-8 (Figma border-width tokens)');
      else add(file, line, col, 'error', 'arbitrary-color', token, `Arbitrary color "${u}" bypasses tokens; use a semantic ${prefix}-* class`);
      return;
    }
    if (rest.startsWith('(')) {
      add(file, line, col, 'error', 'arbitrary-color', token, `CSS-variable shorthand "${u}" bypasses token classes; use the matching semantic class`);
      return;
    }
    if (colorKeywords.has(rest.split('/')[0])) return;
    if (paletteRe.test(rest)) {
      add(file, line, col, 'error', 'palette-color', token, `Raw Tailwind palette color (not available in strict mode) — ${paletteSuggestion(prefix, rest)}`);
      return;
    }
    const pool = known[prefix] || known[prefix === 'placeholder' || prefix === 'decoration' || prefix === 'caret' ? 'text' : 'border'];
    if (pool && pool.has(u.split('/')[0])) {
      if (u.includes('/')) add(file, line, col, 'error', 'opacity-on-token', token, 'Opacity modifiers do not work on semantic token utilities; use a dedicated token (or bg-black/N for backdrops)');
      if (dark) add(file, line, col, 'error', 'dark-override', token, 'Semantic tokens already switch in dark mode — remove the dark: color override');
      return;
    }
    if (['from', 'via', 'to', 'accent', 'caret', 'decoration', 'ring-offset', 'shadow', 'inset-shadow', 'inset-ring'].includes(prefix)) {
      add(file, line, col, 'warning', 'unknown-color', token, `"${u}" is not an AuxoKit token; gradients/accents must use primitives approved in Figma`);
      return;
    }
    const sugg = pool ? nearest(u, pool) : [];
    add(file, line, col, 'error', 'unknown-token', token, `"${u}" is not an AuxoKit ${prefix} token${sugg.length ? ` — did you mean ${sugg.join(', ')}?` : ''}`);
    return;
  }
  if (dark && /^(bg|text|border|ring|fill|stroke|divide|outline)-/.test(u)) add(file, line, col, 'error', 'dark-override', token, 'Remove dark: color override');
  checkLayout(file, line, col, token, u);
}

function checkLayout(file, line, col, token, u) {
  // Radius
  if (/^rounded(-|$)/.test(u)) {
    const m = /^rounded(?:-(?:t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee))?(?:-(.+))?$/.exec(u);
    const size = m ? m[1] : undefined;
    const normalized = size === undefined ? 'rounded' : `rounded-${size}`;
    if (size?.startsWith('[')) add(file, line, col, 'error', 'arbitrary-radius', token, 'Arbitrary radius; use rounded-xxs|xs|sm|(default)|base|lg|xl|full|none');
    else if (!radiusOk.has(normalized)) add(file, line, col, 'error', 'radius-off-scale', token, `"${normalized}" is not an AuxoKit radius (themed scale: ${[...radiusOk].join(', ')})`);
    return;
  }
  if (/^shadow(-|$)/.test(u)) {
    if (u !== 'shadow' && !shadowOk.has(u) && !/^shadow-(none|inner)$/.test(u)) add(file, line, col, u.includes('[') ? 'error' : 'error', 'shadow-off-scale', token, `"${u}" is not an AuxoKit effect style`);
    return;
  }
  if (/^font-\[/.test(u)) { add(file, line, col, 'error', 'arbitrary-font', token, 'Arbitrary font family/weight; the theme sets the font (font-sans) and weights are font-normal|medium|semibold|bold|extrabold'); return; }
  if (/^font-(serif|mono)$/.test(u)) { add(file, line, col, 'warning', 'font-family', token, 'AuxoKit themes define one base font (font-sans); confirm this family exists in Figma'); return; }
  if (/^font-(thin|extralight|light|black)$/.test(u)) { add(file, line, col, 'warning', 'font-weight', token, 'Weight not used by AuxoKit theme tokens (normal|medium|semibold|bold|extrabold)'); return; }
  if (/^text-\[/.test(u)) { add(file, line, col, 'error', 'arbitrary-text', token, 'Arbitrary font size; use text-xxs…text-6xl'); return; }
  if (/^text-([7-9]xl)$/.test(u)) { add(file, line, col, 'warning', 'text-size', token, 'text-7xl+ exist only as primitives, not theme typography tokens'); return; }
  if (/^(leading|tracking)-\[/.test(u)) { add(file, line, col, 'error', 'arbitrary-typography', token, 'Arbitrary line-height/tracking; use leading-none|tight|relaxed|loose|4…10 and tracking-tighter|tight'); return; }
  if (/^z-\[/.test(u)) { add(file, line, col, 'warning', 'arbitrary-z', token, 'Use z-N integers from the overlay ladder (z-40 menus, z-50 modals, z-60 toasts)'); return; }
  const sp = SPACING_PREFIX.exec(u);
  if (sp) {
    const v = sp[2];
    if (v.startsWith('[')) {
      const sizing = /^(w|h|size|min-w|min-h|max-w|max-h|top|right|bottom|left|start|end|inset|inset-x|inset-y|translate-x|translate-y|basis)$/.test(sp[1]);
      add(file, line, col, sizing ? 'warning' : 'error', 'arbitrary-spacing', token, sizing ? 'Arbitrary size — prefer the 4px scale or a max-w-* container token' : 'Arbitrary spacing; use the 4px scale (Figma spacing/N = N×4px)');
    } else if (/^\d+\.\d+$/.test(v) && !FIGMA_HALF_STEPS.has(v)) {
      add(file, line, col, 'warning', 'spacing-off-grid', token, `"${v}" is not a Figma spacing step (fractions allowed: 0.5, 1.5, 2.5, 3.5, 4.5)`);
    }
  }
}

const CLASSY = /^(?:[a-z0-9@&_[\]().\-*>~+'"=#%,/!]+:)*!?-?(bg|text|border|ring|outline|divide|fill|stroke|from|via|to|decoration|caret|accent|placeholder|shadow|rounded|font|leading|tracking|z|p[xytrblse]?|m[xytrblse]?|gap|gap-[xy]|space-[xy]|inset|top|right|bottom|left|start|end|w|h|size|min-[wh]|max-[wh]|translate-[xy]|basis|indent|scroll-[mp])(-|$)/;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const lineOf = (idx) => { let l = 0, c = idx; for (; l < lines.length && c > lines[l].length; l++) c -= lines[l].length + 1; return [l + 1, c + 1]; };
  const ignored = (ln) => /auxokit-lint-ignore/.test(lines[ln - 1] || '');
  const isCss = file.endsWith('.css');

  const scanText = (text, offset) => {
    const re = /\S+/g; let m;
    while ((m = re.exec(text))) {
      const tok = m[0].replace(/[,;.]$/, ''); // prose in strings: drop trailing punctuation (no class ends in . , ;)
      if (!CLASSY.test(tok)) continue;
      const [ln, col] = lineOf(offset + m.index);
      if (ignored(ln)) continue;
      checkClass(file, ln, col, tok, isCss);
    }
  };

  if (isCss) {
    // @apply lines + hardcoded colors outside the generated token file
    const applyRe = /@apply\s+([^;]+);/g; let m;
    while ((m = applyRe.exec(src))) scanText(m[1], m.index + m[0].indexOf(m[1]));
    const hexRe = /(?<![\w-])(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\))/g;
    while ((m = hexRe.exec(src))) { const [ln, col] = lineOf(m.index); if (!ignored(ln)) add(file, ln, col, 'warning', 'hardcoded-color', m[0], 'Hardcoded color in CSS; reference var(--ax-…) tokens'); }
    continue;
  }

  let m;
  STRING_RE.lastIndex = 0;
  while ((m = STRING_RE.exec(src))) {
    const body = m[2];
    const start = m.index + 1;
    // A lone token used as an object key or a union/type literal is a prop value, not a class:
    //   type V = 'default' | 'border-top';   { 'border-top': '…' }
    if (!/\s/.test(body.trim())) {
      const after = src.slice(m.index + m[0].length).match(/^\s*(\S)/)?.[1];
      const before = src.slice(0, m.index).match(/(\S)\s*$/)?.[1];
      if (after === ':' || before === '|' || (after === '|' && before === '=')) continue;
    }
    if (m[1] === '`') {
      // template literals: scan static parts only
      const parts = body.split(/\$\{[^}]*\}/);
      let off = 0;
      for (const part of parts) { scanText(part, start + body.indexOf(part, off)); off = body.indexOf(part, off) + part.length; }
    } else scanText(body, start);
    const hex = /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}|rgba?\(.*\)|hsla?\(.*\))$/.exec(body.trim());
    if (hex) { const [ln, col] = lineOf(start); if (!ignored(ln)) add(file, ln, col, 'warning', 'hardcoded-color', body, 'Hardcoded color value; use a semantic token class (or var(--ax-…) when a class is impossible)'); }
  }

  // Component-usage hints: hand-rolled controls that should be AuxoKit components
  const base = path.basename(file);
  const checks = [
    { re: /<button\b[^>]*className=["'{][^>]*\bbg-(brand|success|danger|warning|dark|neutral-secondary-medium)\b/g, comp: 'Button', skip: /^Button\./ },
    { re: /<input\b(?![^>]*type=["'](checkbox|radio|range|file|hidden)["'])[^>]*className=["'{][^>]*\brounded-base\b/g, comp: 'Input', skip: /^Input\./ },
    { re: /<span\b[^>]*className=["'{][^>]*\brounded-sm\b[^>]*\bborder\b[^>]*\bfont-medium\b/g, comp: 'Badge', skip: /^Badge\./ },
  ];
  for (const c of checks) {
    if (c.skip.test(base)) continue;
    let mm; c.re.lastIndex = 0;
    while ((mm = c.re.exec(src))) { const [ln, col] = lineOf(mm.index); if (!ignored(ln)) add(file, ln, col, 'info', 'use-component', `<${mm[0].slice(1, mm[0].indexOf(' '))}>`, `Hand-rolled control — use the AuxoKit <${c.comp}> component`); }
  }
}

// ---------- report ----------
const order = { error: 0, warning: 1, info: 2 };
findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || order[a.severity] - order[b.severity]);
const counts = { error: 0, warning: 0, info: 0 };
for (const f of findings) counts[f.severity]++;

if (flag('--json')) {
  console.log(JSON.stringify({ manifest: manifestPath, files: files.length, counts, findings }, null, 2));
} else {
  let cur = '';
  for (const f of findings) {
    if (f.file !== cur) { cur = f.file; console.log(`\n${path.relative(process.cwd(), f.file)}`); }
    console.log(`  ${String(f.line).padStart(4)}:${String(f.col).padEnd(3)} ${f.severity.padEnd(7)} ${f.rule.padEnd(18)} ${f.class}  — ${f.message}`);
  }
  console.log(`\n${files.length} file(s) · ${counts.error} error(s) · ${counts.warning} warning(s) · ${counts.info} hint(s)  [manifest: ${manifestPath}]`);
}
const maxWarn = Number(opt('--max-warnings', 'Infinity'));
process.exit(counts.error > 0 || counts.warning > maxWarn ? 1 : 0);
