# Pattern map — what in a reference maps to which AD Design Kit component

Use this after reading the registry (`ad-design-kit-design-system/references/components.json`). Component names are the React exports; props follow each component's doc section. "Near-miss" rows are things that look like gaps but are covered.

## Navigation and chrome

| Reference shows | AD Design Kit | Notes |
|---|---|---|
| Top app bar with logo, links, actions, search | `Navbar` (`logo`, `links`, `actions`, `search`, `sticky`) | Org/account switcher = `Dropdown` in `logo` or `actions` |
| Icon-only left rail (Slack, Linear, Figma) | `Sidebar collapsed` | Near-miss: do not hand-roll a narrower rail; labels become tooltips |
| Full sidebar with sections and badges | `Sidebar` with `sections`, `header`, `footer` | Active item via `current` |
| Site-level links inside the header bar itself (Product · Pricing · Docs) | `Navbar links` (`NavLink` with `current`), up to ~7 | Beyond that the Navbar doc sends you to a mega menu or `Sidebar` |
| Row of nav tabs directly under the header (Overview · Orders · Reports …) | `Tabs variant="underline"` — the Figma set is "Nav tabs" | Place it as the next sibling of the `Navbar`, inside the same `mx-auto max-w-screen-xl px-4` container; never in a padded or shadowed band of its own |
| Tabs that switch views of the same record or page (Overview · Activity · Files) | `Tabs variant="underline"` or `pills` | Inside the page content |
| Segmented control / view switcher | `Tabs variant="segmented"` or `ButtonGroup` | `Tabs` when it switches panels (ARIA), `ButtonGroup` for actions |
| Breadcrumbs | `Breadcrumb` (`items`, `variant="background"`) | |
| Mobile bottom bar | `BottomNavigation` | |
| Wizard / step indicator | `Stepper` (`variant` dots, icons, cards, vertical) | |
| Pager with numbers or arrows | `Pagination` (`default`, `arrows`, `two-buttons`, `helper`) | "Rows per page" = `Dropdown` or `Select` beside it |

## Actions

| Reference shows | AD Design Kit | Notes |
|---|---|---|
| Primary / secondary / destructive buttons | `Button color=brand/secondary/tertiary/danger` | Outlined brand button in the reference → `tertiary` (stand-in; Figma has outline only for success/danger/warning) |
| Text-only link button ("Add row", "Remove") | `Button color="ghost"` (size `xs`/`sm`) or an `<a>` with `text-fg-brand` for navigation | Near-miss: never a raw `<button>` with link classes |
| Icon button | `Button iconOnly aria-label` (+ `Tooltip`) | |
| Split button (action + chevron menu) | `Button` + `Dropdown` trigger `Button iconOnly`, joined with `ButtonGroup` | |
| Floating "+" with actions | `SpeedDial` | |
| App-store badges | `DownloadAppButton` | |

## Forms

| Reference shows | AD Design Kit | Notes |
|---|---|---|
| Text field with label and help/error | `Label` + `Input` + `HelperText` (`status`) | Icons via `leftIcon`/`rightIcon` |
| Field with unit or currency affix ("UOM", "₹") | `Input` with its `leftIcon` / `rightIcon` slot holding a short text `span` | Figma has an "Add-on text" type the code Input does not expose yet: note it as a code gap in the report rather than padding the Input with `className` |
| Search box | `SearchInput` (`default`, `button`, `joined`, `inner`) | |
| Dropdown that sets a value | `Select` (≤ native options) or `Autocomplete` (type-ahead) | A menu of *actions* is `Dropdown`, not `Select` |
| Number with +/- | `NumberInput` | |
| Phone, OTP, tags, copy field | `PhoneInput`, `OtpInput`, `TagInput`, `CopyInput` | |
| File upload / photo dropzone | `FileInput` or `FileDropzone` (`hint`, `actions`) | Dropzone copy ("Click or drag photo") goes in `hint` |
| Multi-line text / editor | `Textarea`, `RichTextEditor` | |
| Checkbox, radio, choice cards | `Checkbox`, `Radio`, `ChoiceCard` + `ChoiceGroup` | Toggle only for settings that apply immediately |
| Switch | `Toggle` | |
| Date / time | `Datepicker` (`mode` single/range), `Calendar`, `TimeInput`, `TimeSlots` | |
| Slider | `RangeSlider` | |
| Floating-label field | `FloatingLabelInput` | |

## Data display

| Reference shows | AD Design Kit | Notes |
|---|---|---|
| Data grid with header, rows, selection | `Table` + `TableHead/Row/HeaderCell/Cell` + `Checkbox`; filters and actions in the `toolbar` slot | A dark or taller header in the reference is not reproduced: the Table's neutral header is the system's look. Selected row → `bg-brand-soft` on the row |
| Sortable column | header content = `Button color="ghost" size="xs"` with sort icon | |
| Column info tooltip | `Tooltip` around a `Button iconOnly ghost xs` | |
| Status pill, count, tag | `Badge` (`color`, `size`, `leading` dot, `circle`) | |
| KPI / stat tiles | `Card` + `CardTitle`/`CardText`, `Progress` for ratios | |
| Avatar, stacked avatars, presence | `Avatar`, `AvatarGroup`, `status` | |
| Icon in a tinted square/circle | `IconShape` | |
| Vertical list with meta and actions | `List` + `ListItem` (`divider`, `cta`) | |
| FAQ / collapsible sections | `Accordion` | |
| Activity feed / history | `Timeline` | |
| Chat | `ChatBubble` + `ChatFile/Audio/Images/LinkPreview` | |
| Image carousel / gallery | `Carousel`, `Gallery` | |
| Keyboard shortcut hints | `Kbd` | |
| Device frames in marketing | `DeviceMockup` | |

## Feedback and overlays

| Reference shows | AD Design Kit | Notes |
|---|---|---|
| Inline message banner | `Alert` (`color`, `variant`) | Page-top announcement = `Banner` |
| Toast / snackbar | `Toast` in `ToastViewport` | |
| Loading | `Spinner`, `Skeleton`, `Progress` | |
| Rating stars | `Rating`, `RatingInput` | |
| Dialog that needs a decision | `Modal` (`size`, `dismissible`) | |
| Side panel / form drawer | `Drawer` (`placement`, `size`) | Reference wider than 384px → pass a width utility in `className` (`w-2xl`); still the same component |
| Context menu | `Dropdown` + `DropdownItem/CheckboxItem/Header/Separator` | |
| Hover hint | `Tooltip`; rich hover content → `Popover` | |
| Hero / marketing block | `Jumbotron`, `Banner` | |

## Empty, error and placeholder states

No dedicated component. Compose: an illustration `img` (content asset), one line of `text-base font-medium text-heading`, one or two `Button`s. If the reference has a distinctive empty-state card, that is still layout glue around these.

## Genuine gaps (report, do not build)

Typical things AD Design Kit has no component or variant for today: drag-and-drop handles and sortable lists, colour pickers, kanban columns with limits, tree views, rich data visualisations (charts), command palettes, code editors, map embeds, multi-month calendars, resizable split panes, stepper inputs inside table cells, inline-editable table cells, a "link" variant of Button. Each goes in the gap report with the Figma set or variant you propose.
