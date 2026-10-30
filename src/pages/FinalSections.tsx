// Gallery sections for Datepicker, Timepicker, Autocomplete, Range slider, Rich text editor, Timeline, Chat bubble,
// Carousel, Banner, Jumbotron, Gallery, Device mockup and Download app button.
import { useState } from 'react'
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../components/icons'
import { Alert } from '../components/ui/Alert'
import { Autocomplete, type AutocompleteOption } from '../components/ui/Autocomplete'
import { Avatar } from '../components/ui/Avatar'
import { Banner } from '../components/ui/Banner'
import { Button } from '../components/ui/Button'
import { Card, CardText, CardTitle } from '../components/ui/Card'
import { Carousel } from '../components/ui/Carousel'
import { ChatAudio, ChatBubble, ChatFile, ChatImages, ChatLinkPreview } from '../components/ui/ChatBubble'
import { Calendar, Datepicker, type DateRange } from '../components/ui/Datepicker'
import { DeviceMockup, type Device } from '../components/ui/DeviceMockup'
import { DownloadAppButton } from '../components/ui/DownloadAppButton'
import { Gallery, type GalleryVariant } from '../components/ui/Gallery'
import { HelperText, Input, Label } from '../components/ui/Input'
import { Jumbotron } from '../components/ui/Jumbotron'
import { RangeSlider } from '../components/ui/RangeSlider'
import { RichTextEditor } from '../components/ui/RichTextEditor'
import { Tabs } from '../components/ui/Tabs'
import { TimeInput, TimeSlots } from '../components/ui/Timepicker'
import { Timeline, type TimelineVariant } from '../components/ui/Timeline'
import { Group, Labeled, Row, Section } from './gallery-layout'

export const finalSections = [
  { id: 'datepicker', name: 'Datepicker', figma: 'Datepicker · 1149:51284' },
  { id: 'timepicker', name: 'Timepicker', figma: 'Timepicker form · 1149:52636' },
  { id: 'autocomplete', name: 'Autocomplete', figma: 'Autocomplete input · 1149:53126' },
  { id: 'range-slider', name: 'Range slider', figma: 'Range Slider examples · 1149:54340' },
  { id: 'rich-text', name: 'Rich text editor', figma: 'Rich text editor input · 1149:49749' },
  { id: 'timeline', name: 'Timeline', figma: 'Timeline · 1149:91254' },
  { id: 'chat-bubble', name: 'Chat bubble', figma: 'Chat bubble · 1149:35720' },
  { id: 'carousel', name: 'Carousel', figma: 'Carousel · 1149:41738' },
  { id: 'banner', name: 'Banner', figma: 'Banner · 1146:21254' },
  { id: 'jumbotron', name: 'Jumbotron', figma: 'Jumbotron · 1149:67227' },
  { id: 'gallery', name: 'Gallery', figma: 'Gallery · 1149:56037' },
  { id: 'device-mockup', name: 'Device mockup', figma: 'Mockups · 1149:41354' },
  { id: 'download-app', name: 'Download app button', figma: 'Download App Button · 1146:24595' },
] as const

const figma = Object.fromEntries(finalSections.map((s) => [s.id, s.figma])) as Record<(typeof finalSections)[number]['id'], string>
const photos = [1, 2, 3, 4, 5, 6].map((n) => ({ src: `/demo/photo-${n}.svg`, alt: `Sample landscape ${n}` }))

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const VolumeLow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4z" strokeLinejoin="round" />
  </svg>
)
const VolumeHigh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
)

const people: AutocompleteOption[] = [
  { value: 'ada', label: 'Ada Lovelace', description: 'ada@ad-design-kit.dev', icon: <Avatar name="Ada Lovelace" size="xs" />, group: 'People' },
  { value: 'grace', label: 'Grace Hopper', description: 'grace@ad-design-kit.dev', icon: <Avatar name="Grace Hopper" size="xs" />, group: 'People' },
  { value: 'alan', label: 'Alan Turing', description: 'alan@ad-design-kit.dev', icon: <Avatar name="Alan Turing" size="xs" />, group: 'People' },
  { value: 'design', label: 'Design system', icon: <CogIcon />, group: 'Projects' },
  { value: 'docs', label: 'Documentation', icon: <InfoIcon />, group: 'Projects' },
  { value: 'archived', label: 'Archived project', icon: <InfoIcon />, group: 'Projects', disabled: true },
]

function DateDemo() {
  const [date, setDate] = useState<Date | null>(null)
  const [range, setRange] = useState<DateRange>({ start: null, end: null })
  const [inline, setInline] = useState<Date | null>(() => new Date())
  const [today] = useState(() => new Date())
  return (
    <>
      <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="d-date">Due date</Label>
          <Datepicker id="d-date" aria-describedby="d-date-help" value={date} onChange={setDate} />
          <HelperText id="d-date-help">Click the field; arrow keys move between days.</HelperText>
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="d-range">Stay (Range)</Label>
          <Datepicker id="d-range" mode="range" value={range} onChange={setRange} placeholder="Check-in – check-out" min={today} />
          <HelperText>Two months; past dates are disabled.</HelperText>
        </div>
      </div>
      <Group title="Calendar on its own (the Figma menu)">
        <div className="inline-flex self-start rounded-base border border-default-medium bg-neutral-primary-medium p-5 shadow-lg">
          <Calendar value={inline} onChange={setInline} />
        </div>
      </Group>
    </>
  )
}

function TimeDemo() {
  const [time, setTime] = useState('09:30')
  const [slot, setSlot] = useState<string | null>('10:00')
  return (
    <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Labeled label="TimeInput (Default)">
          <TimeInput aria-label="Start time" className="w-48" value={time} onChange={(e) => setTime(e.target.value)} />
        </Labeled>
        <Labeled label='addon="start" (Left add-on)'>
          <TimeInput aria-label="Start time with add-on" className="w-48" addon="start" defaultValue="13:00" />
        </Labeled>
        <Labeled label='addon="end" · status="danger"'>
          <TimeInput aria-label="End time" className="w-48" addon="end" status="danger" defaultValue="25:00" />
        </Labeled>
      </div>
      <Labeled label="TimeSlots (menu)">
        <TimeSlots
          label="Available times"
          title="Wednesday, March 12"
          slots={['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00']}
          unavailable={['09:30', '13:30']}
          value={slot}
          onChange={setSlot}
          className="w-full max-w-sm"
        />
      </Labeled>
    </div>
  )
}

function AutocompleteDemo() {
  const [value, setValue] = useState<string | null>(null)
  return (
    <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 pb-80 md:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="ac-assign">Assign to</Label>
        <Autocomplete
          id="ac-assign"
          options={people}
          value={value}
          onChange={setValue}
          placeholder="Search people or projects"
          footer={<Button size="xs" leftIcon={<PlusIcon />} className="w-full">Invite someone new</Button>}
        />
        <HelperText>Type “a” to see highlighted matches; the archived project is disabled.</HelperText>
      </div>
    </div>
  )
}

function SliderDemo() {
  const [v, setV] = useState(40)
  const [range, setRange] = useState<[number, number]>([200, 700])
  return (
    <div className="grid gap-10 rounded-base border border-default bg-neutral-primary-soft p-5 pt-10 md:grid-cols-2">
      <Labeled label="Default (one thumb)">
        <RangeSlider className="w-full" label="Volume" value={v} onChange={setV} startIcon={<VolumeLow />} endIcon={<VolumeHigh />} />
      </Labeled>
      <Labeled label="Range (two thumbs) + min/max">
        <RangeSlider className="w-full" label={['Minimum price', 'Maximum price']} value={range} onChange={setRange} min={0} max={1000} step={10} showMinMax formatValue={(n) => `$${n}`} />
      </Labeled>
      <Labeled label="disabled">
        <RangeSlider className="w-full" label="Disabled" value={60} onChange={() => {}} disabled />
      </Labeled>
    </div>
  )
}

const events = [
  { date: 'March 2026', title: 'Figma file published', description: 'Tokens, themes and 58 component sets released to the team.', icon: <CheckIcon />, avatar: <Avatar name="Ada Lovelace" size="xs" /> },
  { date: 'May 2026', title: 'React library', description: 'Every component mapped to a React template with the same variants.', icon: <CogIcon />, avatar: <Avatar name="Grace Hopper" size="xs" />, actions: <><Button size="sm" color="secondary">Learn more</Button><Button size="sm">Download</Button></> },
  { date: 'October 2026', title: 'Design review skill', description: 'Code is checked against Figma automatically before merge.', icon: <InfoIcon />, avatar: <Avatar name="Alan Turing" size="xs" /> },
]

export default function FinalSections() {
  const [bannerOpen, setBannerOpen] = useState(true)
  const [galleryTab, setGalleryTab] = useState('all')
  return (
    <>
      <Section id="datepicker" title="Datepicker" figma={figma.datepicker} note="Default and Range, with the Clear / Today / Apply footer. Esc closes; today is outlined.">
        <DateDemo />
      </Section>

      <Section id="timepicker" title="Timepicker" figma={figma.timepicker} note="TimeInput (native time field on the Input shell) and a slot menu. Taken slots are disabled.">
        <TimeDemo />
      </Section>

      <Section id="autocomplete" title="Autocomplete" figma={figma.autocomplete} note="Combobox with grouped options, avatars, highlighted matches, a disabled option and a CTA footer. Arrow keys + Enter, Esc closes.">
        <AutocompleteDemo />
      </Section>

      <Section id="range-slider" title="Range slider" figma={figma['range-slider']} note="Drag, click the track, or use arrow / Page / Home / End keys. The value tooltip shows while dragging or focused.">
        <SliderDemo />
      </Section>

      <Section id="rich-text" title="Rich text editor" figma={figma['rich-text']} note="Toolbar groups + editable area. Swap the editable area for Tiptap or Lexical in production; keep the shell classes.">
        <div className="grid gap-6 md:grid-cols-2">
          <Labeled label="Default">
            <RichTextEditor className="w-full" label="Article body" defaultValue="<p>AD Design Kit keeps <b>Figma</b> and <i>code</i> in sync.</p>" />
          </Labeled>
          <Labeled label="Buttons inside (footer)">
            <RichTextEditor
              className="w-full"
              label="Comment"
              placeholder="Write a comment…"
              minRows={3}
              footer={<><span className="text-xs text-body-subtle">Markdown shortcuts supported</span><Button size="sm">Post comment</Button></>}
            />
          </Labeled>
        </div>
      </Section>

      <Section id="timeline" title="Timeline" figma={figma.timeline} note="Default, Icons, Cards (User actions) and Horizontal.">
        <div className="grid gap-10 md:grid-cols-2">
          {(['default', 'icons', 'cards'] as TimelineVariant[]).map((v) => (
            <Group key={v} title={`variant="${v}"`}>
              <Timeline variant={v} items={v === 'cards' ? events.map((e) => ({ ...e, icon: undefined })) : events.map((e) => ({ ...e, avatar: undefined }))} />
            </Group>
          ))}
        </div>
        <Group title='variant="horizontal"'>
          <Timeline variant="horizontal" items={events.map((e) => ({ ...e, actions: <a href="#timeline">Read more →</a> }))} />
        </Group>
      </Section>

      <Section id="chat-bubble" title="Chat bubble" figma={figma['chat-bubble']} note="Received (Left) and sent (Right) with Text, File, Audio, Images and URL content; plus Clean.">
        <div className="flex flex-col gap-6 rounded-base border border-default bg-neutral-primary-soft p-5">
          <ChatBubble name="Grace Hopper" time="11:46" avatar={<Avatar name="Grace Hopper" size="base" />} status="Delivered">
            That’s awesome. I think our users will really appreciate the improvements.
          </ChatBubble>
          <ChatBubble direction="sent" name="Ada Lovelace" time="11:47" avatar={<Avatar name="Ada Lovelace" size="base" />} status="Read">
            Thanks! I’ve attached the release notes.
            <ChatFile name="release-notes.pdf" meta="12 pages · 18 MB · PDF" action={<Button size="xs" color="ghost" iconOnly aria-label="Download release-notes.pdf"><ArrowIcon /></Button>} />
          </ChatBubble>
          <ChatBubble name="Grace Hopper" time="11:48" avatar={<Avatar name="Grace Hopper" size="base" />}>
            <ChatAudio duration="3:42" progress={0.35} />
          </ChatBubble>
          <ChatBubble direction="sent" name="Ada Lovelace" time="11:49" avatar={<Avatar name="Ada Lovelace" size="base" />}>
            Photos from the offsite:
            <ChatImages images={photos} />
          </ChatBubble>
          <ChatBubble name="Grace Hopper" time="11:50" avatar={<Avatar name="Grace Hopper" size="base" />}>
            <ChatLinkPreview href="https://ad-design-kit.dev/docs" title="AD Design Kit documentation" description="ad-design-kit.dev" image={<img src="/demo/photo-5.svg" alt="" className="aspect-video w-full rounded-base object-cover" />} />
          </ChatBubble>
          <ChatBubble name="Alan Turing" time="11:51" avatar={<Avatar name="Alan Turing" size="base" />} clean>
            “Clean” bubble: no fill, no padding.
          </ChatBubble>
        </div>
      </Section>

      <Section id="carousel" title="Carousel" figma={figma.carousel} note="Slides with overlay controls and indicators (no auto-advance), and a cards row with bottom controls.">
        <Carousel label="Sample photos" className="aspect-video max-w-3xl">
          {photos.map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} className="aspect-video w-full object-cover" />
          ))}
        </Carousel>
        <Carousel variant="cards" label="Testimonials">
          {['Ada', 'Grace', 'Alan', 'Katherine', 'Margaret'].map((n) => (
            <Card key={n} className="flex h-full flex-col gap-3">
              <CardTitle>“Figma and code finally match.”</CardTitle>
              <CardText>— {n}, design engineer</CardText>
            </Card>
          ))}
        </Carousel>
      </Section>

      <Section id="banner" title="Banner" figma={figma.banner} note="Default, Icon & link, Heading & description, Newsletter and Logo + Button (floating). Dismiss in the first one.">
        <div className="flex flex-col gap-4 overflow-hidden rounded-base border border-default bg-neutral-secondary-soft pb-4">
          {bannerOpen ? (
            <Banner onDismiss={() => setBannerOpen(false)}>
              New brand identity has been launched for the <a href="#banner">AD Design Kit Library</a>
            </Banner>
          ) : (
            <div className="p-4"><Button size="xs" color="secondary" onClick={() => setBannerOpen(true)}>Show banner again</Button></div>
          )}
          <Banner icon={<MailIcon />}>
            Get 5% commission per sale. <a href="#banner">Become a partner →</a>
          </Banner>
          <Banner title="Integration is the key" actions={<><Button size="xs" color="tertiary">Learn more</Button><Button size="xs">Get started</Button></>}>
            You can integrate AD Design Kit with React, Vue, Angular and plain HTML.
          </Banner>
          <Banner
            actions={
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <Input size="sm" type="email" aria-label="Email address" placeholder="Enter your email" className="w-56" />
                <Button size="sm" type="submit">Subscribe</Button>
              </form>
            }
          >
            Sign up for our newsletter
          </Banner>
          <div className="px-4">
            <Banner floating logo={<span className="text-base font-semibold text-heading">AD Design Kit</span>} actions={<Button size="sm">Sign up</Button>}>
              Build websites even faster with components on top of Tailwind CSS
            </Banner>
          </div>
        </div>
      </Section>

      <Section id="jumbotron" title="Jumbotron" figma={figma.jumbotron} note="Heading + CTA (centered), Text + Illustration (split), Bg-image and Bg gradient (eyebrow pill). Max 2 CTAs.">
        <div className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-base border border-default">
            <Jumbotron
              eyebrow={<Alert variant="pill" color="info">New · AD Design Kit 2.0 is out</Alert>}
              title="We invest in the world’s potential"
              lead="Here at AD Design Kit we focus on markets where technology, innovation and capital can unlock long-term value."
              actions={<><Button size="lg" rightIcon={<ArrowIcon />}>Get started</Button><Button size="lg" color="secondary">Learn more</Button></>}
            />
          </div>
          <div className="overflow-hidden rounded-base border border-default">
            <Jumbotron
              variant="split"
              surface="secondary"
              title="Design and code, one source of truth"
              lead="Tokens and components stay identical in Figma and React."
              actions={<Button size="lg">Start building</Button>}
              media={<img src="/demo/photo-4.svg" alt="Illustration of mountains" className="w-full" />}
            />
          </div>
          <div className="overflow-hidden rounded-base border border-default">
            <Jumbotron
              variant="image"
              backgroundImage="/demo/photo-1.svg"
              title="Built for every theme"
              lead="Modern, Minimal, Enterprise and Mono — light and dark."
              actions={<><Button size="lg">Get started</Button><Button size="lg" color="tertiary">Watch demo</Button></>}
            />
          </div>
        </div>
      </Section>

      <Section id="gallery" title="Gallery" figma={figma.gallery} note="Grid 3 / Grid 2 / Masonry / Featured image, and With filters (Tabs pills above a grid). Carousel = the Carousel component.">
        {(['grid-3', 'grid-2', 'masonry', 'featured'] as GalleryVariant[]).map((v) => (
          <Group key={v} title={`variant="${v}"`}>
            <Gallery variant={v} images={v === 'grid-2' ? photos.slice(0, 4) : photos} className={v === 'featured' ? 'max-w-3xl' : undefined} />
          </Group>
        ))}
        <Group title="With filters">
          <Tabs
            variant="pills"
            label="Filter photos"
            value={galleryTab}
            onValueChange={setGalleryTab}
            items={[
              { value: 'all', label: 'All', content: <Gallery images={photos} /> },
              { value: 'nature', label: 'Nature', content: <Gallery images={photos.slice(0, 3)} /> },
              { value: 'city', label: 'City', content: <Gallery images={photos.slice(3)} /> },
            ]}
          />
        </Group>
      </Section>

      <Section id="device-mockup" title="Device mockup" figma={figma['device-mockup']} note="Marketing frames for screenshots; they scale with width and keep the Figma aspect ratios.">
        <div className="grid items-end gap-10 rounded-base border border-default bg-neutral-primary-soft p-8 md:grid-cols-5">
          {(['iphone', 'android', 'android-pen', 'stylus', 'watch'] as Device[]).map((d) => (
            <Labeled key={d} label={`device="${d}"`}>
              <DeviceMockup device={d} label={`App home screen on ${d}`}>
                <img src="/demo/screen.svg" alt="" />
              </DeviceMockup>
            </Labeled>
          ))}
        </div>
        <div className="grid items-end gap-10 rounded-base border border-default bg-neutral-primary-soft p-8 md:grid-cols-3">
          {(['tablet', 'laptop', 'imac'] as Device[]).map((d) => (
            <Labeled key={d} label={`device="${d}"`}>
              <DeviceMockup device={d} label={`Dashboard on ${d}`}>
                <img src="/demo/photo-6.svg" alt="" />
              </DeviceMockup>
            </Labeled>
          ))}
        </div>
      </Section>

      <Section id="download-app" title="Download app button" figma={figma['download-app']} note="Store × tone. Always a link to the store listing.">
        <Row>
          <DownloadAppButton store="app-store" href="#download-app" />
          <DownloadAppButton store="google-play" href="#download-app" />
          <DownloadAppButton store="app-store" tone="light" href="#download-app" />
          <DownloadAppButton store="google-play" tone="light" href="#download-app" />
        </Row>
      </Section>
    </>
  )
}
