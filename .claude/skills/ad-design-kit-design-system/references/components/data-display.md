# Data display

All components here are **spec verified** (2026-10-26).

## Card
Figma: page `13559:76418` · set `1149:34153` (15 types × Mobile Version) · template `templates/components/Card.tsx`

Shell for every type: `rounded-base border border-default bg-neutral-primary-soft shadow-xs flex flex-col` with `p-6 gap-6` (most types) or `p-7` (Default, Grid card); below `sm` both are `p-5 gap-5` (Figma Mobile Version, 20px). Image cards clip media with `overflow-hidden`; media placeholders `bg-neutral-tertiary`.

Image placeholder (any component, until a real image loads): surface `bg-neutral-tertiary`, centred glyph `text-body-subtle`; the glyph is decorative (`aria-hidden`) and the real image needs `alt` text.

| Figma Type | Content recipe |
|---|---|
| Default | title (`CardTitle`: `text-2xl font-semibold leading-8 text-heading`) and text `text-base text-body` in a `gap-3` stack, Brand `base` CTA |
| With Image | `h-48 rounded-base` image inside the padding (not full-bleed), title + text (`gap-3`), Secondary `base` CTA |
| Split | horizontal (`max-w-160`), `w-48` image `rounded-sm`, same text styles, Secondary CTA; stacks image-on-top below `sm` (Mobile Version) |
| Centered with full image | `p-0` shell (Figma `shadow`), full-bleed image, content `p-6 gap-6` centered, `Badge brand sm`, Brand CTA |
| User profile | `Avatar 2xl`, name `text-xl font-semibold leading-8`, role `text-base text-body`, `Badge brand sm`, Brand + Secondary buttons, menu icon button `text-heading` |
| Login form | title `text-xl font-semibold leading-7`, `Input form`, remember `Checkbox`, link `text-sm font-medium text-fg-brand`, Brand full-width button |
| E-commerce | image, title `text-xl font-semibold`, `Rating` with badge, price `text-3xl font-extrabold leading-none text-heading`, Brand CTA |
| CTA card | `max-w-160`, centred title + text, dark `DownloadAppButton` ×2 (wrap on mobile) |
| With full width tabs | `p-0`; tab bar `bg-neutral-secondary-medium px-6 py-3.5` (`Tabs variant="text"`), body `p-6 gap-4`, title `text-2xl font-semibold leading-9`, link `text-base font-medium text-fg-brand` + arrow |
| With nav tabs | `gap-8`, `Tabs variant="button"` spread full width (a `Select` below `sm`), stats grid 3 columns (2 on mobile): value `text-2xl font-bold leading-6 text-heading`, label `text-base text-body` |
| Pricing card | plan `text-xl font-medium leading-7 text-body`, price `text-5xl font-bold leading-none text-heading`, feature list (List items; unavailable = disabled `text-fg-disabled`), Brand CTA |
| Testimonial card | Figma only has it as Mobile Version: the Grid card's four testimonials stacked, divided by `border-default` |
| Grid card | `p-7`, 2×2 testimonial cells divided by `border-default` (`gap-4`, centred): title `text-lg font-semibold leading-8`, quote `text-base text-body`, `AvatarGroupLabel` base with role |
| Card with list | title `text-xl font-semibold`, link `text-base font-medium text-fg-brand`, `List variant="card"` of "Image & number" items |
| Crypto | title `text-xl font-semibold`, text, rows `rounded-base bg-neutral-secondary-medium p-3 gap-2` with brand logos, `Badge white sm`, `text-lg font-semibold` values |

Mobile Version = the same content stacked at mobile width (responsive classes, not a prop).

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Card padding="roomy">` | A text-only block with a title, short text and one primary action. | The item needs a picture to be recognised; use With Image. |
| Type = With Image | `<Card media={img}>` | The image helps users recognise the item, such as blog posts or articles. | The image is purely decorative; use Default. |
| Type = Split | `<Card media className="flex-row">` | A wide column fits image and text side by side, such as a featured post. | Narrow columns or mobile; use With Image so the image stacks on top. |
| Type = Centered with full image | `<Card padding="none" media>` | A visual promo where the full-bleed image carries the message. | Text-heavy content or items users compare; use With Image. |
| Type = User profile | `<Card>` + `Avatar size="2xl"` | Summarising one person with contact or follow actions. | Listing many people; use a List with Avatar & text items. |
| Type = Login form | `<Card>` + `Input` + `Checkbox` | A short standalone sign-in form centred on an auth page. | Long forms or forms inside a Modal; place the form on the page. |
| Type = E-commerce | `<Card media>` + `Rating` | Product tiles in a shop grid with price, rating and a buy action. | Comparing product specs side by side; use Table. |
| Type = CTA card | `<Card>` + `DownloadAppButton` | Promoting an app download or another single conversion goal inside content. | Page-wide promotions; use Banner or Jumbotron. |
| Type = With full width tabs | `<Card padding="none">` + `Tabs variant="text"` | One card shows alternative views of the same data, such as stats by period. | Tabs that switch whole pages; use page-level Tabs. |
| Type = With nav tabs | `<Card>` + `Tabs variant="button"` | A compact panel switching between a few related contents. | More than about five tabs; use page-level Tabs or separate cards. |
| Type = Pricing card | `<Card>` + `List` | Presenting one plan with price, features and a sign-up action. | Comparing many features across plans; use Table. |
| Type = Testimonial card | `<Card padding="roomy">` + `AvatarGroupLabel` (stacked) | Customer quotes with a named author, shown in a grid. | Rotating quotes in limited space; use Carousel with cards. |
| Type = Grid card | `<Card padding="roomy">` + 2×2 testimonial grid | Four short related items, such as features or stats, as one divided block. | Each item needs its own link or action; use separate cards. |
| Type = Card with list | `<Card>` + `List variant="card"` | A titled short list, such as top customers, with a view-all link. | Data with many attributes to compare; use Table. |
| Type = Crypto | `<Card>` + asset rows | Choosing or showing a few wallets or assets with logos and values. | Long or sortable asset lists; use Table. |

**Use** to group information about one entity (products, posts, profiles, plans, KPIs). **Don't** wrap every section in a card, nest cards, or put cards inside a Modal. Whole-card links: one stretched `<a>`, no nested interactive elements.
A11y: a plain container, so give its title a real heading; if the whole card is clickable, use one stretched link, never nested links or buttons.

## Accordion
Figma: page `3282:18777` · set `1146:19028` (Default, Flush, Separate Cards, Multi-level, With sub-header × Desktop/Mobile) · template `templates/components/Accordion.tsx`
API: `<Accordion items={[{value,title,content,icon,subtitle,items}]} variant multiple defaultValue>` (`defaultValue` may name Multi-level child items).
- Default: `rounded-base border border-default shadow-xs overflow-hidden divide-y divide-default`.
- Trigger: `flex w-full items-center justify-between gap-6 px-6 py-5 text-start text-base font-medium text-body bg-neutral-primary-soft` (Mobile `px-4 py-3.5`) + chevron `size-5`; open: `bg-neutral-tertiary text-heading` (chevron rotated). Figma Icon=True: a 20px leading icon (`question-circle`) `gap-2` before the title.
- Panel: `bg-neutral-primary-soft px-6 py-5 space-y-3 text-base text-body` (Mobile `p-4`), divided from its header by `border-t`; links `text-fg-brand` underlined.
- Flush: no outer border/radius/shadow and no fills, `px-0`, headers and panels divided by `border-default`.
- Separate cards: `flex flex-col gap-4`, each item `rounded-base border border-default shadow-xs overflow-hidden`.
- Multi-level: the open parent lists its child rows directly under its header: chevron first (`gap-2`), `bg-neutral-secondary-medium sm:ps-12`, dividers `border-default-medium`; a child's panel is `bg-neutral-secondary-medium`.
- With sub-header: `IconShape size="base" color="white" shape="circle"` (36px) `gap-2.5`, title always `text-heading`, sub-text `text-sm text-body` (`gap-px`).

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Style = Default | `variant="default"` | A standalone FAQ or settings group on the page background. | It sits inside a Card or bordered panel; use Flush. |
| Style = Flush | `variant="flush"` | Inside cards, sidebars or panels where an outer border would double up. | Standalone on the page background; use Default. |
| Style = Separate Cards | `variant="cards"` | Each item is an independent topic that reads better as its own block. | Many items or tight vertical space; use Default or Flush. |
| Style = Multi-level | `variant="nested"` | Sections have sub-sections, at most two levels deep. | Deeper hierarchies or page navigation; use Sidebar. |
| Style = With sub-header | `variant="subheader"` | Each section needs an icon and a one-line summary before it opens. | Plain question-and-answer lists; use Default. |

**Use** for FAQs, long settings, progressive disclosure. **Don't** hide content users must compare or read, nest >2 levels, or use as page navigation. Triggers are `<button aria-expanded aria-controls>`.
A11y: each header is a `<button>` with `aria-expanded` and `aria-controls`; each panel is a `role="region"` labelled by its header.

## Avatar
Figma: page `3197:21106` · avatar `1146:5178` (4 types × 13 users × 6 sizes) · group `1146:5549` · group label `1146:5592` · dot `1146:5625` · remove `1146:5641` · template `templates/components/Avatar.tsx`

| Size | xs | sm | base | lg | xl | 2xl |
|---|---|---|---|---|---|---|
| Box | `size-4.5` | `size-6` | `size-8` | `size-11` | `size-14` | `size-16` |
| Initials | — | `text-xs` | `text-sm` | `text-lg` | `text-2xl` | `text-2xl` |
| Status dot | `size-1.5` | `size-2` | `size-2.5` | `size-3` | `size-4` | `size-4` |
| Remove button | `size-3` | `size-3.5` | `size-4` | `size-4` | `size-5` | `size-5` |
Image `rounded-full object-cover`; placeholder `bg-neutral-tertiary text-body font-semibold`; status dot (Figma "Avatar dot") `absolute rounded-full` on the top-right edge with no ring (`top-0…top-1`, `end-0…-end-0.5` per size) + online `bg-success`, offline `bg-danger`, away (Figma "Alternative") `bg-gray`; remove button (`onRemove`, Figma "With remove button"): `absolute -end-1.5 rounded-full bg-neutral-tertiary-medium` (`-top-0.5…top-0.5` per size), x icon `text-body`, named "Remove <name>" (`removeLabel`), hit area enlarged with `before:-inset-1.5`.
Group: overlap `-space-x-4` (lg) / `-space-x-3.5` (base) / `-space-x-2` (sm); ring `border-2 border-buffer` (sm: `border`); counter `bg-neutral-quaternary text-body font-medium` (`text-sm` lg, `text-xs` base, `text-xxs` sm).
Group label `<AvatarGroupLabel name src helper size="sm|base|lg|xl">` (Figma Type "Heading & helper text" with `helper`; without it Type "Text", one avatar size smaller): sm `text-xs font-medium leading-4 text-heading` / `text-xs text-body`, `gap-1.5`; base `text-base font-medium leading-none` / `text-sm leading-none text-body`, `gap-2`; lg `text-base` / `text-base`, `gap-2.5`; xl `text-xl` / `text-lg`, `gap-2.5`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Avatar src name>` | A photo or logo of the person or organization is available. | No image exists; use Placeholder. |
| Type = With status | `status="online"` | Presence matters, such as chat, team members or support agents. | Presence is unknown or not updated live; leave the dot off. |
| Type = With remove button | `onRemove={…}` | Selected people can be removed, such as invite or assignee pickers. | The avatar is read-only; use Default. |
| Type = Placeholder | `<Avatar name>` without `src` | No photo exists, so initials from the name stand in. | A photo is available; use Default. |
| Size = xs | `size="xs"` | Inline with small meta text or in dense table rows. | A status dot must be readable; use sm or larger. |
| Size = sm | `size="sm"` | Compact lists, comments and small avatar groups. | Profile headers; use xl or 2xl. |
| Size = base | `size="base"` | Default for chat bubbles, list items and navbar user menus. | Dense tables; use xs or sm. |
| Size = lg | `size="lg"` | Card headers and prominent list rows. | Inline with body text; use sm. |
| Size = xl | `size="xl"` | Profile summaries and stacked timeline rows. | Lists with many rows; use base. |
| Size = 2xl | `size="2xl"` | The User profile card or a profile page header, once per view. | Repeated in lists or avatar groups; use base or lg. |

**Use** for people and organizations. **Don't** for generic icons (IconShape) or brand logos in content. Provide `alt` or `aria-hidden` when the name is adjacent.
A11y: image avatars are `role="img"` with the person's name as `aria-label`; status dots have screen-reader text; an avatar next to the visible name can be decorative.

## IconShape
Figma: page `1149:56577` · set `1149:56578` (6 sizes × 7 colors × Circle/Square) · template `templates/components/IconShape.tsx`

| Size | xs | sm | base | lg | xl | 2xl |
|---|---|---|---|---|---|---|
| Box | `size-4` | `size-6` | `size-9` | `size-12` | `size-16` | `size-24` |
| Icon | `size-2.5` | `size-4` | `size-5` | `size-7` | `size-9` | `size-14` |
Square `rounded-base`, circle `rounded-full`. Colors: brand `bg-brand-softer text-fg-brand` · success (Green) `bg-success-soft text-fg-success-strong` · danger (Red) `bg-danger-soft text-fg-danger-strong` · warning (Yellow) `bg-warning-soft text-fg-warning` · gray `bg-neutral-tertiary text-body` · dark `bg-dark text-white` · white `bg-neutral-primary-medium border border-default-medium text-body`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Size = xs | `size="xs"` | Inline next to small text or inside badges. | The icon must carry detail; use sm or larger. |
| Size = sm | `size="sm"` | Compact list items and dense rows. | Feature highlights; use lg or xl. |
| Size = base | `size="base"` | Default for toasts, alerts and simple feature lists. | Section-level highlights; use xl. |
| Size = lg | `size="lg"` | Feature lists and card headers. | Dense rows; use sm. |
| Size = xl | `size="xl"` | Section-level feature highlights. | Repeated in lists; use base or lg. |
| Size = 2xl | `size="2xl"` | Empty states and similar focal points, once per view. | Any repeated or inline use. |
| Color = White | `color="white"` | Neutral icon on tinted or gray surfaces that needs a visible edge. | On white card surfaces where it blends in; use Gray. |
| Color = Dark | `color="dark"` | One high-emphasis neutral icon, such as a featured step. | Several in a row; use Brand or Gray. |
| Color = Brand | `color="brand"` | Default for feature lists and neutral highlights. | The icon signals success, warning or error; use the status colors. |
| Color = Red | `color="danger"` | Errors, failed or destructive states. | Decorative emphasis; use Brand. |
| Color = Gray | `color="gray"` | Low-emphasis icons, such as empty states or secondary features. | The icon must draw attention; use Brand or a status color. |
| Color = Green | `color="success"` | Success, completed or positive states. | Decorative variety only; use Brand. |
| Color = Yellow | `color="warning"` | Warnings or pending states that need attention. | Errors; use Red. |
| Type = Circle | `shape="circle"` | Toasts, steppers, status icons and next to round avatars. | Feature grids of square cards; use Square. |
| Type = Square | `shape="square"` | Default for feature lists and cards with rounded corners. | Steppers or next to avatars; use Circle. |

**Use** as a decorative container for icons (feature lists, toasts, steppers, empty states). **Don't** as a button or for people. `aria-hidden`.
A11y: decorative (`aria-hidden`), so its meaning must also be in nearby text.

## List
Figma: page `3284:24113` · list `1149:70444` (Divider, Card, Default, CTA) · item `1149:70209` (11 types × Initial/Hover-Active/Disabled) · template `templates/components/List.tsx`
API: `<List variant="default|divider|card|cta">` + `<ListItem icon media description trailing href disabled cta>`.
- Default list: `flex flex-col gap-4`; item `flex items-center gap-1.5 text-base text-body` with icon `size-5 text-body-subtle`; hover/active `text-heading` (icon too); disabled `text-fg-disabled` and struck through (`line-through`).
- Divider list: `divide-y divide-default` with `py-3` rows (Figma gap 12px); icon rows ("With number") take a trailing value `text-sm font-medium text-body`.
- Card list (`variant="card"`, inside a `Card`): the divider list with `py-4` rows; Card title `text-xl font-semibold`, link `text-base font-medium text-fg-brand`.
- Rich items (Image & number, Image & buttons, Image & checkbox, Avatar & text + badge, Transaction): 32px avatar/image `gap-2`, title `text-base font-medium leading-4 text-heading`, helper `text-sm text-body` (`gap-px`), trailing value `text-base font-medium text-body` / `Badge sm` / Secondary `xs` Button.
- Card item (CTA list, `gap-4`): `rounded-base border border-default bg-neutral-secondary-soft p-4`, 36px logo, text `ps-3.5` (22px from the logo), title `text-base font-semibold leading-4 text-heading`, helper `text-sm text-body` (`gap-0.5`), trailing `arrow-right` `size-6 text-body-subtle`; Hover/Active `bg-brand-softer border-brand-subtle`, texts and arrow `text-fg-brand-strong`; Disabled all `text-fg-disabled`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | Short icon lists with one attribute per item, such as feature checklists. | Rows with meta, values or actions; use Divider. |
| Type = Divider | `variant="divider"` | Rich rows with avatar or image, helper text and a trailing value or button. | Simple bullet-style feature lists; use Default. |
| Type = Card | `<Card>` + `variant="card"` | A titled list block on a dashboard, with a view-all link. | The list is the main page content; use Divider without a card. |
| Type = CTA | `variant="cta"` + `ListItem cta` | Each row opens a detail page or next step, such as settings entries. | Rows with several actions; use Divider with trailing buttons. |

**Use** for stacked items with 1–3 attributes. **Don't** for comparable multi-column data (Table) or media-rich blocks (Card grid). Use `<ul>/<li>`.
A11y: a semantic `<ul>`; interactive rows are focusable and disabled rows set `aria-disabled`; icons are `aria-hidden`.

## Table
Figma: page `3284:22719` · set `1149:87477` (Striped columns, Striped rows, With table caption) · template `templates/components/Table.tsx`
API: `<Table striped="rows|columns" caption={{ title, description, actions }} toolbar footer stickyHeader containerClassName>` + `TableHead/TableBody/TableRow/TableHeaderCell/TableCell`.
- Wrapper: `relative flex flex-col rounded-base border border-default bg-neutral-secondary-soft shadow-xs`; the toolbar stays put and an inner `overflow-auto` region holds the table. `stickyHeader` pins the header cells (`sticky top-0`) while rows scroll; bound the height with `containerClassName` (layout only: `max-h-96`, or `min-h-0 flex-1` inside a flex column).
- Toolbar row (Figma "Table header"): `p-5 border-b border-default`; search `Input sm` with a search icon, Secondary `sm` "Filters" (filter + angle-down) and "Actions" (angle-down), Brand `sm` "Add …" (plus).
- Caption block (With table caption): `p-5 bg-neutral-secondary-soft border-b border-default`; title `text-lg font-medium leading-none text-heading`, description `text-base text-body` (`gap-1`), optional Brand `sm` action on the right (`caption.actions`).
- Footer (Figma "Table Footer", `footer` slot): `p-5 border-t border-default text-sm text-body`, "Showing 1-10 of 1000" + `Pagination`.
- Columns in the Figma example: checkbox column `w-14`, sortable headers with a `chevron-sort` icon (`aria-sort`), dates with a `calendar-month` icon, row actions Tertiary `xs` "Actions" (angle-down) + Danger `xs` "Delete" (trash-bin).
- Header cells: `h-11 px-5 bg-neutral-secondary-medium border-b border-default text-sm font-medium leading-none text-body text-start`.
- Body cells: `h-14 px-5 border-b border-default text-sm font-medium leading-none text-heading` (primary column may mix `font-semibold` name + `text-body` meta).
- Striped rows: `even:bg-neutral-secondary-medium`; striped columns: alternate cells `bg-neutral-secondary-medium`.
- Striping matches Figma: even rows / even columns (2, 4, 6) tinted.
- Status: `Badge size="sm"` success/warning/danger. Row actions: Tertiary `xs` + Danger `xs` Buttons.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Striped columns | `striped="columns"` | Users compare values down columns, such as plans or features side by side. | Users read records row by row; use Striped rows. |
| Type = Striped rows | `striped="rows"` | Many wide rows where the eye must track across. | Short tables of a few rows; plain row borders are enough. |
| Type = With table caption | `caption={{ title, description, actions }}` | The table needs a visible title and short context. | A heading right above already names it; use `aria-label`. |

**Use** for data users compare, sort or act on across rows. **Don't** for layout, ≤2 attributes (List), or narrow screens without a responsive strategy. `<th scope>`; sortable headers are buttons with `aria-sort`.
A11y: a real `<table>` with `<th>` headers; give it a caption or `aria-label`; row-selection checkboxes need labels naming the row; sortable headers should set `aria-sort`.

## Timeline
Figma: page `1149:91247` · timeline `1149:91254` (Default, Icons & Card, User actions, Stacked cards, Horizontal, Horizontal advanced × Desktop/Mobile) · item `1149:91357` (6 types) · dot `1149:91248` (Ellipse, Icon, Avatar) · template `templates/components/Timeline.tsx`
API: `<Timeline items={[{date,title,description,icon,avatar,actions,entries}]} variant="default|icons|cards|stacked|horizontal|horizontal-advanced">`.
- Vertical: `<ol class="relative border-s border-default ps-4 flex flex-col gap-11">` (icon/card variants `ps-6`).
- Dots (absolutely on the line): Ellipse `size-3 rounded-full border border-buffer bg-neutral-tertiary`, level with the title; Icon `size-5 rounded-full border-2 border-buffer bg-brand-softer` with `size-2.5 text-fg-brand` icon and Avatar `size-5 rounded-full border-2 border-buffer`, level with the top of the card.
- Item (Default): date `Badge color="gray" size="sm"` with a `calendar-month` icon, title `text-lg font-semibold leading-7 text-heading`, text `text-base text-body`, `gap-2`; actions Secondary `sm` + Brand `sm`, item `gap-5`.
- Icons & Card: each item is a card (`rounded-base border border-default bg-neutral-primary-soft p-6 gap-5 shadow-xs`); title with a Brand `sm` date badge beside it (`gap-3`; above it on mobile).
- User actions (`cards`): same card shell; "who did what" sentence `text-base text-body` with underlined `font-medium text-heading` links, Brand `sm` badge with a `clock` icon on the right (above on mobile); quoted comment `rounded border border-default-medium bg-neutral-secondary-medium p-3 text-sm italic text-body`; actions Secondary `sm` "View comment" (eye) + Brand `sm` "Reply".
- Stacked cards (`stacked`, rows in `entries`): one card per date `rounded-base border border-default bg-neutral-secondary-soft p-5 gap-4`, date heading `text-lg font-semibold`; rows `Avatar xl` + text `text-base text-heading` (links underlined), quote `text-sm text-body-subtle`, `Badge white sm` (eye-slash Private / globe Public), rows divided by `border-b border-default pb-4`. No line or dots.
- Horizontal: one continuous `border-t border-default` across the items (`pt-5`, `pe-11` between items), dot on the line; gray date badge, title, text, Secondary `sm` "Read more" (arrow-right). Two items per row below `sm`.
- Horizontal advanced (`horizontal-advanced`): centred items (`gap-4`), gray date badge above the line, dot on the line, title `text-lg font-semibold` + description `text-base text-body`, link `text-sm font-medium text-fg-brand` with an arrow. Two items per row below `sm`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | A simple chronological history or changelog. | Steps the user must complete; use Stepper. |
| Type = Icons & Card | `variant="icons"` + `icon` | Events of different kinds where an icon helps scanning. | All events are the same kind; use Default. |
| Type = User actions | `variant="cards"` + `avatar` | An activity feed of who did what, with quoted comments. | Threaded discussions; use List with Avatars. |
| Type = Stacked cards | `variant="stacked"` + `entries` | Many events grouped under one date in a compact card. | A few events; use Default. |
| Type = Horizontal | `variant="horizontal"` | Three to five milestones across a wide layout, such as a roadmap. | Narrow screens or many events; use a vertical type. |
| Type = Horizontal advanced | `variant="horizontal-advanced"` | Wide-screen milestones that need a description and a link. | Short labels only; use Horizontal. |

**Use** for chronological events or activity history. **Don't** for steps the user must complete (Stepper) or unordered lists.
A11y: an ordered list in time order; dots and icons are `aria-hidden`, so dates and events must be in text.

## ChatBubble
Figma: page `380:18014` · chat bubble `1149:35720` (Text, File, Audio, Calendar, Images, URL × Left/Right) · bubble `1149:35687` (Left/Right × Clean) · content `1149:35600` (7 types) · template `templates/components/ChatBubble.tsx`
API: `<ChatBubble direction="received|sent" name time avatar status menu clean width="fixed|fluid">` + `ChatFile` (+ `ChatFileDownload`) / `ChatAudio` / `ChatImages` / `ChatLinkPreview`. Put text before a content part in a `<p>`; parts after another element get the Figma `mt-2.5` gap.
- Row: `flex items-start gap-2.5` with `Avatar base` (32px).
- Bubble: `flex flex-col gap-3 max-w-80 rounded-base p-4` (Figma `Width = Fluid` → `width="fluid"`: `w-full max-w-4/5`, the bubble fills the conversation up to 80%, for full-page chat) — received (Direction=Left) `bg-neutral-tertiary`, sent (Direction=Right, bubble Orientation=Left) `bg-brand-softer` — header `text-sm font-medium text-heading` + time `text-sm text-body`, body `text-sm text-body`, footer status `text-sm text-body` (subtle text fails 4.5:1 on the tinted bubbles); menu icon `size-5 text-body`. "Clean" variant: no fill, `p-0`. Mirror the row (`flex-row-reverse`) for the sender.
- Content types: File (no box: `size-5` icon + name `text-sm font-medium text-heading`, meta `text-xs text-body` separated by dots, `ChatFileDownload` 20px download icon on the right), Audio (play / pause button, 28 waveform bars `w-1 gap-1 rounded-full bg-gray`, played part `bg-brand`, duration `text-sm font-medium text-heading`), Calendar ("Google calendar:" `font-medium`, event card `rounded-base border border-default bg-neutral-primary-soft p-2`, hours column `border-e border-light`, slot `border-s border-warning bg-warning-soft text-fg-warning`, expand Ghost icon button), Images (2×2 `gap-2`, `rounded-base` tiles; more than 4 images → 3 photos + a "+N" tile on `bg-overlay-dark` + `text-xl font-medium text-white`), Link preview (link `text-sm font-medium text-fg-brand underline`, card `rounded-base bg-neutral-secondary-strong p-4 gap-2`, title `text-sm font-medium text-heading`, domain `text-xs text-body`).
- Every Figma bubble has the menu: a Ghost `xs` icon button with `dots-vertical`, beside the bubble.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Text | text `children` | Plain written messages. | Sharing files, images or links; use the matching content type. |
| Type = File | `<ChatFile>` | Sharing a document with name, size and a download action. | Photos; use Images. |
| Type = Audio | `<ChatAudio>` | Voice messages. | Long recordings or video; link to a media player. |
| Type = Calendar | composition | A meeting invite or scheduled event shared in the conversation. | A date mentioned in passing; use Text. |
| Type = Images | `<ChatImages>` | One or more photos shared in the conversation. | Documents or downloads; use File. |
| Type = URL | `<ChatLinkPreview>` | A shared link that benefits from a title and preview. | Links inside a sentence; use Text with an inline link. |
| Direction = Left | `direction="received"` | Messages from other participants or the assistant. | The current user's own messages; use Right. |
| Direction = Right | `direction="sent"` | Messages sent by the current user. | Messages from others; use Left. |
| Width = Fixed | `width="fixed"` | Chat in a narrow panel, widget or drawer, with 320px bubbles. | Full-page chat with long replies; use Fluid. |
| Width = Fluid | `width="fluid"` | Full-page chat where long messages fill up to 80% of the width. | Narrow panels or widgets; use Fixed. |

**Use** for conversational UIs. **Don't** for threaded comments/forums (List + Avatars) or notifications.
A11y: sender and time are visible text; action buttons have `aria-label`s; decorative icons are `aria-hidden`.

## Carousel
Figma: page `3284:23924` · carousel `1149:41738` (Default, Default with controls & indicators, With cards, Cards & bottom controls) · control `1149:41774` · indicator `1149:41777` · template `templates/components/Carousel.tsx`
API: `<Carousel label variant="slides|cards" controls indicators perView>{slides}</Carousel>`.
Viewport `relative overflow-hidden rounded-base` (placeholder `bg-gray`); controls `size-11 rounded-full bg-overlay-light text-white` with `size-7` icons, `px-8` from the edges; indicators `size-3.5 rounded-full bg-overlay-light gap-4 bottom-8`, active `bg-white`.
Card carousels: dark round controls `rounded-full bg-dark-strong text-white` (`size-7` angle icons), `bg-gray` when there is nothing more to scroll (disabled). With cards (`indicators={false}`): controls at the sides (`gap-8`), 3 cards per view, cards `gap-6`. Cards & bottom controls: 4 cards per view, cards `gap-4`, under the row (`gap-8`) the 40px controls around dots `size-3.5 bg-quaternary-medium`, active `bg-dark-strong`, `gap-3`. Cards per view: 1 below `sm`, 2 from `sm`, `perView` from `lg`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="slides" indicators={false}` | A few images users step through with previous and next, without position dots. | Users need to know how many slides there are; use Default with controls & indicators. |
| Type = Default with controls & indicators | `variant="slides"` | A gallery of equivalent images users browse one at a time. | Users need to see several items at once; use With cards. |
| Type = With cards | `variant="cards" indicators={false}` | A row of product cards with previous and next at the sides. | Users need to see their position in a long row; use Cards & bottom controls. |
| Type = Cards & bottom controls | `variant="cards"` | A row of equivalent cards, such as articles or testimonials, with controls and position dots below. | Few cards that fit the width; use a grid of Cards. |

**Use** sparingly for galleries of equivalent visual items or testimonials. **Don't** hide important content in later slides, auto-advance without pause, or use as the key hero message.
A11y: a group with `aria-roledescription="carousel"`; previous, next and indicator buttons have `aria-label`s and the active indicator has `aria-current`; slide changes are announced through `aria-live`; never autoplay without a pause control.

## Kbd
Figma: page `13693:81938` · set `1149:92754` (49 keys) · template `templates/components/Kbd.tsx`
API: `<Kbd>⌘</Kbd>`.
`<kbd class="inline-flex items-center gap-2.5 rounded-base border border-default-medium bg-neutral-tertiary px-2 py-1.5 text-xs font-semibold leading-4 text-heading">` (arrow keys: `caret-*` icon `size-4` + `aria-label`). The Figma set has 49 keys: Shift, Ctrl, Tab, Caps Lock, Esc, Spacebar, Enter, the letters, F1–F12 and the four arrows.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| — | — | This component has no design-choice variants; see the usage notes. | — |

**Use** to show keyboard shortcuts in tooltips, menus, docs. **Don't** for generic code (`<code>`) or as a button.
A11y: uses the semantic `<kbd>` element; spell out key names that could be ambiguous.

