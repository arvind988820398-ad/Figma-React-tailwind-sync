# AuxoKit tokens

Generated from `tokens/token-manifest.json` (Figma export 2026-10-26T20:50:00Z). Values shown are **Modern** light/dark; all 10 modes are in the manifest. Class name = Figma variable name.

Pairing rule: use tokens as matched sets — a *soft* surface takes its *subtle* border and *-strong* foreground (`bg-success-soft border-success-subtle text-fg-success-strong`); a *solid* fill takes `text-white` and hovers to `-strong`.

## Backgrounds (`colors/background/*`)

| Class | Use for | Modern light | Modern dark |
|---|---|---|---|
| `bg-variants-white` | Legacy alias of bg-neutral-primary (white → near-black). Prefer bg-neutral-primary. | #ffffff (white) | #030712 (gray/950) |
| `bg-variants-gray` | Legacy alias for gray section bands (gray-100 → near-black). Prefer bg-neutral-tertiary-soft. | #f3f4f6 (gray/100) | #030712 (gray/950) |
| `bg-white` | Pure white regardless of theme/mode. Only on top of imagery or brand fills; prefer bg-neutral-primary-soft for surfaces. | #ffffff (white) | #ffffff (white) |
| `bg-neutral-primary-soft` | Raised surfaces: Card, Modal, Drawer, Popover, Tertiary button, White badge. | #ffffff (white) | #101828 (gray/900) |
| `bg-neutral-primary` | App/page background. The canvas everything sits on. | #ffffff (white) | #030712 (gray/950) |
| `bg-neutral-primary-medium` | Floating menus on top of surfaces: Dropdown menu, White icon shape. | #ffffff (white) | #1e2939 (gray/800) |
| `bg-neutral-primary-strong` | Elevated element on a dark surface (dark-mode emphasis); rarely needed in light. | #ffffff (white) | #333e4f (gray/700) |
| `bg-neutral-secondary-soft` | Very subtle fill: focused Tertiary button, disabled toggle knob, sidebar background. | #f9fafb (gray/050) | #101828 (gray/900) |
| `bg-neutral-secondary` | Subtle neutral surface: Gray badge, secondary panels. | #f9fafb (gray/050) | #030712 (gray/950) |
| `bg-neutral-secondary-medium` | Form controls and Secondary button fill: Input, Select, Textarea, Default alert. | #f9fafb (gray/050) | #1e2939 (gray/800) |
| `bg-neutral-secondary-strong` | Checkbox/Radio box fill. | #f9fafb (gray/050) | #333e4f (gray/700) |
| `bg-neutral-tertiary-soft` | Section bands / striped table rows. | #f3f4f6 (gray/100) | #101828 (gray/900) |
| `bg-neutral-tertiary` | Read-only inputs, input add-ons, Gray icon shape, avatar placeholder, active list row. | #f3f4f6 (gray/100) | #1e2939 (gray/800) |
| `bg-neutral-tertiary-medium` | Hover fill for neutral items (dropdown rows, Secondary button hover), toggle track (off). | #f3f4f6 (gray/100) | #333e4f (gray/700) |
| `bg-neutral-quaternary` | Tracks and fills: progress track, disabled radio dot, skeleton blocks. | #e5e7eb (gray/200) | #333e4f (gray/700) |
| `bg-quaternary-medium` | Stronger skeleton/track fill; scrollbar thumbs. | #e5e7eb (gray/200) | #4a5565 (gray/600) |
| `bg-gray` | Neutral solid fill: Gray progress bar, offline/alternative status dot. | #d1d5dc (gray/300) | #4a5565 (gray/600) |
| `bg-brand-softer` | Brand-tinted surface: Info alert, Brand badge, Brand icon shape. | #eef6ff (brand/050) | #162455 (brand/950) |
| `bg-brand-soft` | Slightly stronger brand tint: selected rows, active sidebar item background. | #dbeafe (brand/100) | #1c398e (brand/900) |
| `bg-brand` | Primary action fill: Brand button, checked checkbox/toggle, active pill tab, progress bar. | #1447e6 (brand/700) | #155dfc (brand/600) |
| `bg-brand-medium` | Brand focus ring color (shadow-focus-brand), range-selection fills. | #bedbff (brand/200) | #1c398e (brand/900) |
| `bg-brand-strong` | Hover/pressed state of bg-brand. | #193cb8 (brand/800) | #1447e6 (brand/700) |
| `bg-success-soft` | Success surface: success alert, badge, input success state. | #ecfdf5 (emerald/050) | #002c22 (emerald/950) |
| `bg-success` | Solid success fill: Success button, online dot, success progress. | #007a55 (emerald/700) | #009966 (emerald/600) |
| `bg-success-medium` | Stronger success tint (selected success chips). | #d0fae5 (emerald/100) | #004f3b (emerald/900) |
| `bg-success-strong` | Hover of bg-success. | #006045 (emerald/800) | #007a55 (emerald/700) |
| `bg-danger-soft` | Error surface: danger alert, badge, input error state. | #fef0f2 (rose/050) | #4d0218 (rose/950) |
| `bg-danger` | Solid destructive fill: Danger button, offline dot. | #c70036 (rose/700) | #c70036 (rose/700) |
| `bg-danger-medium` | Stronger error tint. | #ffe4e6 (rose/100) | #8b0836 (rose/900) |
| `bg-danger-strong` | Hover of bg-danger. | #a50036 (rose/800) | #a50036 (rose/800) |
| `bg-warning-soft` | Warning surface: warning alert, badge. | #fff8f1 (orange/050) | #441306 (orange/950) |
| `bg-warning` | Solid warning fill: Warning button, warning progress. | #ff5a1f (orange/500) | #d03801 (orange/600) |
| `bg-warning-medium` | Stronger warning tint. | #feecdc (orange/100) | #771d1d (orange/900) |
| `bg-warning-strong` | Hover of bg-warning. | #b43403 (orange/700) | #b43403 (orange/700) |
| `bg-dark` | Inverted surface: Dark button, Tooltip, Dark icon shape. | #1e2939 (gray/800) | #1e2939 (gray/800) |
| `bg-dark-strong` | Hover of bg-dark. | #101828 (gray/900) | #333e4f (gray/700) |
| `bg-disabled` | Fill of any disabled control. | #f3f4f6 (gray/100) | #1e2939 (gray/800) |
| `bg-purple` | Categorical/chart color. | #ad46ff (purple/500) | #ad46ff (purple/500) |
| `bg-sky` | Categorical/chart color. | #00a6f4 (sky/500) | #00a6f4 (sky/500) |
| `bg-teal` | Categorical/chart color. | #009689 (teal/600) | #00bba7 (teal/500) |
| `bg-pink` | Categorical/chart color. | #e60076 (pink/600) | #f6339a (pink/500) |
| `bg-cyan` | Categorical/chart color. | #00b8db (cyan/500) | #00b8db (cyan/500) |
| `bg-fuchsia` | Categorical/chart color. | #c800de (fuchsia/600) | #e12afb (fuchsia/500) |
| `bg-indigo` | Categorical/chart color. | #4f39f6 (indigo/600) | #615fff (indigo/500) |
| `bg-orange` | Categorical/chart color. | #ff8a4c (orange/400) | #ff8a4c (orange/400) |
| `bg-overlay-light` | Translucent control on top of images/media: Carousel arrows and indicators, Chat image buttons. Same in every theme. | #ffffff4d (white-alpha/30) | #ffffff4d (white-alpha/30) |
| `bg-overlay-dark` | Dark scrim over images/media: Chat image overlay, caption bars. Same in every theme. | #101828e5 (dark-alpha/90) | #101828e5 (dark-alpha/90) |

## Text & icons (`colors/text/*`)

Icons inherit `currentColor`; color them with the same `text-*` class (or `fill-*`/`stroke-*` for SVG paths that do not use currentColor).

| Class | Use for | Modern light | Modern dark |
|---|---|---|---|
| `text-white` | Text/icons on solid fills (bg-brand, bg-success, bg-danger, bg-warning, bg-dark). | #ffffff (white) | #ffffff (white) |
| `text-black` | Near-black that stays dark in dark mode (text on bg-white / yellow). Rare. | #101828 (gray/900) | #101828 (gray/900) |
| `text-heading` | Headings, labels, primary/emphasized text, filled input values, active menu rows. | #101828 (gray/900) | #ffffff (white) |
| `text-body` | Body copy, secondary button text, helper text, default nav links. | #4a5565 (gray/600) | #99a1af (gray/400) |
| `text-body-subtle` | Placeholders, captions, timestamps, meta text. | #6a7282 (gray/500) | #99a1af (gray/400) |
| `text-fg-brand-subtle` | Brand-tinted text on dark brand fills. | #bedbff (brand/200) | #bedbff (brand/200) |
| `text-fg-brand` | Links, active tab/nav text, brand icons. | #1447e6 (brand/700) | #2b7fff (brand/500) |
| `text-fg-brand-strong` | Text on bg-brand-softer (info alert, brand badge). | #1c398e (brand/900) | #51a2ff (brand/400) |
| `text-fg-success` | Success text/icons on neutral surfaces (outline success button). | #007a55 (emerald/700) | #009966 (emerald/600) |
| `text-fg-success-strong` | Text on bg-success-soft (alerts, badges, input success). | #004f3b (emerald/900) | #5ee9b5 (emerald/300) |
| `text-fg-danger` | Error text/icons on neutral surfaces (outline danger button, inline error). | #c70036 (rose/700) | #ff2056 (rose/500) |
| `text-fg-danger-strong` | Text on bg-danger-soft (alerts, badges, input error). | #8b0836 (rose/900) | #ffa1ad (rose/300) |
| `text-fg-warning-subtle` | Warning text on neutral surfaces (outline warning button). | #d03801 (orange/600) | #ff5a1f (orange/500) |
| `text-fg-warning` | Text on bg-warning-soft (alerts, badges). | #771d1d (orange/900) | #fdba8c (orange/300) |
| `text-fg-yellow` | Rating stars. | #fdc700 (yellow/400) | #fdc700 (yellow/400) |
| `text-fg-info` | Informational accent text. | #1c398e (brand/900) | #8ec5ff (brand/300) |
| `text-fg-disabled` | Text/icons in disabled controls. | #99a1af (gray/400) | #4a5565 (gray/600) |
| `text-fg-purple` | Categorical text/icon accent. | #9810fa (purple/600) | #ad46ff (purple/500) |
| `text-fg-cyan` | Categorical text/icon accent. | #0092b8 (cyan/600) | #00b8db (cyan/500) |
| `text-fg-indigo` | Categorical text/icon accent. | #4f39f6 (indigo/600) | #615fff (indigo/500) |
| `text-fg-pink` | Categorical text/icon accent. | #e60076 (pink/600) | #f6339a (pink/500) |
| `text-fg-lime` | Categorical text/icon accent. | #5ea500 (lime/600) | #7ccf00 (lime/500) |

## Borders (`colors/border/*`)

Also available as `ring-*`, `outline-*`, `divide-*` (drop the `border-` prefix: `ring-brand`, `divide-default`).

| Class | Use for | Modern light | Modern dark |
|---|---|---|---|
| `border-dark` | Border on dark (inverted) surfaces. | #1e2939 (gray/800) | #4a5565 (gray/600) |
| `border-buffer` | Ring that separates overlapping items from the page (avatar stacks, status dots). Matches bg-neutral-primary. | #ffffff (white) | #030712 (gray/950) |
| `border-buffer-medium` | Buffer ring on bg-neutral-primary-soft surfaces. | #ffffff (white) | #101828 (gray/900) |
| `border-buffer-strong` | Buffer ring on bg-neutral-primary-medium surfaces. | #ffffff (white) | #1e2939 (gray/800) |
| `border-muted` | Barely visible separators. | #f9fafb (gray/050) | #101828 (gray/900) |
| `border-light-subtle` | Light separators on soft surfaces. | #f3f4f6 (gray/100) | #101828 (gray/900) |
| `border-light` | Light divider; disabled checkbox/radio border; ghost focus ring. | #f3f4f6 (gray/100) | #1e2939 (gray/800) |
| `border-light-medium` | Disabled toggle border; dark-button focus. | #f3f4f6 (gray/100) | #333e4f (gray/700) |
| `border-default-subtle` | Subtle dividers inside cards/tables. | #e5e7eb (gray/200) | #101828 (gray/900) |
| `border-default` | Default border: cards, modals, dividers, table lines, Tertiary button. | #e5e7eb (gray/200) | #1e2939 (gray/800) |
| `border-default-medium` | Form controls and Secondary button border; dropdown menu border; disabled controls. | #e5e7eb (gray/200) | #333e4f (gray/700) |
| `border-default-strong` | Unchecked checkbox/radio/toggle border; emphasized outlines. | #e5e7eb (gray/200) | #4a5565 (gray/600) |
| `border-success-subtle` | Border of success surfaces; success focus ring. | #a4f4cf (emerald/200) | #004f3b (emerald/900) |
| `border-success` | Outline success button. | #007a55 (emerald/700) | #009966 (emerald/600) |
| `border-danger-subtle` | Border of danger surfaces; danger focus ring. | #ffccd3 (rose/200) | #8b0836 (rose/900) |
| `border-danger` | Outline danger button. | #c70036 (rose/700) | #ec003f (rose/600) |
| `border-warning-subtle` | Border of warning surfaces; warning focus ring. | #fcd9bd (orange/200) | #771d1d (orange/900) |
| `border-warning` | Outline warning button. | #d03801 (orange/600) | #ff5a1f (orange/500) |
| `border-brand-subtle` | Border of brand-tinted surfaces (info alert, brand badge). | #bedbff (brand/200) | #1c398e (brand/900) |
| `border-brand-light` | Border of checked toggle. | #155dfc (brand/600) | #155dfc (brand/600) |
| `border-brand` | Focused input border; active underline tab; checked checkbox/radio border. | #1447e6 (brand/700) | #2b7fff (brand/500) |
| `border-dark-subtle` | Dividers inside dark surfaces. | #1e2939 (gray/800) | #333e4f (gray/700) |
| `border-buffer-gradient-secondary` | Translucent edge for gradient/hero overlays. | #f9fafb80 | #03071280 |
| `border-purple` | Categorical outline. | #ad46ff (purple/500) | #ad46ff (purple/500) |
| `border-orange` | Categorical outline. | #ff8a4c (orange/400) | #ff8a4c (orange/400) |

## Radius (`border/border-radius/*`, themed)

| Class | modern | minimal | enterprise | mono |
|---|---|---|---|---|
| `rounded-0` | 0 | 0 | 0 | 0 |
| `rounded-xxs` | 2 | 2 | 1 | 1 |
| `rounded-xs` | 4 | 2 | 1 | 1 |
| `rounded-sm` | 6 | 4 | 1 | 1 |
| `rounded` | 8 | 6 | 4 | 1 |
| `rounded-base` | 12 | 8 | 4 | 1 |
| `rounded-lg` | 16 | 16 | 4 | 1 |
| `rounded-xl` | 24 | 24 | 4 | 1 |
| `rounded-full` | 9999 | 9999 | 9999 | 9999 |

Component defaults: buttons, inputs, cards, modals, alerts, menus, tooltips → `rounded-base`; badges → `rounded-sm`; checkbox → `rounded-xs`; dropdown rows, inner buttons → `rounded`; pills, avatars, toggles, radios, dots → `rounded-full`.

## Border width

Mode-invariant: Figma `border`=1 → `border`, `border-md`=2 → `border-2`, `border-lg`=4 → `border-4`, `border-xl`=8 → `border-8`.

## Spacing

Figma `spacing/N` = N × 4px = Tailwind `p-N`, `gap-N`, `m-N`, `w-N`… (`spacing/2․5` = 10px = `p-2.5`). Only these steps exist: 0, px, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96.

## Typography

| Figma | Class | Size |
|---|---|---|
| text-xxs | `text-xxs` | 8px |
| text-xs | `text-xs` | 12px |
| text-sm | `text-sm` | 14px |
| text-base | `text-base` | 16px |
| text-lg | `text-lg` | 18px |
| text-xl | `text-xl` | 20px |
| text-2xl … 6xl | `text-2xl` … `text-6xl` | 24 / 30 / 36 / 48 / 60px |

All Figma text styles use 150% line-height (built into the size classes). Text-style variants map to Tailwind modifiers: `leading-none` (100%), `leading-tight` (125%), `leading-relaxed` (162.5%), `leading-loose` (200%), `uppercase`, `underline`, `line-through`. Weights: `font-normal` (Regular), `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`. Tracking: `tracking-tighter` (-0.8px), `tracking-tight` (-0.4px).

Common roles: page title `text-3xl/4xl font-bold text-heading`; section heading `text-xl/2xl font-semibold text-heading`; card title `text-2xl font-semibold text-heading`; body `text-base text-body` (dense UI `text-sm`); labels `text-sm font-medium text-heading`; helper `text-sm text-body`; caption `text-xs text-body-subtle`; buttons `text-sm font-medium` (xs: `text-xs`, lg/xl: `text-base`).

## Shadows (effect styles)

| Class | Use |
|---|---|
| `shadow-xs` | Default on buttons, inputs, cards |
| `shadow` | Small raised elements |
| `shadow-md` | Tooltips |
| `shadow-lg` | Dropdowns, popovers, toasts, menus (Speed dial) |
| `shadow-xl` | Modals, drawers |
| `shadow-2xl` | Rare: marketing mockups |
| `shadow-bottom-dropdown` / `shadow-top` | Scroll-edge shadows inside a scrolling Dropdown list ("With scroll"): bottom edge of the header / top edge of the footer |
| `shadow-focus-brand` | Focus ring: brand/primary controls, inputs, checkboxes, toggles |
| `shadow-focus-secondary` | Focus ring: Secondary, Tertiary, Ghost buttons |
| `shadow-focus-success` / `-danger` / `-warning` / `-dark` | Focus ring for those button colors |

Use focus rings with `focus-visible:` (keyboard focus), and `outline-none` on the element.

## Containers

`max-w-xs` 320 · `max-w-sm` 384 · `max-w-md` 448 · `max-w-lg` 512 · `max-w-xl` 576 · `max-w-2xl` 672 · … · `max-w-7xl` 1280 — identical to Tailwind. Breakpoints sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536. Default page container: `mx-auto max-w-screen-xl px-4`.
