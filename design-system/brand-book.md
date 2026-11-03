AD Design Kit is a Tailwind-native design system that lives in Figma and ships as React + Tailwind CSS v4 code. Every Figma variable has a code twin with the same name, and every Figma component set has a React twin with the same variants. Build with the components and the semantic tokens below; when something is missing, add it in Figma first rather than inventing a one-off.

## Principles

1. **Only semantic tokens for colour.** Paint with `adk-bg-*`, `adk-text-*` and `adk-border-*` (Tailwind classes `bg-brand`, `text-heading`, `border-default-medium`). Never a primitive (`adk-brand-600`, `adk-gray-500`), a hex value, `rgb()` or an arbitrary `bg-[...]` value. The class name *is* the Figma variable name (`colors/background/bg-brand` → `bg-brand`); the default Tailwind palette is removed in strict mode, so raw palette classes silently produce nothing.
2. **No `dark:` colour overrides.** Every semantic token already switches across the four modes (Modern and Enterprise, each light and dark). `dark:` is fine only for non-colour things such as swapping an illustration.
3. **Spacing on the 4px scale only** (`spacing-2.5`, `spacing-4`; Tailwind `p-2.5`, `gap-1.5`, `px-4`). No arbitrary values.
4. **Radius from the themed scale** (`adk-rounded-xxs` … `adk-rounded-xl`, `adk-rounded-full`). The same step renders 12px in Modern and 4px in Enterprise; never `rounded-md`, `rounded-2xl` or a literal radius.
5. **Shadows from the effect styles**, focus rings included; never a hand-written box-shadow.
6. **Type from the theme.** The body face comes from the theme (`sans` → Inter in Modern, `serif` → IBM Plex Serif in Enterprise); never set a font family in a component.
7. **Icons come from Figma.** Use the Icons asset group or the generated React icons; never draw an inline `<svg>` icon.
8. **Use the component before hand-rolling markup.** A `div` with a background, shadow or rounded border is a Card, Badge or Alert drawn by hand.
9. **Variants mirror Figma.** Hover, focus, active and disabled are CSS states, never props; breakpoints are responsive classes, never props.

## Colour

Tokens are matched sets. A *soft* surface takes its *subtle* border and its *-strong* foreground (`adk-bg-success-soft` + `adk-border-success-subtle` + `adk-text-fg-success-strong`); a *solid* fill takes `adk-text-white` and hovers to its *-strong* step (`adk-bg-brand` → `adk-bg-brand-strong`). Each semantic token's note says which components use it and what it resolves to in every mode.

| Need | Token |
|---|---|
| Page background | `adk-bg-neutral-primary` |
| Card, modal, drawer, popover surface | `adk-bg-neutral-primary-soft` + `adk-border-default` |
| Floating menus (Dropdown, Autocomplete, Datepicker) | `adk-bg-neutral-primary-medium` + `adk-border-default-medium` |
| Input field and Secondary button fill | `adk-bg-neutral-secondary-medium` + `adk-border-default-medium` |
| Subtle section, read-only field, input add-on | `adk-bg-neutral-tertiary` |
| Hover fill on neutral items (menu rows) | `adk-bg-neutral-tertiary-medium` |
| Track and divider fill (progress track, skeleton) | `adk-bg-neutral-quaternary` |
| Primary action | `adk-bg-brand` → hover `adk-bg-brand-strong`, focus `shadow-focus-brand` |
| Tinted info surface | `adk-bg-brand-softer` + `adk-border-brand-subtle` + `adk-text-fg-brand-strong` |
| Status surfaces | `adk-bg-{success,danger,warning}-soft` + `adk-border-{…}-subtle` + `adk-text-fg-{…}-strong` (warning: `adk-text-fg-warning`) |
| Solid status fill | `adk-bg-success`, `adk-bg-danger`, `adk-bg-warning` (hover `-strong`) |
| Inverted surface (Dark button, Tooltip) | `adk-bg-dark` → hover `adk-bg-dark-strong` |
| Headings, labels, primary text | `adk-text-heading` |
| Body and secondary text | `adk-text-body` |
| Placeholder and meta text | `adk-text-body-subtle` — on `adk-bg-neutral-primary` and `-primary-soft` only; on tinted or secondary surfaces use `adk-text-body` to keep 4.5:1 |
| Links, active navigation | `adk-text-fg-brand` |
| Disabled | `adk-bg-disabled`, `adk-text-fg-disabled`, `adk-border-default-medium` |
| Text on solid fills | `adk-text-white` |
| Controls and scrims over images | `adk-bg-overlay-light` (carousel arrows), `adk-bg-overlay-dark` (image scrim) |
| Charts and categories | `adk-bg-purple`, `adk-bg-sky`, `adk-bg-teal`, `adk-bg-pink`, `adk-bg-cyan`, `adk-bg-fuchsia`, `adk-bg-indigo`, `adk-bg-orange`; text `adk-text-fg-{purple,cyan,indigo,pink,lime,yellow}` |

Status vocabulary shared by Alert, Toast, Badge, Input states and Progress:

| Status | Soft surface | Foreground on soft | Solid fill |
|---|---|---|---|
| neutral / gray | `adk-bg-neutral-secondary-medium` + `adk-border-default-medium` | `adk-text-heading` | `adk-bg-dark` / `adk-bg-gray` |
| info / brand | `adk-bg-brand-softer` + `adk-border-brand-subtle` | `adk-text-fg-brand-strong` | `adk-bg-brand` |
| success | `adk-bg-success-soft` + `adk-border-success-subtle` | `adk-text-fg-success-strong` | `adk-bg-success` |
| warning | `adk-bg-warning-soft` + `adk-border-warning-subtle` | `adk-text-fg-warning` | `adk-bg-warning` |
| danger | `adk-bg-danger-soft` + `adk-border-danger-subtle` | `adk-text-fg-danger-strong` | `adk-bg-danger` |

Status colours never stand alone: pair them with a word or an icon, as Alert, Badge and HelperText do. `adk-bg-variants-white` and `adk-bg-variants-gray` are legacy aliases; prefer `adk-bg-neutral-primary` and `adk-bg-neutral-tertiary-soft`. `adk-bg-white` and `adk-text-black` stay fixed in dark mode: use them only on top of imagery or brand fills.

Contrast, checked in every mode: `adk-text-body` on `adk-bg-neutral-primary` is 7.6:1 (Modern light) and 7.7:1 (Enterprise light, dark modes); `adk-text-body-subtle` is the tightest pair at 4.8:1 (gray/500 on white) and 7.7:1 in dark, which is why its note limits it to the primary surfaces; `adk-text-fg-brand` reads 6.8:1 (Modern) and 5.3:1 (Enterprise) on white; `adk-text-white` on `adk-bg-warning` (orange/600) is 4.9:1, the lowest of the solid fills. Every pair clears 4.5:1, so the source's values are kept exact.

## Typography

- Set everything in the theme face: `sans` (Inter) in Modern, `serif` (IBM Plex Serif) in Enterprise. Both load from Google Fonts; no font files ship with the kit.
- Sizes are the `text-xxs` … `text-6xl` scale (8–60px), every size with 150% line height. Modifiers: `leading-none` (100%), `leading-tight` (125%), `leading-relaxed` (162.5%), `leading-loose` (200%). `text-7xl` and above exist only as Figma primitives: do not use them in product UI.
- Weights: `font-normal` for paragraphs and helper text; `font-medium` for button text, labels and CTAs; `font-semibold` for main headings; `font-bold` and `font-extrabold` for H1 in hero sections.
- Tracking: `tracking-tight` (-0.4px) on section and card headings; `tracking-tighter` (-0.8px) on big H1s.
- Roles: page title `page-title`; section heading `section-heading`; card title `card-title`; hero H1 `hero-heading`; paragraphs `body` (dense UI `body-dense`); form labels and button text `label`; `helper` under fields; `caption` for timestamps and meta, in `adk-text-body-subtle`. Headings and labels sit in `adk-text-heading`, body in `adk-text-body`.
- Buttons: `text-sm font-medium` (`xs`: `text-xs`; `lg`/`xl`: `text-base`).

## Spacing and layout

- Steps are `spacing-N` = N × 4px, identical to the Tailwind step (`p-4` = `spacing-4` = 16px). Only the listed steps exist.
- Control heights: xs 32px, sm 36px, base 40px, lg 48px, xl 52px; base controls pad `spacing-4` × `spacing-2.5`.
- Default page container: `mx-auto max-w-screen-xl px-4` (1280px, `breakpoint-xl`). Containers follow Tailwind's `max-w-xs` (320) … `max-w-7xl` (1280); breakpoints sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536.
- Border widths: `border-width-1` by default; `border-width-2` for emphasised outlines; 4 and 8 for avatar rings and device frames.

## Radius

`adk-rounded-base` is the default for buttons, inputs, cards, modals, alerts, menus and tooltips; `adk-rounded-sm` for badges; `adk-rounded-xs` for the checkbox box; `adk-rounded` for dropdown rows and buttons nested inside other components; `adk-rounded-full` for pills, avatars, toggles, radios and status dots. In Enterprise every step but `full` flattens to 1px or 4px, so never pick a step for its Modern pixel value.

## Shadows and focus

- `shadow-xs` on buttons, inputs and cards; `shadow-sm` for small raised elements.
- Elevation ladder: Tooltip `shadow-md` → Dropdown, Popover, Toast, menus `shadow-lg` → Modal, Drawer `shadow-xl`; `shadow-2xl` only for marketing mockups.
- Focus rings are shadows applied with `focus-visible:` and `outline-none`: `shadow-focus-brand` on brand controls, inputs, checkboxes and toggles; `shadow-focus-secondary` on Secondary, Tertiary and Ghost buttons; `shadow-focus-success|danger|warning|dark` on buttons of those colours. Each ring is 2px of the matching *-subtle* or *-medium* token, resolved per mode.
- `shadow-bottom-dropdown` and `shadow-top` mark the scroll edges inside a scrolling Dropdown list.
- Backdrops: `bg-black/50`. z-index ladder: menus and popovers `z-40`, drawer and modal `z-50`, toasts `z-60`.

## Themes

Four modes: Modern (light, dark) and Enterprise (light, dark). Modern is blue (`adk-brand-*`), Inter, rounded; Enterprise is cyan on zinc, IBM Plex Serif, square. Set `data-theme` to `modern`, `modern-dark`, `enterprise` or `enterprise-dark` on the root; every colour token, focus ring, radius and the body face follow. Component code never branches on the theme.

## Iconography

447 icons from the Figma Icons page, in the Icons asset group (one SVG each, grouped as in Figma: General, Arrows, User, Text, Files & folders, Media, E-commerce, Education, Food & beverage, Weather, Emoji, Android, Brands). In code, import by Figma name in PascalCase (`angle-down` → `AngleDownIcon`): each icon is a 1em square that inherits `currentColor`, so colour it with the surrounding `adk-text-*` token and size it with the parent's text size or `[&_svg]:size-4`. Icons are decorative (`aria-hidden`) unless given a `title`. Add a missing icon to the Figma page and re-sync rather than drawing one.

## Logo

The AD Design Kit mark (Logos asset group) keeps its own gradients; place it on `adk-bg-neutral-primary` or `-primary-soft` with `spacing-2` of clear space and set the product name beside it in `label` weight. Third-party logos in the stories are example content, not brand assets.

## Components

Choose by situation:

| Situation | Use | Not |
|---|---|---|
| Trigger an action | `Button` | Link-styled text for primary actions; Badge |
| Navigate to another page | `<a>` with `adk-text-fg-brand`; Ghost Button only for toolbar-style nav | Brand Button for every link |
| Related actions side-by-side, one choice | `ButtonGroup` or `Tabs variant="segmented"` | Separate buttons with gaps |
| Persistent page-level message | `Alert` | Toast |
| Transient result of a user action | `Toast` | Alert, Modal |
| Decision required before continuing | `Modal` | Drawer, Popover |
| Secondary task alongside the page (filters, details, forms) | `Drawer` | Modal for long forms |
| Short hint on hover/focus | `Tooltip` | Popover |
| Rich content anchored to an element | `Popover` | Tooltip |
| Actions or options from a trigger | `Dropdown` | Select for actions |
| Choose one of many (form value) | `Select` (>5), `Checkbox` radio / `ChoiceCard` (≤5) | Dropdown |
| Binary setting that applies immediately | `Toggle` | Checkbox |
| Opt-in inside a form submitted later | `Checkbox` | Toggle |
| Status or metadata label, count | `Badge` | Button, Alert |
| Switch views in the same context | `Tabs` | Buttons, Pagination |
| Multi-step flow | `Stepper` | Tabs |
| Loading | `Spinner` (unknown, small area); `Skeleton` (layout-shaped); `Progress` (known %) | Skeleton for button loading |
| Grouped content block | `Card` | Bare bordered div |
| Collapsible Q&A or sections | `Accordion` | Tabs for more than 7 sections |
| Tabular data to compare or sort | `Table` | List, Cards |
| Simple vertical items | `List` | Table |

One `brand` Button per section; `secondary` and `tertiary` for the rest; `danger` only for destructive confirmations; `ghost` in toolbars, rows and card headers. Navigation items are links, never buttons; the current page gets `aria-current="page"`. Overlays use an accessible headless primitive (native `<dialog>`, Radix, Headless UI, Floating UI, React Aria) with the classes from their guidelines. Each component's guidelines list its Figma variants, the Figma property → prop map, the exact token recipe, when to use each variant and its accessibility rules.

## Content

Write in sentence case, in the second person, and keep status copy to one line with the status named in words ("Delete project?", "Upload your invoice", "Update available"). No emoji in UI text; the Emoji icon group covers reactions.

## Not synced

- Fonts: Inter and IBM Plex Serif are loaded from Google Fonts in the repository (`index.html`, `.storybook/preview-head.html`); no font files exist to copy, so `type.fonts` is empty and previews load them from Google Fonts.
- Radius per theme: the token format holds one value per radius token, so the Modern values are recorded and the Enterprise overrides (1px / 4px) live in the component stylesheet; each note states both.
- Spacing and breakpoints: the repository uses Tailwind's built-in scales (documented in `references/tokens.md`) rather than declaring variables; they are recorded here from that documentation.
- `_demo/shadow-*` Figma effect styles (eight coloured glows used only in demo frames) and the `text-7xl`–`text-9xl` primitives are not tokens and were not brought in.
- Third-party logos (`src/assets/logos/*` other than the AD Design Kit mark) and the avatar photos used by the stories were not copied as assets; the previews that need them embed them.
- Components: all 58 were built live from the repository's own stories (route: built — `npm ci`, esbuild bundle of `src/components/ui` and `src/components/icons`, Tailwind v4 CLI for the stylesheet); none were left out. Overlays (Modal, Drawer, Toast, Popover, Tooltip, Dropdown) open on interaction in their previews.
