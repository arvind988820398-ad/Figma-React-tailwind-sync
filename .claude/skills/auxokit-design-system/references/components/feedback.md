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
**Use** for brief non-blocking feedback on an action just taken; auto-dismiss 4–6s, pause on hover. **Don't** for errors the user must fix, critical info, or more than one primary action.
A11y: `role="status" aria-live="polite"` (errors `assertive`), labelled dismiss.

## Badge
Figma: page `3283:24168` · set `1146:22250` (6 colors × 2 sizes × 5 types × icon/text-only) · template `templates/components/Badge.tsx`

| Figma | Prop | Values |
|---|---|---|
| Theme | `color` | `gray` · `white` · `brand` · `success` · `warning` · `danger` |
| Size | `size` | `sm` (20px) · `lg` (24px) |
| Type | `leading` | `dot` · `avatar` · `spinner`; "With secondary text" = two spans |
| Only icon / Only text | `iconOnly` / `circle` | round badge |

Recipe: `inline-flex items-center rounded-sm border font-medium` · sm `gap-1 px-1 py-0.5 text-xs leading-4` (icon `size-3`) · lg `gap-1.5 px-1.5 py-1 text-sm leading-4` (icon `size-3.5`) · round `rounded-full p-0 size-5|6 text-xs`. Colors: gray `bg-neutral-secondary border-default-medium text-heading` · white `bg-neutral-primary-soft border-default text-heading` · brand `bg-brand-softer border-brand-subtle text-fg-brand-strong` · success `bg-success-soft border-success-subtle text-fg-success-strong` · warning `bg-warning-soft border-warning-subtle text-fg-warning` · danger `bg-danger-soft border-danger-subtle text-fg-danger-strong`.
**Use** for 1–2 word status, category, count or "New". **Don't** as a clickable action, for sentences, or more than 2–3 per row.

## Progress
Figma: page `3283:24173` · labelled `1149:82279` (6 colors × Top/Side/Bottom label) · bars `1149:82364` (base/lg × 25–100) · template `templates/components/Progress.tsx`
Track `w-full rounded-base bg-neutral-quaternary` — `h-1.5` (base) / `h-2.5` (lg); fill `rounded-base` + `bg-brand` (Figma "Primary") · `bg-gray` · `bg-dark` · `bg-success` · `bg-danger` · `bg-warning`. Labels: `text-xs font-medium leading-4 text-body` for both the label and the value, `gap-1.5` to the bar (side label: same, inline).
**Use** for determinate progress (uploads, completion, quotas). **Don't** for unknown durations (Spinner/Skeleton) or ratings. `role="progressbar"` + `aria-valuenow/min/max`.

## Spinner
Figma: page `3284:24046` · set `1149:83311` (xs 12 · sm 24 · md 50 · lg 75 · xl 100 × Track) · interactive `1149:83298` · template `templates/components/Spinner.tsx`
SVG `animate-spin`: track `fill-neutral-quaternary` (omit when `track={false}`), arc `fill-brand`. Sizes: `xs size-3` · `sm size-6` · `md size-12.5` · `lg size-18.75` · `xl size-25`. In buttons use `xs`/`sm`.
**Use** for short waits where layout is unknown, or in-button loading. **Don't** for known layouts (Skeleton) or known progress (Progress). `role="status"` + sr-only label.

## Skeleton
Figma: page `13251:80911` · set `1149:85600` (Card + Image, Image + Text, Text, List, Simple text, Widget) · template `templates/components/Skeleton.tsx`
API: `<Skeleton type="text|simple-text|image|card|list|widget">`; primitives `SkeletonLine`, `SkeletonMedia`.
Lines `h-2 rounded-full` — primary line `bg-gray`, secondary/meta line `bg-neutral-quaternary` (lines vary in width: full, ~85%, ~60%, ~25%). Media block `rounded-lg bg-gray` with a centered placeholder icon `fill-neutral-quaternary` (`size-5`). Lists: rows `py-2.5` with a short `bg-gray` title, `bg-neutral-quaternary` subtitle and a right-aligned value. Wrap in `animate-pulse`.
**Use** while loading content of known layout. **Don't** for button loading, waits >3s without progress, or a layout different from the loaded content. `aria-busy="true"` + sr-only "Loading".

## Rating
Figma: page `1149:82443` · set `1149:82444` (Default, With badge, Radio input) · template `templates/components/Rating.tsx`
API: `<Rating value max label badge>` (display) · `<RatingInput value onChange label>` (radio group).
Stars `size-4.5 fill-fg-yellow` (empty: `fill-neutral-quaternary`), `gap-2` to the text; score text `text-sm leading-none text-body`; "With badge" prepends `Badge color="brand" size="sm"`; "Radio input" = row of `ChoiceCard` "Only text" circles (`gap-4`, text `text-sm text-heading`).
**Use** to display aggregate ratings or collect a 1–5 rating (radio group). **Don't** for continuous scores; don't make display-only stars look interactive.
