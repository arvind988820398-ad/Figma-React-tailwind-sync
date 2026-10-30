// Gallery sections for Accordion, Sidebar, Popover, Stepper, Skeleton, Rating, Search input, File upload, Kbd and List.
import { useState } from 'react'
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../components/icons'
import { Accordion, type AccordionVariant } from '../components/ui/Accordion'
import { Alert } from '../components/ui/Alert'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardTitle } from '../components/ui/Card'
import { FileDropzone, FileInput } from '../components/ui/FileUpload'
import { IconShape } from '../components/ui/IconShape'
import { HelperText, Label } from '../components/ui/Input'
import { Kbd } from '../components/ui/Kbd'
import { List, ListItem } from '../components/ui/List'
import { Popover, PopoverItem, type PopoverPlacement } from '../components/ui/Popover'
import { Rating, RatingInput } from '../components/ui/Rating'
import { SearchInput, type SearchInputVariant } from '../components/ui/SearchInput'
import { Sidebar, type SidebarItem } from '../components/ui/Sidebar'
import { Skeleton, type SkeletonType } from '../components/ui/Skeleton'
import { Stepper, type Step, type StepperVariant } from '../components/ui/Stepper'
import { Toggle } from '../components/ui/Toggle'
import { Group, Labeled, Row, Section } from './gallery-layout'

export const contentSections = [
  { id: 'accordion', name: 'Accordion', figma: 'Accordion · 1146:19028' },
  { id: 'sidebar', name: 'Sidebar', figma: 'Sidebar · 1149:82628' },
  { id: 'popover', name: 'Popover', figma: 'Popover · 1149:81090' },
  { id: 'stepper', name: 'Stepper', figma: 'Stepper navigation · 1149:84064' },
  { id: 'skeleton', name: 'Skeleton', figma: 'Skeleton · 1149:85600' },
  { id: 'rating', name: 'Rating', figma: 'Rating · 1149:82444' },
  { id: 'search-input', name: 'Search input', figma: 'Search form · 1149:46581' },
  { id: 'file-upload', name: 'File upload', figma: 'File upload input · 1149:48972 / 1149:48981' },
  { id: 'kbd', name: 'Kbd', figma: 'KBD · 1149:92754' },
  { id: 'list', name: 'List', figma: 'List · 1149:70444' },
] as const

const figma = Object.fromEntries(contentSections.map((s) => [s.id, s.figma])) as Record<(typeof contentSections)[number]['id'], string>

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
  </svg>
)
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" />
  </svg>
)
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" strokeLinecap="round" />
  </svg>
)
const UpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="m6 15 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const faq = [
  { value: 'what', title: 'What is AD Design Kit?', content: <p>An open-source design system with Figma components and matching React + Tailwind code. <a href="#accordion">Read the docs</a>.</p> },
  { value: 'figma', title: 'Is there a Figma file?', content: <p>Yes. Every component here maps to a Figma component set with the same variants.</p> },
  { value: 'diff', title: 'How does it stay in sync?', content: <p>Tokens are exported from Figma variables and compiled to Tailwind utilities with the same names.</p> },
]

function SidebarDemo() {
  const [collapsed, setCollapsed] = useState(false)
  const main: SidebarItem[] = [
    { label: 'Dashboard', href: '#sidebar', icon: <HomeIcon />, current: true },
    { label: 'Analytics', href: '#sidebar', icon: <ChartIcon /> },
    { label: 'Inbox', href: '#sidebar', icon: <MailIcon />, badge: <Badge color="danger" size="sm">3</Badge> },
    { label: 'Users', href: '#sidebar', icon: <UsersIcon /> },
  ]
  const more: SidebarItem[] = [
    { label: 'Settings', href: '#sidebar', icon: <CogIcon /> },
    { label: 'Billing', href: '#sidebar', icon: <InfoIcon />, disabled: true },
  ]
  return (
    <div className="flex flex-col gap-4">
      <Toggle checked={collapsed} onCheckedChange={setCollapsed}>collapsed (Figma Contracted)</Toggle>
      <div className="flex flex-wrap gap-6">
        <div className="h-120 overflow-hidden rounded-base border border-default">
          <Sidebar
            collapsed={collapsed}
            header={
              collapsed ? (
                <IconShape size="sm" color="brand"><CogIcon /></IconShape>
              ) : (
                <span className="text-lg font-medium leading-6 text-heading">AD Design Kit</span>
              )
            }
            sections={[main, more]}
          />
        </div>
        <div className="h-120 overflow-hidden rounded-base border border-default">
          <Sidebar
            label="Sidebar with alert"
            collapsed={collapsed}
            header={collapsed ? <IconShape size="sm" color="brand"><CogIcon /></IconShape> : <span className="text-lg font-medium leading-6 text-heading">With alert</span>}
            sections={[main]}
            footer={
              <Alert variant="complex" color="info" title="Beta" onDismiss={() => {}}>
                Preview the new dashboard before everyone else.
              </Alert>
            }
          />
        </div>
      </div>
    </div>
  )
}

const steps: Step[] = [
  { title: 'Account', icon: <UsersIcon /> },
  { title: 'Profile', icon: <InfoIcon /> },
  { title: 'Payment', icon: <ChartIcon /> },
  { title: 'Confirm', icon: <CheckIcon /> },
]

function RatingDemo() {
  const [value, setValue] = useState<number | null>(4)
  return (
    <div className="flex flex-col gap-6 rounded-base border border-default bg-neutral-primary-soft p-5">
      <Labeled label="Default"><Rating value={4} label="4.95 out of 5" /></Labeled>
      <Labeled label="With badge"><Rating value={4.5} badge={<Badge color="brand" size="sm">4.95</Badge>} label="73 reviews" /></Labeled>
      <Labeled label="Radio input (RatingInput)">
        <RatingInput label="Rate your experience" value={value} onChange={setValue} />
      </Labeled>
    </div>
  )
}

function SearchDemo() {
  const [last, setLast] = useState<string | null>(null)
  return (
    <div className="flex flex-col gap-6 rounded-base border border-default bg-neutral-primary-soft p-5">
      {(['default', 'button', 'joined', 'inner'] as SearchInputVariant[]).map((v) => (
        <Labeled key={v} label={`variant="${v}"`}>
          <SearchInput className="max-w-lg" variant={v} label={`Search (${v})`} placeholder="Search components" onSearch={setLast} />
        </Labeled>
      ))}
      <p className="text-sm text-body" aria-live="polite">
        {last === null ? 'Press Enter or the button to search.' : `Searched for “${last}”.`}
      </p>
    </div>
  )
}

function FileDemo() {
  const [files, setFiles] = useState<string[]>([])
  const onFiles = (f: File[]) => setFiles(f.map((x) => x.name))
  return (
    <>
      <Group title="FileInput (Figma Default)">
        <div className="max-w-md rounded-base border border-default bg-neutral-primary-soft p-5">
          <Label htmlFor="f-avatar">Upload file</Label>
          <FileInput id="f-avatar" aria-describedby="f-avatar-help" onFiles={onFiles} />
          <HelperText id="f-avatar-help">SVG, PNG, JPG or GIF (max. 800×400px).</HelperText>
        </div>
      </Group>
      <Group title="FileDropzone · variant × state">
        <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2 xl:grid-cols-3">
          <Labeled label='variant="advanced" · Initial (hover to see Hover)'>
            <FileDropzone multiple hint="SVG, PNG, JPG or GIF (max. 800×400px)" onFiles={onFiles} />
          </Labeled>
          <Labeled label="Disabled">
            <FileDropzone disabled hint="Uploads are paused" onFiles={onFiles} />
          </Labeled>
          <Labeled label='status="success"'>
            <FileDropzone status="success" hint="3 files uploaded" onFiles={onFiles} />
          </Labeled>
          <Labeled label='status="danger"'>
            <FileDropzone status="danger" hint="File is larger than 5 MB" onFiles={onFiles} />
          </Labeled>
          <Labeled label='variant="ctas"'>
            <FileDropzone
              variant="ctas"
              multiple
              onFiles={onFiles}
              actions={
                <>
                  <span className="text-sm font-medium text-fg-brand">Browse files</span>
                  <span className="text-sm font-medium text-fg-brand">Import from URL</span>
                </>
              }
            />
          </Labeled>
        </div>
      </Group>
      {files.length > 0 && <p className="text-sm text-body">Selected: <span className="font-medium text-heading">{files.join(', ')}</span></p>}
    </>
  )
}

export default function ContentSections() {
  return (
    <>
      <Section id="accordion" title="Accordion" figma={figma.accordion} note="5 styles. Triggers are buttons with aria-expanded; open items get bg-neutral-tertiary and a rotated chevron.">
        {(['default', 'flush', 'cards'] as AccordionVariant[]).map((v) => (
          <Group key={v} title={`variant="${v}"`}>
            <Accordion variant={v} items={faq} defaultValue={['what']} />
          </Group>
        ))}
        <Group title='variant="nested" (Multi-level)'>
          <Accordion
            variant="nested"
            defaultValue={['tokens']}
            items={[
              {
                value: 'tokens',
                title: 'Design tokens',
                content: <p>Colors, radius, typography and shadows.</p>,
                items: [
                  { value: 'colors', title: 'Colors', content: <p>Semantic bg, text and border tokens per theme.</p> },
                  { value: 'radius', title: 'Radius', content: <p>Themed scale from rounded-xxs to rounded-xl.</p> },
                ],
              },
              faq[1],
            ]}
          />
        </Group>
        <Group title='variant="subheader" (With sub-header)'>
          <Accordion
            variant="subheader"
            multiple
            items={[
              { value: 'a', title: 'Account', subtitle: 'Name, email and password', icon: <IconShape size="sm" color="brand"><UsersIcon /></IconShape>, content: <p>Manage your account details.</p> },
              { value: 'b', title: 'Billing', subtitle: 'Plans, invoices and payment', icon: <IconShape size="sm" color="success"><ChartIcon /></IconShape>, content: <p>Manage your subscription.</p> },
            ]}
          />
        </Group>
      </Section>

      <Section id="sidebar" title="Sidebar" figma={figma.sidebar} note="Default and With alert, expanded or collapsed. Collapsed items show their label in a tooltip.">
        <SidebarDemo />
      </Section>

      <Section id="popover" title="Popover" figma={figma.popover} note="Click a trigger to open; Esc or an outside click closes it. Default and Vertical items types × 4 positions.">
        <Group title="placement (Figma Position)">
          <div className="flex flex-wrap items-center justify-center gap-10 rounded-base border border-default bg-neutral-primary-soft px-5 py-40">
            {(['top', 'right', 'bottom', 'left'] as PopoverPlacement[]).map((p) => (
              <Popover key={p} placement={p} title="Popover title" trigger={<Button color="secondary">{p}</Button>}>
                And here’s some amazing content. It’s very engaging. Right?
              </Popover>
            ))}
          </div>
        </Group>
        <Group title="Rich content and Vertical items">
          <Row>
            <Popover
              placement="bottom"
              padding="rich"
              trigger={<Button color="ghost"><Avatar name="Ada Lovelace" size="sm" /> Ada Lovelace</Button>}
            >
              <div className="flex items-center justify-between">
                <Avatar name="Ada Lovelace" size="lg" />
                <Button size="xs">Follow</Button>
              </div>
              <p className="text-sm font-semibold leading-none text-heading">Ada Lovelace</p>
              <p className="text-sm text-body">First programmer. Writes about engines and analysis.</p>
              <a href="#popover" className="text-sm font-medium text-fg-brand">View profile</a>
            </Popover>
            <Popover
              placement="bottom"
              padding="rich"
              title="Must have at least 6 characters"
              trigger={<Button color="secondary">Password strength</Button>}
            >
              <div className="flex gap-2">
                <span className="h-1 flex-1 rounded-full bg-warning" />
                <span className="h-1 flex-1 rounded-full bg-warning" />
                <span className="h-1 flex-1 rounded-full bg-neutral-quaternary" />
                <span className="h-1 flex-1 rounded-full bg-neutral-quaternary" />
              </div>
              <p className="text-sm text-body">It’s better to have:</p>
            </Popover>
            <Popover placement="bottom" padding="none" trigger={<Button color="secondary">Vertical items</Button>}>
              <PopoverItem icon={<HomeIcon />} href="#popover">Dashboard</PopoverItem>
              <PopoverItem icon={<CogIcon />} href="#popover">Settings</PopoverItem>
              <PopoverItem icon={<MailIcon />} href="#popover">Messages</PopoverItem>
            </Popover>
          </Row>
        </Group>
      </Section>

      <Section id="stepper" title="Stepper" figma={figma.stepper} note="6 types. Step 2 is active (current=1); earlier steps are completed. The last example shows Error and Disabled states.">
        <div className="flex flex-col gap-8 rounded-base border border-default bg-neutral-primary-soft p-5">
          {(['default', 'dots', 'icons', 'only-icons', 'cards'] as StepperVariant[]).map((v) => (
            <Labeled key={v} label={`variant="${v}"`}>
              <div className="w-full min-w-xl"><Stepper variant={v} steps={steps} current={1} /></div>
            </Labeled>
          ))}
          <div className="grid gap-8 md:grid-cols-2">
            <Labeled label='variant="vertical"'>
              <Stepper
                variant="vertical"
                current={1}
                steps={[
                  { title: 'Personal info', description: 'Name and email' },
                  { title: 'Company', description: 'Size and industry' },
                  { title: 'Plan', description: 'Choose a subscription' },
                ]}
              />
            </Labeled>
            <Labeled label="status: error / disabled">
              <div className="w-full">
                <Stepper current={1} steps={[{ title: 'Account' }, { title: 'Payment', status: 'error' }, { title: 'Confirm', status: 'disabled' }]} />
              </div>
            </Labeled>
          </div>
        </div>
      </Section>

      <Section id="skeleton" title="Skeleton" figma={figma.skeleton} note="6 Figma types. Primary lines bg-gray, secondary lines bg-neutral-quaternary, pulsing.">
        <div className="grid gap-8 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
          {(['text', 'simple-text', 'image', 'card', 'list', 'widget'] as SkeletonType[]).map((t) => (
            <Labeled key={t} label={`type="${t}"`}>
              <Skeleton type={t} className="w-full" />
            </Labeled>
          ))}
        </div>
      </Section>

      <Section id="rating" title="Rating" figma={figma.rating} note="Default, With badge and Radio input.">
        <RatingDemo />
      </Section>

      <Section id="search-input" title="Search input" figma={figma['search-input']} note="Search field with a leading icon inside a search landmark: plain, spaced button, joined button and inner button.">
        <SearchDemo />
      </Section>

      <Section id="file-upload" title="File upload" figma={figma['file-upload']} note="Default file input and the dropzone (click or drag files onto it). The real file input stays keyboard- and screen-reader-accessible.">
        <FileDemo />
      </Section>

      <Section id="kbd" title="Kbd" figma={figma.kbd} note="Keyboard keys for shortcuts in tooltips, menus and docs.">
        <div className="flex flex-col gap-4 rounded-base border border-default bg-neutral-primary-soft p-5">
          <div className="flex flex-wrap gap-2">
            {['Shift', 'Ctrl', 'Tab', 'Caps Lock', 'Esc', 'Spacebar', 'Enter', 'Alt', 'Fn', '⌘'].map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
            <Kbd aria-label="Arrow up"><UpIcon /></Kbd>
          </div>
          <p className="text-sm text-body">
            Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open search, or <Kbd>Esc</Kbd> to close a dialog.
          </p>
        </div>
      </Section>

      <Section id="list" title="List" figma={figma.list} note="Default, Divider, Card and CTA lists with simple and rich items (Initial / Hover / Disabled).">
        <div className="grid gap-6 md:grid-cols-2">
          <Group title='variant="default"'>
            <div className="rounded-base border border-default bg-neutral-primary-soft p-5">
              <List>
                <ListItem icon={<CheckIcon />}>At least 10 characters</ListItem>
                <ListItem icon={<CheckIcon />} href="#list">At least one uppercase letter (link, hover me)</ListItem>
                <ListItem icon={<CheckIcon />} disabled>At least one special character (disabled)</ListItem>
              </List>
            </div>
          </Group>
          <Group title='variant="divider" (rich items)'>
            <div className="rounded-base border border-default bg-neutral-primary-soft p-5">
              <List variant="divider">
                <ListItem media={<Avatar name="Ada Lovelace" size="base" />} description="ada@ad-design-kit.dev" trailing="$320">Ada Lovelace</ListItem>
                <ListItem media={<Avatar name="Grace Hopper" size="base" />} description="grace@ad-design-kit.dev" trailing={<Badge color="success" size="sm">Paid</Badge>}>Grace Hopper</ListItem>
                <ListItem media={<Avatar name="Alan Turing" size="base" />} description="alan@ad-design-kit.dev" trailing={<Button size="xs" color="secondary">View</Button>}>Alan Turing</ListItem>
              </List>
            </div>
          </Group>
          <Group title="Card list (Figma Card)">
            <Card className="flex flex-col gap-6 shadow">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Latest customers</CardTitle>
                <a href="#list" className="text-base font-medium text-fg-brand">View all</a>
              </div>
              <List variant="divider">
                <ListItem media={<IconShape size="sm" color="success"><PlusIcon /></IconShape>} description="Today, 10:24" trailing="+$2,300">Payment from Bonnie Green</ListItem>
                <ListItem media={<IconShape size="sm" color="danger"><MailIcon /></IconShape>} description="Yesterday" trailing="-$120">Refund to Thomas Lean</ListItem>
              </List>
            </Card>
          </Group>
          <Group title='variant="cta"'>
            <List variant="cta">
              <ListItem cta href="#list" media={<IconShape size="sm" color="brand"><CogIcon /></IconShape>} description="Theme, fonts and dark mode">Appearance</ListItem>
              <ListItem cta href="#list" media={<IconShape size="sm" color="brand"><MailIcon /></IconShape>} description="Email and push">Notifications</ListItem>
            </List>
          </Group>
        </div>
      </Section>
    </>
  )
}
