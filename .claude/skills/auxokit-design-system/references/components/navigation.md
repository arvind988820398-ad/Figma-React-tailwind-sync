# Navigation

All components here are **spec verified** (2026-10-26). Navigation items are links (`<a>` / router `Link`), not buttons; the current page gets `aria-current="page"`. Default link `text-body`, hover/active `text-fg-brand`, disabled `text-fg-disabled`.

## Navbar
Figma: page `3279:21067` · navbar `1149:74216` (Default, With icons, With search input, With links, Centered logo × Mobile/Tablet/Desktop) · content `1149:74308` (9 types) · nav link `1149:74002` (13 types × Initial/Hover/Active/Disabled) · mega menus `1149:74737` (full width), `1149:75228` (fixed width: Icon shape, Categories, Default, Icons & CTA) · mobile menu `1149:75488` (Default, Bordered links) · template `templates/components/Navbar.tsx`
API: `<Navbar logo links actions search sticky size="base|compact">`; `NavLink` for custom layouts. `compact` (`py-1`, 44px with `sm` controls) is a code-ahead size for dense app shells — see figma-audit.md.

- Bar: `sticky top-0 z-40 w-full border-b border-default bg-neutral-primary-soft py-6` → content `mx-auto flex max-w-screen-xl items-center justify-between gap-8 px-4` (height of the content row 30–40px).
- Logo (`Logo sm`) · links `flex gap-8` (Only links `gap-6`) · actions Secondary `base` + Brand `base` (icons type: Ghost `sm` icon buttons, 36px avatar).
- Nav link Default: `text-sm font-medium leading-5 text-body hover:text-fg-brand`; active `text-fg-brand`; disabled `text-fg-disabled`; with chevron/right icon `gap-1.5`, icon `size-4.5`. Other link types: Two icons/Flag & icon (`gap-1.5`), Icon top (icon `size-5` above text), Double text (secondary `text-base font-medium text-body-subtle`), Bordered (`rounded-base border border-default px-2 py-1.5 text-heading`).
- Mega-menu links (Heading & helper, With icon shape, Big Icons, Top icon & CTA): `rounded-base p-2` (CTA `p-3`), title `text-base font-semibold leading-4.5` (18px), helper `text-sm text-body`, icon `size-6`/`size-9` `text-body`; hover `bg-neutral-secondary-medium` (via Hover variant).
- Mega menu full width: `w-full border-y border-light bg-neutral-primary-soft py-12 shadow-lg`, grid `gap-8`, column titles `text-base font-semibold text-heading`, "view all" `text-sm font-medium text-fg-brand`.
- Mega menu fixed width: `rounded-base border border-light bg-neutral-primary-soft p-6 gap-6 shadow-lg`; Categories type has a side column `bg-neutral-secondary-medium p-6` divided by `border-light-medium`; headings `text-sm font-semibold text-heading`.
- Mobile menu: `bg-neutral-primary-soft p-4 flex flex-col gap-4` with `Input sm` search, link list (Bordered links: rows `pb-3 border-b border-light text-sm font-medium text-body`), user block `rounded-base border border-light-medium bg-neutral-secondary-medium px-3 py-2.5 gap-2.5`, Secondary + Brand `sm`/`xs` buttons.
- Breakpoint variants = responsive classes (`md:flex` links, `md:hidden` menu button).

**Use** as the global site/app header. **Don't** exceed ~7 top-level links (use a mega menu or Sidebar), duplicate Sidebar navigation, or switch in-page views (Tabs).

## Sidebar
Figma: page `3279:34616` · sidebar `1149:82628` (Default, With alert, Double sidebar × Contracted) · item `1149:82699` (With icon, With badge × Initial/Hover-Active/Disabled/Collapsed) · header `1149:82737` (Heading, Logo, User select) · template `templates/components/Sidebar.tsx`
API: `<Sidebar header sections={[[{label,href,icon,current,disabled,badge}]]} footer collapsed>`.

- Panel: `h-screen w-72 bg-neutral-primary-soft p-5 flex flex-col gap-5` (add `border-e border-default` when the page is the same color); collapsed `w-16 px-0 py-5 gap-4 items-center` (icons only + Tooltip).
- Header: Logo/Heading `pb-4 border-b border-default` (heading `text-lg font-medium leading-6 text-heading`); User select `p-2` with `AvatarGroupLabel base` + chevron.
- Item: `flex items-center gap-1.5 rounded-base px-2 py-1.5 text-base font-medium text-body` + icon `size-5 text-body`; hover/active `bg-neutral-secondary-medium text-fg-brand` (icon too); disabled `text-fg-disabled`; trailing count `Badge color="danger" size="sm"`; expandable group = Collapsed item with nested items `ps-8`.
- Sections: `border-t border-default pt-4 flex flex-col gap-2`. With alert: `Alert variant="complex" color="info"` at the bottom.
- Double sidebar: icon rail (`py-5 gap-2`) + panel (`p-5 gap-5`) separated by `border-e border-default`; panel title `text-base font-semibold text-heading`, search `Input sm`.

**Use** for app navigation with many destinations or nested sections. **Don't** on marketing sites (Navbar), as a permanent column on mobile (use Drawer), or for page-local filters.

## Breadcrumb
Figma: page `3284:24206` · set `1148:31317` (Default, Background, With dropdown, With group buttons, Only buttons, With badge) · item `1148:31348` (Initial/Hover/Active) · template `templates/components/Breadcrumb.tsx`
API: `<Breadcrumb items={[{label, href, icon}]} variant="default|background">`; last item is the current page.
`<nav aria-label="Breadcrumb"><ol class="flex items-center gap-2.5">`; item `inline-flex items-center gap-1.5 text-sm font-medium leading-5 text-body hover:text-fg-brand` (leading home icon `size-4`), separator chevron `size-4 text-body-subtle` `aria-hidden`; current page `text-body-subtle` + `aria-current="page"`. Background type: `rounded-base border border-default-medium bg-neutral-secondary-medium p-2.5 shadow-xs`. With dropdown / With badge: last crumb is a Secondary `xs` Button with chevron (badge: `Badge brand sm`). With group buttons: `ButtonGroup` (2 buttons). Only buttons: Ghost `xs` Buttons, `gap-1`.
**Use** in hierarchies ≥ 3 levels deep. **Don't** as primary navigation, for linear flows (Stepper), or on top-level pages.

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
**Use** to switch peer views of the same context. **Don't** for sequential steps (Stepper), navigating to pages (links + `aria-current`), >7 tabs, or list filtering.
A11y: `tablist`/`tab`/`tabpanel`, roving focus, `aria-selected`.

## Pagination
Figma: page `3284:22482` · set `1149:81850` (Two buttons, Default, Text buttons, Buttons & helper text, With dropdown, With input, Simple with input, Arrows, Dropdown & buttons) · template `templates/components/Pagination.tsx`
API: `<Pagination page pageCount onPageChange variant="default|arrows|two-buttons" helper>`.
Built entirely from Buttons: a joined row of **Tertiary `sm`** buttons (`-space-x-px`, outer ends `rounded-base`, inner `rounded-none`, group `shadow-xs`); page numbers are 36px squares; the **current page uses the Tertiary Hover style** (`bg-neutral-secondary-medium text-heading`) + `aria-current="page"` (no Active variant in Figma, figma-audit.md #42); prev/next icon buttons (`text-heading`/`text-body`). Two buttons: separate Tertiary `sm` buttons `gap-3`. With dropdown / Dropdown & buttons: Secondary `sm` "Rows per page" select. With input / Simple with input: `Input sm` + `text-sm font-medium leading-none text-body` ("of 20") + Brand `sm` "Go". Helper text: "Showing **1–10** of **100**" `text-sm text-body`, numbers `font-semibold text-heading`.
**Use** for large ordered datasets. **Don't** for feeds (infinite scroll / Load more) or a single page. Use Arrows/Two buttons when the total is unknown.

## BottomNavigation
Figma: page `208:15901` · bar `1146:27386` (Bordered, Default, Action button, Pagination, Segment controls) · item `1146:27379` (Initial/Hover) · desktop `1146:27418` (Call, Media Player) · template `templates/components/BottomNavigation.tsx`
API: `<BottomNavigation items={[{label,href,icon,current}]} variant="default|bordered|action" action fixed>`.
- Bar: `fixed inset-x-0 bottom-0 z-40 h-16 bg-neutral-primary-soft grid grid-cols-4|5` (Bordered: `border-t border-default`).
- Item: `flex flex-col items-center justify-center py-2 text-sm font-medium text-body` + icon `size-6`; hover/active `text-fg-brand`.
- Action button: floating bar `rounded-full border border-default shadow-xs` with a centered Brand icon button.
- Pagination: items + Secondary `xs` page buttons. Segment controls: segmented Toggle input (`Toggle inputs` Advanced) above items, `pt-4 pb-2`.
- Desktop (Call / Media Player): `bg-neutral-primary-soft px-8 py-3 gap-8`, `text-sm text-body`, round 36px controls (danger "end call" `bg-danger text-white`), progress `Progress labelPosition="side"`.

**Use** on mobile for 3–5 top-level destinations. **Don't** on desktop, with >5 items, or for actions (except one center action).

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
**Use** for linear multi-step processes. **Don't** for non-linear navigation (Tabs) or >6 steps. Current step `aria-current="step"`.
