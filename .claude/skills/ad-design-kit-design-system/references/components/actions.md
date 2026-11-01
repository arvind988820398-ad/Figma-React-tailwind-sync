# Actions

All components here are **spec verified** (2026-10-26).

## Button
Figma: page `2542:21012` · set `1146:24616` "Button" (8 colors × 5 sizes × 4 states × icon-only × outline × logo) · template `templates/components/Button.tsx`

### API
```tsx
<Button color="brand" size="base" leftIcon={<PlusIcon />}>Create project</Button>
<Button color="secondary" iconOnly aria-label="Settings"><CogIcon /></Button>
<Button color="danger" outline>Delete</Button>
<Button color="secondary" logo={<GithubLogo />} aria-label="Sign in with GitHub" />
```
| Figma property | Prop | Values |
|---|---|---|
| Color | `color` | `brand` (default) · `secondary` · `tertiary` · `success` · `danger` · `warning` · `dark` · `ghost` |
| Size | `size` | `xs` · `sm` · `base` (default) · `lg` · `xl` |
| Outline | `outline` | boolean — **only** with `success`, `danger`, `warning` (enforced by the TypeScript types) |
| Icon only | `iconOnly` | boolean — square, requires `aria-label` |
| Show left/right icon | `leftIcon`, `rightIcon` | ReactNode |
| Logo inside | `logo` | ReactNode — a brand logo in a square button (Secondary, Tertiary or Ghost in Figma); needs `aria-label` |
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
| iconOnly | `p-0 size-8/9/10/11/12` | square 32/36/40/44/48 | `size-3.5` (xs) · `size-4` (sm) · `size-5` (base–xl) |
| logo | `p-0 size-8/9/10/11/12`, logo `size-5` (xs, sm) · `size-7` (base, lg) · `size-8` (xl), disabled logo `opacity-35` | square | |

| Color | Initial | Hover | Focus-visible |
|---|---|---|---|
| brand | `bg-brand text-white` | `bg-brand-strong` | `bg-brand-strong shadow-focus-brand` |
| secondary | `bg-neutral-secondary-medium border border-default-medium text-body` | `bg-neutral-tertiary-medium text-heading` | `shadow-focus-secondary` |
| tertiary | `bg-neutral-primary-soft border border-default text-body` | `bg-neutral-secondary-medium text-heading` | `bg-neutral-secondary-soft shadow-focus-secondary` |
| success / danger / warning / dark | `bg-{c} text-white` | `bg-{c}-strong` | `shadow-focus-{c}` |
| ghost | `bg-transparent text-heading shadow-none` | `bg-neutral-secondary-medium` | `bg-neutral-secondary-medium shadow-focus-secondary` |
| success / danger / warning + outline | `bg-transparent border border-{c} text-fg-success` / `text-fg-danger` / `text-fg-warning-subtle` | `bg-{c}-strong text-white` | `shadow-focus-{c}` |

Disabled (all but ghost): `bg-disabled border border-default-medium text-fg-disabled`; ghost: `text-fg-disabled`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Color = Brand | `color="brand"` | The single primary action of a section, such as Save or Create project | A second action next to another Brand button — use Secondary instead |
| Color = Secondary | `color="secondary"` | Supporting actions beside the primary one, such as Cancel or Export | The main call to action of the section — use Brand instead |
| Color = Tertiary | `color="tertiary"` | Low-emphasis actions on light surfaces and outlined-style buttons | Actions inside toolbars or table rows — use Ghost instead |
| Color = Success | `color="success"` | Confirming a positive outcome, such as Approve or Mark as done | Ordinary primary actions — use Brand instead |
| Color = Danger | `color="danger"` | Destructive actions such as Delete; pair with a confirmation Modal | Reversible or neutral actions — use Secondary instead |
| Color = Warning | `color="warning"` | Actions with risky but recoverable side effects, such as Override or Force sync | Ordinary primary actions — use Brand; irreversible actions — use Danger |
| Color = Dark | `color="dark"` | High-contrast CTAs on light marketing sections | In-app forms and dialogs — use Brand or Secondary instead |
| Color = Ghost | `color="ghost"` | Toolbars, table rows, card headers and other dense repeated actions | Standalone actions that must be found quickly — use Secondary instead |
| Size = xs | `size="xs"` | Dense tables, chips and compact toolbars (32px) | Touch targets or forms — use base or larger |
| Size = sm | `size="sm"` | Card footers, filters and secondary toolbars (36px) | Primary touch actions on mobile — use base or larger |
| Size = base | `size="base"` | Default for forms, dialogs and page actions (40px) | Hero sections where the CTA must dominate — use lg or xl |
| Size = lg | `size="lg"` | Prominent CTAs in landing sections and empty states (48px) | Dense app screens — use base instead |
| Size = xl | `size="xl"` | Hero CTAs and the Speed dial trigger (52px) | Inside forms, cards or dialogs — use base instead |
| Icon only = False | `children` text label | Any action whose meaning needs words | — |
| Icon only = True | `iconOnly` + `aria-label` | Universal icons such as Close, Settings or More in tight spaces; add a Tooltip | Actions without a widely understood icon — keep a text label |
| Outline = False | — | Default filled buttons for every color | — |
| Outline = True | `outline` | Lower-emphasis Success, Danger or Warning actions, such as a secondary Remove | Brand, Secondary or Dark buttons — use Tertiary instead |
| Logo inside = False | — | All ordinary actions | — |
| Logo inside = True | `logo={<Logo />}` | Sign in with a third-party provider or brand-specific actions | Store download links — use Download app button; generic icons — use leftIcon |

**When to use**: any action that changes state, submits, opens an overlay or starts a flow. **One `brand` button per section**; `secondary`/`tertiary` for the rest; `danger` for destructive confirmations; `ghost` in toolbars, rows, card headers; `dark` on light marketing sections; `iconOnly` for universal icons with `aria-label` + Tooltip.
**When not to use**: navigation (use a link, or `<a className={buttonVariants({...})}>`); status display (Badge); view switching (Tabs/ButtonGroup); two `brand` buttons side by side; `success`/`warning` for ordinary primary actions; outline on brand/secondary/dark (use `tertiary`).
A11y: `type="button"` by default; loading = keep width, `Spinner size="sm"`, `aria-busy` + `disabled`; prefer `base`+ on touch.

## Button group
Figma: page `1149:31693` · set `1149:31694` (xs/sm/base/lg × Gray/White) · examples `1149:31799` (12 types) · template `templates/components/ButtonGroup.tsx`
API: `<ButtonGroup color="gray|white" size vertical label>` + `<ButtonGroupItem active iconOnly>`.
A joined row of Buttons: Figma "Gray" = **Secondary** buttons, "White" = **Tertiary** buttons, same size scale; items overlap by 1px (`-space-x-px`), first `rounded-e-none`, last `rounded-s-none`, middle `rounded-none`; the group carries `shadow-xs` (items `shadow-none`). The selected item uses the Tertiary Hover style (`bg-neutral-secondary-medium text-heading`). Vertical: `flex-col -space-y-px`, ends `rounded-b-none`/`rounded-t-none`. Example types: icon buttons (36px, `text-body`, active `text-heading`), Plus & minus, Numbers (pager), With dropdown button, With badge, Start CTA, Icon button + Info.
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Size = xs | `size="xs"` | Compact toolbars and table headers | Touch interfaces — use base or larger |
| Size = sm | `size="sm"` | Filters and secondary toolbars next to sm controls | Primary page controls on mobile — use base |
| Size = base | `size="base"` | Default for view switchers and pagers alongside base inputs | Dense table toolbars — use sm or xs |
| Size = lg | `size="lg"` | Prominent switchers on marketing or pricing pages | Dense app screens — use base |
| Color = Gray | `color="gray"` | Groups on white surfaces where the items need a visible fill | Groups on gray surfaces where contrast is low — use White |
| Color = White | `color="white"` | Low-emphasis groups and groups placed on tinted surfaces | Groups that should read as filled controls — use Gray |

**Use** for 2–5 closely related actions or a compact view switcher. **Don't** for unrelated actions, primary CTAs, or >5 options. If it switches content panels, use `Tabs variant="segmented"` for ARIA.
A11y: the wrapper is `role="group"` with an `aria-label`; toggle groups set `aria-pressed` on each button; icon-only items need an `aria-label`.

## Speed dial
Figma: page `14231:74723` · examples `1149:84847` (Default, Rounded, Menu, Article dropdown menu × Top/Bottom/Right/Left) · item `1149:84896` (4 types × Initial/Hover/Disabled × Rounded × Horizontal) · menus `1149:84972` (Vertical, Horizontal, Dropdown menu) · template `templates/components/SpeedDial.tsx`
API: `<SpeedDial actions={[{label,icon,onSelect,disabled}]} variant="default|rounded|menu|dropdown" direction fixed defaultOpen>`.
- Trigger: Brand `xl` icon-only Button (48px, `rounded-base`; Rounded `rounded-full`) with the plus icon; open = `bg-brand-strong` (Figma State=Focus).
- Layout: container `inline-flex gap-3 p-1`, menu opening toward the Position and lined up with the trigger's end edge (`items-end`).
- Default / Rounded: `flex flex-col gap-2` (Left/Right `flex-row`) of items `size-12 rounded-base` (Rounded: `rounded-full`) `border border-default bg-neutral-primary shadow-xs` + icon `size-6 text-body`; hover `bg-neutral-tertiary text-heading` + Tooltip label to the side; disabled icon `text-fg-disabled`.
- Menu / Article dropdown menu: Dropdown shell `w-32` (Menu) or `w-44` (Article) `rounded-base border border-default-medium bg-neutral-primary-medium p-2 gap-1.5 shadow-lg` with "Icon & text" rows `rounded p-2 gap-1.5 text-sm font-medium leading-none text-body`, icon `size-4`, hover `bg-neutral-tertiary-medium text-heading`.
- The item part's "Text & icon" and "Outside text" types are not used by the Figma examples; code does not render them.
- `defaultOpen` starts the dial open (docs and previews, as Figma draws it).
- Place `fixed end-6 bottom-6 z-40`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | Square icon actions with tooltip labels, matching rectangular Buttons | Interfaces with round controls — use Rounded |
| Type = Rounded | `variant="rounded"` | Round trigger and items on mobile or playful interfaces | Screens where controls are rectangular — use Default |
| Type = Menu | `variant="menu"` | Actions whose icons are not self-explanatory; a compact menu with an icon and label per row | Long labels — use Article dropdown menu |
| Type = Article dropdown menu | `variant="dropdown"` | Longer action lists with text labels, such as article share or edit actions | Three or fewer universal icon actions — use Default |
| Position = Top | `direction="top"` | Trigger fixed at the bottom of the screen; actions open upward | Trigger near the top edge — use Bottom |
| Position = Bottom | `direction="bottom"` | Trigger near the top of the viewport; actions open downward | Bottom-anchored triggers — use Top |
| Position = Right | `direction="right"` | Trigger at the left edge with free horizontal space | Narrow mobile screens — use Top |
| Position = Left | `direction="left"` | Trigger at the right edge with free horizontal space | Narrow mobile screens — use Top |

**Use** on mobile-first or canvas-like screens for 3–6 creation actions. **Don't** on dense desktop pages with a toolbar, for navigation, or for a single action.
A11y: the trigger has an `aria-label`, `aria-expanded` and `aria-controls`; opening moves focus to the first available action, arrow keys and Home/End move between actions, Esc closes and returns focus; every action needs a visible label, tooltip or `aria-label`.

## Download app button
Figma: set `1146:24595` (Google Play / AppStore × Light / Dark). Store badge link: `inline-flex items-center gap-2 rounded-base border px-4 py-3`, glyph `size-7`, `text-xs leading-3` line over a `text-sm font-bold` store name — Dark `bg-dark border-dark-subtle text-white hover:bg-dark-strong`; Light `bg-neutral-primary-medium border-default-medium text-body hover:bg-neutral-secondary-medium`. Only for store links (`<a>`). · template `templates/components/DownloadAppButton.tsx`
API: `<DownloadAppButton store="app-store|google-play" tone="dark|light" href>`.
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Device = Google Play | `store="google-play"` | Linking to the Android app on Google Play | iOS links — use AppStore |
| Device = AppStore | `store="app-store"` | Linking to the iOS app on the App Store | Android links — use Google Play |
| Type = Light | `tone="light"` | Dark or colored backgrounds, or pages where many dark blocks already compete | Plain white sections where the badge must stand out — use Dark |
| Type = Dark | `tone="dark"` | Default on light backgrounds; matches official store badge styling | Dark backgrounds where it loses contrast — use Light |

**Use** for App Store and Google Play badges on marketing and landing pages. **Don't** for in-app actions (Button) or ordinary links.
A11y: it is a link; the store name is visible text and the logo is decorative (`aria-hidden`).

