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

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Info | `size="lg"` + text children + `footer` | Explanatory text with links that the user reads and acknowledges before continuing. | The content is long or needs scrolling across sections — use a page or a Drawer. |
| Type = Popup | `size="sm" dismissible={false}` + icon, question, `footer` | Confirming one destructive or irreversible action, such as deleting a product. | The action is easy to undo — act directly and offer undo in a Toast. |
| Type = Sign In | `size="sm"` + `<Input>` fields + Brand button | Signing in or re-authenticating without leaving the current page. | It is the app's main sign-in entry point — use a dedicated page. |
| Type = Create product | `size="sm"` + `<Input>`/`<Select>`/`<Textarea>` + `footer` | Creating an item with up to about six fields in one focused step. | The form is longer or needs page context — use a Drawer or a page. |
| Type = With radio inputs | `size="sm"` + `<ChoiceCard>`/`<Radio>` group + Next button | Picking one option before a flow continues, such as a role or a plan. | The choice is one field of a larger form — put Radio or ChoiceCard inline. |
| Type = With timeline | `size="md"` + `<Timeline>` children | A changelog or record history the user opens on demand. | The history is the main content — show it on a page or in a Drawer. |
| Type = With progress bar | `size="sm"` + `<Progress>` + `footer` | Warning about a usage limit that needs a decision, such as storage nearly full. | The usage is passive information — show Progress inline on the page. |
| Type = With list | `size="md"` + list of selectable rows | Choosing one provider or account from a short list, such as connecting a wallet. | The list is long or needs filtering — use a Select, Autocomplete or a page. |
| Type = OTP | `size="sm"` + `<OtpInput>` + Brand button | Verifying a one-time code before a sensitive action. | The code step belongs to a sign-up page flow — put OtpInput on the page. |
| Type = Share | `size="md"` + `<CopyInput>` + social buttons | Sharing a link to the current item with copy and social options. | Only a copy action is needed — use a CopyInput or a button with a Toast. |

**Use** for decisions or short focused tasks that block the page (confirm destructive actions, ≤ ~6 fields, acknowledgements). **Don't** for long forms or content needing page context (Drawer/page), non-blocking info, modal-in-modal, or auto-open on load.
A11y: `role="dialog" aria-modal aria-labelledby`, focus trap, Esc/backdrop close (except destructive), return focus.

## Drawer
Figma: page `13261:80923` · set `1149:37097` (Default, Navigation, With forms, Advanced, With alert, With list, Bottom, Swipeable) · heading `1149:37184` (8 types) · footer `1149:37232` (4 types × Desktop/Mobile) · template `templates/components/Drawer.tsx`
API: `<Drawer open onOpenChange title icon footer placement="start|end|bottom" size="sm|md" swipeable>`.

- Panel: `fixed inset-y-0 start-0 w-80 bg-neutral-primary-soft p-5 flex flex-col gap-5 overflow-y-auto` (`w-96` for list/default content; bottom: `inset-x-0 bottom-0 h-auto`). Shadow `shadow-xl`; add `border-e border-default` only when the drawer is non-modal and sits on a same-colored page.
- Heading ("Heading" type): `flex items-center justify-between border-b border-default pb-4`; title `text-lg font-medium leading-6 text-heading` + 36px close button. Optional leading icon (Figma "Show heading left icon" + "Heading icon", on in Default and Swipeable): `icon` prop, `size-5` before the title with `gap-1.5`; other types (icon, logo & text, avatar, user group): title `text-lg font-semibold leading-7 text-heading`, helper `text-base text-body`, `pb-5 gap-6`.
- Body: forms (`Input form`), lists (`rounded-base border border-default-medium bg-neutral-secondary-medium p-4 gap-3`), alerts (`Alert variant="complex" color="info"`), navigation (Sidebar items).
- Footer: `flex gap-4 border-t border-default pt-5`, Brand `base` + Secondary `base` (3 buttons `gap-3`).
- Bottom: full-width sheet, no handle. Swipeable (`placement="bottom" swipeable`): handle `h-1 w-6 rounded-full bg-neutral-quaternary` centred on the top edge (`absolute top-2.5`), tiles `rounded-base border border-default-medium bg-neutral-secondary-medium p-4 gap-2.5` with `IconShape size="lg" color="white" shape="circle"`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `size="md" icon={…}` + text children + `footer` | Supporting details or explanatory text about an item, with an optional heading icon. | A quick yes/no confirmation is needed — use a Modal. |
| Type = Navigation | `placement="start"` + Sidebar items, no `footer` | App navigation on mobile or in collapsed layouts. | It is the primary navigation on desktop — use a Sidebar. |
| Type = With forms | `size="sm"` + `<Input>` fields + submit button | A short form of two to four fields with one submit, such as contact or feedback. | The form needs several field types and Cancel/Save actions — use Advanced. |
| Type = Advanced | `size="sm"` + mixed fields + `footer` with Close and Brand | Create/edit forms with textarea, date or tag fields that keep the page visible. | The form is multi-step or very long — use a dedicated page. |
| Type = With alert | `<Alert variant="complex" color="info">` in children | A notice or announcement with a link that needs more room than a Toast. | The notice applies to the whole page — use a Banner or an inline Alert. |
| Type = With list | `size="md"` + key-value list tile | Read-only record details, such as order info opened from a table row. | The details need their own URL or are the main content — use a page. |
| Type = Bottom | `placement="bottom"` | A full-width sheet for short content or actions, especially on mobile. | The content is tall or a long form — use a start or end drawer. |
| Type = Swipeable | `placement="bottom" swipeable` | Touch-first bottom sheets with a drag handle, such as picking a widget from tiles. | The layout is desktop and pointer-only — use Bottom or a side drawer. |

**Use** for secondary tasks that keep page context: filters, details, create/edit forms, mobile navigation. **Don't** for quick confirmations (Modal), desktop primary navigation (Sidebar), or content that needs its own URL.
A11y: a native `<dialog>` labelled by its title (`aria-labelledby`), so focus stays inside and Esc closes it; the close button has an `aria-label`; focus returns to the trigger.

## Dropdown
Figma: page `3282:18862` · menu `1149:39895` (16 types) · item `1149:39651` (16 types × Initial/Hover/Disabled) · header `1149:39866` (5 types) · triggers `1149:40204` (6 types) · template `templates/components/Dropdown.tsx`
API: `<Dropdown trigger align label>` with `DropdownItem` (icon, description, trailing, onSelect), `DropdownCheckboxItem`, `DropdownHeader`, `DropdownSeparator`.

- Menu: `z-40 w-52 rounded-base border border-default-medium bg-neutral-primary-medium p-2 flex flex-col gap-1.5 shadow-lg` (widths in Figma: 208 default, 224–320 for richer types). "With scroll": `p-0`, scroll area `max-h-*` with `p-2`, sticky search (`Input sm`) with `shadow-bottom-dropdown` and footer with `shadow-top` (edge shadows over the scrolled list).
- Item: `flex items-center gap-1.5 rounded px-2 py-1.5 text-sm font-medium leading-5 text-body` (32px row; text-sm always uses its 20px line height) · icons `size-4 text-body` · hover `bg-neutral-tertiary-medium text-heading` · disabled `text-fg-disabled`. Secondary text `text-xs leading-4 text-body` (subtle text drops below 4.5:1 on the hover fill). Destructive item (`DropdownItem color="danger"`, e.g. Delete): `text-fg-danger-strong` text and icon, hover/focus `bg-danger-soft`; put it last, after a separator when the menu has several groups, and confirm the action in a Modal. Figma: Dropdown list item `Color = Danger`. Item types: Two icons (trailing `size-3.5`), Left/Right form (Checkbox/Radio/Toggle), With avatar & form, With badge (`Badge color="white" size="sm"`), User select (`AvatarGroupLabel sm`), Icon shapes (24px), With flag, Form & dot (`size-2 rounded-full bg-purple` etc.), Boxed grid tile (`rounded bg-neutral-secondary-strong p-3 gap-1.5`, icon `size-6`; hover `bg-neutral-quaternary text-heading`).
- Separator: wrapper `py-1` with `h-px bg-neutral-quaternary`.
- Header: `rounded bg-neutral-secondary-strong px-2.5 py-2 gap-0.5` — name `text-sm font-medium leading-none text-heading`, email `text-sm text-body`; with avatar `gap-1.5` + `Badge brand sm`; "Big avatar" adds Secondary `xs` button; "Form" header = `Input sm`.
- Triggers: Brand `base` Button with chevron, Ghost icon button (40px, `text-heading`), Secondary icon button (`text-body`), Avatar & name (Ghost button), Link (`text-base font-medium text-fg-brand` + chevron).

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<DropdownItem>` rows | A short list of actions from a trigger, such as row actions or "More". | The choice is a form value — use a Select. |
| Type = User profile | `<DropdownHeader name email>` + `<DropdownItem>` rows | The account menu behind a navbar avatar. | You only show a profile card with no actions — use a Popover. |
| Type = with separator | `<DropdownSeparator>` between item groups | More than about five actions that fall into groups, with the destructive item last. | There are only a few related actions — use Default. |
| Type = With radio input | compose: Radio rows in children | Switching one view setting in place, such as sort order or density. | The choice is a form value to submit — use a Select or Radio group. |
| Type = With toggle | compose: Toggle rows with descriptions | On/off preferences that apply immediately, such as notification settings. | The settings are saved with a form submit — use Checkbox in the form. |
| Type = Checkbox | `<DropdownCheckboxItem>` rows | Multi-select filters or column visibility, with the menu staying open. | There are more than about twelve options — use Users with search or an Autocomplete. |
| Type = Users | compose: search `<Input sm>` + checkbox user rows + action button | Selecting several people from a long list to act on, such as removing members. | People are a form field value — use an Autocomplete or TagInput. |
| Type = With scroll | `p-0` scroll area + sticky search and footer | Lists longer than about twelve items that need search and a sticky action. | The list is short — use Default; for form values use an Autocomplete. |
| Type = Heading & Button | compose: heading + `<DropdownItem>` rows + footer button | Picking a destination with a create-new option, such as "Save to collection". | There is no heading or create action — use Default. |
| Type = User selection | compose: `<AvatarGroupLabel sm>` rows + `<Badge>` | Switching account or picking one person, with a status badge on the current one. | Several people must be selected — use Users. |
| Type = Text & illustration | compose: illustration + title + text | An empty state inside a menu, such as "No notifications yet". | The empty state belongs to a page or section — show it there. |
| Type = With forms | compose: two date `<Input>` fields | A quick inline input inside a menu, such as a date range filter. | The input is a longer form — use a Drawer or a Modal. |
| Type = Grid | compose: boxed grid tiles with icons | An app or section launcher with six to nine icon tiles. | The actions are text-only or many — use Default. |
| Type = Language select | compose: `<DropdownItem>` rows with flags | Switching interface language or region from a trigger. | Language is a form field — use a Select. |
| Type = Menu | compose: CTA header + rows with trailing icon buttons + "Show all" | Rich pickers, such as a model selector, where each row has quick actions. | Plain actions are enough — use Default; never nest submenus deeper than one level. |
| Type = With number inputs | compose: `<NumberInput>` rows | Adjusting several counts in place, such as guests or passengers. | Only one count is needed — use a NumberInput directly in the form. |

**Use** for actions or navigation options revealed from a trigger (row actions, user menu, "More"); checkbox/radio/toggle variants for in-menu filters and settings. **Don't** for form values (Select/Autocomplete), >12 items without search, always-needed actions, or nested submenus deeper than one level.
A11y: `role="menu"`/`menuitem` (or `menuitemcheckbox`/`menuitemradio`), arrow keys, Esc returns focus.

## Popover
Figma: page `3303:16685` · set `1149:81090` (Default, Vertical items × Top/Right/Bottom/Left) · content `1149:81187` (9 types) · template `templates/components/Popover.tsx`
API: `<Popover trigger title placement padding="text|rich|none">`; `PopoverItem` for Vertical items.

- Panel: `w-64 rounded-base border border-default-medium bg-neutral-primary-medium shadow-lg overflow-hidden` with an arrow in the same fill/border.
- Header (optional): `border-b border-default-medium bg-neutral-tertiary-medium px-3 py-1.5 text-sm font-medium leading-5 text-heading`.
- Content "Text": `px-3 py-2 text-sm text-body`. Rich content (User/Company profile, Description & image, Progress, Password strength, Paragraphs, Illustration & CTA): `p-3 flex flex-col gap-2.5`–`gap-4`; titles `text-sm font-semibold leading-none text-heading`; text `text-sm text-body`; links `text-sm font-medium text-fg-brand`; small CTAs Brand `xs` / Secondary `sm`. Password strength bars `h-1 flex-1 rounded-full bg-warning` / `bg-neutral-quaternary`.
- Vertical items: list of `px-3 py-2 gap-1.5 text-sm leading-none text-body` rows with `size-4` icons.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `padding="text"` or `padding="rich"`, optional `title` | Text or rich content anchored to an element, such as a profile card or password rules. | The content is a one-line label — use a Tooltip. |
| Type = Vertical items | `padding="none"` + `<PopoverItem>` rows | A short list of links or info rows tied to an element. | The rows run commands and need menu keyboard behaviour — use a Dropdown. |
| Position = Left | `placement="left"` | The trigger sits at the right edge, such as an info icon at a row end. | Space is narrow, as on mobile — use Top or Bottom. |
| Position = Right | `placement="right"` | The trigger sits in a left column or sidebar with room to its right. | Space is narrow, as on mobile — use Top or Bottom. |
| Position = Top | `placement="top"` (default) | The default; the trigger has room above it, such as inline in body text. | The trigger is near the top of the viewport — use Bottom. |
| Position = Bottom | `placement="bottom"` | The trigger is near the top of the page, such as in a navbar or table header. | The trigger is near the bottom of the viewport — use Top. |

**Use** for rich, interactive or longer content anchored to an element (profile cards, password rules, inline help with links). **Don't** for one-line labels (Tooltip), action menus (Dropdown), or content required to finish a task.
A11y: the trigger has `aria-haspopup`, `aria-expanded` and `aria-controls`; the panel is `role="dialog"` labelled by its title, or by `label` when there is no title.

## Tooltip
Figma: page `3283:24170` · set `1149:93859` (Top/Bottom/Left/Right) · template `templates/components/Tooltip.tsx`
Bubble `rounded-base bg-dark px-3 py-2 text-sm font-medium leading-4 text-white shadow-md` + 8px arrow `bg-dark`; `max-w-xs`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Position = Top | `placement="top"` (default) | The default; the trigger has room above it, such as a toolbar icon button. | The trigger is near the top of the viewport — use Bottom. |
| Position = Bottom | `placement="bottom"` | The trigger is near the top of the page, such as in a navbar or table header. | The trigger is near the bottom of the viewport — use Top. |
| Position = Left | `placement="left"` | The trigger sits at the right edge, such as a row-end icon button. | Space is narrow, as on mobile — use Top or Bottom. |
| Position = Right | `placement="right"` | The trigger sits in a vertical icon rail or sidebar with room to its right. | Space is narrow, as on mobile — use Top or Bottom. |

**Use** for short (≤ ~8 words) labels of icon-only buttons, truncated text, shortcuts (with Kbd). **Don't** for essential or interactive content, controls that already have a visible label, or errors.
A11y: show on hover **and** focus, hide on Esc, `role="tooltip"` + `aria-describedby`.
