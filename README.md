# AuxoKit app

React + TypeScript + Vite + Tailwind CSS v4, wired to the AuxoKit design system (Figma `TKsoawKvPxaNCff4q43Mli`).

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at http://localhost:5173 |
| `npm run build` | Typecheck and build to `dist/` |
| `npm run lint` | oxlint (code quality) |
| `npm run lint:tokens` | AuxoKit token linter: flags raw palette colors, arbitrary values, `dark:` overrides, unknown tokens |
| `npm run tokens:build` | Rebuild `auxokit.css` from the Figma snapshot in `.claude/skills` and copy it into `src/styles/` |

## Where things live

- `src/styles/auxokit.css` — generated design tokens. Never edit by hand; sync from Figma with the `auxokit-figma-sync` skill, then `npm run tokens:build`.
- `src/styles/app.css` — Tailwind entry (`@import "tailwindcss"` + tokens).
- `src/components/ui/` — all 56 AuxoKit components (every Figma component set). Each file names its Figma node; the registry in `.claude/skills/auxokit-design-system/references/components.json` maps Figma variants to props.
- `src/lib/theme.ts` — `setTheme(theme, dark)`; themes `modern | minimal | enterprise | playful | mono`, saved per browser.
- `src/App.tsx` — Overview page and the **Components** page (`/components`, in `src/pages/`) showing every variant; replace the overview with your app.
- `public/demo/` — placeholder images for the Components page; delete them together with `src/pages/` when you no longer need the gallery.
- `.claude/skills/` — the Claude Code skills: `auxokit-design-system` (build UI), `auxokit-review` (review against Figma), `auxokit-figma-sync` (keep Figma and code in sync).

## Rules of thumb

Use semantic token classes only (`bg-brand`, `text-heading`, `border-default`); no `bg-blue-600`, hex values, `[arbitrary]` values or `dark:` color overrides. Theme and dark mode switch every token automatically. Run `npm run lint:tokens` before committing UI changes.
