# AD Design Kit app

React + TypeScript + Vite + Tailwind CSS v4, wired to the AD Design Kit design system (Figma `TKsoawKvPxaNCff4q43Mli`).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at http://localhost:5173 |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run lint` | oxlint (code quality) |
| `npm run lint:tokens` | AD Design Kit token linter: flags raw palette colors, arbitrary values, `dark:` overrides, unknown tokens |
| `npm run tokens:build` | Rebuild `ad-design-kit.css` from the Figma snapshot in `.claude/skills`, copy it into `src/styles/`, and regenerate the Storybook docs |
| `npm run storybook` | Regenerate the docs data, then start Storybook at http://localhost:6006 |
| `npm run build-storybook` | Static Storybook build in `storybook-static/` |
| `npm run docs:build` | Regenerate `.storybook/generated/ad-design-kit-docs.ts` from the registry, usage docs, token manifest and Figma audit |
| `npm run docs:check` | CI check: fails when the generated docs are stale; prints registry ↔ code drift (add `-- --strict` to fail on drift too) |
| `npx vitest run --project storybook` | Render every story headlessly in Chromium (smoke test) |

## Where things live

- `src/styles/ad-design-kit.css` — generated design tokens. Never edit by hand; sync from Figma with the `ad-design-kit-figma-sync` skill, then `npm run tokens:build`.
- `src/styles/app.css` — Tailwind entry (`@import "tailwindcss"` + tokens).
- `src/components/ui/` — all 56 AD Design Kit components (every Figma component set). Each file names its Figma node; the registry in `.claude/skills/ad-design-kit-design-system/references/components.json` maps Figma variants to props.
- `src/lib/theme.ts` — `setTheme(theme, dark)`; themes `modern | enterprise`, saved per browser.
- `src/App.tsx` — a blank canvas; build new screens here from the components in `src/components/ui/`.
- **Hosted Storybook:** https://ad-design-kit-storybook.netlify.app. Redeploy with `npm run storybook:deploy`.
- `.storybook/` — Storybook config, the generated docs data (`generated/ad-design-kit-docs.ts`), the docs page template and blocks (`ad-design-kit/`), the guide pages (`docs/*.mdx`) and the generator (`scripts/build-docs.mjs`). Stories live next to each component as `*.stories.tsx`.
- `.claude/skills/` — the Claude Code skills: `ad-design-kit-design-system` (build UI), `ad-design-kit-compose` (build any screen from a reference image, mockup or Figma frame using only existing components; gaps go back to Figma instead of becoming one-off components; ships `check-composition.mjs` for code and `check-fonts.mjs` for the rendered page), `ad-design-kit-review` (review against Figma), `ad-design-kit-figma-sync` (keep Figma and code in sync).

## Rules of thumb

Use semantic token classes only (`bg-brand`, `text-heading`, `border-default`); no `bg-blue-600`, hex values, `[arbitrary]` values or `dark:` color overrides. Theme and dark mode switch every token automatically. Run `npm run lint:tokens` before committing UI changes.

## Storybook

Storybook is the living documentation of the design system and is generated from the same files the Figma sync maintains, so it never drifts from the registry:

- **Foundations** — colors, typography, radius, shadows and the ten theme modes, rendered live through the real tokens (Theme and Scheme toolbar menus).
- **Guides** — the component chooser and the Figma ⇄ code sync status, including every open drift finding and the Figma audit.
- **Components** — one docs page per Figma component set: stories with controls, the Figma property → React prop mapping, recipe and when-to-use notes, a link to the Figma set, and a Design tab with the Figma frame.

After a Figma sync (tokens, registry or usage docs changed) run `npm run docs:build`; `npm run storybook` does it automatically. `npm run docs:check` is the CI guard.

