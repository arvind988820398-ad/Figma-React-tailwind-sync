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

**Use** for site-wide, dismissible announcements. **Don't** for contextual errors (Alert), action feedback (Toast), or more than one banner at a time. Persist dismissal.

## Jumbotron (hero)
Figma: page `267:16342` · set `1149:67227` (Heading + CTA, Bg-image, Text + Illustration, Link + Forms, Bg gradient, With navbar, Bento cards × Mobile/Tablet/Desktop) · template `templates/components/Jumbotron.tsx`
API: `<Jumbotron title lead actions eyebrow variant="centered|split|image" media backgroundImage surface>`.
- Section: `bg-neutral-primary py-24` → `mx-auto max-w-screen-xl px-4 flex flex-col gap-6` (centered or split).
- Heading: `text-6xl font-semibold leading-none text-heading` (mobile `text-4xl`). Lead: `text-xl leading-7 text-body`. CTAs: Brand `lg` + Secondary `lg`, `gap-4`.
- Bg-image: image + `bg-black/60` overlay, heading `text-white`, lead `text-fg-disabled` (as in Figma), CTAs Brand `lg` + Tertiary `lg`, `py-56`.
- Text + Illustration: split layout, media `rounded-xl shadow-md`.
- Link + Forms: `bg-neutral-secondary`, link `text-lg font-medium text-fg-brand`, `Card` "Login form" on the side.
- Bg gradient: announcement `Alert variant="pill" color="info"`, heading `text-black`, `Input` with inner button (Figma lead color and gradient are unbound — figma-audit.md #43).
- With navbar: `Navbar` + hero `py-24 gap-6`.
- Bento cards: grid of cards (`rounded-base`/`rounded-xl`, `bg-neutral-secondary`, `bg-neutral-primary-soft`, `bg-neutral-tertiary`), `shadow-xl`/`shadow-2xl` showcase images; many values unbound in Figma — build with scale values `p-7 gap-8`.

**Use** as the first section of landing pages with one message and CTA. **Don't** inside app screens, stack heroes, or show more than 2 CTAs.

## Gallery
Figma: page `320:17990` · set `1149:56037` "Gallery" (Grid 3 columns, Grid 2 columns, Featured image, Carousel, With filters, Masonry × Mobile/Tablet/Desktop) · template `templates/components/Gallery.tsx`
API: `<Gallery images variant="grid-3|grid-2|masonry|featured">`.
Grid `grid grid-cols-2 md:grid-cols-3 gap-4` (or 2 columns); images `h-auto max-w-full rounded-base`; Masonry `columns-2 md:columns-4 gap-4` with `mb-4` items; Featured image: one large image above a row of thumbnails `gap-4`; With filters: `Tabs variant="pills"` above the grid; Carousel: `Carousel`.
**Use** for browsable image collections. **Don't** for a single hero image or product listings with data (Cards).

## DeviceMockup
Figma: page `702:18224` · set `1149:41354` "Mockups" (Stylus pen, Android & pen, Android, iPhone, Tablet, iMac, Laptop, Smartwatch) · template `templates/components/DeviceMockup.tsx`
API: `<DeviceMockup device="iphone|android|tablet|laptop|imac|watch" label>{screen}</DeviceMockup>`.
Device frames are drawn with `bg-neutral-quaternary` bezels (iMac/Laptop/Smartwatch add `bg-neutral-tertiary-medium` / `bg-neutral-tertiary` stands), `rounded-xl`-scale outer radius, and an image/screen slot. Sizes in Figma: phones 448×896, tablet 768×1012, iMac 896×735, laptop 896×473, watch 320×476 — keep the aspect ratio and scale with `w-full max-w-*`.
**Use** on marketing pages to present product screenshots. **Don't** inside the product UI.
