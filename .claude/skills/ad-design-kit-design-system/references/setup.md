# Setup: AD Design Kit in a React + Tailwind project

## 1. Tailwind v4 (recommended)

```bash
npm i -D tailwindcss @tailwindcss/vite   # or @tailwindcss/postcss
npm i clsx tailwind-merge
```

`src/styles/app.css`:

```css
@import "tailwindcss";
@import "./ad-design-kit.css";   /* copied from the skill's tokens/ad-design-kit.css — generated, never edit */
```

`tokens/ad-design-kit.css` contains:
- `:root` primitives as `--adk-<palette>-<step>` (e.g. `--adk-brand-700`) — exact Figma "Primitives" hexes.
- One block per Figma "Themes" mode setting `--adk-bg-*`, `--adk-text-*`, `--adk-border-*`, `--adk-rounded*`, `--adk-font-base`.
- `@theme inline` wiring radius, shadows, font, line-heights into Tailwind; **strict mode** removes the default color palette (`--color-*: initial`) so `bg-blue-500` and friends compile to nothing. Regenerate with `--no-strict` only for a temporary migration.
- `@utility` declarations whose names equal Figma variable names: `bg-*`, `text-*` (+ `fill-*`, `stroke-*`), `border-*` (+ `ring-*`, `outline-*`, `divide-*`).
- `@custom-variant dark (&:where(.dark, .dark *))` — class-based dark mode.

Supported utility families per token role:

| Figma group | Class | Extra classes generated |
|---|---|---|
| `colors/background/bg-X` | `bg-X` | `fill-X`, `stroke-X` for SVG shapes (e.g. spinner `fill-brand`, `fill-neutral-quaternary`) |
| `colors/text/text-X` | `text-X` | `fill-X`, `stroke-X` (e.g. `fill-fg-brand`) |
| `colors/border/border-X` | `border-X` | `ring-X`, `outline-X`, `divide-X` (e.g. `ring-brand`, `divide-default`) |

Opacity modifiers (`bg-brand/50`) are not supported on semantic utilities — the translucent semantic tokens are `bg-overlay-light`, `bg-overlay-dark` and `border-buffer-gradient-secondary`. Use the overlay tokens for controls and scrims on images; for modal backdrops use `bg-black/50` (black and white stay in the palette).

## 2. Fonts

The base font switches by theme (`typography/font-family/font-base`). Load both once in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Serif:wght@400;500;600;700&display=swap" rel="stylesheet">
```

If the product ships a single theme, load only that theme's font.

| Theme | Font |
|---|---|
| modern | Inter |
| enterprise | IBM Plex Serif |

## 3. Themes & dark mode

```html
<html data-theme="modern">            <!-- modern | enterprise -->
<html data-theme="modern" class="dark">
```

- No `data-theme` → Modern. Themes can also be scoped: `<section data-theme="enterprise">` re-themes a subtree (works because the theme wiring uses `@theme inline`).
- Theme switch helper:

```ts
export type ADDesignKitTheme = 'modern' | 'enterprise';
export function setTheme(theme: ADDesignKitTheme, dark: boolean) {
  const el = document.documentElement;
  el.dataset.theme = theme;
  el.classList.toggle('dark', dark);
}
// Respect OS preference on first load:
setTheme('modern', window.matchMedia('(prefers-color-scheme: dark)').matches);
```

Never branch colors on theme in TS (`theme === 'dark' ? 'bg-…' : 'bg-…'`). Tokens do it.

## 4. Component files

Copy `templates/lib/cn.ts` → `src/lib/cn.ts` and the components you need from `templates/components/` → `src/components/ui/`. Each template file header names its Figma node so reviewers can trace it. Keep component names and prop values as in `references/components.json`.

## 5. Tailwind v3 projects

v3 cannot read `@theme`/`@utility`. Options, in order of preference:
1. Upgrade to v4 (`npx @tailwindcss/upgrade`).
2. Keep `ad-design-kit.css` for the CSS variables (it is plain CSS apart from the `@theme`, `@utility` and `@custom-variant` blocks — delete those three blocks for v3) and add to `tailwind.config.js`:
   ```js
   // Generated mapping: one entry per semantic token in token-manifest.json
   theme: {
     colors: { white: '#fff', black: '#000', transparent: 'transparent', current: 'currentColor' },
     extend: {
       backgroundColor: { brand: 'var(--adk-bg-brand)', /* … every bg-* token minus the "bg-" prefix */ },
       textColor: { heading: 'var(--adk-text-heading)', /* … */ },
       borderColor: { default: 'var(--adk-border-default)', /* … */ },
       borderRadius: { xxs: 'var(--adk-rounded-xxs)', xs: 'var(--adk-rounded-xs)', sm: 'var(--adk-rounded-sm)', DEFAULT: 'var(--adk-rounded)', base: 'var(--adk-rounded-base)', lg: 'var(--adk-rounded-lg)', xl: 'var(--adk-rounded-xl)' },
       fontFamily: { sans: 'var(--adk-font-base)' },
     },
   },
   darkMode: 'class',
   ```
   Generate the full maps from `token-manifest.json` (`tokens[*].role` + `cssVar`) rather than typing them.
