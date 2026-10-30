# Figma audit — open inconsistencies in AD Design Kit (updated 2026-10-31)

Code follows the **intended** design where Figma is still inconsistent. Each row says what code does, so reviewers do not flag these as drift. Fix them in Figma, re-run the sync skill, then delete the row. Row numbers are stable (fixed rows are removed, not renumbered).

## Fixed in Figma on 2026-10-31
- **Row 26:** `typography/line-height/leading-heading(none)` was not unused: the Jumbotron headline binds it (60px = text-6xl with leading-none). It is renamed `typography/line-height/leading-none-6xl` and documented; the token CSS does not change.
- **Row 32:** KBD gap and paddings are bound to `spacing/2` and `spacing/5`. The Range slider 67px gap no longer exists.
- **Row 36:** 77 nav-link, tab, breadcrumb, list-row and stepper corners (6px) are bound to `rounded-base`, and 20 corners of 8px (Accordion, Autocomplete, Textarea chatroom bar, choice cards, Timeline, Skeleton, chat bubble, Carousel media) to `rounded-lg`, matching code. Tooltip arrows and device bezels stay unbound as art.
- **Row 43:** Jumbotron copy is bound to text tokens; only the Bento illustration colors and its 16/20px art radii stay unbound, as intended.
- **Rows 45–46:** Navbar `Size = Default / Compact` and `Width = Contained / Fluid` were added (see "Code ahead of Figma").

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


## Components

| # | Finding | Where | Code does | Suggested Figma fix |
|---|---|---|---|---|
| 30 | Shape fills bound to **text** tokens | Rating stars (`text-fg-yellow`), List transaction icon (`text-fg-success`), Card/Chat image placeholders (`text-body`, `text-fg-disabled`, `text-body-subtle`) | Uses the derived `fill-*` utilities (valid, generated for every text token) | Optional: add `bg-*` tokens if these are surfaces |
| 37 | Line-height inconsistency | Labels `lh20` in forms vs `lh16` in checkbox/radio labels; Dropdown/Autocomplete items `lh14` (leading-none) vs Breadcrumb/Nav links `lh20` | Mirrors Figma per component (`leading-5` / `leading-4` / `leading-none`) | Decide one rule per role |
| 38 | Helper text size differs | Form Helper `12px` vs checkbox/toggle helper `14px` | Mirrors (`text-xs` vs `text-sm`) | Align |
| 42 | Pagination has no "current page" variant; Figma marks it with the Tertiary **Hover** state | `1149:81850` | Tertiary Hover style + `aria-current` | Add an Active state to Button or Pagination |
| 44 | Colored shadow demo styles `shadow-{blue-600,green-500,…}/50` exist as local effect styles | Effect styles | Not exported to code (palette colors are not tokens) | Move them to a docs page or delete |

Code mirrors Figma values exactly (the generated CSS is a faithful copy, so designers see exactly what ships).

## Code ahead of Figma

Variants that exist in code because a product needed them; add them to the Figma set, then re-run the sync so the registry lists them.

None open. Navbar `size="compact"` and `fluid` (old rows 45 and 46) were added to Figma on 2026-10-31 as `Size = Default / Compact` and `Width = Contained / Fluid` (Desktop variants).
