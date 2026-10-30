# Data display

All components here are **spec verified** (2026-10-26).

## Card
Figma: page `13559:76418` · set `1149:34153` (15 types × Mobile Version) · template `templates/components/Card.tsx`

Shell for every type: `rounded-base border border-default bg-neutral-primary-soft shadow-xs flex flex-col gap-6` with `p-6` (most types) or `p-7` (Default, Grid card). Image cards clip media with `overflow-hidden`; media placeholders `bg-neutral-tertiary`.

Image placeholder (any component, until a real image loads): surface `bg-neutral-tertiary`, centred glyph `text-body-subtle`; the glyph is decorative (`aria-hidden`) and the real image needs `alt` text.

| Figma Type | Content recipe |
|---|---|
| Default | title `text-2xl font-semibold leading-8 text-heading`, text `text-base text-body`, Brand `base` CTA |
| With Image | image on top, title `text-2xl font-semibold leading-8`, text, Secondary `base` CTA |
| Split | horizontal (`w-160`), image `rounded`, same text styles, Secondary CTA |
| Centered with full image | `p-0` shell (Figma `shadow`), full-bleed image, content `p-6 gap-6` centered, `Badge brand sm`, Brand CTA |
| User profile | `Avatar 2xl`, name `text-xl font-semibold leading-8`, role `text-base text-body`, `Badge brand sm`, Brand + Secondary buttons, menu icon button `text-heading` |
| Login form | title `text-xl font-semibold leading-7`, `Input form`, remember `Checkbox`, link `text-sm font-medium text-fg-brand`, Brand full-width button |
| E-commerce | image, title `text-xl font-semibold`, `Rating` with badge, price `text-3xl font-extrabold leading-none text-heading`, Brand CTA |
| CTA card | `w-160`, title + text, `DownloadAppButton` ×2 |
| With full width tabs | `p-0`; tab bar `bg-neutral-secondary-medium px-6 py-3.5` (`Tabs variant="text"`), body `p-6 gap-4`, stat `text-2xl font-semibold leading-9`, link `text-base font-medium text-fg-brand` |
| With nav tabs | `gap-8`, `Tabs variant="button"`, title `text-2xl font-bold leading-none` |
| Pricing card | plan `text-xl font-medium leading-7 text-body`, price `text-5xl font-bold leading-none text-heading`, feature list (List items; unavailable = disabled `text-fg-disabled`), Brand CTA |
| Testimonial card | quote `text-base text-body`, `AvatarGroupLabel`, divided grid cells |
| Grid card | `p-7 gap-0`, 2×2 cells `p-6 gap-4` divided by `border-default`, title `text-lg font-semibold leading-8`, text `text-base text-body` |
| Card with list | title `text-xl font-semibold`, link `text-base font-medium text-fg-brand`, `List` of "Image & number" items |
| Crypto | title `text-xl font-semibold`, text, rows `rounded-base bg-neutral-secondary-medium p-3 gap-2` with brand logos, `Badge white sm`, `text-lg font-semibold` values |

Mobile Version = the same content stacked at mobile width (responsive classes, not a prop).
**Use** to group information about one entity (products, posts, profiles, plans, KPIs). **Don't** wrap every section in a card, nest cards, or put cards inside a Modal. Whole-card links: one stretched `<a>`, no nested interactive elements.
A11y: a plain container, so give its title a real heading; if the whole card is clickable, use one stretched link, never nested links or buttons.

## Accordion
Figma: page `3282:18777` · set `1146:19028` (Default, Flush, Separate Cards, Multi-level, With sub-header × Desktop/Mobile) · template `templates/components/Accordion.tsx`
API: `<Accordion items={[{value,title,content,icon,subtitle,items}]} variant multiple defaultValue>`.
- Default: `rounded-base border border-default shadow-xs overflow-hidden divide-y divide-default`.
- Trigger: `flex w-full items-center justify-between gap-3 px-6 py-5 text-start text-base font-medium text-body` + chevron `size-5`; open: `bg-neutral-tertiary text-heading` (chevron `text-heading`, rotated).
- Panel: `bg-neutral-primary-soft px-6 py-5 text-base text-body` (links `text-fg-brand`).
- Flush: no outer border/radius/shadow, `px-0`, items divided by `border-b border-default`.
- Separate cards: `flex flex-col gap-4`, each item `rounded-base border border-default shadow-xs overflow-hidden`.
- Multi-level: nested items indent `ps-12`, nested header `bg-neutral-secondary-medium`, nested divider `border-default-medium`.
- With sub-header: 36px leading icon, sub-text `text-sm text-body`.

**Use** for FAQs, long settings, progressive disclosure. **Don't** hide content users must compare or read, nest >2 levels, or use as page navigation. Triggers are `<button aria-expanded aria-controls>`.
A11y: each header is a `<button>` with `aria-expanded` and `aria-controls`; each panel is a `role="region"` labelled by its header.

## Avatar
Figma: page `3197:21106` · avatar `1146:5178` (4 types × 13 users × 6 sizes) · group `1146:5549` · group label `1146:5592` · dot `1146:5625` · remove `1146:5641` · template `templates/components/Avatar.tsx`

| Size | xs | sm | base | lg | xl | 2xl |
|---|---|---|---|---|---|---|
| Box | `size-4.5` | `size-6` | `size-8` | `size-11` | `size-14` | `size-16` |
| Initials | — | `text-xs` | `text-sm` | `text-lg` | `text-2xl` | `text-2xl` |
| Status dot | `size-1.5` | `size-2.5` | `size-2` | `size-3` | `size-4` | `size-4` |
| Remove button | `size-3` | `size-3.5` | `size-4` | `size-5` | — | — |
Image `rounded-full object-cover`; placeholder `bg-neutral-tertiary text-body font-semibold`; status dot `absolute bottom-0 end-0 rounded-full border-2 border-buffer` + online `bg-success`, offline `bg-danger`, away `bg-gray`; remove button: round, x icon `text-body`.
Group: overlap `-space-x-4` (lg) / `-space-x-3.5` (base) / `-space-x-2` (sm); ring `border-2 border-buffer` (sm: `border`); counter `bg-neutral-quaternary text-body font-medium` (`text-sm` lg, `text-xs` base, `text-xxs` sm).
Group label (name + helper): sm `text-xs font-medium leading-4 text-heading` / `text-xs text-body`, `gap-1.5`; base `text-base font-medium leading-none` / `text-sm leading-none text-body`, `gap-2`; lg `text-base` / `text-base`, `gap-2.5`; xl `text-xl` / `text-lg`, `gap-2.5`.
**Use** for people and organizations. **Don't** for generic icons (IconShape) or brand logos in content. Provide `alt` or `aria-hidden` when the name is adjacent.
A11y: image avatars are `role="img"` with the person's name as `aria-label`; status dots have screen-reader text; an avatar next to the visible name can be decorative.

## IconShape
Figma: page `1149:56577` · set `1149:56578` (6 sizes × 7 colors × Circle/Square) · template `templates/components/IconShape.tsx`

| Size | xs | sm | base | lg | xl | 2xl |
|---|---|---|---|---|---|---|
| Box | `size-4` | `size-6` | `size-9` | `size-12` | `size-16` | `size-24` |
| Icon | `size-2.5` | `size-4` | `size-5` | `size-7` | `size-9` | `size-14` |
Square `rounded-base`, circle `rounded-full`. Colors: brand `bg-brand-softer text-fg-brand` · success (Green) `bg-success-soft text-fg-success-strong` · danger (Red) `bg-danger-soft text-fg-danger-strong` · warning (Yellow) `bg-warning-soft text-fg-warning` · gray `bg-neutral-tertiary text-body` · dark `bg-dark text-white` · white `bg-neutral-primary-medium border border-default-medium text-body`.
**Use** as a decorative container for icons (feature lists, toasts, steppers, empty states). **Don't** as a button or for people. `aria-hidden`.
A11y: decorative (`aria-hidden`), so its meaning must also be in nearby text.

## List
Figma: page `3284:24113` · list `1149:70444` (Divider, Card, Default, CTA) · item `1149:70209` (11 types × Initial/Hover-Active/Disabled) · template `templates/components/List.tsx`
API: `<List variant="default|divider|cta">` + `<ListItem icon media description trailing href disabled cta>`.
- Default list: `flex flex-col gap-4`; item `flex items-center gap-1.5 text-base text-body` with icon `size-5 text-body-subtle`; hover/active `text-heading` (icon too); disabled `text-fg-disabled`.
- Divider list: `divide-y divide-default` with `py-3` rows (Figma gap 12px).
- Card list: Card shell `p-6 gap-6` (`shadow`), title `text-xl font-semibold`, link `text-base font-medium text-fg-brand`.
- Rich items (Image & number, Image & buttons, Image & checkbox, Avatar & text + badge, Transaction): 32px avatar/image, title `text-base font-medium leading-4 text-heading`, helper `text-sm text-body`, trailing value `text-base font-medium text-heading` / `Badge sm` / Secondary `xs` Button, `gap-1.5`–`gap-2`.
- Card item (CTA list): `rounded-base border border-default bg-neutral-secondary-soft p-4 gap-6`, title `text-base font-semibold leading-4 text-heading`, helper `text-sm text-body`, trailing chevron `text-body-subtle`.

**Use** for stacked items with 1–3 attributes. **Don't** for comparable multi-column data (Table) or media-rich blocks (Card grid). Use `<ul>/<li>`.
A11y: a semantic `<ul>`; interactive rows are focusable and disabled rows set `aria-disabled`; icons are `aria-hidden`.

## Table
Figma: page `3284:22719` · set `1149:87477` (Striped columns, Striped rows, With table caption) · template `templates/components/Table.tsx`
API: `<Table striped="rows|columns" caption toolbar stickyHeader containerClassName>` + `TableHead/TableBody/TableRow/TableHeaderCell/TableCell`.
- Wrapper: `relative flex flex-col rounded-base border border-default bg-neutral-secondary-soft shadow-xs`; the toolbar stays put and an inner `overflow-auto` region holds the table. `stickyHeader` pins the header cells (`sticky top-0`) while rows scroll; bound the height with `containerClassName` (layout only: `max-h-96`, or `min-h-0 flex-1` inside a flex column).
- Toolbar row: search `Input` (36px, `text-sm`), Secondary `sm` "Filters", Brand `sm` "Add …".
- Caption block (With table caption): `p-5 bg-neutral-secondary-soft border-b border-default`; title `text-lg font-medium leading-none text-heading`, description `text-base text-body`.
- Header cells: `h-11 px-5 bg-neutral-secondary-medium border-b border-default text-sm font-medium leading-none text-body text-start`.
- Body cells: `h-14 px-5 border-b border-default text-sm font-medium leading-none text-heading` (primary column may mix `font-semibold` name + `text-body` meta).
- Striped rows: `even:bg-neutral-secondary-medium`; striped columns: alternate cells `bg-neutral-secondary-medium`.
- Status: `Badge size="sm"` success/warning/danger. Row actions: Tertiary `xs` + Danger `xs` Buttons.

**Use** for data users compare, sort or act on across rows. **Don't** for layout, ≤2 attributes (List), or narrow screens without a responsive strategy. `<th scope>`; sortable headers are buttons with `aria-sort`.
A11y: a real `<table>` with `<th>` headers; give it a caption or `aria-label`; row-selection checkboxes need labels naming the row; sortable headers should set `aria-sort`.

## Timeline
Figma: page `1149:91247` · timeline `1149:91254` (Default, Icons & Card, User actions, Stacked cards, Horizontal, Horizontal advanced × Desktop/Mobile) · item `1149:91357` (6 types) · dot `1149:91248` (Ellipse, Icon, Avatar) · template `templates/components/Timeline.tsx`
API: `<Timeline items={[{date,title,description,icon,avatar,actions}]} variant="default|icons|cards|horizontal">`.
- Vertical: `<ol class="relative border-s border-default ps-4 flex flex-col gap-11">` (icon/card variants `ps-6`).
- Dots (absolutely on the line): Ellipse `size-3 rounded-full border border-buffer bg-neutral-tertiary`; Icon `size-5 rounded-full border-2 border-buffer bg-brand-softer` with `size-2.5 text-fg-brand` icon; Avatar `size-5 rounded-full border-2 border-buffer`.
- Item: date `Badge color="gray" size="sm"`, title `text-lg font-semibold leading-7 text-heading`, text `text-base text-body`, `gap-2`; actions Secondary `sm` + Brand `sm`, item `gap-5`.
- As card / User actions: Card shell `p-6 gap-5`; quoted comment `rounded border border-default-medium bg-neutral-secondary-medium p-3 text-sm italic text-body`.
- Stacked cards: `rounded-base border border-default bg-neutral-secondary-soft p-5 gap-4`, rows with `Avatar xl`, meta `text-sm text-body-subtle`, `Badge white sm`.
- Horizontal: `border-t border-default pt-5 flex gap-11`; small items: title `text-lg font-semibold`, link `text-sm font-medium text-fg-brand`.

**Use** for chronological events or activity history. **Don't** for steps the user must complete (Stepper) or unordered lists.
A11y: an ordered list in time order; dots and icons are `aria-hidden`, so dates and events must be in text.

## ChatBubble
Figma: page `380:18014` · chat bubble `1149:35720` (Text, File, Audio, Calendar, Images, URL × Left/Right) · bubble `1149:35687` (Left/Right × Clean) · content `1149:35600` (7 types) · template `templates/components/ChatBubble.tsx`
API: `<ChatBubble direction="received|sent" name time avatar status menu clean>` + `ChatFile` / `ChatAudio` / `ChatImages` / `ChatLinkPreview`.
- Row: `flex items-start gap-2.5` with `Avatar base` (32px).
- Bubble: `flex flex-col gap-1.5 max-w-80 rounded-base p-4` — received (Direction=Left) `bg-neutral-tertiary`, sent (Direction=Right, bubble Orientation=Left) `bg-brand-softer` — header `text-sm font-semibold text-heading` + time `text-sm text-body`, body `text-sm text-body`, footer status `text-sm text-body` (subtle text fails 4.5:1 on the tinted bubbles); menu icon `size-5 text-body`. "Clean" variant: no fill, `p-0`. Mirror the row (`flex-row-reverse`) for the sender.
- Content types: File (`text-sm font-medium text-heading` + `text-xs text-body`, file icon `text-heading`), Audio (play button, waveform bars `rounded-full bg-gray`, active `bg-brand`), Calendar (event card `rounded-base border border-default bg-neutral-primary-soft p-2`, highlighted `bg-warning-soft text-fg-warning`), Images (`rounded-base`, overflow tile `bg-overlay-dark` + `text-xl font-medium text-white`), Link preview (`rounded-base bg-neutral-secondary-strong p-4`, title `text-heading`, url `text-xs text-body`, link `text-fg-brand`).

**Use** for conversational UIs. **Don't** for threaded comments/forums (List + Avatars) or notifications.
A11y: sender and time are visible text; action buttons have `aria-label`s; decorative icons are `aria-hidden`.

## Carousel
Figma: page `3284:23924` · carousel `1149:41738` (Default, Default with controls & indicators, With cards, Cards & bottom controls) · control `1149:41774` · indicator `1149:41777` · template `templates/components/Carousel.tsx`
API: `<Carousel label variant="slides|cards" controls indicators>{slides}</Carousel>`.
Viewport `relative overflow-hidden rounded-base` (placeholder `bg-gray`); controls `size-11 rounded-full bg-overlay-light text-white` with `size-7` icons, `px-8` from the edges; indicators `size-3.5 rounded-full bg-overlay-light`, active `bg-white`. Card carousels: Cards `gap-8`, bottom controls as 40px white-icon buttons.
**Use** sparingly for galleries of equivalent visual items or testimonials. **Don't** hide important content in later slides, auto-advance without pause, or use as the key hero message.
A11y: a group with `aria-roledescription="carousel"`; previous, next and indicator buttons have `aria-label`s and the active indicator has `aria-current`; slide changes are announced through `aria-live`; never autoplay without a pause control.

## Kbd
Figma: page `13693:81938` · set `1149:92754` (49 keys) · template `templates/components/Kbd.tsx`
API: `<Kbd>⌘</Kbd>`.
`<kbd class="inline-flex items-center gap-2.5 rounded-base border border-default-medium bg-neutral-tertiary px-2 py-1.5 text-xs font-semibold leading-4 text-heading">` (arrow keys: icon `size-4`).
**Use** to show keyboard shortcuts in tooltips, menus, docs. **Don't** for generic code (`<code>`) or as a button.
A11y: uses the semantic `<kbd>` element; spell out key names that could be ambiguous.

