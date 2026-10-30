---
name: ad-design-kit-design-system
description: Build UI in React + Tailwind CSS using the AD Design Kit design system (Figma file TKsoawKvPxaNCff4q43Mli) so code matches Figma 1:1 — same token names, same component variants, same themes. Use whenever writing, editing or scaffolding React/TSX/JSX UI, styling with Tailwind, implementing a Figma frame or AD Design Kit component (button, input, badge, alert, modal, card, navbar, tabs, dropdown, table…), choosing colors/spacing/radius/typography, setting up theming or dark mode, or deciding which component fits a use case — even if the user does not say "AD Design Kit".
---

# AD Design Kit design system — React + Tailwind

AD Design Kit is a Tailwind-native design system in Figma (`TKsoawKvPxaNCff4q43Mli`). Every Figma variable has a code twin with **the same name**, and every Figma component set has a React twin listed in `references/components.json`. Your job when writing UI is to keep that 1:1 mapping intact.

## Non-negotiable rules

1. **Only semantic token classes for color.** `bg-brand`, `text-heading`, `border-default-medium` — never `bg-blue-600`, `text-gray-500`, `#hex`, `rgb()`, `bg-[...]`, or inline `style={{color}}`. The class name *is* the Figma variable name (`colors/background/bg-brand` → `bg-brand`). The default Tailwind palette is deliberately removed in strict mode, so raw palette classes silently produce nothing.
2. **No `dark:` color overrides.** Every semantic token already switches in dark mode and across the 4 themes. Writing `dark:bg-gray-800` breaks theming. (`dark:` is fine for non-color things like swapping an illustration.)
3. **Spacing on the 4px scale only** (`p-2.5`, `gap-1.5`, `px-4`). No arbitrary values (`p-[13px]`). Figma spacing variables are `spacing/N` = N×4px, identical to Tailwind.
4. **Radius from the themed scale:** `rounded-xxs`, `rounded-xs`, `rounded-sm`, `rounded`, `rounded-base`, `rounded-lg`, `rounded-xl`, `rounded-full`, `rounded-none`. These change per theme (Modern `rounded-base` = 12px, Enterprise = 4px, Mono = 1px). Never `rounded-md`/`rounded-2xl`/`rounded-[...]`.
5. **Shadows from the effect styles:** `shadow-xs` (default for controls), `shadow`, and the overlay ladder `shadow-md` (Tooltip) → `shadow-lg` (Dropdown, Popover, Toast, menus) → `shadow-xl` (Modal, Drawer); `shadow-2xl` for marketing; focus rings `shadow-focus-brand|secondary|success|danger|warning|dark`.
6. **Typography:** `text-xxs…text-6xl` with weights `font-normal|medium|semibold|bold|extrabold`. Body font comes from the theme (`font-sans` → Inter / Open Sans / IBM Plex Serif / IBM Plex Mono). Never set `font-[...]` families.
7. **Use the AD Design Kit component before hand-rolling markup.** Check `references/components.json` → the component's doc section. If the needed variant does not exist in Figma, say so and propose adding it to Figma first rather than inventing a one-off in code.
8. **Variants mirror Figma.** Props come from Figma variant properties via the registry's `propMap` (e.g. Figma `Color=Brand, Size=l` → `<Button color="brand" size="lg">`). Hover/Focus/Disabled/Active are CSS states, never props. Breakpoint variants are responsive classes, never props.

## Workflow

**Implementing a Figma link or frame**
1. Parse `node-id` from the URL. Look it up in `references/components.json` (`node` or `parts`). If it is a known component set → use the React component; otherwise it is a composition of components.
2. With the Figma MCP available, call `get_design_context` / `get_screenshot` for the node (load the `figma-design-to-code` guidance first). Treat its output as a reference: map every color/spacing/radius it reports to the semantic classes here. Never paste its hex values or arbitrary classes.
3. Read the matching section of `references/components/<category>.md` for the class recipe, do's and don'ts.
4. Build with the existing project components (look for `components/ui/*` first). If AD Design Kit components are not in the project yet, scaffold them from `templates/` (see Setup).
5. Finish by running the token linter from the review skill: `node ~/.claude/skills/ad-design-kit-review/scripts/lint-tokens.mjs <paths>` (or the project-local `.claude/skills/...` path).

**Writing UI without a Figma link**
Pick the component with the "Choosing a component" table below, then the variant from its doc section. Compose layouts with Tailwind layout utilities (flex/grid/gap/max-w-*) plus semantic surface tokens.

## Setup in a React project (once)

Full details: `references/setup.md`. Short version:
1. Copy `tokens/ad-design-kit.css` into the app (e.g. `src/styles/ad-design-kit.css`) and import it after Tailwind: `@import "tailwindcss"; @import "./ad-design-kit.css";` (Tailwind v4).
2. Load the four theme fonts (Google Fonts `<link>` in `index.html`, listed in setup.md).
3. Set `<html data-theme="modern">`; toggle `class="dark"` for dark mode.
4. `npm i clsx tailwind-merge`, then copy `templates/lib/cn.ts` and the components you need from `templates/components/` into `src/components/ui/`.
5. Never hand-edit `ad-design-kit.css`; regenerate it with the `ad-design-kit-figma-sync` skill.

## Token cheat sheet (full table: `references/tokens.md`)

| Need | Use |
|---|---|
| Page background | `bg-neutral-primary` |
| Card / modal / popover surface | `bg-neutral-primary-soft` (+ `border border-default`) |
| Input field & secondary button fill | `bg-neutral-secondary-medium` (+ `border-default-medium`) |
| Subtle section / read-only / add-on | `bg-neutral-tertiary` |
| Hover fill on neutral items (menu rows) | `bg-neutral-tertiary-medium` |
| Track / divider fill (progress bg) | `bg-neutral-quaternary` |
| Primary action | `bg-brand` → hover `bg-brand-strong`, focus `shadow-focus-brand` |
| Tinted info surface | `bg-brand-softer` + `border-brand-subtle` + `text-fg-brand-strong` |
| Status surfaces | `bg-{success,danger,warning}-soft` + `border-{…}-subtle` + `text-fg-{…}-strong` |
| Solid status fill | `bg-success`, `bg-danger`, `bg-warning` (hover `-strong`) |
| Headings / primary text | `text-heading` |
| Body / secondary text | `text-body` |
| Placeholder / meta text | `text-body-subtle` |
| Links, active nav | `text-fg-brand` |
| Disabled | `bg-disabled`, `text-fg-disabled`, `border-default-medium` |
| Default border | `border-default`; controls `border-default-medium`; strong `border-default-strong` |
| Text on solid fills | `text-white` |
| Controls / scrims over images and media | `bg-overlay-light` (carousel arrows), `bg-overlay-dark` (image scrim) |
| Charts / categorical | `bg-purple bg-sky bg-teal bg-pink bg-cyan bg-fuchsia bg-indigo bg-orange`, `text-fg-{purple,cyan,indigo,pink,lime,yellow}` |

## Choosing a component (summary — each doc section has full when/when-not)

| Situation | Use | Not |
|---|---|---|
| Trigger an action | `Button` | `Link`-styled text for primary actions; Badge |
| Navigate to another page | `<a>` with `text-fg-brand` / `NavLink` / Ghost Button only for toolbar-style nav | Brand Button for every link |
| Related actions side-by-side, one choice | `ButtonGroup` or `Tabs variant="segmented"` | Separate buttons with gaps |
| Persistent page-level message | `Alert` | Toast (auto-dismiss) |
| Transient result of user action | `Toast` | Alert, Modal |
| Requires decision before continuing | `Modal` | Drawer, Popover |
| Secondary task alongside page (filters, details, forms) | `Drawer` | Modal for long forms |
| Short hint on hover/focus, no interaction | `Tooltip` | Popover |
| Rich content or interaction anchored to element | `Popover` | Tooltip |
| List of actions/options from a trigger | `Dropdown` | Select for actions |
| Choose 1 of many (form value) | `Select` (>5), `Radio`/`ChoiceCard` (≤5) | Dropdown |
| Binary setting that applies immediately | `Toggle` | Checkbox |
| Opt-in inside a form submitted later | `Checkbox` | Toggle |
| Status/metadata label, count | `Badge` | Button, Alert |
| Switch views within the same context | `Tabs` | Buttons, Pagination |
| Multi-step flow | `Stepper` | Tabs |
| Loading: unknown duration, small area | `Spinner`; layout-shaped content → `Skeleton`; known % → `Progress` | Skeleton for button loading |
| Grouped content block | `Card` | Bare bordered div |
| Collapsible Q&A / sections | `Accordion` | Tabs for >7 sections |
| Tabular data to compare/sort | `Table` | List, Cards |
| Simple vertical items | `List` | Table |

## References

- `references/setup.md` — install, fonts, theme switching, dark mode, Tailwind v3 note
- `references/tokens.md` — every semantic token: meaning, when to use, Modern light/dark values
- `references/components/actions.md` — Button, Button group, Speed dial, Download app button
- `references/components/forms.md` — Input, Label/Helper, Select, Search, Number, Phone, Copy, File upload, Tag, OTP, Textarea, Rich text, Floating label, Datepicker, Timepicker, Autocomplete, Range slider, Toggle, Checkbox/Radio, Choice cards
- `references/components/feedback.md` — Alert, Toast, Badge, Progress, Spinner, Skeleton, Rating
- `references/components/overlays.md` — Modal, Drawer, Dropdown, Popover, Tooltip
- `references/components/navigation.md` — Navbar, Sidebar, Breadcrumb, Tabs, Pagination, Bottom navigation, Stepper
- `references/components/data-display.md` — Card, Accordion, Avatar, Icon shape, List, Table, Timeline, Chat bubble, Carousel, KBD
- `references/components/marketing.md` — Banner, Jumbotron, Gallery, Device mockups
- `references/components.json` — registry: Figma node ids ↔ React components ↔ prop mapping
- `references/figma-audit.md` — inconsistencies found in the Figma file; how code handles each
- `tokens/ad-design-kit.css` — generated Tailwind v4 theme (source of truth in code); `tokens/token-manifest.json` — resolved values per theme/mode
- `templates/` — React implementations of every AD Design Kit component (cn helper + 56 files covering all 58 registry entries; Label and HelperText live in Input.tsx). The registry's `template` field links each component to its file; copy what you need into `components/ui/`

Every component (58 Figma component sets plus their parts) is **spec verified**: each variant's token bindings were read from Figma on 2026-10-26 and updated after the Figma cleanup of 2026-10-27, when every component was rebound to local variables and placeholder variant names were replaced. Where Figma uses a raw or wrongly bound value, the doc says what code uses and links the `figma-audit.md` row. If Figma changes later, re-pull a component with `ad-design-kit-review/scripts/figma-component-spec.js` (via the Figma MCP `use_figma` tool; `MODE = 'summary'` for composite components) and update its doc.
