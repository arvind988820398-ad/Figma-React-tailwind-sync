# Marketing & page sections

All sections here are **spec verified** (2026-10-26). They are composed from atoms; keep the Figma Type as a `variant` prop when you make a reusable section component.

## Banner
Figma: page `248:16106` · set `1146:21254` (Default, Logo + Button, Newsletter, Icon & link, Heading & description × Mobile/Tablet/Desktop) · template `templates/components/Banner.tsx`
API: `<Banner title icon actions logo floating sticky onDismiss>`.
- Strip: `w-full border-b border-default bg-neutral-primary-soft p-4 flex items-center justify-between` (sticky/fixed `top-0 z-50`), dismiss 32px Ghost icon button `text-heading`.
- Default: text `text-sm text-body` with inline link.
- Icon & link: text `text-sm text-body`, link `text-sm font-medium text-fg-brand` + arrow `size-4`.
- Heading & description: title `text-lg font-medium leading-6 text-heading`, text `text-sm text-body`, Tertiary `xs` + Brand `xs` actions.
- Newsletter: `Input form` Inline + Brand `sm`.
- Logo + Button (floating): `max-w-5xl rounded-base border border-default shadow-xs`, logo divided by `border-e border-default ps-4`, text `text-base text-body`, Brand `sm`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Default | `<Banner>{text + link}</Banner>` | One short announcement sentence with an inline link. | The message needs a heading or buttons; use Heading & description. |
| Type = Logo + Button | `logo floating actions` | A floating promo card pairing the brand logo with one Brand CTA. | You need a full-width strip or two actions; use Heading & description. |
| Type = Newsletter | `actions={<form>…</form>}` | Collecting an email for a newsletter or waitlist from a dismissible strip. | Signup is the page's main goal; put the form in the Jumbotron or a form section. |
| Type = Icon & link | `icon` + link in children | A short announcement with a leading icon and one "learn more" link. | The message needs a title or buttons; use Heading & description. |
| Type = Heading & description | `title actions` | The announcement needs a title, a supporting sentence and up to two actions. | One line is enough; use Default or Icon & link. |

**Use** for site-wide, dismissible announcements. **Don't** for contextual errors (Alert), action feedback (Toast), or more than one banner at a time. Persist dismissal.
A11y: a `role="region"` landmark with a label; the dismiss button has an `aria-label`; never put essential information only in a dismissable banner.

## Jumbotron (hero)
Figma: page `267:16342` · set `1149:67227` (Heading + CTA, Bg-image, Text + Illustration, Link + Forms, Bg gradient, With navbar, Bento cards × Mobile/Tablet/Desktop) · template `templates/components/Jumbotron.tsx`
API: `<Jumbotron title lead actions eyebrow variant="centered|split|image" media backgroundImage surface>`.
- Section: `bg-neutral-primary py-24` → `mx-auto max-w-screen-xl px-4 flex flex-col gap-6` (centered or split).
- Heading: `text-6xl font-semibold leading-none text-heading` (mobile `text-4xl`). Lead: `text-xl leading-7 text-body`. CTAs: Brand `lg` + Secondary `lg`, `gap-4`.
- Bg-image: image + `bg-black/60` overlay, heading `text-white`, lead `text-fg-disabled` (as in Figma), CTAs Brand `lg` + Tertiary `lg`, `py-56`.
- Text + Illustration: split layout, media `rounded-xl shadow-md`.
- Link + Forms: `bg-neutral-secondary`, link `text-lg font-medium text-fg-brand`, `Card` "Login form" on the side.
- Bg gradient: announcement `Alert variant="pill" color="info"`, heading `text-black`, `Input` with inner button (the gradient is illustration art and stays unbound in Figma).
- With navbar: `Navbar` + hero `py-24 gap-6`.
- Bento cards: grid of cards (`rounded-base`/`rounded-xl`, `bg-neutral-secondary`, `bg-neutral-primary-soft`, `bg-neutral-tertiary`), `shadow-xl`/`shadow-2xl` showcase images; many values unbound in Figma — build with scale values `p-7 gap-8`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Heading + CTA | `variant="centered"` | Default landing hero: one headline, a lead and up to two CTAs. | You have a real product visual to show; use Text + Illustration. |
| Type = Bg-image | `variant="image" backgroundImage` | A meaningful photo sets the scene and text keeps 4.5:1 over the overlay. | The photo is decorative filler or busy behind text; use Heading + CTA. |
| Type = Text + Illustration | `variant="split" media` | Copy should sit beside a product screenshot or illustration. | No real visual exists; use Heading + CTA instead of stock art. |
| Type = Link + Forms | `variant="split" surface="secondary" media={<Card>}` | Visitors should sign in or sign up directly from the hero. | The form needs more than a few fields; link to a dedicated sign-up page. |
| Type = Bg gradient | `variant="centered" eyebrow={<Alert variant="pill">}` | Launch pages pairing an announcement pill with an inline email input. | There is nothing new to announce; use Heading + CTA. |
| Type = With navbar | `<Navbar>` + `<Jumbotron>` | The landing page has no app shell and the hero sits under its own Navbar. | The layout already renders a Navbar; use the hero alone to avoid two. |
| Type = Bento cards | `<Jumbotron>` + Card grid | Showcasing several features or screenshots at once below the headline. | There is one message or one visual; use Heading + CTA or Text + Illustration. |

**Use** as the first section of landing pages with one message and CTA. **Don't** inside app screens, stack heroes, or show more than 2 CTAs.
A11y: its headline is the page's single `h1`; decorative art is `aria-hidden`; text over images must keep 4.5:1 contrast.

## Gallery
Figma: page `320:17990` · set `1149:56037` "Gallery" (Grid 3 columns, Grid 2 columns, Featured image, Carousel, With filters, Masonry × Mobile/Tablet/Desktop) · template `templates/components/Gallery.tsx`
API: `<Gallery images={[{src, alt, tags?}]} variant="grid-3|grid-2|masonry|featured|carousel|filters" label allLabel>`.
Grid `grid grid-cols-2 md:grid-cols-3 gap-4` (or 2 columns); images `h-auto max-w-full rounded-base`; Masonry `columns-2 md:columns-4 gap-4` with `mb-4` items; Featured image: one large image above a row of thumbnails `gap-4`; With filters (`variant="filters"`): `Tabs variant="pills"` built from the images' `tags` above a 3-column grid, first pill `allLabel`; Carousel (`variant="carousel"`): the `Carousel` component with controls and no indicators.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Grid 3 columns | `variant="grid-3"` | Many images of equal importance with similar aspect ratios. | Images have mixed aspect ratios; use Masonry. |
| Type = Grid 2 columns | `variant="grid-2"` | Fewer, larger images where detail matters, or a narrow container. | There are many small images; use Grid 3 columns. |
| Type = Featured image | `variant="featured"` | One lead image deserves focus, with related shots as thumbnails below. | All images matter equally; use Grid 3 columns. |
| Type = Carousel | `variant="carousel"` | Space allows one image at a time and images are viewed in sequence. | Users need to scan or compare all images at once; use a grid. |
| Type = With filters | `variant="filters"` + `tags` on images | Large collections that users narrow down by category. | The collection is small or has one category; use Grid 3 columns. |
| Type = Masonry | `variant="masonry"` | Mixed portrait and landscape images that should keep their original crops. | Row order matters or images share one ratio; use Grid 3 columns. |

**Use** for browsable image collections. **Don't** for a single hero image or product listings with data (Cards).
A11y: every image needs `alt` text; the active filter has `aria-current`; carousel controls have `aria-label`s.

## DeviceMockup
Figma: page `702:18224` · set `1149:41354` "Mockups" (Stylus pen, Android & pen, Android, iPhone, Tablet, iMac, Laptop, Smartwatch) · template `templates/components/DeviceMockup.tsx`
API: `<DeviceMockup device="iphone|android|android-pen|stylus|tablet|laptop|imac|watch" label>{screen}</DeviceMockup>`. `android-pen` is the phone with the stylus leaning beside it; `stylus` is the pen alone (no screen slot).
Device frames are drawn with `bg-neutral-quaternary` bezels (iMac/Laptop/Smartwatch add `bg-neutral-tertiary-medium` / `bg-neutral-tertiary` stands), `rounded-xl`-scale outer radius, and an image/screen slot. Sizes in Figma: phones 448×896, tablet 768×1012, iMac 896×735, laptop 896×473, watch 320×476 — keep the aspect ratio and scale with `w-full max-w-*`.

**Variants**

| Variant | Code | Use when | Don't use when |
|---|---|---|---|
| Type = Stylus pen | `device="stylus"` | Showing a stylus accessory on its own; it has no screen slot. | You need to show a screenshot; use Android & pen. |
| Type = Android & pen | `device="android-pen"` | An Android screenshot of a feature built around pen input. | Pen input is irrelevant to the feature; use Android. |
| Type = Android | `device="android"` | Presenting an Android app screenshot. | The screenshot is from iOS; use iPhone. |
| Type = iPhone | `device="iphone"` | Presenting an iOS app or mobile web screenshot. | The screenshot is from Android; use Android. |
| Type = Tablet | `device="tablet"` | Showing a tablet-optimised layout at a 3:4 ratio. | The layout is a phone or desktop view; use a phone frame or Laptop. |
| Type = iMac | `device="imac"` | Showing a full desktop web or app screen as the page centerpiece. | Space is tight or the product is used on the go; use Laptop. |
| Type = Laptop | `device="laptop"` | Showing a desktop web app screenshot in a compact 16:10 frame. | The screenshot is a mobile layout; use iPhone or Android. |
| Type = Smartwatch | `device="watch"` | Showing a watch app or a glanceable notification. | The content needs more than a glance; use a phone frame. |

**Use** on marketing pages to present product screenshots. **Don't** inside the product UI.
A11y: the frame is decorative; with a `label` it becomes `role="img"` with that label, otherwise give the screenshot inside its own `alt` text.

