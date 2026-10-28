---
name: auxokit-compose
description: Turn any design reference — an uploaded screenshot, mockup, photo of a whiteboard, a Figma frame from another file, or a written description of a screen — into React + Tailwind code composed ONLY from the AuxoKit components that already exist in Figma (TKsoawKvPxaNCff4q43Mli) and in `src/components/ui`. The skill never invents a component, never hand-rolls buttons, inputs, menus, tabs, tables or dialogs, and never copies the reference's colors or fonts; anything the system cannot express is reported as a gap for the designer instead of being built. Use it whenever someone shares a design image or reference and asks to build, implement, recreate, clone, "make this with our design system", "turn this into a page", or "use our components for this" — even if they do not say "AuxoKit" — and for any new screen or feature page in this project.
---

# AuxoKit compose — build screens from a reference, components only

AuxoKit's whole value is the 1:1 mapping between Figma and code: every component set in Figma has a React twin, every token has the same name, and the sync, review and Storybook docs all depend on that mapping staying intact. A one-off component written for one screen breaks it: it has no Figma counterpart, no registry entry, no docs, and the next sync cannot see it. So this skill has one job: **compose the reference from what exists, and hand everything else back to the designer as a precise gap list.** Not building something is a valid outcome; building a lookalike is not.

Depends on the `auxokit-design-system` skill (registry, docs, tokens) and the `auxokit-review` skill (token linter); both sit next to this folder.

## The contract

Allowed:
- Any component listed in `auxokit-design-system/references/components.json` (56 React components, 58 Figma sets), in the props and variants its doc section describes.
- Layout glue: `div`/`section`/`main`/`aside`/`header`/`footer`/`nav`/`ul`/`li`/`form` with flex/grid/gap/padding utilities and AuxoKit surface tokens; headings and paragraphs with the typography tokens; `img`; `<a>` for navigation, styled as a link (`text-fg-brand`) or with `buttonVariants()`.
- Icons: the project's `src/components/icons.tsx` (icons are not components; a missing icon can be added there as an inline SVG, say so in the report).

Not allowed, with no exceptions for "it's just this once":
- New files or exports under `src/components/ui`.
- **Restyling a component through `className`.** A component's colours, padding, height, radius, shadow, typography and hover states are its Figma spec. The only classes a screen may pass are layout ones: width (`w-*`, `min-w-*`), margins, flex/grid placement, visibility, and an edge divider the docs ask for (`border-e border-default` on a Sidebar). `text-fg-brand` on a tertiary Button, `bg-dark` on a table header, `shadow` on a Navbar, `size-6` on an icon button are all a second component hiding in a prop. If the reference needs a look the variant list does not have, that is a gap, not a className.
- **Wrapping a component in a custom band.** Navbar, Tabs, Table, Sidebar and Pagination carry their own container, padding and dividers (`Navbar` renders `mx-auto max-w-screen-xl px-4 py-6`). Do not put them inside a `div` that adds padding, shadow or a background to "match the mock"; when two things must align, give both the same documented container instead.
- **Using a component for what its doc says "Don't".** Every doc section ends with Use / Don't. The site's top-level navigation is `Navbar links` or `Sidebar` items with `current`; the row of section tabs under a header (Figma set "Nav tabs") is `Tabs variant="underline"`, placed directly below the `Navbar` in the Navbar's own container. An action is a `Button`, not a `Badge`. A menu of actions is `Dropdown`, not `Select`. Read the line before you choose, and when the reference breaks it, follow the doc and say so in the map.
- Raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`/`<tr>`/`<td>`, `<details>`, `<progress>` — these are the signature of a hand-rolled control. Use Button, Input, Select, Textarea, Modal/Drawer, Table, Accordion, Progress.
- Re-styling a component into something Figma does not have (a "pill" Button, a dark Alert, a 54px Sidebar), or a `Record<variant, classes>` map in feature code — that is a component in disguise.
- The reference's hex colors, font families, pixel radii or shadows. The reference tells you *what* is on screen; AuxoKit tokens decide *how it looks*.
- **Any font decision at all.** The theme sets the family (Modern = Inter, Minimal = Open Sans, Enterprise = IBM Plex Serif, Mono = IBM Plex Mono, all loaded once in `index.html`); sizes are `text-xxs…text-6xl`, weights `font-normal…font-extrabold`. No `font-[…]`, no `style={{ fontFamily }}`, no Google Fonts link or `@font-face` in feature code, no `text-[13px]`. A mock in Roboto is still built in the theme font.

`scripts/check-composition.mjs` enforces the mechanical parts of this; run it before you report.

## Workflow

### 1. Read the reference, not just look at it
- **Image** (screenshot, mockup, photo): open it with the Read tool. Write down every region top-to-bottom, left-to-right, with its content and behaviour as far as you can infer (what is clickable, what is a list, what is a form).
- **Figma link to another file**: load the `figma-design-to-code` guidance and call `get_design_context` for the frame; use the code it returns only as an inventory of regions, text and spacing. Its components are *not* AuxoKit components, even when they are called "Button" — map them like any other reference.
- **Text description**: list the regions it implies and ask about anything that changes the component choice (single vs multi select, modal vs page), but do not block on cosmetic details.

### 2. Load the inventory
Read `auxokit-design-system/references/components.json` for the component names and `propMap`s, and the doc section (`references/components/<category>.md`) for every component you intend to use — including its container and spacing recipe (so you place it as designed) and its **Use / Don't** line (so you do not pick it for the wrong job). `references/pattern-map.md` in this skill lists the usual UI regions and which AuxoKit component covers each, including the near-misses that look like a gap but are not (icon rail → `Sidebar collapsed`, text link button → `Button color="ghost"` or `buttonVariants`, split button → `Button` + `Dropdown`). If you are unsure whether a variant exists in Figma, `search_design_system` on `TKsoawKvPxaNCff4q43Mli` settles it; the registry mirrors Figma, so the registry answer is normally final.

### 3. Write the composition map before any code
One row per region. Keep it in your reply so the user can see the mapping and correct it.

| # | Region in reference | Content / behaviour | AuxoKit | Status |
|---|---|---|---|---|
| 1 | Top bar | org switcher, bell, avatar | `Navbar` logo slot + `Dropdown` + `Button ghost iconOnly` + `Avatar` | match |
| 2 | Filter chips | removable keyword chips | `Badge color="white" rightIcon` | composed |
| 3 | Colour picker | 8 swatches, one selected | — | **gap** |
| 4 | Nav tabs under the header | Material List / Indent / … | `Tabs variant="underline"` (Figma "Nav tabs") directly below the `Navbar`, inside `mx-auto max-w-screen-xl px-4` | match |

Status meanings:
- **match** — one component, one of its variants.
- **composed** — several components plus layout glue, nothing new in behaviour or look.
- **stand-in** — the closest existing component used honestly (reference has an outlined brand button → AuxoKit `tertiary`). Only when the swap keeps the meaning; never when it changes what the control does.
- **gap** — no component or variant expresses it. Do not build it. Leave a clearly labelled placeholder (`<div className="rounded-base border border-dashed border-default-medium p-4 text-sm text-body-subtle">Needs AuxoKit component: Colour picker</div>`) and put it in the gap report. The fix is a Figma addition through the designer, then `auxokit-figma-sync` section B; never a local component.

If more than a third of the regions are gaps, stop after the map and ask whether to proceed with placeholders or wait for Figma — building a page that is mostly placeholders helps nobody.

### 4. Build
- Put the screen in `src/features/<name>/` (or where the project keeps pages); import only from `src/components/ui`, `src/components/icons`, `src/lib`.
- Translate every colour in the reference to a semantic token by role (primary action → `bg-brand`, raised panel → `bg-neutral-primary-soft` + `border-default`, selected row → `bg-brand-softer` + `text-fg-brand`, dark header → `bg-dark` + `text-white`, muted text → `text-body-subtle`). Spacing on the 4px scale, radius from the themed scale, fonts from the theme. The `auxokit-design-system` cheat sheet has the full table.
- Let each component own its box. Place a `Navbar` as the first child of the page column, a `Sidebar` as a full-height column, a `Table` directly in the content area; align neighbours by reusing the component's documented container (`mx-auto max-w-screen-xl px-4`), never by padding a wrapper to taste. If the mock's header is taller, darker or wider than the component, the component wins.
- Make it interactive where the reference implies interaction: filters filter, tabs switch, drawers open. Use component props for state (`value`/`onChange`, `open`/`onOpenChange`), not CSS classes.
- Keep assets from the reference only when they are content (an illustration, a logo). Never embed a screenshot of UI as UI.

### 5. Verify
```bash
node .claude/skills/auxokit-compose/scripts/check-composition.mjs src/features/<name>
npx tsc -p tsconfig.app.json --noEmit
```
The checker fails on raw controls, new `components/ui` files, style overrides passed through `className` on a system component, inline typography styles and font imports in feature code, and token violations (it runs the token linter).

When the dev server or Storybook is running, also prove the rendered fonts:
```bash
node .claude/skills/auxokit-compose/scripts/check-fonts.mjs http://localhost:5173/<route>            # whole page
node .claude/skills/auxokit-compose/scripts/check-fonts.mjs http://localhost:5173/<route> --selector 'dialog[open]'
node .claude/skills/auxokit-compose/scripts/check-fonts.mjs "http://localhost:6006/iframe.html?viewMode=story&id=<story-id>"   # a story
```
It opens the page in headless Chromium, waits for webfonts, and checks every text element: the family must be the font of the theme in effect for that element (it follows `data-theme` scopes, reading the families from the token manifest), the size must be on the text scale and the weight on the weight scale, and the theme font must actually be loaded. Any mismatch is a build error: a fallback font usually means the Google Fonts link is missing, and an off-scale size means a className or inline style slipped through. Fix every error; a `// auxokit-compose-allow: <reason>` comment on the line is only for a genuine layout element the regex misreads, never for a control. If the app or Storybook is running, open the screen and compare it with the reference side by side: same regions, same order, same hierarchy — identical pixels are not the goal, identical structure through AuxoKit's look is.

### 6. Report
End with this structure:

```
## Composition map
<the table from step 3, with final statuses>

## Gaps for Figma
- <Region>: what the reference shows, why no AuxoKit component covers it, the proposed component or variant (name, properties) to add in Figma. "None" when there are no gaps.

## Stand-ins
- <Region>: reference → AuxoKit choice, and why it keeps the meaning.

## Checks
check-composition: pass/fail (counts) · check-fonts: pass/fail (elements checked) or not run (no server) · tsc: pass/fail · visual: compared / not compared
```

## Mistakes this skill exists to prevent (all seen in real work)

| What was built | Why it is wrong | What the system wanted |
|---|---|---|
| Table header given `bg-dark text-white`, cells `border-e`, rows `h-16` to match a mock | Restyled component: Figma's Table has a neutral header, row dividers, 56px cells | Plain `Table` parts; put filters in its `toolbar` slot |
| `Navbar className="shadow"` and a `div className="px-12 pt-6"` around `Tabs` | Custom bands break the documented container and misalign the header and the nav tabs below it | `Navbar` as-is; the nav tabs row reuses `mx-auto max-w-screen-xl px-4` so both line up |
| Nav tabs moved into `Navbar links` or a `Sidebar` section "because Tabs are not navigation" | Over-reading the Tabs doc: the Figma set is "Nav tabs" and the reference shows a tab row under the header; the Navbar's ~7-link limit and the Sidebar are for the site's top-level navigation | `Tabs variant="underline"` directly below the `Navbar` |
| `Button color="tertiary" className="text-fg-brand"` to imitate an outlined blue button | Colour override = a Button variant Figma does not have | `tertiary` as designed, listed as a stand-in |
| A hand-written 54px dark icon rail with tooltips | Hand-rolled Sidebar | `Sidebar collapsed` |
| Raw `<button>` text links ("Add Specification") | Hand-rolled control | `Button color="ghost"` |
| A mock set in Roboto reproduced with `font-['Roboto']` or an extra Google Fonts link | The theme owns the family; a second font breaks every other theme | Nothing: the theme font applies by itself; verify with `check-fonts.mjs` |
| `TableRow className="bg-brand-soft"` for a selected row | The Table set has no selected-row variant; the tint is a state the component does not own | Let the `Checkbox` show selection, set `aria-selected`, and list "Table row: selected state" as a gap |

## Examples

**Reference: a settings page screenshot with toggles, a danger zone and a save bar.**
Map: section cards → `Card` + `CardTitle`; each setting row → `Toggle` with `description`; danger zone → `Alert color="danger" variant="complex"` with a `Button color="danger" outline`; sticky save bar → layout `div` with `Button` + `Button color="tertiary"`. No gaps.

**Reference: a kanban board from a Figma file.**
Map: columns → layout grid of `Card`s; cards → `Card` with `Badge`s and `AvatarGroup`; "+ Add card" → `Button color="ghost" size="sm" leftIcon`; drag handles and column WIP limits → **gap** (no drag affordance or counter-pill component). Build the board as static columns, placeholder the handle, report the gap with a proposed `Kanban card` set.

**Reference: "an icon-only left rail like Slack".**
Not a gap: `Sidebar collapsed` is exactly that (icons with tooltips). Width differs from the reference; that is AuxoKit's decision, not a reason to hand-roll a 54px rail.
