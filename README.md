# AD Design Kit

A design system whose Figma file and React + Tailwind CSS v4 code stay in sync. Every Figma variable has a token class with the same name, every Figma component set has a React twin, and Claude Code skills keep the two aligned in both directions.

- **Figma:** [AD Design Kit](https://www.figma.com/design/TKsoawKvPxaNCff4q43Mli) (`TKsoawKvPxaNCff4q43Mli`)
- **Storybook:** https://ad-design-kit-storybook.netlify.app
- **Case study:** https://arvindpachahara.netlify.app/work/design-system

## What's inside

- **56 React components** covering all 58 Figma component sets, each with stories, interaction tests and accessibility checks.
- **Tokens generated from Figma:** colors, radius, typography and shadows for 2 themes (Modern, Enterprise) × light and dark.
- **Living docs in Storybook,** generated from the same registry and usage docs the Figma sync maintains: Figma property → React prop maps, recipes, when to use each variant, and a Figma embed.
- **Version history of the Figma file in code** (`CHANGELOG.md`, Storybook → Guides → Changelog): every sync is a version with its token, variant, component and icon changes, tagged in git as `ds-v<version>`.
- **A design system graph** (Storybook → Guides → Graph): every component, the tokens and icons it uses, the components it builds on, and the screens and Figma gaps around it, read from the code on every docs build.
- **447 icons from Figma** as React components (`AngleDownIcon`, `CloseIcon`, …), used by every component and shown in Storybook → Foundations → Icons.
- **The same system in Claude Design:** tokens, guidelines, live previews and icons, re-synced from the code by the `ad-design-kit-claude-design` skill (`npm run claude-design:status` says whether it is behind).
- **A demo app:** a material management web app in `src/features/materials` (material list, indents with approval, purchase orders, GRN, site transfers, material issue, expenses, vendor payable), composed only from library components.

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev          # app at http://localhost:5173
npm run storybook    # docs at http://localhost:6006
```

## Use it in another project

The kit is published on npm as [`ad-design-kit`](https://www.npmjs.com/package/ad-design-kit), with the same version as the design system (see `CHANGELOG.md`). It works in any React 19 + Tailwind CSS v4 app.

1. Install: `npm install ad-design-kit` (React 19 and Tailwind CSS v4 are peer dependencies).
2. In the app's main stylesheet:
   ```css
   @import "tailwindcss";
   @import "ad-design-kit/styles.css";
   ```
   `styles.css` brings the tokens and tells your Tailwind to scan the package for the classes its components use.
3. Load the theme fonts once in `index.html` (Inter for Modern, IBM Plex Serif for Enterprise):
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Serif:wght@400;500;600;700&display=swap" rel="stylesheet" />
   ```
4. Set the theme on `<html data-theme="modern">` (or `enterprise`; add `class="dark"` for dark mode), or call `setTheme('enterprise', true)`.
5. Use the components and icons:
   ```tsx
   import { Button, Badge, setTheme } from 'ad-design-kit';
   import { PlusIcon } from 'ad-design-kit/icons';

   <Button leftIcon={<PlusIcon />}>Create project</Button>
   ```
   Every module is a separate file, so an app only bundles the components and icons it imports.

**Publishing.** `.github/workflows/publish-package.yml` publishes a new version to npm (with provenance) whenever a design-system version tag (`ds-v*`) is pushed, or when the workflow is run by hand. It uses npm trusted publishing, so there is no token to store or renew: npm accepts only this repository's workflow. `npm run changelog:release` sets the version, `npm run changelog:tag` tags the commit, and `git push --follow-tags` publishes. `npm run build:package` builds the same package locally into `dist-package/`.

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
| `npm run storybook:deploy` | Build and publish Storybook to Netlify (CI does this automatically on `main`) |
| `npm run icons:build` | Regenerate the icon components from the Figma icon snapshot (`-- --check` to verify) |
| `npm run tokens:build` | Rebuild the token CSS from the Figma snapshot, copy it into `src/styles/`, regenerate the docs |
| `npm run docs:build` / `docs:check` | Regenerate / verify `.storybook/generated/ad-design-kit-docs.ts` |
| `npm run changelog` | What changed in the Figma snapshot since the last design-system version |
| `npm run changelog:release -- --title "…"` | Record those changes as the next version (`CHANGELOG.md`, Guides → Changelog) |
| `npm run build:package` | Build the npm package into `dist-package/` (regenerates `src/index.ts`) |
| `npm run changelog:tag` | Tag the committed version as `ds-v<version>` |
| `npm run figma:descriptions` | Regenerate the Figma component descriptions from the code docs (`-- --check` to verify) |
| `npm run figma:variants` | Print the per-variant guidance for the Figma usage frames (`-- --check` to verify every component has it) |

## Repository structure

```
├── src/
│   ├── components/ui/      # the 56 components + their *.stories.tsx
│   ├── components/icons/   # all 447 Figma icons (generated) + createIcon
│   ├── features/materials/ # demo app built only from library components
│   ├── lib/                # cn() class merger, theme switcher
│   ├── index.ts            # package entry point (generated by scripts/build-package.mjs)
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
├── scripts/                # build-package.mjs: builds the npm package
├── public/                 # logo mark and favicon
└── .github/workflows/ci.yml
```

## How Figma and code stay in sync

The sources of truth live in `.claude/skills/ad-design-kit-design-system/`:

- `tokens/figma-*.json`: the committed Figma variable snapshot. `npm run tokens:build` turns it into `ad-design-kit.css`.
- `references/components.json`: the registry. Figma node ids, variant properties and how each maps to a React prop.
- `references/components/*.md`: usage docs per component: recipe, a **Variants** table (when to use and when not to use each variant), do's and don'ts, accessibility.

From those, Storybook docs, Figma component descriptions and the "Usage guidelines" frames in Figma are generated, so the three never disagree. Every sync is recorded as a version: `npm run changelog:release` compares the snapshot with the last `ds-v*` tag and writes the changes to `CHANGELOG.md` and Storybook, and `npm run check` fails when the snapshot changed without a version. The `ad-design-kit-figma-sync` skill explains the full workflow: pull tokens and component inventories from Figma, diff them against the snapshot and registry, update the code, then push descriptions and usage frames back to Figma.

## Rules of thumb

- Use semantic token classes only (`bg-brand`, `text-heading`, `border-default`). No raw palette colors, hex values, `[arbitrary]` values or `dark:` color overrides; themes and dark mode switch every token.
- Variants mirror Figma. Hover, focus and disabled are CSS states, never props; breakpoints are responsive classes.
- Build screens from existing components. If the design needs something the library lacks, add it in Figma first.
- Run `npm run check` and `npm run test` before pushing; CI runs the same gates plus the build.
