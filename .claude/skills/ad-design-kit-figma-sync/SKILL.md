---
name: ad-design-kit-figma-sync
description: Keep the AD Design Kit Figma file (TKsoawKvPxaNCff4q43Mli) and the React + Tailwind code in sync — pull Figma variables (colors, radius, fonts, themes, dark mode) into the generated Tailwind token CSS, detect token and component-variant drift in both directions, update the component registry/docs, and optionally push usage docs or Code Connect mappings back to Figma. Use when the user says sync/update/pull tokens from Figma, "design changed", "check drift", "are Figma and code in sync", after editing variables or components in Figma, before a release, or when the token linter reports tokens that exist in Figma but not in code.
---

# AD Design Kit Figma ⇄ code sync

Source of truth: **Figma** for tokens and component variants; **code** for behavior. The bridge files live in the `ad-design-kit-design-system` skill next to this one:

| File | Role |
|---|---|
| `ad-design-kit-design-system/tokens/figma-primitives.json`, `figma-themes.json`, `figma-effects.json` | Raw Figma exports (committed snapshot) |
| `ad-design-kit-design-system/scripts/build-tokens.mjs` | Generates `tokens/ad-design-kit.css` + `tokens/token-manifest.json` |
| `ad-design-kit-design-system/references/components.json` | Component registry: Figma node ids ⇄ React components ⇄ prop maps |
| `ad-design-kit-design-system/references/figma-audit.md` | Known Figma inconsistencies and how code handles them |

The app holds a **copy** of `ad-design-kit.css` (find it: `grep -rl "AD Design Kit design tokens for Tailwind" --include=*.css .`). Sync updates the skill snapshot first, then the app copy.

## Prerequisites
Figma MCP connected (`whoami` works). Before any `use_figma` call: `create_session` with fileKey `TKsoawKvPxaNCff4q43Mli`, and load the `figma-use` guidance (skill or `skill://figma/figma-use/SKILL.md`). All export scripts are **read-only**.

## A. Token sync (Figma → code)

1. **Export.** Run `scripts/figma-export-variables.js` through `use_figma` three times in parallel with `PART = 'primitives'`, `'themes'`, `'effects'` (edit the constant in the code you send). Save each returned string verbatim to a temp dir (scratchpad), e.g. `…/sync/new/figma-primitives.json`, `figma-themes.json`, `figma-effects.json` (all effect styles are local; focus rings export a `colorToken`).
2. **Diff.**
   ```bash
   node ad-design-kit-figma-sync/scripts/diff-tokens.mjs --old ad-design-kit-design-system/tokens --new <tmp>/sync/new
   ```
   Exit 0 = in sync → stop and report. Otherwise show the user the change list grouped as **breaking** (removed, renamed, mode list changed) vs **non-breaking** (added, value changed). Surface any `warnings` in the themes export: they mean a Themes alias points outside the local Primitives collection again (e.g. someone re-linked a library), which makes local Primitive edits stop reaching the themes.
3. **Apply** (after the user agrees, or immediately if they asked to "sync"): copy the new JSONs over `ad-design-kit-design-system/tokens/`, then
   ```bash
   node ad-design-kit-design-system/scripts/build-tokens.mjs
   ```
   Read its warnings: a new token family without a code mapping (e.g. a new radius name, a new role prefix) needs a small edit to `build-tokens.mjs` (`radiusMap`, role regexes) — make it, keep the naming contract (class name = Figma variable name), rebuild.
4. **Propagate to the app.** Copy `tokens/ad-design-kit.css` over the app's copy. Run the linter on the app:
   ```bash
   node ad-design-kit-review/scripts/lint-tokens.mjs src
   ```
   Removed/renamed tokens now show as `unknown-token` errors at every usage, with suggestions. Fix renames mechanically; for removals ask what replaces them (check Figma).
5. **Docs.** Regenerate `references/tokens.md` usage table if tokens were added/removed (add a "Use for" line for each new token in the same style), and update the cheat sheet in the design-system `SKILL.md` when a commonly used token changes meaning. Then `npm run docs:build` so the Storybook token pages pick the changes up (`npm run tokens:build` already does this).
6. **Report**: counts by kind, files touched, lint result, follow-ups.

## B. Component sync (Figma → code)

1. **Inventory.** Collect the unique `page` ids from `components.json` (plus any new component pages — list pages with `get_metadata` without nodeId and look for `---- <Name>` pages not in the registry). Run `scripts/figma-export-components.js` once per page **in parallel** (one message, many `use_figma` calls, each with its `PAGE_ID`). Write each returned string as one line of `<tmp>/sync/inventory.jsonl`.
2. **Diff.**
   ```bash
   node ad-design-kit-figma-sync/scripts/diff-components.mjs <tmp>/sync/inventory.jsonl --src <app src dir>
   ```
   Finding kinds: `new-set` (Figma component not in the registry), `removed-set`, `renamed-set`, `added-/removed-variant-prop`, `added-/removed-variant-values`, `propmap-update` (Figma renamed a value that still maps to the same prop value), `code-usage` (app code uses a value Figma removed).
3. **Apply.**
   - Update `components.json` (`figmaVariants`, `propMap`, `parts`, new entries with `doc` anchors) and bump `snapshotAt`.
   - For added variant values: extend the React component (variant maps in `templates/components/*` and the app's `components/ui/*`), pull the exact spec with `ad-design-kit-review/scripts/figma-component-spec.js` filtered to the new values, and add rows to the doc's recipe table.
   - For removed values: remove from the component types so TypeScript flags every usage; fix `code-usage` call sites (ask which replacement to use when not obvious).
   - For a `new-set`: add a registry entry and a doc section with Figma ref, API, recipe (from the spec script), **When to use / When not to use**, accessibility.
4. Run the reviewer's linter and the project's typecheck/tests.
5. **Storybook.** Add or update the component's `*.stories.tsx` (one story per variant axis), then `npm run docs:build`. The generator reads `components.json`, the doc sections and the token manifest, and reports registry ↔ code drift (a prop map value missing from the React union); `npm run docs:check` fails in CI on stale docs and prints drift (`npm run docs:check -- --strict` fails on drift too). The Guides → Figma sync page in Storybook shows the same findings.

## C. Code → Figma (only with explicit user approval — these write to the shared Figma file)

- **Usage descriptions and docs links.** Every Figma component set's description and documentation link are generated, never typed in Figma. Sources: the one-line purpose in `ad-design-kit-design-system/references/figma-summaries.json`, the "Use … / Don't …" and "A11y:" lines of the component's doc section, the registry's prop map, and `storybookUrl` in `components.json` (the hosted Storybook; `null` means no links yet).
  1. `npm run figma:descriptions` writes `generated/figma-descriptions.json`. Each set gets its summary, Use, Don't, Accessibility, Code signature and Docs link; parts say "In code: part of <X>". It exits 2 and names the gap when a main component's doc lacks a Use, Don't or A11y line: fix the doc, not the output. `--check` fails when the file is stale.
  2. After the user approves writing to Figma, paste the sets into `scripts/figma-apply-descriptions.js` as `ITEMS` and run it with `use_figma` (about 40 sets per call, in parallel). It skips sets that already match and returns the ids it changed.
  3. Run this whenever a doc section, a summary, the prop map or the Storybook URL changes. A new Figma component set needs a row in `figma-summaries.json` first.
  4. The plugin API reads descriptions back HTML-escaped ("Don&#39;t"), while Figma and the published library show normal characters. Decode before comparing and never "fix" the escaping.
  5. Designers only see the new text after the library is published from Figma (Assets → Publish).
- **Usage guideline frames.** Every main component (58) has a "Usage guidelines — <Component>" frame left of its page content. Six are hand-built with real do and don't examples, anatomy and specs (Button, Input, Table, Modal, Tabs, Navbar; `scripts/figma-usage-frame.js`). The other 52 are generated by `scripts/figma-usage-frame-generic.js` from `node scripts/build-usage-frame-data.mjs` (purpose, use, don't, accessibility, code signature and Storybook link from the generated descriptions, plus real instances per variant, color, state and size). Rebuild a component's frame after its doc changes; the generic script skips the hand-built six. Do and don't captions use the unpublished `_Usage / Verdict` set on the Buttons page.
- **Variant guidance.** Every main component's doc section has a `**Variants**` table (Variant · Code · Use when · Don't use when; one row per design-choice variant value, never states, breakpoints or sample content). Storybook renders it as part of the doc; `scripts/figma-usage-variants.js` adds the same table as a "Variants — when to use" section to each usage frame (data: `node scripts/build-variant-guidance.mjs [Component …]`; `--check` lists components without a table). Run it after rebuilding a usage frame, since a rebuilt frame loses the section.
- **Code Connect.** If the team uses Code Connect, follow the `figma-code-connect` skill to map each registry entry (`node` → React component file and prop map). The registry already has the prop translation each mapping needs.
- **Audit fixes.** Items in `figma-audit.md` are fixed by designers in Figma; you may offer to apply clear-cut variable re-binds (e.g. Badge Success text → `text-fg-success-strong`) only when the user explicitly asks, then re-run section A and remove the fixed rows.
- Never change token **values** in Figma from code; values are design decisions.

## D. Icon sync (Figma → code)

Every icon on the Figma Icons page is a React component in `src/components/icons/figma.tsx`, generated from the committed snapshot `ad-design-kit-design-system/icons/figma-icons.json`.

1. **Layout.** Run a read-only `use_figma` call that returns, for every top-level frame on the Icons page, its id, name and each icon component's `[name, x, y, w, h]` relative to the frame; save it as `<tmp>/icons/layout.json`.
2. **Export.** `download_assets` each frame with `defaultFormat: "svg"` and save the export to `<tmp>/icons/<frame-id with : → ->.svg` (one call per frame keeps the SVG out of the conversation).
3. **Split.** `node ad-design-kit-figma-sync/scripts/split-figma-icons.mjs <tmp>/icons` writes the snapshot: one entry per icon with its frame position as the viewBox, dark fills as `currentColor`, clip paths kept, repeated names suffixed `-alt`.
4. **Build.** `npm run icons:build` generates `figma.tsx` and `catalog.ts` for the app and the templates; `npm run check` fails when they are stale. Storybook → Foundations → Icons shows every icon.
5. Components import icons by Figma name; when Figma swaps an icon inside a component, change the import, never draw an inline `<svg>`.

## E. Storybook docs

The Storybook under `.storybook/` is generated from the bridge files above: `scripts/build-docs.mjs` turns `components.json`, `references/components/*.md`, `references/tokens.md`, `figma-audit.md` and `token-manifest.json` into `generated/ad-design-kit-docs.ts`, which the docs page template and the guide pages render. Nothing in Storybook is hand-written per component, so the only way to change what it says is to change those sources and rebuild. Whenever a sync touches them, finish with `npm run docs:build` (or `npm run docs:check` to verify).

The Figma sync page also has **App screens** and **Gaps for Figma**. The builder runs `ad-design-kit-compose/scripts/check-composition.mjs` on every folder under `src/features` (which AD Design Kit components each screen uses, linked to their docs, and anything made by hand with file and line) and reads `ad-design-kit-compose/references/gaps.json` (what screens need that Figma lacks: proposal, stand-in, status, where it is marked). When a sync brings in a component that closes a gap: replace the stand-ins marked `// ad-design-kit-gap: <id>`, remove the markers, set the row's `status` to `done`, and rebuild the docs. A row the designer has drawn but not yet synced is `in-figma`.

**Hosting.** Storybook is published on Netlify at https://ad-design-kit-storybook.netlify.app (site `ad-design-kit-storybook`, config in `netlify.toml`). Redeploy after any docs or component change with `npm run storybook:deploy` (needs `netlify login` once). Every Figma component set links to its page there; if a story file's title changes, re-run `npm run figma:descriptions` and apply the result to Figma.

## Drift check for CI (optional)
Commit the exports and add a CI step that fails when the app's `ad-design-kit.css` differs from a fresh build:
```bash
node .claude/skills/ad-design-kit-design-system/scripts/build-tokens.mjs --out /tmp/ax && diff -q /tmp/ax/ad-design-kit.css src/styles/ad-design-kit.css
node .claude/skills/ad-design-kit-review/scripts/lint-tokens.mjs src --max-warnings 0
npm run docs:check
npm run figma:descriptions -- --check
```
Figma-side drift needs Figma API access; run sections A/B on a schedule (e.g. weekly) instead.
