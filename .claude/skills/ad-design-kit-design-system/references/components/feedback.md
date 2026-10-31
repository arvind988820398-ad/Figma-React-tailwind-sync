# Feedback & status

All components here are **spec verified** (2026-10-26).

Status vocabulary shared by Alert, Toast, Badge, Input states and Progress:

| Status | Soft surface | Foreground on soft | Solid fill |
|---|---|---|---|
| neutral / gray | `bg-neutral-secondary-medium border-default-medium` | `text-heading` | `bg-dark` / `bg-gray` |
| info / brand | `bg-brand-softer border-brand-subtle` | `text-fg-brand-strong` | `bg-brand` |
| success | `bg-success-soft border-success-subtle` | `text-fg-success-strong` | `bg-success` |
| warning | `bg-warning-soft border-warning-subtle` | `text-fg-warning` | `bg-warning` |
| danger | `bg-danger-soft border-danger-subtle` | `text-fg-danger-strong` | `bg-danger` |

## Alert
Figma: page `3284:18927` · set `1146:15151` (4 types × 5 colors) · template `templates/components/Alert.tsx`

| Figma | Prop | Values |
|---|---|---|
| Color | `color` | `neutral` (Figma "Default") · `info` · `success` · `warning` · `danger` |
| Type | `variant` | `default` · `complex` · `pill` (Figma "Small") · `border-top` |
| Heading / Body text | `title` / `children` | |
| Show left / right icon | `icon` / `onDismiss` | |

Recipe: `flex items-start gap-3 rounded-base border p-4 text-sm leading-5` + status surface + foreground; icon `size-4`. Complex: title `text-base font-medium`, body `text-sm`, actions `mt-3 flex gap-2` (xs Buttons). Pill: `inline-flex items-center gap-2 rounded-full border py-1 ps-1 pe-2` with a leading solid chip `text-xs font-medium`. Border-top: `rounded-none border-0 border-t-4`.
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `variant="default"` | A one- or two-line message with an optional icon and dismiss. | The message needs a heading or actions; use Complex. |
| Type = Complex | `variant="complex"` | The message needs a title, body text and up to two xs actions. | The user must decide before continuing; use Modal. |
| Type = Small | `variant="pill"` | A compact inline notice of a few words, such as beside a form header. | The text wraps beyond one line; use Default. |
| Type = Border top | `variant="border-top"` | A full-width message along the top edge of a card or section. | Site-wide announcements; use Banner. |
| Color = Default | `color="neutral"` | Neutral context such as tips or notes with no status meaning. | The message reports success, a risk or an error; use that status color. |
| Color = Info | `color="info"` | Helpful information or a change the user should know about. | Decorative highlighting with no message; use Default or no alert. |
| Color = Success | `color="success"` | A persistent positive state, such as account verified. | A transient confirmation of an action just taken; use Toast. |
| Color = Warning | `color="warning"` | A risk or pending issue the user should address soon. | Something has already failed; use Danger. |
| Color = Danger | `color="danger"` | An error or blocking problem the user must fix; pair with an icon and clear text. | Mild cautions or reminders; use Warning. |

**Use** for persistent messages tied to a page/section (validation summary, account status, offline). **Don't** for transient confirmations (Toast), blocking decisions (Modal), site-wide announcements (Banner), or more than 2 stacked alerts.
A11y: `role="alert"` only for urgent dynamic errors; otherwise `role="status"`.

## Toast
Figma: page `3337:16705` · set `1149:93975` (9 types) · template `templates/components/Toast.tsx`
API: `<Toast color icon title header actions onDismiss duration>` inside `<ToastViewport>`.

| Figma Type | Recipe |
|---|---|
| Icon & text | `flex items-center gap-2.5 w-80 rounded-base border border-default-medium bg-neutral-primary-medium p-4 shadow-lg text-sm text-body`; leading icon `size-5 text-fg-brand`, close 32px Ghost icon button `text-heading` |
| Icon shape & text | as above with `IconShape size="base"` (e.g. success) |
| Icon shape & buttons / With progress bar / With illustration | `p-4`, title `text-base font-semibold leading-4 text-heading`, body `text-sm text-body`, `gap-3`–`3.5`, actions Brand `xs` + Secondary `xs`; progress variant adds `Progress labelPosition="side"` |
| Avatar & button | `p-4`, avatar 32px, title `text-base font-semibold leading-6 text-heading`, Brand `xs` action |
| With header | `p-3 gap-4`; header row `text-sm font-medium text-heading` + timestamp `text-xs text-fg-brand`; body title `text-base font-semibold`, text `text-sm text-body` |
| Warning | `bg-warning-soft border-warning-subtle shadow-lg p-4`; title/body/icon `text-fg-warning`; actions Warning `xs` outline + solid |
| Error | `bg-danger-soft border-danger-subtle shadow-lg p-4`; text/icon `text-fg-danger-strong`; actions Danger `xs` outline + solid |

Stack: `fixed bottom-5 end-5 z-60 flex flex-col gap-3` (or top-end; one placement app-wide).
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Icon & text | `icon` + `children` | A one-line confirmation of an action, such as "Message sent". | The message needs a title or action; use Icon shape & buttons. |
| Type = Icon shape & text | `icon={<IconShape />}` | A one-line confirmation that needs a stronger status cue, such as success. | Errors the user must fix; use Alert. |
| Type = Icon shape & buttons | `title` + `actions` | A titled message with one action such as Undo or View. | More than one primary action; use Modal or Alert. |
| Type = Avatar & button | `icon={<Avatar />}` + `title` + `actions` | Notifications about a person, such as a new message or mention. | System messages with no person involved; use Icon & text. |
| Type = With header | `header={{ title, time }}` | App or channel notifications that need a source and a timestamp. | Simple action confirmations; use Icon & text. |
| Type = With progress bar | `children={<Progress labelPosition="side" />}` | A background task with known progress, such as an upload. | Unknown durations; use Spinner. |
| Type = With illustration | `children` with an illustration | Occasional feature or onboarding messages after an action. | Routine confirmations; use Icon & text. |
| Type = Warning | `color="warning"` | A non-blocking caution about an action just taken, such as a partial sync. | Problems the user must fix; use Alert with `color="warning"`. |
| Type = Error | `color="danger"` | A failed background action the user can retry from the toast. | Errors the user must fix to continue; use Alert or inline validation. |

**Use** for brief non-blocking feedback on an action just taken; auto-dismiss 4–6s, pause on hover. **Don't** for errors the user must fix, critical info, or more than one primary action.
A11y: `role="status" aria-live="polite"` (errors `assertive`), labelled dismiss.

## Badge
Figma: page `3283:24168` · set `1146:22250` (6 colors × 2 sizes × 5 types × icon/text-only) · template `templates/components/Badge.tsx`

| Figma | Prop | Values |
|---|---|---|
| Theme | `color` | `gray` · `white` · `brand` · `success` · `warning` · `danger` |
| Size | `size` | `sm` (20px) · `lg` (24px) |
| Type | `leading` | a dot `<span>` · `<Avatar size="xs">` · `<Spinner size="xs">`; "With secondary text" = two spans |
| Only icon / Only text | `iconOnly` / `circle` | round badge: `iconOnly` holds an icon and needs an `aria-label`; `circle` holds 1–2 characters |

Recipe: `inline-flex items-center rounded-sm border font-medium` · sm `gap-1 px-1 py-0.5 text-xs leading-4` (icon `size-3`) · lg `gap-1.5 px-1.5 py-1 text-sm leading-4` (icon `size-3.5`) · round `rounded-full p-0 size-5|6 text-xs`. Colors: gray `bg-neutral-secondary border-default-medium text-heading` · white `bg-neutral-primary-soft border-default text-heading` · brand `bg-brand-softer border-brand-subtle text-fg-brand-strong` · success `bg-success-soft border-success-subtle text-fg-success-strong` · warning `bg-warning-soft border-warning-subtle text-fg-warning` · danger `bg-danger-soft border-danger-subtle text-fg-danger-strong`.
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Theme = Gray | `color="gray"` | Neutral metadata, categories or counts with no status meaning. | The label conveys a status; use the matching status color. |
| Theme = White | `color="white"` | Neutral labels on tinted or gray surfaces where Gray blends in. | On white cards where it lacks contrast; use Gray. |
| Theme = Brand | `color="brand"` | Highlights such as "New", "Beta" or an active filter count. | Success, warning or error meanings; use the status colors. |
| Theme = Danger | `color="danger"` | Error, failed or overdue states, with text that names the state. | Items that only need attention; use Warning. |
| Theme = Warning | `color="warning"` | Pending, expiring or needs-attention states. | Something has failed; use Danger. |
| Theme = Success | `color="success"` | Completed, active, paid or healthy states. | Neutral counts or categories; use Gray. |
| Size = sm | `size="sm"` | Default; tables, lists, cards and next to body text. | Next to large headings; use lg. |
| Size = lg | `size="lg"` | Beside headings or in roomy page headers. | Dense tables or lists; use sm. |
| Type = Default | `<Badge>Label</Badge>` | A plain text label. | Live status that benefits from a dot; use With dot. |
| Type = With avatar | `leading={<Avatar size="xs" />}` | Labelling a person, such as an assignee or owner. | Labels not about a person; use Default. |
| Type = With dot | `leading={<span className="size-1.5 rounded-full bg-success" />}` | Live or ongoing status, such as Online or Active, alongside the text. | Static categories; use Default. |
| Type = With loader | `leading={<Spinner size="xs" />}` | A status that is in progress, such as Syncing or Processing. | Loading a whole region; use Spinner or Skeleton. |
| Type = With secondary text | two `<span>` children | A label plus a value, such as "Plan Pro" or "v2.1 Latest". | Long text or sentences; use plain text. |
| Only icon = False | `—` | The badge has a visible text label. | Space allows only a marker and the icon is self-explanatory; use Only icon = True. |
| Only icon = True | `iconOnly aria-label="…"` + icon child | A round icon-only status marker in tight space, with an aria-label. | The icon meaning is not obvious; use a text label. |
| Only text = False | `—` | Standard rectangular badge for words or longer values. | A one- or two-character counter; use Only text = True. |
| Only text = True | `circle` | A round counter of 1–2 characters, such as an unread count. | Text longer than 2 characters; use the standard badge. |

**Use** for 1–2 word status, category, count or "New". **Don't** as a clickable action, for sentences, or more than 2–3 per row.
A11y: plain text, so the label must make sense on its own ("3 unread", not "3"); never show status with colour alone.

## Progress
Figma: page `3283:24173` · labelled `1149:82279` (6 colors × Top/Side/Bottom label) · bars `1149:82364` (base/lg × 25–100) · template `templates/components/Progress.tsx`
Track `w-full rounded-base bg-neutral-quaternary` — `h-1.5` (base) / `h-2.5` (lg); fill `rounded-base` + `bg-brand` (Figma "Primary") · `bg-gray` · `bg-dark` · `bg-success` · `bg-danger` · `bg-warning`. Labels: `text-xs font-medium leading-4 text-body` for both the label and the value, `gap-1.5` to the bar (side label: same, inline).
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Color = Primary | `color="brand"` | Default for neutral progress such as uploads or step completion. | The value carries a status meaning; use Success, Warning or Danger. |
| Color = Gray | `color="gray"` | Low-emphasis bars, such as several secondary bars in one list. | The main progress on the page; use Primary. |
| Color = Dark | `color="dark"` | High-contrast neutral bars in stats or comparison lists. | Values with a status meaning; use the status colors. |
| Color = Success | `color="success"` | Completed or healthy values, such as a goal reached. | Ordinary in-progress tasks; use Primary. |
| Color = Danger | `color="danger"` | Over-limit or failed values, stated in the label too. | Values approaching a limit; use Warning. |
| Color = Warning | `color="warning"` | Values nearing a limit, such as 85% of storage used. | Normal progress; use Primary. |
| Type = Top label | `labelPosition="top"` | Default; a label and value sit above the bar. | Tight rows with little height; use Side label. |
| Type = Side label | `labelPosition="side"` | Compact rows, toasts and table cells that show only the value. | Long labels that squeeze the bar; use Top label. |
| Type = Bottom label | `labelPosition="bottom"` | The bar sits under a heading and the value reads as a caption. | Standard forms and cards; use Top label. |

**Use** for determinate progress (uploads, completion, quotas). **Don't** for unknown durations (Spinner/Skeleton) or ratings. `role="progressbar"` + `aria-valuenow/min/max`.
A11y: `role="progressbar"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow`; give it a visible label or an `aria-label`.

## Spinner
Figma: page `3284:24046` · set `1149:83311` (xs 12 · sm 24 · md 50 · lg 75 · xl 100 × Track) · interactive `1149:83298` · template `templates/components/Spinner.tsx`
SVG `animate-spin`: track `fill-neutral-quaternary` (omit when `track={false}`), arc `fill-brand`. Sizes: `xs size-3` · `sm size-6` · `md size-12.5` · `lg size-18.75` · `xl size-25`. In buttons use `xs`/`sm`.
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Size = xs | `size="xs"` | Inside xs and sm buttons, badges and inline text. | Loading a region; use md or larger. |
| Size = sm | `size="sm"` | Default; inside base and larger buttons and small widgets. | Full-page loading; use lg or xl. |
| Size = md | `size="md"` | Loading a card, panel or table region. | Inside buttons; use xs or sm. |
| Size = lg | `size="lg"` | Loading a large section or a modal body. | Small components; use sm or md. |
| Size = xl | `size="xl"` | Full-page or empty-screen loading only. | Anything smaller than a page; use md or lg. |
| Track = True | `track` | Default; the track gives the arc contrast on neutral surfaces. | Solid colored fills where the track looks muddy; use False. |
| Track = False | `track={false}` | On solid fills such as Brand buttons, where only the arc should show. | Neutral surfaces where the arc alone is hard to see; keep the track. |

**Use** for short waits where layout is unknown, or in-button loading. **Don't** for known layouts (Skeleton) or known progress (Progress). `role="status"` + sr-only label.
A11y: `role="status"` with screen-reader text ("Loading"); inside a button, also set `aria-busy` and `disabled` on the button.

## Skeleton
Figma: page `13251:80911` · set `1149:85600` (Card + Image, Image + Text, Text, List, Simple text, Widget) · template `templates/components/Skeleton.tsx`
API: `<Skeleton type="text|simple-text|image|card|list|widget">`; primitives `SkeletonLine`, `SkeletonMedia`.
Lines `h-2 rounded-full` — primary line `bg-gray`, secondary/meta line `bg-neutral-quaternary` (lines vary in width: full, ~85%, ~60%, ~25%). Media block `rounded-lg bg-gray` with a centered placeholder icon `fill-neutral-quaternary` (`size-5`). Lists: rows `py-2.5` with a short `bg-gray` title, `bg-neutral-quaternary` subtitle and a right-aligned value. Wrap in `animate-pulse`.
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Card + Image | `type="card"` | Loading a card with a media header, title and text. | Content without an image; use Text. |
| Type = Image + Text | `type="image"` | Loading a media block paired with a short text block. | Rows of a list; use List. |
| Type = Text | `type="text"` | Loading paragraphs or an article body. | One or two short lines; use Simple text. |
| Type = List | `type="list"` | Loading list or table rows with a title, subtitle and value. | Card grids; use Card + Image. |
| Type = Simple text | `type="simple-text"` | Loading a short block of a few lines, such as a description. | Full articles; use Text. |
| Type = Widget | `type="widget"` | Loading a dashboard widget or chart card. | Text content; use Text or Simple text. |

**Use** while loading content of known layout. **Don't** for button loading, waits >3s without progress, or a layout different from the loaded content. `aria-busy="true"` + sr-only "Loading".
A11y: the placeholder is `role="status"` with `aria-busy` and screen-reader text; the shapes themselves are `aria-hidden`.

## Rating
Figma: page `1149:82443` · set `1149:82444` (Default, With badge, Radio input) · template `templates/components/Rating.tsx`
API: `<Rating value max label badge>` (display) · `<RatingInput value onChange label>` (radio group).
Stars `size-4.5 fill-fg-yellow` (empty: `fill-neutral-quaternary`), `gap-2` to the text; score text `text-sm leading-none text-body`; "With badge" prepends `Badge color="brand" size="sm"`; "Radio input" = row of `ChoiceCard` "Only text" circles (`gap-4`, text `text-sm text-heading`).
**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Rating value label>` | Displaying an aggregate score as stars with a short label. | Collecting a rating; use Radio input. |
| Type = With badge | `<Rating badge>` | Display where the numeric score should stand out, such as product reviews. | Compact list rows; use Default. |
| Type = Radio input | `<RatingInput>` | Collecting a 1–5 rating in a form or feedback prompt. | Read-only display; use Default. |

**Use** to display aggregate ratings or collect a 1–5 rating (radio group). **Don't** for continuous scores; don't make display-only stars look interactive.
A11y: a read-only rating is `role="img"` with an `aria-label` such as "4 out of 5"; an editable rating is radio inputs in a `fieldset` with a `legend`.

