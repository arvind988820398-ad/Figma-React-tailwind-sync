// Builds tokens.json + tokens.css for the published design system from the generated
// token CSS, the Figma effect styles and the token docs.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, OUT, ensure, sha as gitSha, repoSlug } from './lib.mjs';

ensure(OUT);

const css = fs.readFileSync(path.join(REPO, 'src/styles/ad-design-kit.css'), 'utf8');
const tokensMd = fs.readFileSync(path.join(REPO, '.claude/skills/ad-design-kit-design-system/references/tokens.md'), 'utf8');
const effects = JSON.parse(fs.readFileSync(path.join(REPO, '.claude/skills/ad-design-kit-design-system/tokens/figma-effects.json'), 'utf8')).effects;
const sha = gitSha();
const now = new Date().toISOString();

// ---- parse CSS blocks -------------------------------------------------------
function block(selectorRe) {
  const m = css.match(selectorRe);
  if (!m) throw new Error('block not found: ' + selectorRe);
  const start = css.indexOf('{', m.index) + 1;
  const end = css.indexOf('}', start);
  const vars = {};
  for (const line of css.slice(start, end).split('\n')) {
    const mm = line.match(/^\s*--([a-z0-9-]+):\s*(.+?);/i);
    if (mm) vars[mm[1]] = mm[2].trim();
  }
  return vars;
}
const primitives = block(/^:root \{/m);
const modes = {
  modern: block(/^:root,\n\[data-theme="modern"\] \{/m),
  'modern-dark': block(/^:root\.dark,\n/m),
  enterprise: block(/^\[data-theme="enterprise"\] \{/m),
  'enterprise-dark': block(/^\[data-theme="enterprise"\]\.dark,\n/m),
};
const themeIds = Object.keys(modes);
const themes = [
  { id: 'modern', name: 'Modern · light' },
  { id: 'modern-dark', name: 'Modern · dark' },
  { id: 'enterprise', name: 'Enterprise · light' },
  { id: 'enterprise-dark', name: 'Enterprise · dark' },
];

// ---- usage notes from tokens.md ---------------------------------------------
const usage = {};
for (const line of tokensMd.split('\n')) {
  const m = line.match(/^\| `([a-z0-9-]+)` \| (.+?) \|/);
  if (m && !m[2].startsWith('---')) usage[m[1]] = m[2].replace(/\s+\|.*$/, '');
}
// cls in the docs tables is the Tailwind class; the variable is adk-<role>-<rest> where role is bg|text|border.
function noteFor(name) {
  // name like adk-bg-brand, adk-text-heading, adk-border-default
  const m = name.match(/^adk-(bg|text|border)-(.+)$/);
  if (!m) return undefined;
  const cls = `${m[1]}-${m[2]}`;
  return usage[cls];
}
const prettyScale = (n) => {
  const m = n.match(/^adk-([a-z]+)-(\d+|alpha-\d+)$/);
  return m ? `${m[1]}/${m[2]}` : n.replace(/^adk-/, '');
};

// ---- colors -------------------------------------------------------------------
const colorTokens = [];
const seen = new Set();
const isColorValue = (v) => /^#([0-9a-f]{3,8})$/i.test(v) || /^var\(--adk-/.test(v);

// primitives first
for (const [name, value] of Object.entries(primitives)) {
  if (!isColorValue(value)) continue;
  const full = 'adk-' + name.replace(/^adk-/, '');
  colorTokens.push({
    name: full,
    value: value.toLowerCase(),
    usage: `Primitive \`${prettyScale(full)}\` from the Figma Primitives collection. Never use it directly in UI: reference it through a semantic \`adk-bg-*\`, \`adk-text-*\` or \`adk-border-*\` token so themes and dark mode keep working.`,
  });
  seen.add(full);
}
// semantic tokens, in the order of the modern block
const skippedVars = [];
for (const name of Object.keys(modes.modern)) {
  const full = name;
  const v0 = modes.modern[name];
  if (!isColorValue(v0)) continue;
  const value = {};
  for (const id of themeIds) {
    const v = modes[id][name];
    if (v === undefined) continue;
    if (/^var\(--(adk-[a-z0-9-]+)\)$/.test(v)) value[id] = '{' + v.match(/^var\(--(adk-[a-z0-9-]+)\)$/)[1] + '}';
    else if (/^#[0-9a-f]{3,8}$/i.test(v)) value[id] = v.toLowerCase();
    else skippedVars.push(`${name} (${id}: ${v})`);
  }
  const roleNote = noteFor(full);
  const modernVals = themeIds.map((id) => `${id}: ${value[id]?.replace(/[{}]/g, '').replace(/^adk-/, '') ?? '–'}`).join(' · ');
  colorTokens.push({
    name: full,
    value,
    usage: (roleNote ? roleNote + ' ' : '') + `Tailwind class \`${full.replace(/^adk-/, '')}\`. Per theme: ${modernVals}.`,
  });
  seen.add(full);
}

// ---- radius (Modern values; Enterprise differs, see usage) -----------------------
const radiusDefaults = {
  'adk-rounded-0': 'Square corners; `rounded-0`.',
  'adk-rounded-xxs': '`rounded-xxs`: hairline-rounded corners on tiny elements.',
  'adk-rounded-xs': '`rounded-xs`: Checkbox box.',
  'adk-rounded-sm': '`rounded-sm`: Badges.',
  'adk-rounded': '`rounded`: dropdown rows and buttons nested inside other components.',
  'adk-rounded-base': '`rounded-base`: the default for buttons, inputs, cards, modals, alerts, menus and tooltips.',
  'adk-rounded-lg': '`rounded-lg`: large cards and media.',
  'adk-rounded-xl': '`rounded-xl`: marketing sections and device mockups.',
  'adk-rounded-full': '`rounded-full`: pills, avatars, toggles, radios and status dots.',
};
const radiusTokens = [];
for (const [name, v] of Object.entries(modes.modern)) {
  if (!name.startsWith('adk-rounded')) continue;
  const ent = modes.enterprise[name];
  const value = v === '0' ? '0' : v;
  radiusTokens.push({
    name,
    value,
    usage: `${radiusDefaults[name] ?? ''} Themed in the source: Modern ${v === '0' ? '0' : v}, Enterprise ${ent === '0' ? '0' : ent} (the Enterprise value is applied by the component stylesheet under \`[data-theme="enterprise"]\`). Never use \`rounded-md\`, \`rounded-2xl\` or arbitrary values.`.trim(),
  });
}

// ---- spacing (Figma spacing/N = N × 4px) ---------------------------------------
const steps = ['0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8', '9', '10', '11', '12', '14', '16', '20', '24', '28', '32', '36', '40', '44', '48', '52', '56', '60', '64', '72', '80', '96'];
const spacingUse = {
  '0': 'No space.', px: '1px hairline offsets (`-space-x-px` in ButtonGroup).', '0.5': 'Icon nudges and the gap between a dot and its label.',
  '1': 'Tight gaps inside badges and inner padding of Speed dial containers.', '1.5': 'Gap between a button label and its icon; xs button vertical padding.',
  '2': 'Padding of dropdown rows, inner padding of menus, gap in lists; sm button vertical padding.', '2.5': 'Base button vertical padding; input padding.',
  '3': 'xs/sm button horizontal padding; gap between buttons in a row; Speed dial gap.', '3.5': 'xl button vertical padding.',
  '4': 'Base button horizontal padding; card and alert padding; page gutter (`px-4`).', '4.5': 'Rare in-between step kept for Figma parity.',
  '5': 'lg button horizontal padding; modal body padding.', '6': 'xl button horizontal padding; card padding on desktop; Speed dial offset (`end-6 bottom-6`).',
  '8': 'Section padding inside drawers and modals; icon-shape sizes.', '10': 'Height of a base control (40px).', '12': 'Height of an xl control / Speed dial trigger (48px).',
  '16': 'Vertical rhythm between marketing sections on mobile.', '20': 'Vertical rhythm between marketing sections on desktop.',
};
const spacingTokens = steps.map((s) => ({
  name: `spacing-${s}`,
  value: s === 'px' ? '1px' : s === '0' ? '0' : `${Number(s) * 4}px`,
  usage: `${spacingUse[s] ?? 'Layout step from the 4px scale.'} Tailwind \`p-${s}\`, \`gap-${s}\`, \`m-${s}\`, \`w-${s}\`… (Figma \`spacing/${s}\`). Only these steps exist; no arbitrary values.`,
}));

// ---- shadows (from Figma effect styles; focus rings resolve their token per theme) --
const hexToRgba = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
const resolve = (themeId, varName) => {
  let v = modes[themeId][varName] ?? primitives[varName];
  let guard = 0;
  while (/^var\(/.test(v) && guard++ < 10) {
    const ref = v.match(/^var\(--(adk-[a-z0-9-]+)\)$/)[1];
    v = modes[themeId][ref] ?? primitives[ref.replace(/^adk-/, '')] ?? primitives[ref];
  }
  return v;
};
const shadowMap = {
  'shadow-xs': ['shadow-xs', 'Default on buttons, inputs and cards (`shadow-xs`).'],
  'shadow': ['shadow-sm', 'Small raised elements; Figma "shadow" (Tailwind `shadow` / `shadow-sm`).'],
  'shadow-md': ['shadow-md', 'Tooltips (`shadow-md`).'],
  'shadow-lg': ['shadow-lg', 'Dropdowns, popovers, toasts and menus such as the Speed dial (`shadow-lg`).'],
  'shadow-xl': ['shadow-xl', 'Modals and drawers (`shadow-xl`).'],
  'shadow-2xl': ['shadow-2xl', 'Rare: marketing mockups (`shadow-2xl`).'],
  'shadow-bottom-dropdown': ['shadow-bottom-dropdown', 'Scroll-edge shadow under the header of a scrolling Dropdown list.'],
  'shadow-top': ['shadow-top', 'Scroll-edge shadow above the footer of a scrolling Dropdown list.'],
  'focus-brand': ['shadow-focus-brand', 'Focus ring for brand/primary controls, inputs, checkboxes and toggles; apply with `focus-visible:` and `outline-none`.'],
  'focus-secondary': ['shadow-focus-secondary', 'Focus ring for Secondary, Tertiary and Ghost buttons.'],
  'focus-success': ['shadow-focus-success', 'Focus ring for Success buttons.'],
  'focus-danger': ['shadow-focus-danger', 'Focus ring for Danger buttons.'],
  'focus-warning': ['shadow-focus-warning', 'Focus ring for Warning buttons.'],
  'focus-dark': ['shadow-focus-dark', 'Focus ring for Dark buttons.'],
};
const shadowTokens = [];
for (const [fig, [name, use]] of Object.entries(shadowMap)) {
  const layers = effects[fig];
  const build = (themeId) =>
    layers
      .map((l) => {
        const color = l.colorToken ? resolve(themeId, 'adk-' + l.colorToken.split('/').pop()) : hexToRgba(l.color, l.alpha);
        return `${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${color}`;
      })
      .join(', ');
  const perTheme = layers.some((l) => l.colorToken);
  shadowTokens.push({
    name,
    value: perTheme ? Object.fromEntries(themeIds.map((id) => [id, build(id)])) : build('modern'),
    usage: use + (perTheme ? ` Its color is the \`${'adk-' + layers[0].colorToken.split('/').pop()}\` token resolved per theme.` : ''),
  });
}

// ---- type -----------------------------------------------------------------------
const sizes = [
  ['text-xxs', 8, 'Tiny labels inside very small elements, such as initials on an xs avatar. Never body text.'],
  ['text-xs', 12, 'Captions, helper text, badges and timestamps.'],
  ['text-sm', 14, 'Labels, buttons, table cells and dense UI text.'],
  ['text-base', 16, 'Paragraphs and larger buttons.'],
  ['text-lg', 18, 'Lead text and drawer or modal titles.'],
  ['text-xl', 20, 'Section headings.'],
  ['text-2xl', 24, 'Card titles and section headings.'],
  ['text-3xl', 30, 'Page titles.'],
  ['text-4xl', 36, 'Block headings.'],
  ['text-5xl', 48, 'Large marketing headings.'],
  ['text-6xl', 60, 'Larger headings like H1 in hero blocks.'],
];
const scaleGroup = (suffix, family, note) => ({
  name: `Scale · ${note}`,
  family,
  styles: sizes.map(([cls, px, use]) => ({
    name: `${cls}${suffix}`,
    fontSize: `${px}px`,
    lineHeight: 1.5,
    fontWeight: 400,
    usage: `${use} Tailwind \`${cls}\`; every size carries 150% line height.`,
    sample: 'The quick brown fox jumps over the lazy dog',
  })),
});
const roles = [
  ['page-title', 30, 700, '-0.4px', 'Page titles: `text-3xl font-bold tracking-tight text-heading` (`text-4xl` on wide layouts).'],
  ['section-heading', 20, 600, '-0.4px', 'Section headings: `text-xl font-semibold tracking-tight text-heading` (`text-2xl` for larger sections).'],
  ['card-title', 24, 600, '-0.4px', 'Card titles: `text-2xl font-semibold tracking-tight text-heading`.'],
  ['hero-heading', 48, 800, '-0.8px', 'H1 in hero sections: `text-5xl font-extrabold tracking-tighter text-heading` (`text-6xl` on desktop).'],
  ['body', 16, 400, undefined, 'Body copy: `text-base text-body`.'],
  ['body-dense', 14, 400, undefined, 'Dense UI text, table cells, secondary button text: `text-sm text-body`.'],
  ['label', 14, 500, undefined, 'Form labels, button text, CTA text: `text-sm font-medium text-heading`.'],
  ['helper', 12, 400, undefined, 'Helper text under fields: `text-xs leading-4 text-body`.'],
  ['caption', 12, 400, undefined, 'Captions, timestamps, meta text: `text-xs text-body-subtle`.'],
];
const rolesGroup = (suffix, family, note) => ({
  name: `Roles · ${note}`,
  family,
  styles: roles.map(([n, px, w, ls, use]) => ({
    name: `${n}${suffix}`,
    fontSize: `${px}px`,
    lineHeight: n === 'helper' ? '16px' : 1.5,
    fontWeight: w,
    ...(ls ? { letterSpacing: ls } : {}),
    usage: use,
  })),
});

const tokens = {
  name: 'AD Design Kit',
  version: 1,
  meta: {
    source: 'github',
    repo: repoSlug(),
    ref: `main@${sha}`,
    package: '.',
    paths: {
      tokens: ['src/styles/ad-design-kit.css', '.claude/skills/ad-design-kit-design-system/tokens/figma-effects.json', '.claude/skills/ad-design-kit-design-system/references/tokens.md'],
      fonts: [],
      assets: ['public/logo-mark.svg', 'src/assets/logos/ad-design-kit.svg', '.claude/skills/ad-design-kit-design-system/icons/figma-icons.json'],
      docs: ['README.md', '.storybook/docs/*.mdx', '.claude/skills/ad-design-kit-design-system/references/components/*.md'],
    },
    components: {},
    synced: now,
  },
  color: { themes, tokens: colorTokens },
  type: {
    fonts: [],
    families: {
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
      serif: '"IBM Plex Serif", ui-serif, Georgia, serif',
    },
    groups: [
      rolesGroup('', 'sans', 'Modern (Inter)'),
      scaleGroup('', 'sans', 'Modern (Inter)'),
      rolesGroup('-enterprise', 'serif', 'Enterprise (IBM Plex Serif)'),
      scaleGroup('-enterprise', 'serif', 'Enterprise (IBM Plex Serif)'),
    ],
  },
  spacing: { note: 'Figma `spacing/N` = N × 4px = the Tailwind step of the same name. Only these steps exist.', tokens: spacingTokens },
  radius: { note: 'Radius is themed: Modern values are listed; Enterprise flattens every step but `full` to 1px/4px (see each note). The same class renders differently per theme.', tokens: radiusTokens },
  shadow: { note: 'From the Figma effect styles. Elevation: shadow-xs on controls, shadow-md → lg → xl for tooltips, menus and modals. Focus rings are shadows applied with `focus-visible:` and `outline-none`.', tokens: shadowTokens },
  borderWidth: {
    note: 'Mode-invariant. Figma `border` = 1 → `border`, `border-md` = 2 → `border-2`, `border-lg` = 4 → `border-4`, `border-xl` = 8 → `border-8`.',
    tokens: [
      { name: 'border-width-1', value: '1px', usage: 'Default border on cards, inputs, dividers (`border`).' },
      { name: 'border-width-2', value: '2px', usage: 'Emphasised outlines, focus rings (`border-2`).' },
      { name: 'border-width-4', value: '4px', usage: 'Avatar rings and decorative frames (`border-4`).' },
      { name: 'border-width-8', value: '8px', usage: 'Device mockup frames (`border-8`).' },
    ],
  },
  breakpoint: {
    note: 'Identical to Tailwind. Default page container: `mx-auto max-w-screen-xl px-4`.',
    tokens: [
      { name: 'breakpoint-sm', value: '640px', usage: 'Phones in landscape; stack → row for simple layouts.' },
      { name: 'breakpoint-md', value: '768px', usage: 'Tablets; Navbar collapses below this (`md:` menu).' },
      { name: 'breakpoint-lg', value: '1024px', usage: 'Laptops; Sidebar becomes persistent.' },
      { name: 'breakpoint-xl', value: '1280px', usage: 'Desktop; the default page container width (`max-w-screen-xl`).' },
      { name: 'breakpoint-2xl', value: '1536px', usage: 'Wide desktop.' },
    ],
  },
};

fs.writeFileSync(path.join(OUT, 'tokens.json'), JSON.stringify(tokens, null, 1));

// ---- tokens.css, laid out as the page compiles it ----------------------------------
const esc = (n) => n.replace(/\./g, '\\.');
const colorLine = (t, id) => {
  const v = typeof t.value === 'string' ? t.value : (t.value[id] ?? t.value[themeIds[0]]);
  const out = /^\{(.+)\}$/.test(v) ? `var(--${v.slice(1, -1)})` : v;
  return `  --${esc(t.name)}: ${out};`;
};
const shadowLine = (t, id) => `  --${esc(t.name)}: ${typeof t.value === 'string' ? t.value : (t.value[id] ?? t.value[themeIds[0]])};`;
let out = `/* AD Design Kit — generated from tokens.json */\n`;
out += `:root, [data-theme="modern"] {\n${colorTokens.map((t) => colorLine(t, 'modern')).join('\n')}\n${shadowTokens.map((t) => shadowLine(t, 'modern')).join('\n')}\n}\n`;
for (const id of themeIds.slice(1)) {
  out += `[data-theme="${id}"] {\n${colorTokens.filter((t) => typeof t.value !== 'string').map((t) => colorLine(t, id)).join('\n')}\n${shadowTokens.filter((t) => typeof t.value !== 'string').map((t) => shadowLine(t, id)).join('\n')}\n}\n`;
}
out += `:root {\n${[...spacingTokens, ...radiusTokens, ...tokens.borderWidth.tokens, ...tokens.breakpoint.tokens].map((t) => `  --${esc(t.name)}: ${t.value};`).join('\n')}\n`;
out += Object.entries(tokens.type.families).map(([k, v]) => `  --font-${k}: ${v};`).join('\n') + '\n}\n';
for (const g of tokens.type.groups) for (const s of g.styles) {
  out += `.${esc(s.name)} { font-family: var(--font-${g.family}); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''} }\n`;
}
fs.writeFileSync(path.join(OUT, 'tokens.css'), out);

console.log(`colors ${colorTokens.length} (primitives ${Object.keys(primitives).length}), radius ${radiusTokens.length}, spacing ${spacingTokens.length}, shadows ${shadowTokens.length}, type styles ${tokens.type.groups.reduce((n, g) => n + g.styles.length, 0)}`);
console.log('skipped:', skippedVars.length ? skippedVars : 'none');
const noNote = colorTokens.filter((t) => t.name.match(/^adk-(bg|text|border)-/) && !noteFor(t.name)).map((t) => t.name);
console.log('semantic tokens without a doc note:', noNote);
