# Overlays

All components here are **spec verified** (2026-10-26).

Surfaces as drawn in Figma:

| Overlay | Fill | Border | Shadow |
|---|---|---|---|
| Modal | `bg-neutral-primary-soft` | `border-default` | `shadow-xl` |
| Drawer | `bg-neutral-primary-soft` | none (edge border optional) | `shadow-xl` |
| Dropdown / Autocomplete / Datepicker menus | `bg-neutral-primary-medium` | `border-default-medium` | `shadow-lg` |
| Popover | `bg-neutral-primary-medium` | `border-default-medium` | `shadow-lg` |
| Tooltip | `bg-dark` | none | `shadow-md` |

Elevation ladder: Tooltip `shadow-md` → Dropdown, Popover, Toast, menus `shadow-lg` → Modal, Drawer `shadow-xl`. All use `rounded-base`. Backdrop: `bg-black/50`. z-index ladder: menus/popovers `z-40`, drawer/modal `z-50`, toasts `z-60`. Use an accessible headless primitive (native `<dialog>`, Radix, Headless UI, Floating UI, React Aria) and apply these classes.

## Modal
Figma: page `3284:23179` · set `1149:71305` (Info, Popup, Sign In, Create product, With radio inputs, With timeline, With progress bar, With list, OTP, Share) · header `1149:71403` (7 types) · footer `1149:71444` (4 types) · template `templates/components/Modal.tsx`

- Panel: `w-full rounded-base border border-default bg-neutral-primary-soft p-6 flex flex-col gap-6`; widths from Figma: `max-w-sm` (384: Sign In, Popup, OTP, Create product), `max-w-md` (448: Share, With list, With timeline), `max-w-xl` (576: Info).
- Header: `flex items-center justify-between gap-6 border-b border-default pb-5`; title `text-lg font-medium leading-7 text-heading`; supporting text `text-base text-body` (or `text-fg-brand` link); close = 36px Ghost icon button `text-heading`. Header types add `IconShape size="lg" color="white"`, logo, `AvatarGroup size="lg"` or `Breadcrumb`.
- Body: `flex flex-col gap-4 text-base text-body`; emphasized `font-medium text-heading`; links `font-medium text-fg-brand`.
- Footer: `flex items-center gap-4 border-t border-default pt-6`; Brand `base` + Secondary `base`; "3 buttons" `gap-3`; "Buttons & links" adds a `text-base font-medium text-body` link and a `bg-neutral-quaternary` divider; "Pagination" footer uses Pagination.
- Popup (confirm): centered 36px icon `text-heading`, text `text-base text-body`, footer buttons. With progress bar: title `text-lg font-semibold leading-7`.

**Use** for decisions or short focused tasks that block the page (confirm destructive actions, ≤ ~6 fields, acknowledgements). **Don't** for long forms or content needing page context (Drawer/page), non-blocking info, modal-in-modal, or auto-open on load.
A11y: `role="dialog" aria-modal aria-labelledby`, focus trap, Esc/backdrop close (except destructive), return focus.

## Drawer
Figma: page `13261:80923` · set `1149:37097` (Default, Navigation, With forms, Advanced, With alert, With list, Bottom, Swipeable) · heading `1149:37184` (8 types) · footer `1149:37232` (4 types × Desktop/Mobile) · template `templates/components/Drawer.tsx`
API: `<Drawer open onOpenChange title footer placement="start|end|bottom" size="sm|md">`.

- Panel: `fixed inset-y-0 start-0 w-80 bg-neutral-primary-soft p-5 flex flex-col gap-5 overflow-y-auto` (`w-96` for list/default content; bottom: `inset-x-0 bottom-0 h-auto`). Shadow `shadow-xl`; add `border-e border-default` only when the drawer is non-modal and sits on a same-colored page.
- Heading ("Heading" type): `flex items-center justify-between border-b border-default pb-4`; title `text-lg font-medium leading-6 text-heading` + 36px close button; other types (icon, logo & text, avatar, user group): title `text-lg font-semibold leading-7 text-heading`, helper `text-base text-body`, `pb-5 gap-6`.
- Body: forms (`Input form`), lists (`rounded-base border border-default-medium bg-neutral-secondary-medium p-4 gap-3`), alerts (`Alert variant="complex" color="info"`), navigation (Sidebar items).
- Footer: `flex gap-4 border-t border-default pt-5`, Brand `base` + Secondary `base` (3 buttons `gap-3`).
- Swipeable: handle `h-1.5 w-8 rounded-full bg-neutral-quaternary`, tiles `rounded-base border border-default-medium bg-neutral-secondary-medium p-4 gap-2.5` with `IconShape size="lg" color="white" shape="circle"`.

**Use** for secondary tasks that keep page context: filters, details, create/edit forms, mobile navigation. **Don't** for quick confirmations (Modal), desktop primary navigation (Sidebar), or content that needs its own URL.

## Dropdown
Figma: page `3282:18862` · menu `1149:39895` (16 types) · item `1149:39651` (16 types × Initial/Hover/Disabled) · header `1149:39866` (5 types) · triggers `1149:40204` (6 types) · template `templates/components/Dropdown.tsx`
API: `<Dropdown trigger align label>` with `DropdownItem` (icon, description, trailing, onSelect), `DropdownCheckboxItem`, `DropdownHeader`, `DropdownSeparator`.

- Menu: `z-40 w-52 rounded-base border border-default-medium bg-neutral-primary-medium p-2 flex flex-col gap-1.5 shadow-lg` (widths in Figma: 208 default, 224–320 for richer types). "With scroll": `p-0`, scroll area `max-h-*` with `p-2`, sticky search (`Input sm`) with `shadow-bottom-dropdown` and footer with `shadow-top` (edge shadows over the scrolled list).
- Item: `flex items-center gap-1.5 rounded p-2 text-sm font-medium leading-none text-body` · icons `size-4 text-body` · hover `bg-neutral-tertiary-medium text-heading` · disabled `text-fg-disabled`. Secondary text `text-xs text-body-subtle leading-none`. Item types: Two icons (trailing `size-3.5`), Left/Right form (Checkbox/Radio/Toggle), With avatar & form, With badge (`Badge color="white" size="sm"`), User select (`AvatarGroupLabel sm`), Icon shapes (24px), With flag, Form & dot (`size-2 rounded-full bg-purple` etc.), Boxed grid tile (`rounded bg-neutral-secondary-strong p-3 gap-1.5`, icon `size-6`; hover `bg-neutral-quaternary text-heading`).
- Separator: wrapper `py-1` with `h-px bg-neutral-quaternary`.
- Header: `rounded bg-neutral-secondary-strong px-2.5 py-2 gap-0.5` — name `text-sm font-medium leading-none text-heading`, email `text-sm text-body`; with avatar `gap-1.5` + `Badge brand sm`; "Big avatar" adds Secondary `xs` button; "Form" header = `Input sm`.
- Triggers: Brand `base` Button with chevron, Ghost icon button (40px, `text-heading`), Secondary icon button (`text-body`), Avatar & name (Ghost button), Link (`text-base font-medium text-fg-brand` + chevron).

**Use** for actions or navigation options revealed from a trigger (row actions, user menu, "More"); checkbox/radio/toggle variants for in-menu filters and settings. **Don't** for form values (Select/Autocomplete), >12 items without search, always-needed actions, or nested submenus deeper than one level.
A11y: `role="menu"`/`menuitem` (or `menuitemcheckbox`/`menuitemradio`), arrow keys, Esc returns focus.

## Popover
Figma: page `3303:16685` · set `1149:81090` (Default, Vertical items × Top/Right/Bottom/Left) · content `1149:81187` (9 types) · template `templates/components/Popover.tsx`
API: `<Popover trigger title placement padding="text|rich|none">`; `PopoverItem` for Vertical items.

- Panel: `w-64 rounded-base border border-default-medium bg-neutral-primary-medium shadow-lg overflow-hidden` with an arrow in the same fill/border.
- Header (optional): `border-b border-default-medium bg-neutral-tertiary-medium px-3 py-1.5 text-sm font-medium leading-5 text-heading`.
- Content "Text": `px-3 py-2 text-sm text-body`. Rich content (User/Company profile, Description & image, Progress, Password strength, Paragraphs, Illustration & CTA): `p-3 flex flex-col gap-2.5`–`gap-4`; titles `text-sm font-semibold leading-none text-heading`; text `text-sm text-body`; links `text-sm font-medium text-fg-brand`; small CTAs Brand `xs` / Secondary `sm`. Password strength bars `h-1 flex-1 rounded-full bg-warning` / `bg-neutral-quaternary`.
- Vertical items: list of `px-3 py-2 gap-1.5 text-sm leading-none text-body` rows with `size-4` icons.

**Use** for rich, interactive or longer content anchored to an element (profile cards, password rules, inline help with links). **Don't** for one-line labels (Tooltip), action menus (Dropdown), or content required to finish a task.

## Tooltip
Figma: page `3283:24170` · set `1149:93859` (Top/Bottom/Left/Right) · template `templates/components/Tooltip.tsx`
Bubble `rounded-base bg-dark px-3 py-2 text-sm font-medium leading-4 text-white shadow-md` + 8px arrow `bg-dark`; `max-w-xs`.
**Use** for short (≤ ~8 words) labels of icon-only buttons, truncated text, shortcuts (with Kbd). **Don't** for essential or interactive content, controls that already have a visible label, or errors.
A11y: show on hover **and** focus, hide on Esc, `role="tooltip"` + `aria-describedby`.
