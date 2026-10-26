---
name: auxokit-review
description: Review React + Tailwind code against the AuxoKit design system (Figma TKsoawKvPxaNCff4q43Mli) and report every deviation — wrong or hardcoded tokens, raw Tailwind palette colors, arbitrary values, dark-mode overrides, missing or extra variants, wrong sizes/padding/radius/shadows, states that differ from Figma, misuse of a component (e.g. Toggle inside a submit form), and accessibility gaps. Use when the user asks to review, audit, check, QA or validate a component/page/PR/diff for design-system compliance or "does this match Figma", before merging UI changes, or after implementing an AuxoKit component.
---

# AuxoKit design-system review

Goal: prove that a piece of UI code matches AuxoKit in Figma — tokens, variants, states, usage — and give the developer a precise, fixable list. Depends on the `auxokit-design-system` skill (registry, token manifest, component docs); its folder sits next to this one.

Paths below are relative to the skills folder (`.claude/skills/` in the project or `~/.claude/skills/`).

## Inputs to establish first
1. **What to review**: files/dirs, a component name, or the diff (`git diff --name-only <base>...HEAD -- '*.tsx' '*.jsx' '*.css'`). Default: uncommitted + branch changes.
2. **Which Figma component(s)** it implements: match the React component name / file name against `auxokit-design-system/references/components.json` (`react`, `figmaName`). If the user gave a Figma link, use its `node-id`.

## Step 1 — Automated token lint (always)
```bash
node auxokit-review/scripts/lint-tokens.mjs <paths> [--json]
```
It flags: raw palette colors (`bg-blue-600`) with the semantic replacement, unknown/misspelled tokens with nearest matches, arbitrary values (`p-[13px]`, `bg-[#…]`, `text-[15px]`, `shadow-[…]`), off-scale radius/shadows, `dark:` color overrides, opacity on semantic tokens, off-grid spacing, hardcoded hex/rgb in TSX/CSS, and hand-rolled controls that should be `<Button>/<Input>/<Badge>`. Lines with `auxokit-lint-ignore` are skipped — every ignore must carry a reason; question ignores without one.

## Step 2 — Variant & prop parity (per component)
Read the component's `figmaVariants` + `propMap` in `components.json` and its doc section (`doc` field). Check:
- Every Figma variant value is reachable through props (e.g. Button: 8 colors × 5 sizes, `iconOnly`, `outline` only for success/danger/warning). Missing → **error**; extra values not in Figma → **error** (code-only variants break sync) unless documented in `figma-audit.md`.
- Prop names/values follow `propMap` (Figma `Size=l` → `size="lg"`). Renamed or differently cased props → **warning**.
- Interaction states (Hover/Focus/Active/Disabled/Read-only) are implemented with CSS pseudo-classes (`hover:`, `focus-visible:`, `disabled:`, `read-only:`, `aria-*:`), not props. Every state Figma draws exists in code with the documented token (e.g. Button hover `bg-brand-strong`, focus `shadow-focus-brand`, disabled `bg-disabled text-fg-disabled border-default-medium`).
- Breakpoint/Mobile variants are responsive classes, not props.

## Step 3 — Spec comparison (for components marked `specVerified`, or any component on request)
The doc's recipe table is the extracted spec. For anything not verified — or when the doc may be stale — pull live values from Figma:
1. Figma MCP: `create_session` (fileKey `TKsoawKvPxaNCff4q43Mli`), load the `figma-use` guidance, then run `auxokit-review/scripts/figma-component-spec.js` via `use_figma` with `PAGE_ID`/`SET_ID` from the registry. `MODE = 'atom'` for single controls (Button, Input, Badge…); `MODE = 'summary'` for composites (Card, Modal, Navbar, Table…) — it lists every token used inside plus nested AuxoKit components. Use `FILTER` to keep output small (e.g. Desktop breakpoint only).
2. Translate each row: `spacing/2․5` → `2.5` (e.g. `px-2.5`), `rounded-base` → `rounded-base`, `bg-brand` → `bg-brand`, `border` → `border`, `border-md` → `border-2`, text `14/Medium lh20px` → `text-sm font-medium leading-5`, `shadow-xs`/`focus-brand` → `shadow-xs`/`shadow-focus-brand`, size `40` height → check padding + line-height add up. `RAW#hex` or bare numbers = unbound in Figma → report as a **Figma** finding, not a code one.
3. Compare per variant: height, padding, gap, radius, fill, border color/width, text size/weight/line-height/color, icon size/color, shadow. Mismatch → **error** with expected vs actual classes.
Optionally `get_screenshot` of the variant and compare with the rendered component (run the app or Storybook) for a visual sanity check.

## Step 4 — Usage review
Using the "When to use / When not to use" bullets in the component's doc section, check the **call sites**:
- Right component for the job (Toggle vs Checkbox, Toast vs Alert, Modal vs Drawer, Dropdown vs Select, Tabs vs Stepper, Badge vs Button).
- Hierarchy rules: one `brand` Button per section, ≤2 CTAs in a hero, no nested cards, no modal-in-modal.
- Layout: semantic surfaces (`bg-neutral-primary` page, `bg-neutral-primary-soft` cards), spacing on the 4px scale, containers `max-w-*`.

## Step 5 — Accessibility essentials
Labels for every control (`<Label htmlFor>` / `aria-label` on icon-only buttons), `aria-invalid` + described-by for errors, roles (`switch`, `dialog`, `tablist`, `menu`, `tooltip`, `progressbar`, `status`), keyboard access (focus-visible ring present, Esc closes overlays), color never the only signal. Token contrast is designed in Figma — flag only text placed on a surface it was not designed for (e.g. `text-body-subtle` on `bg-brand`).

## Report format
Start with a one-line verdict: **Matches AuxoKit** / **Minor deviations** / **Does not match**. Then a table, most severe first:

| # | Severity | File:line | Rule | Found | Expected (AuxoKit) | Fix |
|---|---|---|---|---|---|---|

Severity: **error** = visible mismatch with Figma or broken theming/dark mode; **warning** = drift risk or off-scale value; **info** = suggestion. Group Figma-side problems (unbound values, naming issues) in a separate "Figma follow-ups" list and cross-check `auxokit-design-system/references/figma-audit.md` first — known items there are not code errors.

End with the lint summary line and, if the user agrees, apply the fixes (edit code, re-run the linter until 0 errors). Never "fix" a mismatch by adding new tokens or arbitrary values in code; if Figma lacks what the design needs, the fix is in Figma (recommend it) — then sync.

See `references/review-checklist.md` for the full checklist and common mistakes with corrections.
