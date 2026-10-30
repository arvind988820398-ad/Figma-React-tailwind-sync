# Actions

All components here are **spec verified** (2026-10-26).

## Button
Figma: page `2542:21012` · set `1146:24616` "Button" (8 colors × 5 sizes × 4 states × icon-only × outline × logo) · template `templates/components/Button.tsx`

### API
```tsx
<Button color="brand" size="base" leftIcon={<PlusIcon />}>Create project</Button>
<Button color="secondary" iconOnly aria-label="Settings"><CogIcon /></Button>
<Button color="danger" outline>Delete</Button>
```
| Figma property | Prop | Values |
|---|---|---|
| Color | `color` | `brand` (default) · `secondary` · `tertiary` · `success` · `danger` · `warning` · `dark` · `ghost` |
| Size | `size` | `xs` · `sm` · `base` (default) · `lg` · `xl` |
| Outline | `outline` | boolean — **only** with `success`, `danger`, `warning` (enforced by the TypeScript types) |
| Icon only | `iconOnly` | boolean — square, requires `aria-label` |
| Show left/right icon | `leftIcon`, `rightIcon` | ReactNode |
| Logo inside | `logo` | ReactNode (brand/social logo button) |
| State | — | CSS: `:hover`, `:focus-visible`, `:disabled` |

### Recipe
Base: `inline-flex items-center justify-center gap-1.5 rounded-base font-medium shadow-xs transition-colors focus-visible:outline-none disabled:pointer-events-none`

| Size | Classes | Height | Icon |
|---|---|---|---|
| xs | `px-3 py-1.5 text-xs leading-5` | 32 | `size-3.5` |
| sm | `px-3 py-2 text-sm leading-5` | 36 | `size-4` |
| base | `px-4 py-2.5 text-sm leading-5` | 40 | `size-4` |
| lg | `px-5 py-3 text-base leading-6` | 48 | `size-4` |
| xl | `px-6 py-3.5 text-base leading-6` | 52 | `size-5` |
| iconOnly | `p-0 size-8/9/10/12/13`, icon `size-4`–`size-5` | square | |

| Color | Initial | Hover | Focus-visible |
|---|---|---|---|
| brand | `bg-brand text-white` | `bg-brand-strong` | `bg-brand-strong shadow-focus-brand` |
| secondary | `bg-neutral-secondary-medium border border-default-medium text-body` | `bg-neutral-tertiary-medium text-heading` | `shadow-focus-secondary` |
| tertiary | `bg-neutral-primary-soft border border-default text-body` | `bg-neutral-secondary-medium text-heading` | `bg-neutral-secondary-soft shadow-focus-secondary` |
| success / danger / warning / dark | `bg-{c} text-white` | `bg-{c}-strong` | `shadow-focus-{c}` |
| ghost | `bg-transparent text-heading shadow-none` | `bg-neutral-secondary-medium` | `bg-neutral-secondary-medium shadow-focus-secondary` |
| success / danger / warning + outline | `bg-transparent border border-{c} text-fg-success` / `text-fg-danger` / `text-fg-warning-subtle` | `bg-{c}-strong text-white` | `shadow-focus-{c}` |

Disabled (all but ghost): `bg-disabled border border-default-medium text-fg-disabled`; ghost: `text-fg-disabled`.

**When to use**: any action that changes state, submits, opens an overlay or starts a flow. **One `brand` button per section**; `secondary`/`tertiary` for the rest; `danger` for destructive confirmations; `ghost` in toolbars, rows, card headers; `dark` on light marketing sections; `iconOnly` for universal icons with `aria-label` + Tooltip.
**When not to use**: navigation (use a link, or `<a className={buttonVariants({...})}>`); status display (Badge); view switching (Tabs/ButtonGroup); two `brand` buttons side by side; `success`/`warning` for ordinary primary actions; outline on brand/secondary/dark (use `tertiary`).
A11y: `type="button"` by default; loading = keep width, `Spinner size="sm"`, `aria-busy` + `disabled`; prefer `base`+ on touch.

## Button group
Figma: page `1149:31693` · set `1149:31694` (xs/sm/base/lg × Gray/White) · examples `1149:31799` (12 types) · template `templates/components/ButtonGroup.tsx`
API: `<ButtonGroup color="gray|white" size vertical label>` + `<ButtonGroupItem active iconOnly>`.
A joined row of Buttons: Figma "Gray" = **Secondary** buttons, "White" = **Tertiary** buttons, same size scale; items overlap by 1px (`-space-x-px`), first `rounded-e-none`, last `rounded-s-none`, middle `rounded-none`; the group carries `shadow-xs` (items `shadow-none`). The selected item uses the Tertiary Hover style (`bg-neutral-secondary-medium text-heading`). Vertical: `flex-col -space-y-px`, ends `rounded-b-none`/`rounded-t-none`. Example types: icon buttons (36px, `text-body`, active `text-heading`), Plus & minus, Numbers (pager), With dropdown button, With badge, Start CTA, Icon button + Info.
**Use** for 2–5 closely related actions or a compact view switcher. **Don't** for unrelated actions, primary CTAs, or >5 options. If it switches content panels, use `Tabs variant="segmented"` for ARIA.
A11y: the wrapper is `role="group"` with an `aria-label`; toggle groups set `aria-pressed` on each button; icon-only items need an `aria-label`.

## Speed dial
Figma: page `14231:74723` · examples `1149:84847` (Default, Rounded, Menu, Article dropdown menu × Top/Bottom/Right/Left) · item `1149:84896` (4 types × Initial/Hover/Disabled × Rounded × Horizontal) · menus `1149:84972` (Vertical, Horizontal, Dropdown menu) · template `templates/components/SpeedDial.tsx`
API: `<SpeedDial actions={[{label,icon,onSelect,disabled}]} variant="default|rounded|menu|dropdown" direction fixed>`.
- Trigger: Brand `xl` icon-only Button (52px, `rounded-base`); "Rounded" examples use round items.
- Menu: `flex flex-col gap-2` (Horizontal `flex-row`), opening toward the Position; container `p-1 gap-3` with the trigger.
- Item (Default): `size-12 rounded-base` (Rounded: `rounded-full`) `border border-default bg-neutral-primary shadow-xs` + icon `size-6 text-body`; hover `bg-neutral-tertiary text-heading` (+ Tooltip label to the side); disabled icon `text-fg-disabled`.
- Text & icon item: `size-14` with label `text-xs font-medium leading-3 text-body` under the icon. Outside text: item + label beside it `gap-2.5`.
- Dropdown menu type: Dropdown shell (`p-2 gap-1.5 shadow-lg`) with "Icon & text" rows `rounded p-2 gap-1.5 text-sm font-medium leading-none text-body`, icon `size-4`.
- Place `fixed end-6 bottom-6 z-40`.

**Use** on mobile-first or canvas-like screens for 3–6 creation actions. **Don't** on dense desktop pages with a toolbar, for navigation, or for a single action.
A11y: the trigger has an `aria-label`, `aria-expanded` and `aria-controls`; every action needs a visible label, tooltip or `aria-label`.

## Download app button
Figma: set `1146:24595` (Google Play / AppStore × Light / Dark). Store badge link: `inline-flex items-center gap-3 rounded-base px-4 py-2.5` — Dark `bg-dark text-white hover:bg-dark-strong`; Light `bg-neutral-primary-soft border border-default text-heading hover:bg-neutral-secondary-medium`. Only for store links (`<a>`). · template `templates/components/DownloadAppButton.tsx`
API: `<DownloadAppButton store="app-store|google-play" tone="dark|light" href>`.
**Use** for App Store and Google Play badges on marketing and landing pages. **Don't** for in-app actions (Button) or ordinary links.
A11y: it is a link; the store name is visible text and the logo is decorative (`aria-hidden`).

