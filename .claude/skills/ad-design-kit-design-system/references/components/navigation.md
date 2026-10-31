# Navigation

All components here are **spec verified** (2026-10-26). Navigation items are links (`<a>` / router `Link`), not buttons; the current page gets `aria-current="page"`. Default link `text-body`, hover/active `text-fg-brand`, disabled `text-fg-disabled`.

## Navbar
Figma: page `3279:21067` · navbar `1149:74216` (Default, With icons, With search input, With links, Centered logo × Mobile/Tablet/Desktop) · content `1149:74308` (9 types) · nav link `1149:74002` (13 types × Initial/Hover/Active/Disabled) · mega menus `1149:74737` (full width), `1149:75228` (fixed width: Icon shape, Categories, Default, Icons & CTA) · mobile menu `1149:75488` (Default, Bordered links) · template `templates/components/Navbar.tsx`
API: `<Navbar logo links actions search centered fluid sticky size="base|compact">`; `NavLink` for custom layouts. `compact` (`py-1`, 44px with `sm` controls; Figma `Size = Compact`) is for dense app shells; `fluid` drops the centered `max-w-screen-xl` container so the bar spans an app shell's full width (Figma `Width = Fluid`). `centered` (Figma `Type = Centered logo`): from `md` a 3-column grid, links on the left (`gap-6`), logo in the middle, actions on the right; below `md` it collapses like Default.

- Bar: `sticky top-0 z-40 w-full border-b border-default bg-neutral-primary-soft py-6` → content `mx-auto flex max-w-screen-xl items-center justify-between gap-8 px-4` (height of the content row 30–40px).
- Logo (`Logo sm`) · links `flex gap-8` (Only links `gap-6`) · actions Secondary `base` + Brand `base` (icons type: Ghost `sm` icon buttons, 36px avatar).
- Nav link Default: `text-sm font-medium leading-5 text-body hover:text-fg-brand`; active `text-fg-brand`; disabled `text-fg-disabled`; with chevron/right icon `gap-1.5`, icon `size-4.5`. Other link types: Two icons/Flag & icon (`gap-1.5`), Icon top (icon `size-5` above text), Double text (secondary `text-base font-medium text-body-subtle`), Bordered (`rounded-base border border-default px-2 py-1.5 text-heading`).
- Mega-menu links (Heading & helper, With icon shape, Big Icons, Top icon & CTA): `rounded-base p-2` (CTA `p-3`), title `text-base font-semibold leading-4.5` (18px), helper `text-sm text-body`, icon `size-6`/`size-9` `text-body`; hover `bg-neutral-secondary-medium` (via Hover variant).
- Mega menu full width: `w-full border-y border-light bg-neutral-primary-soft py-12 shadow-lg`, grid `gap-8`, column titles `text-base font-semibold text-heading`, "view all" `text-sm font-medium text-fg-brand`.
- Mega menu fixed width: `rounded-base border border-light bg-neutral-primary-soft p-6 gap-6 shadow-lg`; Categories type has a side column `bg-neutral-secondary-medium p-6` divided by `border-light-medium`; headings `text-sm font-semibold text-heading`.
- Mobile menu: `bg-neutral-primary-soft p-4 flex flex-col gap-4` with `Input sm` search, link list (Bordered links: rows `pb-3 border-b border-light text-sm font-medium text-body`), user block `rounded-base border border-light-medium bg-neutral-secondary-medium px-3 py-2.5 gap-2.5`, Secondary + Brand `sm`/`xs` buttons.
- Breakpoint variants = responsive classes (`md:flex` links, `md:hidden` menu button).

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `links={…} actions={…}` | Site header with top-level links plus sign-in or CTA buttons. | App headers that need notifications and an avatar (With icons). |
| Type = With icons | `actions={…}` | App header with icon buttons (notifications, settings) and a 36px avatar. | Marketing pages that need visible text CTAs (Default). |
| Type = With search input | `search={<Input size="sm" />}` | Global search is a primary task across the whole product. | Search only filters the current page; put the Input in the page toolbar. |
| Type = With links | `links={…}` | Simple sites with top-level links and no account actions. | Sign-in or a primary CTA is needed in the header (Default). |
| Type = Centered logo | `centered` | Brand-led sites with few links placed around a centered logo. | App shells or headers with many links and actions (Default). |
| Size = Default | `size="base"` | Marketing sites and standalone pages with `base` buttons. | Dense app shells where vertical space matters (Compact). |
| Size = Compact | `size="compact"` | Dense app shells; a 44px bar with `sm` controls. | Marketing headers with `base` buttons (Default). |
| Width = Contained | `fluid={false}` | Content pages centered in `max-w-screen-xl`. | App shells with a Sidebar or full-width data views (Fluid). |
| Width = Fluid | `fluid` | App shells where the bar spans the full width beside a Sidebar or wide tables. | Marketing or reading pages with centered content (Contained). |

**Use** as the global site/app header. **Don't** exceed ~7 top-level links (use a mega menu or Sidebar), duplicate Sidebar navigation, or switch in-page views (Tabs).
A11y: links sit in a `<nav>` with an `aria-label`; the current page has `aria-current="page"`; the mobile menu button has `aria-expanded` and `aria-controls`.

## Sidebar
Figma: page `3279:34616` · sidebar `1149:82628` (Default, With alert, Double sidebar × Contracted) · item `1149:82699` (With icon, With badge × Initial/Hover-Active/Disabled/Collapsed) · header `1149:82737` (Heading, Logo, User select) · template `templates/components/Sidebar.tsx`
API: `<Sidebar header sections={[[{label,href,icon,current,disabled,badge,meta,actions}]]} footer collapsed label rail>`. `rail` (Figma `Type = Double sidebar`) = `{ sections, header, label }`: a collapsed icon rail rendered before the panel, `border-e border-default`. `meta` = second line under the label (`text-xs leading-4 text-body`, e.g. a timestamp); `actions` = per-item menu (a `Dropdown` with a ghost `xs` icon Button) rendered beside the link, shown on hover, keyboard focus and always on touch screens; the item reserves `pe-10` for it. Both are code ahead of Figma (figma-audit.md row 48).

- Panel: `h-screen w-72 bg-neutral-primary-soft p-5 flex flex-col gap-5` (add `border-e border-default` when the page is the same color); collapsed `w-16 px-0 py-5 gap-4 items-center`: icons only, each a 36px item (`size-9`, Figma Ghost `sm` icon Button) with a Tooltip.
- Header: Logo/Heading `pb-4 border-b border-default` (heading `text-lg font-medium leading-6 text-heading`); User select `p-2` with `AvatarGroupLabel base` + chevron.
- Item: `flex items-center gap-1.5 rounded-base px-2 py-1.5 text-base font-medium text-body` + icon `size-5 text-body`; hover/active `bg-neutral-secondary-medium text-fg-brand` (icon too); disabled `text-fg-disabled`; trailing count `Badge color="danger" size="sm"`; expandable group = Collapsed item with nested items `ps-8`.
- Sections: the lists sit in one group (Figma "Content", `flex flex-col gap-4`); each list `flex flex-col gap-2`, lists after the first `border-t border-default pt-4`. With alert: `Alert variant="complex" color="info"` at the bottom.
- Double sidebar: icon rail (`py-5 gap-2`) + panel (`p-5 gap-5`) separated by `border-e border-default`; panel title `text-base font-semibold text-heading`, search `Input sm`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `sections={…}` | App navigation with many destinations grouped into sections. | Marketing sites (Navbar) or page-local filters. |
| Type = With alert | `footer={<Alert variant="complex" color="info" />}` | A persistent notice such as a trial or upgrade prompt at the panel bottom. | Urgent messages; the footer hides when collapsed, so use a page Alert or Toast. |
| Type = Double sidebar | `rail={{ sections, header }}` | Two-level apps: an icon rail for areas, a panel for pages within the area. | Destinations fit one level of sections (Default). |
| Contracted = False | `collapsed={false}` | Default desktop layout where labels help users find destinations. | Mobile screens; use a Drawer instead of a permanent column. |
| Contracted = True | `collapsed` | Dense workspaces needing width; 36px icon items with Tooltip labels. | Icons are ambiguous or users are new to the app (False). |

**Use** for app navigation with many destinations or nested sections. **Don't** on marketing sites (Navbar), as a permanent column on mobile (use Drawer), or for page-local filters.
A11y: a `<nav>` with an `aria-label`; the current item has `aria-current="page"`; disabled items set `aria-disabled`; collapsed icon-only items still need an accessible name.

## Breadcrumb
Figma: page `3284:24206` · set `1148:31317` (Default, Background, With dropdown, With group buttons, Only buttons, With badge) · item `1148:31348` (Initial/Hover/Active) · template `templates/components/Breadcrumb.tsx`
API: `<Breadcrumb items={[{label, href, icon}]} variant="default|background|buttons" leading>`; last item is the current page. `leading` = Figma "With group buttons" (a back/forward `ButtonGroup size="sm" color="white"` before the trail); `variant="buttons"` = Figma "Only buttons".
`<nav aria-label="Breadcrumb"><ol class="flex items-center gap-2.5">`; item `inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-body hover:text-fg-brand` (leading home icon `size-4`), separator chevron `size-4 text-body-subtle` `aria-hidden`; current page `text-body-subtle` + `aria-current="page"`. Background type: `rounded-base border border-default-medium bg-neutral-secondary-medium p-2.5 shadow-xs`. With dropdown / With badge: last crumb is a Secondary `xs` Button with chevron (badge: `Badge brand sm`). With group buttons: `ButtonGroup` (2 buttons). Only buttons: Ghost `xs` Buttons, `gap-1`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | Location trail above the page title in hierarchies three or more levels deep. | Top-level pages or linear flows (Stepper). |
| Type = Background | `variant="background"` | The trail must stand apart from a busy or image-heavy header. | Plain page headers where the trail needs no container (Default). |
| Type = With dropdown | `last label = <Dropdown>` | Users switch between siblings of the current level, such as projects. | The current level has no siblings worth switching to (Default). |
| Type = With group buttons | `leading={<ButtonGroup size="sm">}` | The trail sits in a toolbar and should read as one joined ButtonGroup. | The trail is part of a page header (Default). |
| Type = Only buttons | `variant="buttons"` | Dense toolbars where crumbs render as Ghost `xs` buttons. | Standard page headers (Default). |
| Type = With badge | `last label = <Badge>` | The current item needs a short status such as Draft or Beta. | The status is not about the current item; place the Badge by the page title. |

**Use** in hierarchies ≥ 3 levels deep. **Don't** as primary navigation, for linear flows (Stepper), or on top-level pages.
A11y: a `<nav>` with an `aria-label` around an ordered list; the last item has `aria-current="page"`; separators are `aria-hidden`.

## Tabs
Figma: page `3283:24214` · tabs `1149:80530` (7 types × Mobile) · tab `1149:80596` (Default, Pill, Border bottom, User select × Initial/Hover-Active) · template `templates/components/Tabs.tsx`
API: `<Tabs items={[{value,label,icon,disabled,content}]} value onValueChange variant>`.

| Figma Type | `variant` | List | Tab | Active tab |
|---|---|---|---|---|
| Default | `text` | `flex gap-6` | `text-sm font-medium text-body hover:text-fg-brand` | `text-fg-brand` |
| Border bottom | `underline` | `flex gap-6 border-b border-default` | `pb-4 text-sm font-medium text-body border-b border-transparent -mb-px` | `text-fg-brand border-brand` |
| Pills | `pills` | `flex gap-6` | `rounded-base px-4 py-2.5 text-sm font-medium text-body` | `bg-brand text-white` |
| Button / Button group | `button` / `segmented` | ButtonGroup | Tertiary item | Tertiary Hover style (`bg-neutral-secondary-medium text-heading`) |
| Vertical pills / list | `vertical-pills` / `vertical-list` | `flex flex-col gap-2` | as pills / list item | as pills |
| User select tab | — | | `rounded-base px-4 py-2.5`, name `text-xs font-medium text-heading`, meta `text-xs text-body` | `bg-neutral-tertiary` |
Icons `size-4`, `gap-1.5`. Mobile: horizontal scroll or a `Select`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="text"` | Lightweight view switch inside a card, panel or Modal. | The section-tab row under a header (Border bottom). |
| Type = Pills | `variant="pills"` | A prominent view switch in a toolbar or dashboard card. | The section-tab row under a header (Border bottom). |
| Type = Button | `variant="button"` | Views switch from separate Tertiary `sm` buttons in a toolbar. | Two to four short options that read as one control (Button group). |
| Type = Button group | `variant="segmented"` | Two to four short options, such as Day / Week / Month. | More than four options or long labels (Border bottom). |
| Type = Border bottom | `variant="underline"` | The section-tab row directly below the Navbar (Figma Nav tabs) or a page header. | Small cards and panels where a full-width rule is too heavy (Default). |
| Type = Vertical with list item | `variant="vertical-list"` | Settings pages with many sections listed in a side column. | App-wide navigation between pages (Sidebar). |
| Type = Vertical pills | `variant="vertical-pills"` | A side column of views that needs a strong filled active state. | There is room for a horizontal row (Pills). |

**Use** to switch peer views of the same context. **Don't** for sequential steps (Stepper), navigating to pages (links + `aria-current`), >7 tabs, or list filtering.
A11y: `tablist`/`tab`/`tabpanel`, roving focus, `aria-selected`.

## Pagination
Figma: page `3284:22482` · set `1149:81850` (Two buttons, Default, Text buttons, Buttons & helper text, With dropdown, With input, Simple with input, Arrows, Dropdown & buttons) · template `templates/components/Pagination.tsx`
API: `<Pagination page pageCount onPageChange variant="default|labeled|arrows|two-buttons|jump|select" helper pageSize jumpTo>`. `labeled` = Figma "Text buttons" (Previous / Next as text in the joined row); `pageSize={{ value, options, onChange }}` = "With dropdown" (`Select sm`, "10 per page"); `jumpTo` = "With input" ("Go to [n] Page", Enter jumps); `jump` = "Simple with input" ("Go to page [n]" + Brand `sm` Go); `select` = "Dropdown & buttons" (page `Select sm` + "of N pages" + joined arrows). Typed page numbers are clamped to `1…pageCount`.
Built entirely from Buttons: a joined row of **Tertiary `sm`** buttons (`-space-x-px`, outer ends `rounded-base`, inner `rounded-none`, group `shadow-xs`); page numbers are 36px squares; the **current page uses the selected style** (`bg-brand-softer border-brand-subtle text-fg-brand`, unchanged on hover) + `aria-current="page"`, so it never looks like a hovered page; prev/next icon buttons (`text-heading`/`text-body`). Two buttons: separate Tertiary `sm` buttons `gap-3`. With dropdown / Dropdown & buttons: Secondary `sm` "Rows per page" select. With input / Simple with input: `Input sm` + `text-sm font-medium leading-none text-body` ("of 20") + Brand `sm` "Go". Helper text: "Showing **1–10** of **100**" `text-sm text-body`, numbers `font-semibold text-heading`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Two buttons | `variant="two-buttons"` | The total is unknown; separate Previous and Next buttons. | Users need to jump to a specific page (Default). |
| Type = Default | `variant="default"` | The page count is known and users jump to nearby pages. | The total is unknown (Arrows or Two buttons). |
| Type = Text buttons | `variant="labeled"` | Previous and Next need text labels beside the page numbers. | Space is tight (Arrows). |
| Type = Buttons & helper text | `helper={{ from, to, total }}` | Tables where users need the visible range, such as Showing 1–10 of 100. | The total is unknown or costly to count (Arrows). |
| Type = With dropdown | `variant="labeled" pageSize={…}` | Users choose the page size with a Rows per page select. | The page size is fixed (Default). |
| Type = With input | `variant="labeled" jumpTo` | Many pages where users jump straight to a page number. | Few pages that fit as numbered buttons (Default). |
| Type = Simple with input | `variant="jump"` | Narrow toolbars needing jump-to-page without numbered buttons. | Few pages, where numbered buttons are faster (Default). |
| Type = Arrows | `variant="arrows"` | The total is unknown or space is tight; icon-only previous and next. | Users need page numbers (Default) or text labels (Two buttons). |
| Type = Dropdown & buttons | `variant="select"` | Data tables needing both a page-size select and previous and next buttons. | The page size is fixed (Two buttons or Default). |

**Use** for large ordered datasets. **Don't** for feeds (infinite scroll / Load more) or a single page. Use Arrows/Two buttons when the total is unknown.
A11y: a `<nav>` with an `aria-label`; the current page has `aria-current="page"`; previous and next icon buttons have `aria-label`s.

## BottomNavigation
Figma: page `208:15901` · bar `1146:27386` (Bordered, Default, Action button, Pagination, Segment controls) · item `1146:27379` (Initial/Hover) · desktop `1146:27418` (Call, Media Player) · template `templates/components/BottomNavigation.tsx`
API: `<BottomNavigation items={[{label,href,icon,current}]} variant="default|bordered|action" action pager segments fixed>`. `pager={{ page, pageCount, onPageChange }}` = Figma "Pagination" (icon-only items around a Secondary `xs` "‹ 1 of N ›" pill); `segments` = Figma "Segment controls" (e.g. `<Tabs variant="segmented">` above icon-only items, `pt-4 pb-2 gap-4`, items `h-10`). Icon-only items keep their label as `sr-only` text.
- Bar: `fixed inset-x-0 bottom-0 z-40 h-16 bg-neutral-primary-soft grid grid-cols-4|5` (Bordered: `border-t border-default`).
- Item: `flex flex-col items-center justify-center py-2 text-sm font-medium text-body` + icon `size-6`; hover/active `text-fg-brand`.
- Action button: floating bar `rounded-full border border-default shadow-xs` with a centered Brand icon button.
- Pagination: items + Secondary `xs` page buttons. Segment controls: segmented Toggle input (`Toggle inputs` Advanced) above items, `pt-4 pb-2`.
- Desktop (Call / Media Player): `bg-neutral-primary-soft px-8 py-3 gap-8`, `text-sm text-body`, round 36px controls (danger "end call" `bg-danger text-white`), progress `Progress labelPosition="side"`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Style = Default | `variant="default"` | Mobile bar whose background already contrasts with the page. | The page is the same color as the bar (Bordered). |
| Style = Bordered | `variant="bordered"` | The bar sits on content of the same color and needs a top border. | The bar already contrasts with the page (Default). |
| Style = Action button | `variant="action" action={…}` | One primary action, such as New post, sits in the center of the bar. | There is no single primary action, or more than one. |
| Style = Pagination | `pager={{ page, pageCount, onPageChange }}` | Mobile paged viewers, such as a reader, need page controls with the items. | Paging data tables (Pagination). |
| Style = Segment controls | `segments={<Tabs variant="segmented">}` | A segmented switch between peer views sits above the destinations. | Switching top-level destinations; use the bar items. |

**Use** on mobile for 3–5 top-level destinations. **Don't** on desktop, with >5 items, or for actions (except one center action).
A11y: a `<nav>` with an `aria-label`; the active item has `aria-current`; every item keeps a text label, never icon only.

## Stepper
Figma: page `110:14549` · navigation `1149:84064` (Default, Only icons, Vertical, Icons & text, With dots, Cards × Mobile/Desktop) · step `1149:84155` (7 types × Initial/Active/Completed/Error/Disabled) · examples `1149:83977` · template `templates/components/Stepper.tsx`
API: `<Stepper steps={[{title,description,icon,status}]} current variant>`.

| Step type | Initial | Active | Completed | Error | Disabled |
|---|---|---|---|---|---|
| Default (number + label): circle `size-5 rounded-full border text-xs font-semibold leading-3`, label `text-base font-medium leading-4`, `gap-2` | `border-default-strong text-body` | `border-brand text-fg-brand` | check icon `size-3.5 text-fg-brand`, label `text-fg-brand` | `border-danger text-fg-danger` + icon | `border-default text-fg-disabled` |
| Dot: dot `size-3 rounded-full border`, label `text-base font-medium`, `gap-3` | `bg-neutral-primary border-default-medium text-body` | `border-brand-light text-fg-brand` | `bg-brand text-fg-brand` | `bg-danger text-fg-danger` | `text-fg-disabled` |
| Icon shape (& text) | `IconShape lg circle gray`, text `text-body` | `IconShape brand`, `text-fg-brand` | `IconShape success`, `text-fg-brand` | `IconShape danger`, `text-fg-danger` | gray, `text-fg-disabled` |
| Number & text: circle `size-9 rounded-full text-base font-semibold`, title `text-base font-medium`, helper `text-sm` | `bg-neutral-tertiary text-body` | `bg-brand-softer text-fg-brand-strong`, labels `text-fg-brand` | icon `text-fg-brand` | `text-fg-danger` | `bg-neutral-tertiary text-fg-disabled` |
| Icon & text: icon `size-5`, `gap-2` | `text-body` | `text-fg-brand` | `text-fg-brand` | `text-fg-danger` | `text-fg-disabled` |
| Card alert: `rounded-base border p-4 gap-2 text-base font-medium` | `bg-neutral-secondary-medium border-default-medium text-body` | `bg-brand-softer border-brand-subtle text-fg-brand-strong` | same as active | `bg-danger-soft border-danger-subtle text-fg-danger-strong` | `bg-neutral-secondary-soft border-default text-fg-disabled` |

Connectors: `h-px flex-1 bg-…` drawn as borders in Figma — Default `border-t border-default`, With dots `border-t-2`, Only icons / Icons & text `border-t-4`; spacing between steps `gap-4`–`gap-5`. Vertical: `flex-col` with `border-s border-default`. Examples place the stepper in a `rounded-base border border-default bg-neutral-secondary-soft` card with a step title `text-lg font-medium leading-none text-body` and Secondary + Brand `base` actions (`gap-8`/`gap-12`).

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | Horizontal numbered steps with short labels, such as checkout or setup forms. | Labels are long or the screen is narrow (Vertical). |
| Type = Only icons | `variant="only-icons"` | Compact progress where step titles appear elsewhere on the screen. | Icons alone are ambiguous (Icons & text). |
| Type = Vertical | `variant="vertical"` | Steps with helper text, long labels or narrow side columns. | Short labels across a wide page header (Default). |
| Type = Icons & text | `variant="icons"` | Each step has a recognizable icon, such as Cart, Shipping, Payment. | Steps without distinct icons (Default). |
| Type = With dots | `variant="dots"` | A light progress indicator, such as onboarding screens. | Users need step numbers to see how far they are (Default). |
| Type = Cards | `variant="cards"` | Steps shown as prominent status blocks at the top of a wizard. | More than four steps or tight width (Default). |

**Use** for linear multi-step processes. **Don't** for non-linear navigation (Tabs) or >6 steps. Current step `aria-current="step"`.
A11y: an ordered list; the current step has `aria-current`; completed steps are also stated in screen-reader text, not only with a check icon.

