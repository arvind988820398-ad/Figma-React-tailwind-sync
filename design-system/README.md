# Design system producer

Rebuilds every file of the published **AD Design Kit** design system (the Claude Design System artifact in `system.json`) from the code in this repository, so the published system can be kept in step with the code with one command.

```bash
npm run design-system:build                  # full build, incl. the headless render check
npm run design-system:build -- --skip-render # no Chromium needed; previews use default picks/heights
```

The output lands in `design-system/dist/project/` (git-ignored). It is the system's complete file tree, ready to publish:

| Output | Built from |
|---|---|
| `tokens.json`, `tokens.css` | `src/styles/ad-design-kit.css` (primitives, the four theme modes), `tokens/figma-effects.json` (shadows, focus rings), `references/tokens.md` (usage notes) |
| `README.md` (the brand book) | `design-system/brand-book.md` — edit that file |
| `assets/Icons/**.svg`, `assets/Logos/*.svg` + their `README.md` | `icons/figma-icons.json`, `src/assets/logos/ad-design-kit.svg`, `public/logo-mark.svg` |
| `components/<Comp>/README.md` | the registry and usage docs via `.storybook/generated/ad-design-kit-docs.ts` (run `npm run docs:build` first) |
| `components/<Comp>/preview.html` | each component's `*.stories.tsx`: the first stories that render cleanly, measured headless |
| `components/bundle.js`, `bundle.css`, `index.d.ts`, `lib/react*.js` | esbuild over `src/components/ui` + `src/components/icons` (+ the stories, which the previews render), Tailwind v4 CLI, `tsc` declaration emit |
| `components/Cover/preview.html` | `design-system/cover.html` — hand-drawn from the palette; redo it when the palette or the name changes |
| `design-system.json` | `system.json` + `assets-map.json` + the build |

## Publishing a rebuild

The scripts write files; publishing needs the Claude artifact tooling. After a build, tell Claude (in this repo, in Claude Code or a chat with the repository connected):

> Re-sync the AD Design Kit design system from `design-system/dist/project` — publish the files that changed, upload the SVGs listed in `design-system/dist/build/pending-uploads.json`, and update `design-system/assets-map.json` with their ids.

Claude reads the system back, compares, publishes only what changed (uploads first, the index last, `tokens.json` always whole) and keeps anything people edited on the page that the code does not define.

## Files you maintain

- `system.json` — the artifact's url, title, namespace and its `createdOnFiles` marker (never change the marker).
- `assets-map.json` — path → uploaded asset id for every icon/logo already in the artifact. New SVGs show up in `pending-uploads.json` until they are uploaded and recorded here.
- `brand-book.md` — the system's README.
- `cover.html` — the cover shown above the brand book.

## Requirements

Node 24 and `npm ci` as for the rest of the repo. The render check launches Playwright's Chromium (the same browser the Storybook tests use: `npx playwright install chromium`); without it the build still completes with default previews. Set `DS_CHROMIUM=/path/to/chrome` to use another Chromium binary.
