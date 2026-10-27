#!/usr/bin/env node
// AuxoKit token builder: Figma variable exports -> Tailwind v4 CSS + machine-readable manifest.
//
//   node build-tokens.mjs [--tokens <dir>] [--out <dir>] [--no-strict]
//
// Reads  <tokens>/figma-primitives.json, figma-themes.json, figma-effects.json
// Writes <out>/auxokit.css            (import after `@import "tailwindcss";`)
//        <out>/token-manifest.json    (used by the review linter and the sync diff)
//
// Naming contract (never change without updating Figma):
//   Figma `colors/background/bg-brand`   -> CSS var --ax-bg-brand        -> class `bg-brand`
//   Figma `colors/text/text-heading`     -> CSS var --ax-text-heading    -> class `text-heading` (+ fill-/stroke-)
//   Figma `colors/border/border-default` -> CSS var --ax-border-default  -> class `border-default` (+ ring-/outline-/divide-)
//   Figma `border/border-radius/rounded-base` -> --ax-rounded-base       -> class `rounded-base`
//   Figma `typography/font-family/font-base`  -> --ax-font-base          -> class `font-sans` (default body font)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const tokensDir = path.resolve(arg('--tokens', path.join(here, '..', 'tokens')));
const outDir = path.resolve(arg('--out', tokensDir));
const strict = !args.includes('--no-strict');

const read = (f) => JSON.parse(fs.readFileSync(path.join(tokensDir, f), 'utf8'));
const prim = read('figma-primitives.json');
const themes = read('figma-themes.json');
const effects = read('figma-effects.json');

const warnings = [];

// ---------- helpers ----------
const px = (n) => (n === 0 ? '0' : `${n}px`);
const primVarName = (figmaName) => {
  // colors/brand/050 -> brand-50 ; white -> white ; colors/green/50 -> green-50
  const parts = figmaName.replace(/^colors\//, '').split('/');
  if (parts.length === 2) parts[1] = String(Number(parts[1]));
  return parts.join('-');
};
const modeKey = (m) => {
  const match = /^(.+?)\s*\((light|dark)\)$/i.exec(m.trim());
  if (!match) throw new Error(`Unexpected mode name "${m}" — expected "Theme (light|dark)"`);
  return { theme: match[1].trim().toLowerCase().replace(/\s+/g, '-'), scheme: match[2].toLowerCase() };
};
const modes = themes.modes.map(modeKey);
const valueFor = (tok, i) => (Array.isArray(tok.v) ? tok.v[i] : tok.v);

function resolvePrimitive(ref) {
  const name = ref.slice(1, -1);
  const t = prim.tokens[name];
  if (!t) throw new Error(`Alias ${ref} not found in Primitives`);
  return { name, value: t.v, type: t.t };
}

// Returns { css, hex } for a themed value in mode i.
// "{~name}" aliases point inside the Themes collection (same mode); "{name}" point to Primitives.
function themedValue(tok, i, kind) {
  let raw = valueFor(tok, i);
  for (let hops = 0; typeof raw === 'string' && raw.startsWith('{~'); hops++) {
    const target = themes.tokens[raw.slice(2, -1)];
    if (!target || hops > 10) throw new Error(`Unresolvable Themes alias ${raw}`);
    raw = valueFor(target, i);
  }
  if (typeof raw === 'string' && raw.startsWith('{')) {
    const p = resolvePrimitive(raw);
    if (kind === 'color') return { css: `var(--ax-${primVarName(p.name)})`, hex: p.value, ref: p.name };
    if (kind === 'px') return { css: px(p.value), hex: p.value, ref: p.name };
    return { css: String(p.value), hex: p.value, ref: p.name };
  }
  if (kind === 'px') return { css: px(raw), hex: raw };
  return { css: String(raw), hex: raw };
}

// ---------- classify theme tokens ----------
const semantic = []; // { figma, cssVar, role, className, kind }
for (const [figma, tok] of Object.entries(themes.tokens)) {
  let m;
  if ((m = /^colors\/background\/(bg-.+)$/.exec(figma)) || (m = /^(bg-variants-.+)$/.exec(figma))) {
    semantic.push({ figma, role: 'bg', className: m[1], cssVar: `--ax-${m[1]}`, kind: 'color', tok });
  } else if ((m = /^colors\/text\/(text-.+)$/.exec(figma))) {
    semantic.push({ figma, role: 'text', className: m[1], cssVar: `--ax-${m[1]}`, kind: 'color', tok });
  } else if ((m = /^colors\/border\/(border-.+)$/.exec(figma))) {
    semantic.push({ figma, role: 'border', className: m[1], cssVar: `--ax-${m[1]}`, kind: 'color', tok });
  } else if ((m = /^border\/border-radius\/(rounded(?:-.+)?)$/.exec(figma))) {
    semantic.push({ figma, role: 'radius', className: m[1], cssVar: `--ax-${m[1]}`, kind: 'px', tok });
  } else if (figma === 'typography/font-family/font-base') {
    semantic.push({ figma, role: 'font', className: 'font-sans', cssVar: '--ax-font-base', kind: 'font', tok });
  } else if (figma === 'typography/font-size/text-xxs') {
    semantic.push({ figma, role: 'text-size', className: 'text-xxs', cssVar: '--ax-text-xxs', kind: 'px', tok });
  } else {
    // Mode-invariant structural tokens (spacing, max-width, containers, widths, weights, sizes).
    // Tailwind's defaults already match these; verify instead of re-emitting.
    if (Array.isArray(tok.v)) warnings.push(`Token ${figma} varies by mode but has no code mapping — add one in build-tokens.mjs`);
  }
}

// ---------- verify Tailwind defaults still match Figma ----------
const tailwindDefaults = {
  'font/size/xs': 12, 'font/size/sm': 14, 'font/size/base': 16, 'font/size/lg': 18, 'font/size/xl': 20,
  'font/size/2xl': 24, 'font/size/3xl': 30, 'font/size/4xl': 36, 'font/size/5xl': 48, 'font/size/6xl': 60,
  'font/size/7xl': 72, 'font/size/8xl': 96, 'font/size/9xl': 128,
  'max-width/max-w-xs': 320, 'max-width/max-w-sm': 384, 'max-width/max-w-md': 448, 'max-width/max-w-lg': 512,
  'max-width/max-w-xl': 576, 'max-width/max-w-2xl': 672, 'max-width/max-w-3xl': 768, 'max-width/max-w-4xl': 896,
  'max-width/max-w-5xl': 1024, 'max-width/max-w-6xl': 1152, 'max-width/max-w-7xl': 1280,
  'container/sm': 640, 'container/md': 768, 'container/lg': 1024, 'container/xl': 1280, 'container/2xl': 1536,
  'border/border-width/border': 1, 'border/border-width/border-2': 2, 'border/border-width/border-4': 4, 'border/border-width/border-8': 8,
};
for (const [name, expected] of Object.entries(tailwindDefaults)) {
  const t = prim.tokens[name];
  if (!t) warnings.push(`Primitive ${name} missing in Figma export`);
  else if (t.v !== expected) warnings.push(`Primitive ${name} = ${t.v} in Figma but Tailwind default is ${expected} — Tailwind default kept; fix Figma or add an override`);
}
for (const [name, t] of Object.entries(prim.tokens)) {
  const m = /^spacing\/(.+)$/.exec(name);
  if (!m) continue;
  const step = m[1] === 'px' ? null : Number(m[1].replace('․', '.'));
  if (step !== null && t.v !== step * 4) warnings.push(`Spacing ${name} = ${t.v}px breaks the 4px scale (expected ${step * 4}px)`);
}

// ---------- emit CSS ----------
const L = [];
const line = (s = '') => L.push(s);
const stamp = `${themes.source.fileKey} · themes ${themes.source.exportedAt} · primitives ${prim.source.exportedAt}`;

line('/* ==========================================================================');
line('   AuxoKit design tokens for Tailwind CSS v4 — GENERATED, DO NOT EDIT BY HAND.');
line(`   Source: Figma ${stamp}`);
line('   Regenerate: node .claude/skills/auxokit-design-system/scripts/build-tokens.mjs');
line('   Usage (main CSS):  @import "tailwindcss";  @import "./auxokit.css";');
line('   Theme switch:      <html data-theme="modern|minimal|enterprise|mono" class="dark?">');
line('   ========================================================================== */');
line();
line('@custom-variant dark (&:where(.dark, .dark *));');
line();

// Primitives
line('/* ---------- Primitives (Figma collection "Primitives") ---------- */');
line(':root {');
for (const [name, t] of Object.entries(prim.tokens)) {
  if (t.t === 'C') line(`  --ax-${primVarName(name)}: ${t.v};`);
}
line('}');
line();

// Theme modes
const fontStack = (family) => {
  const generic = /mono/i.test(family) ? 'ui-monospace, monospace' : /serif/i.test(family) && !/sans/i.test(family) ? 'ui-serif, Georgia, serif' : 'ui-sans-serif, system-ui, sans-serif';
  return `"${family}", ${generic}`;
};
line('/* ---------- Semantic tokens per theme mode (Figma collection "Themes") ---------- */');
modes.forEach((mode, i) => {
  const sel = mode.scheme === 'light'
    ? [`[data-theme="${mode.theme}"]`]
    : [`[data-theme="${mode.theme}"].dark`, `.dark [data-theme="${mode.theme}"]`];
  if (mode.theme === 'modern') sel.unshift(mode.scheme === 'light' ? ':root' : ':root.dark');
  line(`/* ${themes.modes[i]} */`);
  line(`${sel.join(',\n')} {`);
  line(`  color-scheme: ${mode.scheme};`);
  for (const s of semantic) {
    if (s.kind === 'font') {
      const v = themedValue(s.tok, i, 'raw');
      line(`  ${s.cssVar}: ${fontStack(String(v.hex))};`);
    } else {
      line(`  ${s.cssVar}: ${themedValue(s.tok, i, s.kind).css};`);
    }
  }
  line('}');
  line();
});

// Tailwind theme (inline so nested [data-theme] scopes resolve correctly)
const radius = Object.fromEntries(semantic.filter((s) => s.role === 'radius').map((s) => [s.className, s.cssVar]));
line('/* ---------- Tailwind theme ---------- */');
line('@theme inline {');
if (strict) {
  line('  /* Strict mode: Tailwind\'s default palette is removed so only AuxoKit tokens can be used.');
  line('     Build with --no-strict to keep the default palette during a migration. */');
  line('  --color-*: initial;');
  line('  --color-white: var(--ax-white);');
  line('  --color-black: var(--ax-black);');
}
line('  --font-sans: var(--ax-font-base);');
line('  --text-xxs: var(--ax-text-xxs);');
for (const size of ['xxs', 'xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl']) {
  line(`  --text-${size}--line-height: 1.5;`);
}
const radiusMap = {
  'rounded-0': null, // Tailwind `rounded-none`
  'rounded-xxs': '--radius-xxs', 'rounded-xs': '--radius-xs', 'rounded-sm': '--radius-sm', rounded: '--radius',
  'rounded-base': '--radius-base', 'rounded-lg': '--radius-lg', 'rounded-xl': '--radius-xl', 'rounded-full': null,
};
for (const [cls, twVar] of Object.entries(radiusMap)) {
  if (!twVar) continue;
  if (!radius[cls]) { warnings.push(`Radius token ${cls} missing in Figma export`); continue; }
  line(`  ${twVar}: var(${radius[cls]});`);
}
for (const s of semantic.filter((x) => x.role === 'radius')) {
  if (!(s.className in radiusMap)) warnings.push(`New radius token ${s.className} has no Tailwind mapping — add it to radiusMap`);
}
const shadowCss = (layers) =>
  layers
    .map((l) => {
      const color = l.colorToken
        ? `var(--ax-${l.colorToken.split('/').pop()})`
        : l.alpha >= 1 ? l.color : `color-mix(in srgb, ${l.color} ${+(l.alpha * 100).toFixed(1)}%, transparent)`;
      return `${px(l.x)} ${px(l.y)} ${px(l.blur)} ${px(l.spread)} ${color}`;
    })
    .join(', ');
// `shadow-blue-600/50`-style styles are Tailwind colored-shadow demos, not tokens.
const effectNames = Object.keys(effects.effects).filter((n) => !n.includes('/'));
for (const name of effectNames) {
  const layers = effects.effects[name];
  if (name === 'shadow') { line(`  --shadow-sm: ${shadowCss(layers)}; /* Figma "shadow" (Tailwind \`shadow\`/\`shadow-sm\`) */`); continue; }
  const tw = name.startsWith('focus-') ? `--shadow-${name}` : `--${name.replace(/^shadow/, 'shadow')}`;
  line(`  ${tw}: ${shadowCss(layers)};`);
}
line('}');
line();

// Role-bound color utilities with exact Figma names
line('/* ---------- Semantic color utilities (class name == Figma variable name) ---------- */');
const classes = { bg: [], text: [], border: [], fill: [], stroke: [], ring: [], outline: [], divide: [] };
for (const s of semantic) {
  const v = `var(${s.cssVar})`;
  // SVG paint utilities come from both bg-* (shapes: spinner arc/track) and text-* (icons) tokens.
  const svgPaint = (suffix) => {
    if (classes.fill.includes(`fill-${suffix}`)) return; // bg-white and text-white share a name and value
    line(`@utility fill-${suffix} { fill: ${v}; }`);
    line(`@utility stroke-${suffix} { stroke: ${v}; }`);
    classes.fill.push(`fill-${suffix}`); classes.stroke.push(`stroke-${suffix}`);
  };
  if (s.role === 'bg') {
    line(`@utility ${s.className} { background-color: ${v}; }`);
    classes.bg.push(s.className);
    svgPaint(s.className.replace(/^bg-/, ''));
  } else if (s.role === 'text') {
    line(`@utility ${s.className} { color: ${v}; }`);
    classes.text.push(s.className);
    svgPaint(s.className.replace(/^text-/, ''));
  } else if (s.role === 'border') {
    const suffix = s.className.replace(/^border-/, '');
    line(`@utility ${s.className} { border-color: ${v}; }`);
    line(`@utility ring-${suffix} { --tw-ring-color: ${v}; }`);
    line(`@utility outline-${suffix} { outline-color: ${v}; }`);
    line(`@utility divide-${suffix} { & > :not(:last-child) { border-color: ${v}; } }`);
    classes.border.push(s.className); classes.ring.push(`ring-${suffix}`); classes.outline.push(`outline-${suffix}`); classes.divide.push(`divide-${suffix}`);
  }
}
line();
line('@layer base {');
line('  *, ::before, ::after, ::backdrop { border-color: var(--ax-border-default); }');
line('  body { background-color: var(--ax-bg-neutral-primary); }');
line('  /* Re-apply on every theme scope: custom properties resolve where declared, so a nested');
line('     [data-theme] must set its own font/color instead of inheriting the root\'s computed value. */');
line('  html, [data-theme] { font-family: var(--ax-font-base); color: var(--ax-text-body); }');
line('}');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'auxokit.css'), L.join('\n') + '\n');

// ---------- manifest ----------
const manifest = {
  generatedFrom: { fileKey: themes.source.fileKey, themesExportedAt: themes.source.exportedAt, primitivesExportedAt: prim.source.exportedAt },
  themes: [...new Set(modes.map((m) => m.theme))],
  modes: modes.map((m, i) => ({ figma: themes.modes[i], theme: m.theme, scheme: m.scheme })),
  classes: {
    ...classes,
    radius: ['rounded-none', 'rounded-xxs', 'rounded-xs', 'rounded-sm', 'rounded', 'rounded-base', 'rounded-lg', 'rounded-xl', 'rounded-full'],
    shadow: ['shadow-none', 'shadow-sm', ...effectNames.map((n) => (n.startsWith('focus-') ? `shadow-${n}` : n))],
    fontSize: ['text-xxs', 'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl'],
  },
  primitiveColors: Object.keys(prim.tokens).filter((n) => prim.tokens[n].t === 'C').map(primVarName),
  tokens: Object.fromEntries(
    semantic.map((s) => [
      s.className === 'font-sans' ? 'font-base' : s.className,
      {
        figma: s.figma,
        role: s.role,
        cssVar: s.cssVar,
        values: Object.fromEntries(
          modes.map((m, i) => {
            const v = themedValue(s.tok, i, s.kind === 'font' ? 'raw' : s.kind);
            return [`${m.theme}-${m.scheme}`, v.ref ? `${v.hex} (${v.ref})` : v.hex];
          }),
        ),
      },
    ]),
  ),
  warnings,
};
fs.writeFileSync(path.join(outDir, 'token-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`Wrote ${path.join(outDir, 'auxokit.css')}`);
console.log(`Wrote ${path.join(outDir, 'token-manifest.json')}`);
console.log(`${semantic.length} semantic tokens · ${modes.length} modes · strict=${strict}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log('  - ' + w);
}
