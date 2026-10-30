# Figma audit — open inconsistencies in AD Design Kit (updated 2026-10-27)

Code follows the **intended** design where Figma is still inconsistent. Each row says what code does, so reviewers do not flag these as drift. Fix them in Figma, re-run the sync skill, then delete the row. Row numbers are stable (fixed rows are removed, not renumbered).

## Fixed in Figma on 2026-10-27
Rows 1–25, 27–29, 31, 33–35, 39–41 are resolved and were removed:
- **Variables:** all 890 Themes aliases now point to the local `Primitives` collection; the 10 theme value slips (old rows 14–23) are corrected. `colors/*/050` is renamed to `/50`, and `container/2xl` is 1536. New overlay tokens `bg-overlay-light` and `bg-overlay-dark` were added (primitives `white-alpha/30` and `dark-alpha/90`). Every variable has WEB code syntax `var(--adk-…)`.
- **Effect styles:** the focus rings `focus-brand|secondary|success|danger|warning|dark` are local styles bound to theme tokens. Button focus states use them for every color, and outline buttons keep their 1px colored stroke. `shadow-bottom-dropdown` and `shadow-top` are local copies of the former library styles.
- **Component bindings:** every component page is bound to local variables only; about 7,600 library and stray bindings were remapped. The exceptions are a few decorative gradient stops in the ▒ Patterns art, which point to library-only gradient variables and are now plain colors. Text that was bound to background tokens now uses text tokens (Badge, Toast, Stepper, Table). Alert Warning uses `text-fg-warning`. The Skeleton placeholder blue and the raw Carousel/Chat overlays now use tokens.
- **Elevation ladder:** Tooltip `shadow-md`; Dropdown, Popover, Toast and menus `shadow-lg`; Modal and Drawer `shadow-xl`.
- **Consistency:**
  - Drawer and Sidebar heading titles use `text-heading`.
  - Floating label success/danger borders use `-subtle`.
  - Sent chat bubbles use `bg-brand-softer`.
  - Datepicker cells use `rounded` in every state.
  - The Toggle lg Disabled Checked variant has its stroke.
- **Names:**
  - Button and Group button: Size `l` → `lg`.
  - Spinner sizes are now `xs/sm/md/lg/xl` (12/24/50/75/100).
  - All `TypeN` placeholders and misspellings were renamed: Timeline, Chat bubble, Drawer, Timepicker, Toast "Icon shape & text", "Stacked full", "Card with list", "Features", "Range Slider examples", File upload State `Initial`.
  - Every component set has a usage description.

## Theme variables

| # | Variable | Value | Likely intent |
|---|---|---|---|
| 26 | `typography/line-height/leading-heading(none)` | `60`, unused, name contains parentheses | Remove or rename |

## Components

| # | Finding | Where | Code does | Suggested Figma fix |
|---|---|---|---|---|
| 30 | Shape fills bound to **text** tokens | Rating stars (`text-fg-yellow`), List transaction icon (`text-fg-success`), Card/Chat image placeholders (`text-body`, `text-fg-disabled`, `text-body-subtle`) | Uses the derived `fill-*` utilities (valid, generated for every text token) | Optional: add `bg-*` tokens if these are surfaces |
| 32 | Remaining **unbound spacing** | Range slider examples gap 67px; KBD paddings 8/20px | Nearest scale value (`gap-16`, `px-2`/`px-5`) | Bind to `spacing/*` |
| 36 | Remaining **unbound radii** | 6px on nav links (Navbar, Nav tabs, Breadcrumbs, List rows, Stepper), with no themed 6px token; scattered 8px radii (Accordion, Autocomplete, Checkbox cards, Timelines, Skeleton, Chat/Carousel media); Tooltip arrow 4px; Device mockup bezels (art) | `rounded-base` for links and rows, `rounded-lg` for 8px | Bind to `rounded-base` / `rounded-lg`, or add a themed `rounded-md` |
| 37 | Line-height inconsistency | Labels `lh20` in forms vs `lh16` in checkbox/radio labels; Dropdown/Autocomplete items `lh14` (leading-none) vs Breadcrumb/Nav links `lh20` | Mirrors Figma per component (`leading-5` / `leading-4` / `leading-none`) | Decide one rule per role |
| 38 | Helper text size differs | Form Helper `12px` vs checkbox/toggle helper `14px` | Mirrors (`text-xs` vs `text-sm`) | Align |
| 42 | Pagination has no "current page" variant; Figma marks it with the Tertiary **Hover** state | `1149:81850` | Tertiary Hover style + `aria-current` | Add an Active state to Button or Pagination |
| 43 | **Jumbotron art** is partly unbound: "Bg-image" lead text uses `text-fg-disabled`; "Bg gradient" lead `#4a5565` and the gradient; "Text + Illustration" `#d90606`; Bento `#ff5733`, `#050100`; radii 16/20px | `1149:67227` | `text-body` for copy; gradients and illustration colors left to the designer | Bind the copy to text tokens; keep illustration colors as art |
| 44 | Colored shadow demo styles `shadow-{blue-600,green-500,…}/50` exist as local effect styles | Effect styles | Not exported to code (palette colors are not tokens) | Move them to a docs page or delete |

Code mirrors Figma values exactly (the generated CSS is a faithful copy, so designers see exactly what ships).

## Code ahead of Figma

Variants that exist in code because a product needed them; add them to the Figma set, then re-run the sync so the registry lists them.

| # | Component | Code | Proposed Figma addition |
|---|---|---|---|
| 46 | Navbar `1149:74216` | `fluid`: content row full width (`px-4`, no `max-w-screen-xl`) for app shells | Add a `Width = Contained / Fluid` property to the Navbar set |
| 45 | Navbar `1149:74216` | `size="compact"`: bar `py-1` (44px tall with `sm` logo/action controls) for dense app shells | Add a `Size = Default / Compact` property to the Navbar set with the compact padding |
