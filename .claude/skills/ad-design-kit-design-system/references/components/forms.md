# Forms

All form components are **spec verified** against Figma (2026-10-26). Values below are the bound Figma variables translated to Tailwind; "(unbound)" marks a raw Figma value that code mirrors and figma-audit.md tracks.

## Shared field anatomy
Every "… form" set in Figma (Input form, Select form, Search form, Number form, Phone form, Copy to clipboard form, Timepicker form, Textarea examples, OTP examples) is the same stack:

```
<div class="flex flex-col gap-2.5">        ← Figma gap spacing/2․5 (10px)
  <Label required>…</Label>                 ← Label(Required & icon)
  <control />                               ← Input field / Select / Textarea …
  <HelperText>…</HelperText>                ← Helper(Default)
</div>
```
Inline variant: `flex items-center gap-4` with `Label` on the left and a `sm` control. Fields in a form are separated by `gap-4`–`gap-6`.

Control size scale (Input field, Tag input, OTP, Floating label, Timepicker input share it):

| Size | Height | Padding | Text | Icon |
|---|---|---|---|---|
| sm | 36 | `px-2.5 py-2` | `text-sm leading-5` | `size-4` |
| base | 40 | `px-3 py-2.5` | `text-sm leading-5` | `size-4` |
| lg | 48 | `px-3.5 py-3` | `text-base leading-6` | `size-5` |
| xl | 52 | `px-4 py-3.5` | `text-base leading-6` | `size-5` |

Control state tokens (shell = `rounded-base border shadow-xs`, icon/text gap `gap-2`):

| State | Fill | Border | Text / icon |
|---|---|---|---|
| Initial | `bg-neutral-secondary-medium` | `border-default-medium` | placeholder `text-body-subtle` |
| Focus / typing | same | `border-brand` | `text-heading` (+ `focus-visible:shadow-focus-brand`) |
| Filled | same | `border-default-medium` | `text-heading` |
| Disabled | same | `border-default-medium` | `text-fg-disabled` |
| Read-only | `bg-neutral-tertiary` | `border-default-medium` | `text-body` |
| Success | `bg-success-soft` | `border-success-subtle` | `text-fg-success-strong` |
| Danger | `bg-danger-soft` | `border-danger-subtle` | `text-fg-danger-strong` |

## Input
Figma: page `3279:34618` · set `1149:46826` "Input field" (5 types × 4 sizes × 7 states) · template `templates/components/Input.tsx`

```tsx
<Label htmlFor="email" required>Email</Label>
<Input id="email" type="email" leftIcon={<MailIcon/>} placeholder="name@company.com" />
<HelperText>We'll never share your email.</HelperText>
```
| Figma | Prop | Values |
|---|---|---|
| Size | `size` | `sm` · `base` · `lg` · `xl` |
| Type | slots | Default · Add-on icon (`addonIcon`) · Add-on text (`addonText`) · Inner button (`endAction`) · Stacked placeholder (`stackedLabel`) |
| State Success / Danger | `status` | `success` · `danger` |
| State Disabled / Read-only | native `disabled` / `readOnly` | |
| Show left/right icon | `leftIcon`, `rightIcon` | ReactNode |

Recipe: shell + size row + state row above. Add-on segment: `bg-neutral-tertiary text-body p-2.5` (text-body keeps 4.5:1 on the tinted segment) joined to the field (`rounded-s-base`, field `rounded-s-none`, shared border). Inner button: Tertiary `xs` Button inside the field, `rounded` radius. Stacked placeholder: label `text-xs text-body` above value `text-sm text-heading`, `gap-0.5`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Input>` | Most single-line fields; add `leftIcon`/`rightIcon` for a hint glyph. | The value has a fixed prefix or unit — use Add-on text. |
| Type = Add-on icon | `addonIcon={<Icon/>}` | A joined icon segment clarifies what the field holds, e.g. user or mail. | The icon is only decorative — use `leftIcon` inside the field. |
| Type = Add-on text | `addonText="https://"` | A fixed prefix or unit belongs to the value: URL scheme, currency, domain. | Users pick the prefix — join a Select, or use PhoneInput for dial codes. |
| Type = Inner button | `endAction={<Button size="xs"/>}` | One action works on this field only, e.g. apply a coupon or reveal a password. | The action submits the whole form — put the Button in the form footer. |
| Type = Stacked placeholder | `stackedLabel="…"` | Dense summary or checkout layouts where the label sits inside the box. | Standard forms — use an external Label; never mix both styles in one form. |
| Size = sm | `size="sm"` | Dense tables, toolbars, filters and inline forms. | Primary fields on touch screens — use base or lg. |
| Size = base | `size="base"` | Default for most forms, dialogs and side panels. | Neighbouring controls use another size — match the row. |
| Size = lg | `size="lg"` | Prominent single fields: sign-in, onboarding, main search. | Dense multi-column forms — use base. |
| Size = xl | `size="xl"` | Hero or touch-first forms with one or two fields. | Regular forms or dialogs — use base or lg. |

**Use** for single-line free text: names, emails, URLs, search terms, numbers without steppers.
**Don't** for long text (`Textarea`), known options (`Select`/`Autocomplete`/`Radio`), dates (`Datepicker`), on/off (`Toggle`), or read-only data that isn't a form value.
A11y: visible `Label` with `htmlFor`; errors via `aria-invalid` + `aria-describedby` → HelperText; don't rely on color alone.

## Label and HelperText
Figma: Label `1149:94727` · Helper `1149:94741` · checkbox/toggle variants `1149:55119`, `1149:55133`, `1149:54502`, `1149:54510`

| Part | Classes |
|---|---|
| Label | `text-sm font-medium leading-5 text-heading` |
| Required asterisk | `text-fg-danger` directly after the text (`gap-1`) |
| Label icon (info) | `size-3.5 text-body-subtle` |
| Label hint ("Two texts") | `text-xs text-body-subtle` |
| Helper (forms) | `text-xs leading-4 text-body` (every helper and description under a control uses this caption size) |
| Helper "Left & Right text" | left `text-xs text-body`, right `text-xs font-medium text-fg-brand` |
| Helper for checkbox / toggle | `text-sm text-body` |
| Label for checkbox / radio | `text-sm font-medium leading-5 text-heading` (same 20px line height as form labels; the 16px box sits `mt-0.5`, centred on the first line) |

Status helper text: danger `text-fg-danger`, success `text-fg-success`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Label>` | The label of an optional field. | The field is required — use Required & icon. |
| Type = Required & icon | `<Label required>` | Required fields, or labels that need an info icon with a tooltip. | Optional fields — use Default; the asterisk never replaces the `required` attribute. |
| Type = Two texts | `<Label hint="…">` | A short right-aligned note such as "Optional" or a character limit. | The note is a sentence of guidance — use HelperText below the control. |
| Type = Default | `<HelperText>` | Hints and validation messages under a control; add `status` for success or danger. | The message concerns the whole page or form — use Alert. |
| Type = Tags | `compose: <HelperText> + <Badge>` | Suggested example values or applied tags shown under a field. | Users type several values themselves — use TagInput. |
| Type = Left & Right text | `compose: <HelperText> + two spans` | Min/max labels, or a hint paired with a counter or link. | There is only one message — use Default. |
| Type = Progress bar | `compose: <HelperText> + <Progress>` | Password strength or character-limit progress under a field. | Upload or task progress — use Progress on its own. |
| Type = Features | `compose: <HelperText> + checklist` | Password or input rules that tick off as the user types. | Long instructions — put them in text before the form. |

**Use** a Label on every control, and HelperText under it for hints and validation messages. **Don't** use placeholder text as the label or put errors only in colour.
A11y: always pair `Label htmlFor` with the input id; link helper and error text to the input with `aria-describedby`; required fields show the marker and set `required`.

## Select
Figma: `1149:46541` "Select form" (Default, Inline, With Buttons, 2 inputs, Range inputs, 3 inputs, Left button). Built from the Input field shell (`Default/base`) + chevron `size-4 text-body-subtle` at the end; button add-ons are Secondary `base` Buttons joined to the field (`shadow-xs` on the group). · template `templates/components/Select.tsx`
API: `<Select size status disabled>` + `<option>`s; same sizes/states as Input.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Select>` | One value from 5+ known options in a stacked field. | 4 or fewer options — use Radio or ChoiceCard. |
| Type = Inline | `compose: <Label> beside <Select size="sm">` | Toolbars and filter bars where label and select share a row. | Stacked forms — use Default. |
| Type = With Buttons | `compose: <Select> + <Button>` | The choice is applied by a joined action, e.g. pick a role then Invite. | The button submits the whole form — put it in the form footer. |
| Type = 2 inputs | `compose: 2 × <Select>` | Two linked choices that form one value, e.g. card expiry month and year. | The values are unrelated — use separate fields. |
| Type = Range inputs | `compose: <Select> – <Select>` | A from–to range picked from fixed steps, e.g. price brackets. | The range is continuous — use RangeSlider; for dates use Datepicker Range. |
| Type = 3 inputs | `compose: 3 × <Select>` | Three-part values such as day, month and year for far-past dates. | Dates near today — use Datepicker. |
| Type = Left button | `compose: <Button> + <Select>` | A leading button scopes or opens the choice, e.g. a category before the item. | Picking a dial code — use PhoneInput. |

**Use** for one value from 5+ known options. **Don't** for ≤4 options (Radio/ChoiceCard), actions (Dropdown), or long/remote lists (Autocomplete). Prefer native `<select>` unless custom rendering is needed.
A11y: a native `<select>`, so keyboard and screen-reader support come from the browser; always give it a `Label`; set `aria-invalid` together with an error helper.

## SearchInput
Figma: `1149:46581` "Search form" (8 types). Input field with leading search icon; actions: Brand `base` "Search", Secondary `base` filters; "Inner button" uses the Input field Inner button variant; "Three buttons" joins icon-only Buttons. · template `templates/components/SearchInput.tsx`
API: `<SearchInput onSearch variant="default|button|joined|inner" size placeholder label>`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | Live filtering of a list or table as the user types. | Search runs only on submit — use With button (no-space). |
| Type = Inline | `compose: <Label> beside <SearchInput>` | Filter bars where a visible label sits on the same row. | Header or page search — use Default with an `aria-label`. |
| Type = With buttons | `compose: <SearchInput> + <Button>s` | Search with a joined filter or options button next to submit. | Only a submit is needed — use With button (no-space). |
| Type = With spaced buttons | `compose: <SearchInput> + gap + <Button>s` | Search plus separate actions that must read as distinct from the field. | Width is tight — use With buttons. |
| Type = Inner button | `variant="inner"` | Compact search with the submit button inside the field. | Results update live — use Default. |
| Type = Three buttons | `compose: <SearchInput> + 3 icon-only <Button>s` | Search with joined view or filter actions, e.g. filter, sort, layout. | One or two actions — use With buttons. |
| Type = With button (spaced) | `variant="button"` | Page-level search with a visible Search button beside the field. | Live filtering — use Default. |
| Type = With button (no-space) | `variant="joined"` | Prominent search bar with a joined Search button, e.g. hero or results page. | Dense toolbars — use Default or Inner button. |

**Use** for filtering/searching content. **Don't** for picking a form value (Autocomplete). Wrap in `<form role="search">`, `type="search"`.
A11y: wrapped in a `role="search"` landmark; the input needs a label (visible or `aria-label`); the submit icon button has an `aria-label`.

## NumberInput
Figma: `1149:46630` "Number form" (13 types). Steppers are 40×40 icon buttons (`text-body`, plus icon may be `text-fg-brand`) joined to a centered Input; "Ghost input" uses `Input sm` with 32px icon buttons; "With progress bar" pairs it with RangeSlider; "Range" uses Helper(Left & Right text). · template `templates/components/NumberInput.tsx`
API: `<NumberInput value onChange min max step variant="default|buttons|spaced|ghost" size>`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | Typed numbers where steppers add nothing, e.g. an amount. | IDs, phone or card numbers — use Input `inputMode="numeric"`. |
| Type = Inline | `compose: <Label> beside <NumberInput>` | Compact rows such as a cart line or a settings row. | Stacked forms — use With buttons. |
| Type = With buttons | `variant="buttons"` | Small counts changed one step at a time, e.g. quantity or guests. | Values far from the start value — use Default. |
| Type = With spaced buttons | `variant="spaced"` | Touch-friendly steppers set apart from the field. | Dense tables — use Ghost input. |
| Type = Inner button | `compose: <Input endAction>` + steppers | Steppers inside the field to save width. | Touch-first layouts — use With spaced buttons. |
| Type = Three buttons | `compose: <NumberInput> + <Button>` | A stepper joined to an action, e.g. Add to cart. | No follow-up action — use With buttons. |
| Type = Stacked placeholder | `compose: <Input stackedLabel type="number">` | Dense summary or checkout layouts with the label inside the box. | Standard labelled forms — use Default. |
| Type = With progress bar | `compose: <NumberInput> + <RangeSlider>` | Both exact entry and approximate dragging help, e.g. a budget. | Only one mode is needed — use NumberInput or RangeSlider alone. |
| Type = Stacked inputs | `compose: stacked <NumberInput>s` | Several related counts, e.g. adults, children and infants. | The values are unrelated — use separate fields. |
| Type = Stacked full | `compose: full-width stacked <NumberInput>s` | Related counts in full-width or mobile layouts. | Narrow panels or popovers — use Stacked inputs. |
| Type = Range | `compose: 2 × <NumberInput> + <HelperText>` | Exact min and max values, e.g. price from and to. | Approximate ranges — use RangeSlider Range. |
| Type = Ghost input | `variant="ghost"` | Compact steppers in tables, cart lines and popovers. | Main form fields — use With buttons. |
| Type = One button | `compose: <NumberInput> + one <Button>` | A single follow-up action next to the value, e.g. Apply. | Users step both ways — use With buttons. |

**Use** for small bounded integers (quantity, guests). **Don't** for IDs, phone or card numbers (Input `inputMode="numeric"`) or wide ranges (RangeSlider).
A11y: the minus and plus buttons have `aria-label`s and `aria-controls` the input; the input keeps native arrow-key stepping; pair it with a `Label`.

## PhoneInput
Figma: `1149:46719` "Phone form" (8 types). Country selector = Secondary `base` Button with flag + chevron, joined to Input field; "Stacked with button" adds Brand `base` submit. · template `templates/components/PhoneInput.tsx`
API: `<PhoneInput value onChange country onCountryChange countries status>`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<PhoneInput>` | A phone number field with a country dial-code selector. | The number is not a phone number — use Input `inputMode="numeric"`. |
| Type = Inline | `compose: <Label> beside <PhoneInput>` | Settings rows where the label sits on the left. | Stacked forms — use Default. |
| Type = With spaced buttons | `compose: <PhoneInput> + gap + <Button>` | Phone plus a separate action, e.g. Send code. | Width is tight — use Inner button. |
| Type = Inner button | `compose: <PhoneInput>` + inner `<Button size="xs">` | A compact verify or send action inside the field. | The action submits a larger form — use the form footer. |
| Type = Three buttons | `compose: <PhoneInput> + <Button>s` | Phone with several joined actions, e.g. call, message, verify. | One action is enough — use One button. |
| Type = Stacked with button | `compose: <PhoneInput>` above `<Button>` | Single-purpose steps such as Send verification code. | The phone is one field in a longer form — use Default. |
| Type = Select & Button | `compose: <Select> + <PhoneInput> + <Button>` | An extra choice comes with the number, e.g. SMS or call. | No extra choice — use One button. |
| Type = One button | `compose: <PhoneInput> + <Button>` | One joined action on the number, e.g. Verify. | No action belongs to the field — use Default. |

**Use** when the dial code matters. **Don't** for generic numbers.
A11y: the country code and the number each have a label; format hints go in helper text linked by `aria-describedby`; errors set `aria-invalid`.

## CopyInput
Figma: `1149:46768` "Copy to clipboard form" (10 types). Input field + inner/joined copy Button (Brand `base`, Secondary `base`, or Tertiary `xs` inside "Large input"); "Add-on" uses Input Add-on text. · template `templates/components/CopyInput.tsx`
API: `<CopyInput value variant="joined|inner|icon">`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="icon"` | Copy with a compact icon button, e.g. in tables or settings rows. | Copy is the main task — use Default with button. |
| Type = Inline | `compose: <Label> beside <CopyInput>` | Settings rows where the label sits on the left. | Stacked forms — use Default. |
| Type = With spaced buttons | `compose: <CopyInput> + gap + <Button>s` | Copy plus separate actions, e.g. Regenerate, that need clear spacing. | Copy is the only action — use Default with button. |
| Type = Inner button | `variant="inner"` | A small Copy button inside the field to save width. | Copy is the main task — use Default with button. |
| Type = Three buttons | `compose: <CopyInput> + 3 icon-only <Button>s` | Copy, open and share actions on one value, e.g. a share link. | One action is enough — use Default. |
| Type = Select & Button | `compose: <Select> + <CopyInput>` | The value depends on a choice, e.g. HTTPS or SSH clone URL. | Only one format exists — use Default with button. |
| Type = Default with button | `variant="joined"` | A visible Copy label is the main action, e.g. share link or invite URL. | Space is tight — use Default or Inner button. |
| Type = Add-on | `compose: <Input addonText readOnly> + copy <Button>` | The value has a fixed prefix shown as an add-on, e.g. domain. | No prefix — use Default with button. |
| Type = Two buttons | `compose: <CopyInput> + <Button>` | Copy plus one more action, e.g. Regenerate key. | Copy is the only action — use Default with button. |
| Type = Large input | `variant="inner"` with a long value | Long values shown in full, e.g. API keys or embed code. | Short codes — use Default with button. |

**Use** for API keys, share links, codes; announce "Copied" via `aria-live`. **Don't** for editable values.
A11y: the copy button has an `aria-label`; the "Copied" confirmation is announced through an `aria-live` region.

## FileUpload
Figma: `1149:48972` (Default, Advanced) · dropzone `1149:48981` (Advanced, With CTAs × Initial/Hover/Disabled/Success/Danger) · template `templates/components/FileUpload.tsx`
API: `<FileInput onFiles>` (Default) · `<FileDropzone onFiles variant="advanced|ctas" status disabled hint actions>`.
- Default = Input field "Add-on text" variant (the add-on is the "Choose file" segment).
- Dropzone shell: `rounded-base border border-default-medium bg-neutral-secondary-medium` (hover `bg-neutral-tertiary`), content `flex flex-col items-center gap-2`, icon `size-6 text-body-subtle`, text `text-sm text-body-subtle`, hint `text-xs font-medium text-body-subtle`, Brand `xs` "Browse" Button.
- With CTAs: icon `size-9 text-body`, text `text-body`, actions `gap-6`.
- Success / Danger: success/danger soft surface + subtle border + `-strong` text; Disabled: `text-fg-disabled` and disabled Button.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Advanced | `<FileDropzone variant="advanced">` | Drag-and-drop for several files or media inside a form. | One file in a form — use `<FileInput>`. |
| Type = With cta's | `<FileDropzone variant="ctas" actions={…}>` | Upload steps or empty states that offer other sources, e.g. camera or cloud import. | A plain form field — use Advanced or `<FileInput>`. |

**Use** Default for one file in a form; dropzone for multiple files or media. **Don't** hide the real `<input type="file">` from assistive tech.
A11y: built on a real `<input type="file">` inside a `<label>`, so it works with keyboard and screen readers; put type and size limits in helper text linked by `aria-describedby`.

## TagInput
Figma: `1149:49173` (sm–xl × Initial/Focus/Filled/Disabled/Success/Danger). Input field shell (same state table) containing `Badge color="white" size="sm" leading={<Avatar/>}` chips, `gap-2`, trailing icon `text-body-subtle`. · template `templates/components/TagInput.tsx`
API: `<TagInput value onChange size status disabled renderLeading>`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Size = sm | `size="sm"` | Dense tables, toolbars, filters and inline forms. | Primary fields on touch screens — use base or lg. |
| Size = base | `size="base"` | Default for most forms, dialogs and side panels. | Neighbouring controls use another size — match the row. |
| Size = lg | `size="lg"` | Prominent single fields: sign-in, onboarding, main search. | Dense multi-column forms — use base. |
| Size = xl | `size="xl"` | Hero or touch-first forms with one or two fields. | Regular forms or dialogs — use base or lg. |

**Use** for free-form multiple values (emails, keywords). **Don't** when values come from a fixed list (multi-select Autocomplete or Checkbox group).
A11y: Enter adds a tag and Backspace removes the last one; each tag's remove button has an `aria-label` naming the tag; errors set `aria-invalid`.

## OtpInput
Figma: boxes `1149:49523` (sm–xl × 7 states) · examples `1149:49576` (Default, Spaced, Separator, Separator spaced) · template `templates/components/OtpInput.tsx`
API: `<OtpInput value onChange length variant="default|spaced|separator|separator-spaced" size status>`.
Box = Input shell, square (`base` `size-10`, `sm` `size-9`, `lg` `size-12`, `xl` `size-13`), value `text-base font-semibold leading-4 text-heading text-center`, state table as above. Separator: 2px dash `border-t-2 border-dark` between groups. Examples use `sm` boxes.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Size = sm | `size="sm"` | Default for code entry inside forms and dialogs. | Touch-first screens — use lg. |
| Size = base | `size="base"` | Standalone verification cards with room to spare. | Narrow dialogs or 8-digit codes — use sm. |
| Size = lg | `size="lg"` | Touch-first or full-page verification steps. | Dense forms — use sm. |
| Size = xl | `size="xl"` | Kiosk or hero verification screens with a short code. | Dialogs or long codes — use sm or base. |

**Use** for one-time codes (4–8 characters) with `autocomplete="one-time-code"`, paste support, auto-advance. **Don't** for passwords or general numbers.
A11y: the fields sit in a `role="group"` with a label; each digit field has its own `aria-label`; typing moves focus forward and Backspace moves back. An empty box between filled ones is a space in `value`, so clearing one box never shifts the others.

## Textarea
Figma: `1149:49679` (Default, Chatroom, Buttons inside, Buttons outside × Initial/Focus/Filled) · examples `1149:50131` · template `templates/components/Textarea.tsx`
API: `<Textarea status rows footer>`; `footer` = Buttons inside (use `TextareaToolButton` + Brand `sm`).
- Default: Input shell + `p-3.5 text-sm leading-5`, `rows={4}`; focus `border-brand`; filled `text-heading`.
- Buttons inside: shell wraps text area (`p-3.5`) + footer bar `bg-neutral-tertiary-medium px-2.5 py-2.5 gap-4 border-t border-default-medium` with icon buttons (`size-5` icons `text-body`, hover `text-heading`) and Brand `sm` submit.
- Buttons outside: textarea alone, then a row with Brand `sm` button (`gap-4`).
- Chatroom: bar `bg-neutral-secondary-soft rounded-lg p-2 gap-2` containing `Input sm` + icon buttons (send icon `text-fg-brand`).

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Textarea>` | Multi-line plain text in a form: descriptions, notes, feedback. | Single-line values — use Input. |
| Type = Chatroom | `compose: <Input size="sm"> + icon <Button>s` | Chat or messaging composers pinned to the bottom of a thread. | Long-form text — use Default. |
| Type = Buttons inside | `footer={…}` | Comment boxes with attach or emoji tools and a submit in one shell. | The text is one field in a larger form — use Default. |
| Type = Buttons outside | `compose: <Textarea> + <Button size="sm">` | Simple comment or reply boxes with a separate submit. | Users need formatting — use RichTextEditor. |

**Use** for multi-line plain text. **Don't** for single-line values or formatted content (RichTextEditor).
A11y: pair it with a `Label`; set `aria-invalid` together with an error helper; toolbar buttons, when shown, have `aria-label`s.

## RichTextEditor
Figma: `1149:49749` (Default, Buttons inside, Buttons outside × Initial/Focus/Filled) · template `templates/components/RichTextEditor.tsx`
API: `<RichTextEditor label defaultValue onChange placeholder footer minRows>` (swap the editable area for Tiptap/Lexical in production).
Shell: `rounded-base border border-default-medium shadow-xs` (focus `border-brand`). Toolbar: `bg-neutral-secondary-medium p-3 gap-0.5`, icon buttons `p-1 rounded-lg` with `size-5 text-body` icons, groups divided by `w-px bg-neutral-quaternary`; Tertiary/Secondary `xs` Buttons for "Format"/"Insert". Editor area `p-3.5 text-sm text-heading`, placeholder `text-body-subtle`. "Buttons inside" adds a footer with Brand `sm` submit.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Buttons inside | `footer={…}` | Post or comment composers with a submit inside the editor shell. | The editor is one field in a larger form — use Default. |
| Type = Buttons outside | `compose: <RichTextEditor> + <Button>` | Stand-alone editors with actions below, e.g. Save draft and Publish. | Plain comments — use Textarea. |
| Type = Default | `<RichTextEditor>` | Formatted content inside a larger form submitted later. | Plain text without formatting — use Textarea. |

**Use** when users must format text. **Don't** for plain comments.
A11y: the editing area is `role="textbox"` with `aria-multiline`; formatting buttons sit in a `role="toolbar"` and each has an `aria-label`.

## FloatingLabelInput
Figma: page `1149:50453` · set `1149:50454` (3 types × 4 sizes × 7 states) · template `templates/components/FloatingLabelInput.tsx`
API: `<FloatingLabelInput label variant="underline|filled|outlined" size status>`.

| Figma Type | `variant` | Shell |
|---|---|---|
| Default | `underline` | no fill, no radius on the field, bottom border only `border-b-2 border-default-medium`, `px-0` |
| With background | `filled` | `bg-neutral-secondary-medium rounded-t-lg border-b-2 border-default-medium px-2.5` |
| Bordered | `outlined` | `bg-neutral-primary rounded-base border border-default-medium px-2.5`; the floating label sits on the border with `bg-neutral-primary px-1` |

Vertical padding and text follow the size scale (sm `py-2`, base `py-2.5`, lg `py-3 text-base`, xl `py-3.5 text-base`). Label at rest `text-sm text-body-subtle`; floated (focus) `text-fg-brand`; value `text-heading`. Success/danger use `border-success-subtle` / `border-danger-subtle` (same as Input field) and `-strong` text; disabled `text-fg-disabled` (outlined: `bg-neutral-secondary-medium`); read-only `text-body`. Implement with `peer` + `placeholder=" "` + `peer-placeholder-shown:` / `peer-focus:` utilities.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="underline"` | Minimal compact forms on plain backgrounds. | Busy or tinted surfaces where a bottom line is hard to see — use Bordered. |
| Type = With background | `variant="filled"` | Compact forms that need a clear tap area, e.g. mobile login. | Forms that also use outlined fields — use Bordered. |
| Type = Bordered | `variant="outlined"` | Compact forms that need the full field outline, e.g. checkout. | Long forms — use Input with a Label. |
| Size = sm | `size="sm"` | Dense tables, toolbars, filters and inline forms. | Primary fields on touch screens — use base or lg. |
| Size = base | `size="base"` | Default for most forms, dialogs and side panels. | Neighbouring controls use another size — match the row. |
| Size = lg | `size="lg"` | Prominent single fields: sign-in, onboarding, main search. | Dense multi-column forms — use base. |
| Size = xl | `size="xl"` | Hero or touch-first forms with one or two fields. | Regular forms or dialogs — use base or lg. |

**Use** in compact forms (login, checkout). **Don't** mix with standard labelled inputs in the same form or use in long forms.
A11y: the floating text is a real `<label>` and stays the accessible name; never replace it with a placeholder; errors set `aria-invalid`.

## Datepicker
Figma: page `1149:51144` · cell `1149:51147` · controls `1149:51164` · menu `1149:51169` (Default, Range, Year picker, Month, Day/Year/Month) · examples `1149:51284` · template `templates/components/Datepicker.tsx`
API: `<Datepicker value onChange mode="single|range" min max weekStart locale size>`; `<Calendar>` for the menu alone.
- Trigger: Input form with calendar icon.
- Menu: `rounded-base border border-default-medium bg-neutral-primary-medium p-5 shadow-lg flex flex-col gap-4`; Range shows two months `gap-6`.
- Header: month/year `text-sm font-semibold leading-5 text-heading`, prev/next 32px icon buttons `text-heading`.
- Weekday labels: `text-xs font-semibold leading-3 text-body`.
- Cell `size-9 text-xs font-semibold leading-4`:

| State | Classes |
|---|---|
| Initial | `rounded text-body` |
| Hover | `rounded bg-neutral-tertiary-medium text-heading` |
| Active / Active start / Active end | `rounded bg-brand text-white` (range ends join the band: start `rounded-e-none`, end `rounded-s-none`) |
| Active between | `rounded-none bg-neutral-tertiary-medium text-heading` |
| Outlined (today) | `rounded border border-brand text-heading` |
| Disabled | `rounded text-fg-disabled` |

- Footer: Secondary `base` "Clear" + Brand `base` "Today"/"Apply".

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `mode="single"` | One date near today, e.g. a due date or appointment. | Birthdays or far-past dates — use Selects or a masked Input. |
| Type = Range | `mode="range"` | A start and end date, e.g. a stay or a report period. | Two unrelated dates — use two single Datepickers. |

**Use** for picking dates near "now". **Don't** for birthdays/far-past dates (Selects or masked Input) or month-only values (Month/Year picker variant).
A11y: the calendar is a `role="dialog"` holding a `role="grid"` of days; arrow keys move between days and Enter selects; today is `aria-current` and the chosen day `aria-selected`; month changes are announced through `aria-live`.

## Timepicker
Figma: page `1149:52187` · input `1149:52243` (Default, Left add-on, Right add-on × sizes × states) · form `1149:52636` · menus `1149:52665` · template `templates/components/Timepicker.tsx`
API: `<TimeInput size status addon="start|end">` · `<TimeSlots slots value onChange unavailable label title columns>`.
Input = Input field shell + clock icon (`text-body-subtle`; focus `text-fg-brand`; filled `text-heading`). Add-on variants join a `bg-neutral-tertiary` icon segment. Menu = `rounded-base border border-default-medium bg-neutral-primary-medium p-4 gap-4 shadow-lg`; slot list items `text-base font-semibold leading-4 text-heading`, selected slot `bg-brand text-white rounded-base`; advanced menus add a header row (`text-sm font-semibold text-heading`, `pb-3 border-b border-default-medium`), OTP-style hour/minute boxes (`OtpInput sm`) and Tertiary/Brand `sm` actions.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<TimeInput>` | One time of day in a form. | Durations — use NumberInput with a unit Select. |
| Type = Inline | `compose: <Label> beside <TimeInput>` | Settings rows, e.g. quiet hours start. | Stacked forms — use Default. |
| Type = With Dropdown | `compose: <TimeSlots> in a Popover` | Booking from a fixed set of available slots. | Any time is allowed — use Default. |
| Type = With button | `compose: <TimeInput> + <Button>` | A time confirmed by its own action, e.g. Set reminder. | The time is one field in a larger form — use Default. |
| Type = With select | `compose: <TimeInput> + <Select>` | A time that needs a time zone or similar qualifier. | Only one time zone applies — use Default. |
| Type = Range | `compose: 2 × <TimeInput>` | Start and end times, e.g. opening hours or a meeting. | The range spans several days — use Datepicker Range. |

**Use** for times of day or slot booking. **Don't** for durations (NumberInput + unit Select). Prefer native `type="time"` when slot UI isn't required.
A11y: the fields are grouped in a `fieldset` with a `legend`; each field has a label; errors set `aria-invalid`.

## Autocomplete
Figma: page `1149:53107` · examples `1149:53126` · menu `1149:53147` (Default, CTA, With save option, Advanced, Buttons & categories) · item `1149:53218` (5 types × Initial/Hover/Disabled) · template `templates/components/Autocomplete.tsx`
API: `<Autocomplete options={[{value,label,description,icon,group,disabled}]} value onChange footer size>`.
- Menu = Dropdown menu shell: `rounded-base border border-default-medium bg-neutral-primary-medium p-2 gap-1.5 shadow-lg` (Advanced `gap-1`, Categories `gap-2`).
- Group heading: `px-2.5 pt-2 text-sm font-semibold text-heading`.
- Item: `flex items-center gap-1.5 rounded px-2 py-1.5 text-sm font-medium leading-5 text-body`, icons `size-4 text-body`; hover `bg-neutral-tertiary-medium text-heading`; disabled `text-fg-disabled`. Bordered items add `border-b border-default`. Secondary text `text-xs text-body` (keeps 4.5:1 on the active fill). "Heading & description": title `text-sm font-medium text-heading`, description `text-sm text-body`, 36px icon.
- Category chips: Secondary `xs` Buttons; footer CTA Brand `xs`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `options={[{ value, label }]}` | Picking one item from a large or remote list by typing. | Fewer than 10 static options — use Select. |
| Type = User | `options` with `icon: <Avatar/>` | Picking people, e.g. an assignee, owner or reviewer. | The items are not people — use Default. |
| Type = Highlighted text | — (built in, no prop) | Long result lists where the matched text speeds up scanning. | Short static lists — use Select. |
| Type = Advanced with save | `footer={…}` | Users can create or save a new entry when nothing matches. | The list is closed — use Default. |
| Type = Advanced | `options` with `description` | Options need a second line to tell them apart, e.g. email or path. | Labels alone are distinct — use Default. |
| Type = Categories | `options` with `group` | Mixed result types, e.g. people, projects and files. | All results are one type — use Default. |

**Use** to pick from a large or remote list with typing. **Don't** for <10 static options (Select). Implement combobox ARIA (`role="combobox"`, `aria-expanded`, `aria-activedescendant`).
A11y: follows the combobox pattern: the input is `role="combobox"` with `aria-expanded`, `aria-controls` and `aria-activedescendant`; arrow keys move through the `listbox` options and Enter selects.

## RangeSlider
Figma: page `1149:54339` · examples `1149:54340` · helper `1149:54358` · bar `1149:54365` · thumb `1149:54373` · template `templates/components/RangeSlider.tsx`
API: `<RangeSlider value={n | [lo, hi]} onChange min max step label showMinMax startIcon endIcon formatValue>`.
- Track `h-2 w-full rounded-base bg-neutral-quaternary`; filled part `rounded-base bg-brand`.
- Thumb `size-5 rounded-full border border-default-medium bg-neutral-primary-medium shadow-md`; active/dragging `border-brand`.
- Min/max labels & helper `text-sm font-medium text-body`; optional side icons `size-6 text-body`; value Tooltip above the thumb.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `value={n}` | One approximate value in a bounded range, e.g. volume or radius. | An exact number is needed — use NumberInput. |
| Type = Range | `value={[lo, hi]}` | An approximate min–max filter, e.g. a price range. | Exact bounds are needed — use NumberInput Range. |

**Use** for approximate values in a bounded range. **Don't** when an exact number is needed (NumberInput) or for more than two thumbs.
A11y: each thumb is `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`; arrow keys step the value; every thumb needs an `aria-label`.

## Toggle
Figma: page `1149:54431` · switches `1149:54432` · inputs `1149:54457` · label `1149:54502` · helper `1149:54510` · group `1149:54513` · template `templates/components/Toggle.tsx`

| Size | Track | Knob |
|---|---|---|
| base | `w-9 h-5` | `size-4` |
| lg | `w-11 h-6` | `size-5` |
Off: track `bg-neutral-tertiary-medium border border-default-strong`, knob `bg-white shadow-xs`. On: `bg-brand border-brand-light`. Focus: `shadow-focus-brand`. Disabled: `bg-neutral-tertiary-medium border-light-medium`, knob `bg-neutral-secondary-soft`.
Toggle inputs: label `text-sm font-medium text-heading` + helper `text-xs leading-4 text-body`, `gap-2` (Left & Right label: `gap-3`). "Simple card" / "Advanced with icon": card `rounded-base border border-default bg-neutral-primary-soft p-4 gap-2.5 shadow-xs` (wide variants `gap-16`). "Advanced"/"Only icons" are **segmented controls**: `rounded-base bg-neutral-tertiary-medium p-1.5 gap-0.5`, segment `rounded-sm px-2 py-1 text-xs font-medium text-body`, selected segment `bg-neutral-primary-medium text-heading rounded` (use `Tabs variant="segmented"` semantics). Groups stack items `gap-4`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Size = base | `size="base"` | Default for settings lists, cards and table rows. | Touch-first or stand-alone settings — use lg. |
| Size = lg | `size="lg"` | Touch-first or prominent stand-alone settings. | Dense lists and table rows — use base. |

**Use** for settings that apply immediately. **Don't** inside forms submitted later (Checkbox), for choosing between named options (Tabs/Radio), or for actions. `role="switch"` + `aria-checked`.
A11y: `role="switch"` with `aria-checked`; the visible label is the accessible name and is clickable; Space toggles it.

## Checkbox and Radio
Figma: page `1149:54696` · inputs `1149:54707` · template `templates/components/Checkbox.tsx`
Box `size-4 border border-default-strong bg-neutral-secondary-strong` — checkbox `rounded-xs`, radio `rounded-full`. Checked checkbox `bg-brand border-brand` + white check; checked radio `border-brand` + dot `size-2 bg-brand`. Focus `shadow-focus-brand`. Disabled `border-light` (checked radio dot `bg-neutral-quaternary`). Label `text-sm font-medium leading-4 text-heading` with `gap-2.5` to the box; description `text-sm text-body`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Checkbox input | `<Checkbox>` | Independent opt-ins, consent and multi-select lists in a form. | Settings that apply immediately — use Toggle. |
| Type = Radio input | `<Radio>` | Exactly one of 2–5 visible options, grouped in a fieldset. | 6 or more options — use Select. |

**Checkbox — use** for independent opt-ins, multi-select lists, consent. **Don't** for mutually exclusive options or instant settings.
**Radio — use** for one of 2–5 visible options. **Don't** for 6+ options (Select).
**Use** for opt-ins inside a form that is submitted later, and for picking several items from a list (radios: exactly one of a few).
A11y: real `<input>` elements inside a `<label>`; group radios in a `fieldset` with a `legend`; never show the checked state with colour alone.

## ChoiceCard
Figma: `1149:54726` "Checkbox/Radio form" (18 types × Initial/Hover/Checked) · groups `1149:55022` (10 types) · template `templates/components/ChoiceCard.tsx`
API: `<ChoiceCard type="radio|checkbox" variant="card|bordered|chip|circle" title description icon trailing>` inside `<ChoiceGroup label columns>`.

| Type | Shell (Initial → Checked) |
|---|---|
| Left checkbox card, Icon & text, With side icon & text, Box icon & logo, Icon & toggle, Advanced, Advanced (Radio inputs) | `rounded-base border border-default bg-neutral-primary-soft p-4 gap-2.5 shadow-xs` → `bg-brand-softer border-brand-subtle` (text/icons `text-fg-brand-strong`) |
| Bordered left input | same → only `border-brand` |
| Simple (chip) | `rounded-base border px-3 py-2 shadow-xs` same colors |
| Only icon / Only text | `size-9 rounded-full border border-default bg-neutral-primary-soft` → `bg-brand-softer border-brand-subtle text-fg-brand-strong` |
| Color swatch | `size-8 rounded` filled with the color; checked shows white check icon |
| Payment | card `p-4 rounded-base border-default`, logo, text `text-base text-body`, title `text-base font-medium text-heading` |
| With helper / Default / Rating / Dots & text | plain rows (`gap-2.5`), no card |

Groups stack items `gap-4` (grid variants use `grid gap-4`).

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `compose: <ChoiceGroup>` of plain rows | A labelled group of plain choice rows without cards. | Options need description or visuals — use Left checkbox card. |
| Type = Left checkbox card | `variant="card" type="checkbox"` | Multi-select options with title and description, e.g. add-ons. | Short simple labels — use Checkbox. |
| Type = Icon & text | `variant="card" icon={…}` | Options recognised by an icon, e.g. device or channel. | Icons add no meaning — use Left checkbox card. |
| Type = With side icon & text | `compose: variant="card" trailing={…}` | Cards with a trailing icon or detail, e.g. price or status. | Nothing to show at the end — use Icon & text. |
| Type = Advanced | `variant="card"` with `description` | Rich options with title, description and detail, e.g. plans. | Short labels — use Simple. |
| Type = Simple | `variant="chip"` | Short choices in a row, e.g. sizes or filters. | Options need description — use Left checkbox card. |
| Type = Only Icon | `variant="circle"` + `aria-label` | Icon-only choices with an obvious meaning, e.g. text alignment. | Icons are ambiguous — use Icon & text. |
| Type = Box icon & logo | `compose: variant="card" icon={logo}` | Brand or provider choices, e.g. integrations. | No brand is involved — use Icon & text. |
| Type = With helper | `compose: plain rows + description` | Radio or checkbox rows that need a one-line explanation. | Options need visuals or emphasis — use Left checkbox card. |
| Type = Advanced (Radio inputs) | `variant="card" type="radio"` | Exactly one detailed option, e.g. plan or shipping speed. | Several can be chosen — use Left checkbox card. |
| Type = Only text | `variant="circle"` | Very short values, e.g. sizes S, M, L or a count. | Labels are longer than 2–3 characters — use Simple. |
| Type = Icons & text | `compose: <ChoiceGroup columns>` of icon cards | A grid of icon-and-label cards, e.g. picking a category. | Options need descriptions — use Icon & text. |
| Type = Color | `compose: colour swatch` + `aria-label` | Picking a product or theme colour, each named for screen readers. | The value is not a colour — use Only text. |
| Type = Rating | `variant="circle"` | Picking a score on a short numeric scale, e.g. 1–5 or NPS. | Showing or picking stars — use Rating. |
| Type = Dots & text | `compose: plain rows + status dot` | Options marked by a coloured dot plus text, e.g. priority. | The dot would be the only cue — use With helper. |
| Type = Payment | `compose: variant="card" icon={card logo}` | Choosing a payment method with brand and card details. | Entering new card details — use Input fields. |
| Type = Icon & toggle | `compose: variant="card" trailing={<Toggle/>}` | Setting cards whose switch applies immediately. | Inside a form submitted later — use Left checkbox card. |
| Type = Bordered left input | `variant="bordered"` | Lighter card lists where only the border marks the choice. | Selection needs strong emphasis — use Left checkbox card. |

**Use** when options need description or visuals (plans, payment, shipping). **Don't** for short simple labels. The whole card is the `<label>` around a real input.
A11y: real radio or checkbox inputs inside a `fieldset` with a `legend`; the whole card is the label, so clicking anywhere selects it.

