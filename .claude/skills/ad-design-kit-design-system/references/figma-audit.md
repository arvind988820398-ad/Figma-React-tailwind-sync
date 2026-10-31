# Figma audit — open inconsistencies in AD Design Kit (updated 2026-10-31)

Code follows the **intended** design where Figma is still inconsistent. Each row says what code does, so reviewers do not flag these as drift. Fix them in Figma, re-run the sync skill, then delete the row. Row numbers are stable (fixed rows are removed, not renumbered).

## Fixed in Figma on 2026-10-31
- **Row 26:** `typography/line-height/leading-heading(none)` was not unused: the Jumbotron headline binds it (60px = text-6xl with leading-none). It is renamed `typography/line-height/leading-none-6xl` and documented; the token CSS does not change.
- **Row 32:** KBD gap and paddings are bound to `spacing/2` and `spacing/5`. The Range slider 67px gap no longer exists.
- **Row 36:** 77 nav-link, tab, breadcrumb, list-row and stepper corners (6px) are bound to `rounded-base`, and 20 corners of 8px (Accordion, Autocomplete, Textarea chatroom bar, choice cards, Timeline, Skeleton, chat bubble, Carousel media) to `rounded-lg`, matching code. Tooltip arrows and device bezels stay unbound as art.
- **Row 43:** Jumbotron copy is bound to text tokens; only the Bento illustration colors and its 16/20px art radii stay unbound, as intended.
- **Rows 30, 37, 38, 42 and 44, resolved to common design-system practice (Material, Carbon, Atlassian, WCAG 2.2):**
  - **Glyph vs surface colors (30).** Icons, stars and separator dots keep foreground tokens (`text-*`, used in code as `fill-*`); that is the standard, not a defect. Image placeholders follow one recipe: surface `bg-neutral-tertiary`, glyph `text-body-subtle` (Card and Chat no longer use `text-body` or the disabled color for it).
  - **Line height follows font size (37).** `text-sm` always uses `leading-5` (20px) and `text-xs` `leading-4` (16px): checkbox and radio labels, choice-card titles, dropdown and autocomplete items now match form labels and nav links. Menu rows keep 32px by moving padding from 8px to 6px. Fixed 14px line heights are gone, which also meets WCAG 1.4.12 text spacing.
  - **One helper-text size (38).** Every helper or description under a control is `text-xs leading-4 text-body` (12/16): form Helper, checkbox, radio and toggle helpers.
  - **Selected is not hover (42).** The current Pagination page uses the selected style `bg-brand-softer border-brand-subtle text-fg-brand` with `aria-current="page"`, unchanged on hover.
  - **Only tokens are published (44).** The eight colored demo shadows are renamed `_demo/shadow-…/50`, so they stay on the Shadows page but leave the published library; the token CSS is unchanged.
- **Remote components relinked.** Instances on many pages still pointed to the kit this file was copied from, which no longer publishes them ("Component removed from library" in the Swap panel). Every instance is now local (0 of 15,542 remote):
  - Rebuilt as local sets with the same variants, layout and component properties: `Table header`, `Table cell (header)`, `Table cell (base)`, `Table Footer` (Tables page), `Country flag` (Dropdowns), `Text Block` (Skeleton), `Separator` (Modals).
  - The 240 logos, illustrations and icons on the Logos, Illustrations and Icons pages are now local components in place; `Apple` and `Google Play` sit on the Buttons page.
  - Variables too: the copied layers were still bound to the old kit's variables, and some pages set a mode on its collection, so Figma painted them from stale cached (dark) values. That is why the rebuilt Table header looked dark. About 20,000 bindings now point to the local Themes and Primitives variables (same name, or the renamed one: `bg-primary-soft` → `bg-neutral-primary-soft`, `border-base` → `border-default`, `size/lg` → `typography/font-size/text-lg`, `primary/*` → `colors/brand/*`). About 2,700 stale overrides on nested layers were cleared, and 60 stale modes removed. The file has 0 remote variable bindings. The Colors page "Slate" column, which was bound to violet, is now bound to `colors/slate/*`.
  - Instances with a local twin (Button, Badge, Tooltip, Avatar, Icon Shape, Nav tabs, Pattern, the form sets, icons) were swapped to it, keeping their overrides. One old-style Badge became the Badge set, and the Gallery grid example was detached.
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

None open.

Code mirrors Figma values exactly (the generated CSS is a faithful copy, so designers see exactly what ships).

## Code ahead of Figma

Variants that exist in code because a product needed them; add them to the Figma set, then re-run the sync so the registry lists them.

| # | Component | Code | Proposed Figma addition |
|---|---|---|---|
| 48 | Sidebar item `1149:82699` | `meta` (second line, e.g. timestamp) and `actions` (per-item menu beside the link, shown on hover/focus) for chat or file history | Add `Type = With meta` (two-line label) and a `Show actions` boolean with a trailing ghost icon Button (visible in Hover/Active) to the Navigation list item set |

Closed: Navbar `size="compact"` and `fluid` (old rows 45 and 46) were added to Figma on 2026-10-31 as `Size = Default / Compact` and `Width = Contained / Fluid` (Desktop variants). Chat bubble `width="fluid"` (old row 47) is Figma `Width = Fixed / Fluid` on the Chat bubble and Bubble sets, and DropdownItem `color="danger"` (old row 49) is Figma `Color = Default / Danger` on the Dropdown list item set (Default type), both added on 2026-10-31.
