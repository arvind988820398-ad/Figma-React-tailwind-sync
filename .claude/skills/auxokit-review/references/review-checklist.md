# AuxoKit review checklist

## Tokens
- [ ] Colors only via semantic utilities named exactly like Figma variables (`bg-*`, `text-*`, `border-*`, and derived `ring-* outline-* divide-* fill-* stroke-*`).
- [ ] No Tailwind palette classes, no `[#hex]`, no `style={{ color }}`, no `color-mix` in components.
- [ ] Soft/subtle/strong pairing respected (soft surface + subtle border + `-strong` foreground; solid fill + `text-white`).
- [ ] No `dark:` color classes; theme switching via `data-theme` + `.dark` only.
- [ ] Radius from the themed scale; component defaults respected (controls/cards `rounded-base`, badges `rounded-sm`, checkbox `rounded-xs`, menu rows `rounded`).
- [ ] Shadows: `shadow-xs` on controls/cards, `shadow-lg` menus, `shadow-xl` dialogs, focus via `shadow-focus-*` with `focus-visible:`.
- [ ] Typography: `text-xxs…6xl`, weights normal/medium/semibold/bold/extrabold, line-height from size (or the `leading-5/6` used in control recipes). No font family anywhere in feature code; when a server runs, `node .claude/skills/auxokit-compose/scripts/check-fonts.mjs <url>` proves the rendered family, sizes and weights.
- [ ] Spacing on the 4px scale; fractional steps only 0.5/1.5/2.5/3.5/4.5 unless an ignore comment explains a Figma pixel size.

## Component contract
- [ ] Component exists in `components.json`; React name matches `react`.
- [ ] Prop values ⇄ Figma variant values per `propMap` (e.g. `size="lg"` ⇄ Figma `l`).
- [ ] All Figma variants implemented; no code-only variants.
- [ ] States via CSS pseudo-classes with the documented tokens.
- [ ] Slots for Figma boolean/instance-swap props (`Show left icon` → `leftIcon`).
- [ ] Header comment references the Figma node id.

## Usage
- [ ] The component fits the "When to use" list and violates none of "When not to use".
- [ ] One primary (brand) action per region.
- [ ] Navigation uses links, actions use buttons.
- [ ] Overlays use an accessible primitive (dialog/Radix/Headless UI), not hand-rolled focus traps.

## Accessibility
- [ ] Visible label or `aria-label`; errors announced (`aria-invalid`, `aria-describedby`).
- [ ] Keyboard: focus-visible ring, Esc closes overlays, arrow keys in tabs/menus.
- [ ] Correct roles/ARIA states (`aria-checked`, `aria-selected`, `aria-expanded`, `aria-current`).
- [ ] Icon-only controls have accessible names; decorative icons `aria-hidden`.

## Common mistakes → corrections

| Found | Correct |
|---|---|
| `bg-blue-600 hover:bg-blue-700 text-white` | `<Button color="brand">` (`bg-brand hover:bg-brand-strong text-white`) |
| `bg-white dark:bg-gray-800 border-gray-200` | `bg-neutral-primary-soft border-default` |
| `text-gray-900 dark:text-white` | `text-heading` |
| `text-gray-500` | `text-body-subtle` (meta) or `text-body` (copy) |
| `bg-gray-50 border-gray-300` input | `<Input>` (`bg-neutral-secondary-medium border-default-medium`) |
| `rounded-lg` on a button | `rounded-base` (themed; `rounded-lg` is a larger themed radius) |
| `focus:ring-4 focus:ring-blue-300` | `focus-visible:shadow-focus-brand focus-visible:outline-none` |
| `bg-green-100 text-green-800` badge | `<Badge color="success">` |
| `bg-red-50 text-red-800 border-red-300` alert | `<Alert color="danger">` |
| `shadow-[0_1px_2px_rgba(0,0,0,.05)]` | `shadow-xs` |
| `<input type="checkbox">` styled as switch, inside a form submitted later | `<Checkbox>` (Toggle is for instant settings) |
| Toast used for a validation error | Inline `HelperText status="danger"` + `aria-invalid` |
| Brand + Brand buttons side by side | One `brand`, the other `secondary`/`tertiary` |
| `size="large"` / `variant="primary"` props | `size="lg"`, `color="brand"` (registry names) |
