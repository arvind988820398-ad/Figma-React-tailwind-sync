---
name: auxokit-figma-sync
description: Keep the AuxoKit Figma file (TKsoawKvPxaNCff4q43Mli) and the React + Tailwind code in sync — pull Figma variables (colors, radius, fonts, themes, dark mode) into the generated Tailwind token CSS, detect token and component-variant drift in both directions, update the component registry/docs, and optionally push usage docs or Code Connect mappings back to Figma. Use when the user says sync/update/pull tokens from Figma, "design changed", "check drift", "are Figma and code in sync", after editing variables or components in Figma, before a release, or when the token linter reports tokens that exist in Figma but not in code.
---

# AuxoKit Figma ⇄ code sync

Source of truth: **Figma** for tokens and component variants; **code** for behavior. The bridge files live in the `auxokit-design-system` skill next to this one:

| File | Role |
|---|---|
| `auxokit-design-system/tokens/figma-primitives.json`, `figma-themes.json`, `figma-effects.json` | Raw Figma exports (committed snapshot) |
| `auxokit-design-system/scripts/build-tokens.mjs` | Generates `tokens/auxokit.css` + `tokens/token-manifest.json` |
| `auxokit-design-system/references/components.json` | Component registry: Figma node ids ⇄ React components ⇄ prop maps |
| `auxokit-design-system/references/figma-audit.md` | Known Figma inconsistencies and how code handles them |

The app holds a **copy** of `auxokit.css` (find it: `grep -rl "AuxoKit design tokens for Tailwind" --include=*.css .`). Sync updates the skill snapshot first, then the app copy.

## Prerequisites
Figma MCP connected (`whoami` works). Before any `use_figma` call: `create_session` with fileKey `TKsoawKvPxaNCff4q43Mli`, and load the `figma-use` guidance (skill or `skill://figma/figma-use/SKILL.md`). All export scripts are **read-only**.

## A. Token sync (Figma → code)

1. **Export.** Run `scripts/figma-export-variables.js` through `use_figma` three times in parallel with `PART = 'primitives'`, `'themes'`, `'effects'` (edit the constant in the code you send). Save each returned string verbatim to a temp dir (scratchpad), e.g. `…/sync/new/figma-primitives.json`, `figma-themes.json`, `figma-effects.json` (all effect styles are local; focus rings export a `colorToken`).
2. **Diff.**
   ```bash
   node auxokit-figma-sync/scripts/diff-tokens.mjs --old auxokit-design-system/tokens --new <tmp>/sync/new
   ```
   Exit 0 = in sync → stop and report. Otherwise show the user the change list grouped as **breaking** (removed, renamed, mode list changed) vs **non-breaking** (added, value changed). Surface any `warnings` in the themes export: they mean a Themes alias points outside the local Primitives collection again (e.g. someone re-linked a library), which makes local Primitive edits stop reaching the themes.
3. **Apply** (after the user agrees, or immediately if they asked to "sync"): copy the new JSONs over `auxokit-design-system/tokens/`, then
   ```bash
   node auxokit-design-system/scripts/build-tokens.mjs
   ```
   Read its warnings: a new token family without a code mapping (e.g. a new radius name, a new role prefix) needs a small edit to `build-tokens.mjs` (`radiusMap`, role regexes) — make it, keep the naming contract (class name = Figma variable name), rebuild.
4. **Propagate to the app.** Copy `tokens/auxokit.css` over the app's copy. Run the linter on the app:
   ```bash
   node auxokit-review/scripts/lint-tokens.mjs src
   ```
   Removed/renamed tokens now show as `unknown-token` errors at every usage, with suggestions. Fix renames mechanically; for removals ask what replaces them (check Figma).
5. **Docs.** Regenerate `references/tokens.md` usage table if tokens were added/removed (add a "Use for" line for each new token in the same style), and update the cheat sheet in the design-system `SKILL.md` when a commonly used token changes meaning. Then `npm run docs:build` so the Storybook token pages pick the changes up (`npm run tokens:build` already does this).
6. **Report**: counts by kind, files touched, lint result, follow-ups.

## B. Component sync (Figma → code)

1. **Inventory.** Collect the unique `page` ids from `components.json` (plus any new component pages — list pages with `get_metadata` without nodeId and look for `---- <Name>` pages not in the registry). Run `scripts/figma-export-components.js` once per page **in parallel** (one message, many `use_figma` calls, each with its `PAGE_ID`). Write each returned string as one line of `<tmp>/sync/inventory.jsonl`.
2. **Diff.**
   ```bash
   node auxokit-figma-sync/scripts/diff-components.mjs <tmp>/sync/inventory.jsonl --src <app src dir>
   ```
   Finding kinds: `new-set` (Figma component not in the registry), `removed-set`, `renamed-set`, `added-/removed-variant-prop`, `added-/removed-variant-values`, `propmap-update` (Figma renamed a value that still maps to the same prop value), `code-usage` (app code uses a value Figma removed).
3. **Apply.**
   - Update `components.json` (`figmaVariants`, `propMap`, `parts`, new entries with `doc` anchors) and bump `snapshotAt`.
   - For added variant values: extend the React component (variant maps in `templates/components/*` and the app's `components/ui/*`), pull the exact spec with `auxokit-review/scripts/figma-component-spec.js` filtered to the new values, and add rows to the doc's recipe table.
   - For removed values: remove from the component types so TypeScript flags every usage; fix `code-usage` call sites (ask which replacement to use when not obvious).
   - For a `new-set`: add a registry entry and a doc section with Figma ref, API, recipe (from the spec script), **When to use / When not to use**, accessibility.
4. Run the reviewer's linter and the project's typecheck/tests.
5. **Storybook.** Add or update the component's `*.stories.tsx` (one story per variant axis), then `npm run docs:build`. The generator reads `components.json`, the doc sections and the token manifest, and reports registry ↔ code drift (a prop map value missing from the React union); `npm run docs:check` fails in CI on stale docs and prints drift (`npm run docs:check -- --strict` fails on drift too). The Guides → Figma sync page in Storybook shows the same findings.

## C. Code → Figma (only with explicit user approval — these write to the shared Figma file)

- **Usage descriptions.** Every component set has a description written from these docs (2026-10-27). When a doc's "Use / Don't" changes, offer to update the matching summary (≤ 3 lines each) into `COMPONENT_SET.description` via `use_figma` — confirm the exact text and the list of sets first, then batch the writes per page, return the node ids changed.
- **Code Connect.** If the team uses Code Connect, follow the `figma-code-connect` skill to map each registry entry (`node` → React component file and prop map). The registry already has the prop translation each mapping needs.
- **Audit fixes.** Items in `figma-audit.md` are fixed by designers in Figma; you may offer to apply clear-cut variable re-binds (e.g. Badge Success text → `text-fg-success-strong`) only when the user explicitly asks, then re-run section A and remove the fixed rows.
- Never change token **values** in Figma from code; values are design decisions.

## D. Storybook docs

The Storybook under `.storybook/` is generated from the bridge files above: `scripts/build-docs.mjs` turns `components.json`, `references/components/*.md`, `references/tokens.md`, `figma-audit.md` and `token-manifest.json` into `generated/auxokit-docs.ts`, which the docs page template and the guide pages render. Nothing in Storybook is hand-written per component, so the only way to change what it says is to change those sources and rebuild. Whenever a sync touches them, finish with `npm run docs:build` (or `npm run docs:check` to verify).

## Drift check for CI (optional)
Commit the exports and add a CI step that fails when the app's `auxokit.css` differs from a fresh build:
```bash
node .claude/skills/auxokit-design-system/scripts/build-tokens.mjs --out /tmp/ax && diff -q /tmp/ax/auxokit.css src/styles/auxokit.css
node .claude/skills/auxokit-review/scripts/lint-tokens.mjs src --max-warnings 0
npm run docs:check
```
Figma-side drift needs Figma API access; run sections A/B on a schedule (e.g. weekly) instead.
