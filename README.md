# AD Design Kit

A design system whose Figma file and React + Tailwind CSS v4 code stay in sync. Every Figma variable has a token class with the same name, every Figma component set has a React twin, and Claude Code skills keep the two aligned in both directions.

- **Figma:** [AD Design Kit](https://www.figma.com/design/TKsoawKvPxaNCff4q43Mli) (`TKsoawKvPxaNCff4q43Mli`)
- **Storybook:** https://ad-design-kit-storybook.netlify.app
- **Case study:** https://arvindpachahara.netlify.app/work/design-system

## What's inside

- **56 React components** covering all 58 Figma component sets, each with stories, interaction tests and accessibility checks.
- **Tokens generated from Figma:** colors, radius, typography and shadows for 2 themes (Modern, Enterprise) × light and dark.
- **Living docs in Storybook,** generated from the same registry and usage docs the Figma sync maintains: Figma property → React prop maps, recipes, when to use each variant, and a Figma embed.
- **A demo app:** the chat screen in `src/features/chat`, composed only from library components.

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev          # app at http://localhost:5173
npm run storybook    # docs at http://localhost:6006
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server for the app |
| `npm run build` | Typecheck and build the app to `dist/` |
| `npm run typecheck` | TypeScript only |
| `npm run lint` | oxlint |
| `npm run lint:tokens` | Design-token linter: raw palette colors, arbitrary values, `dark:` color overrides, unknown tokens |
| `npm run test` | Render every story in Chromium with its interaction tests and axe checks |
| `npm run test:coverage` | The same with coverage (80% per-file threshold) |
| `npm run check` | All static gates: typecheck, both linters, docs drift, Figma descriptions and variant guidance |
| `npm run storybook` | Regenerate the docs data, then start Storybook |
| `npm run build-storybook` | Static Storybook in `storybook-static/` |
| `npm run storybook:deploy` | Build and publish Storybook to Netlify |
| `npm run tokens:build` | Rebuild the token CSS from the Figma snapshot, copy it into `src/styles/`, regenerate the docs |
| `npm run docs:build` / `docs:check` | Regenerate / verify `.storybook/generated/ad-design-kit-docs.ts` |
| `npm run figma:descriptions` | Regenerate the Figma component descriptions from the code docs (`-- --check` to verify) |
| `npm run figma:variants` | Print the per-variant guidance for the Figma usage frames (`-- --check` to verify every component has it) |

## Repository structure

```
├── src/
│   ├── components/ui/      # the 56 components + their *.stories.tsx
│   ├── components/icons.tsx
│   ├── features/chat/      # demo app built only from library components
│   ├── lib/                # cn() class merger, theme switcher
│   └── styles/             # app.css (Tailwind entry) + ad-design-kit.css (generated tokens, never edit)
├── .storybook/
│   ├── docs/               # Foundations and Guides pages (MDX)
│   ├── ad-design-kit/      # docs page template, blocks, Figma links
│   ├── scripts/            # build-docs.mjs: generates the docs data from the registry
│   └── generated/          # ad-design-kit-docs.ts (generated, committed)
├── .claude/skills/         # Claude Code skills, the source of truth for docs and sync
│   ├── ad-design-kit-design-system/   # registry, usage docs, tokens, component templates
│   ├── ad-design-kit-figma-sync/      # Figma ⇄ code sync scripts and generated Figma descriptions
│   ├── ad-design-kit-compose/         # build screens from a reference using only existing components
│   └── ad-design-kit-review/          # token linter and Figma spec extraction for reviews
├── public/                 # logo mark and favicon
└── .github/workflows/ci.yml
```

## How Figma and code stay in sync

The sources of truth live in `.claude/skills/ad-design-kit-design-system/`:

- `tokens/figma-*.json`: the committed Figma variable snapshot. `npm run tokens:build` turns it into `ad-design-kit.css`.
- `references/components.json`: the registry. Figma node ids, variant properties and how each maps to a React prop.
- `references/components/*.md`: usage docs per component: recipe, a **Variants** table (when to use and when not to use each variant), do's and don'ts, accessibility.

From those, Storybook docs, Figma component descriptions and the "Usage guidelines" frames in Figma are generated, so the three never disagree. The `ad-design-kit-figma-sync` skill explains the full workflow: pull tokens and component inventories from Figma, diff them against the snapshot and registry, update the code, then push descriptions and usage frames back to Figma.

## Rules of thumb

- Use semantic token classes only (`bg-brand`, `text-heading`, `border-default`). No raw palette colors, hex values, `[arbitrary]` values or `dark:` color overrides; themes and dark mode switch every token.
- Variants mirror Figma. Hover, focus and disabled are CSS states, never props; breakpoints are responsive classes.
- Build screens from existing components. If the design needs something the library lacks, add it in Figma first.
- Run `npm run check` and `npm run test` before pushing; CI runs the same gates plus the build.
