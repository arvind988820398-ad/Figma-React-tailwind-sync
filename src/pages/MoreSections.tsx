// Gallery sections for Select, Textarea, Dropdown, Toast, Drawer, Tabs, Navbar, Breadcrumb, Pagination and Table.
import { useState } from 'react'
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../components/icons'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Breadcrumb } from '../components/ui/Breadcrumb'
import { Button } from '../components/ui/Button'
import { Drawer, type DrawerPlacement, type DrawerSize } from '../components/ui/Drawer'
import { Dropdown, DropdownCheckboxItem, DropdownHeader, DropdownItem, DropdownSeparator } from '../components/ui/Dropdown'
import { IconShape } from '../components/ui/IconShape'
import { HelperText, Input, Label, type FieldSize } from '../components/ui/Input'
import { Navbar } from '../components/ui/Navbar'
import { Pagination, type PaginationVariant } from '../components/ui/Pagination'
import { Progress } from '../components/ui/Progress'
import { Select } from '../components/ui/Select'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, type TableStriped } from '../components/ui/Table'
import { Tabs, type TabsVariant } from '../components/ui/Tabs'
import { Textarea, TextareaToolButton } from '../components/ui/Textarea'
import { Toast, ToastViewport } from '../components/ui/Toast'
import { Group, Labeled, Matrix, Row, Section } from './gallery-layout'

export const moreSections = [
  { id: 'select', name: 'Select', figma: 'Select form · 1149:46541' },
  { id: 'textarea', name: 'Textarea', figma: 'Textarea input · 1149:49679' },
  { id: 'dropdown', name: 'Dropdown', figma: 'Dropdown menu · 1149:39895' },
  { id: 'toast', name: 'Toast', figma: 'Toast · 1149:93975' },
  { id: 'drawer', name: 'Drawer', figma: 'Drawer · 1149:37097' },
  { id: 'tabs', name: 'Tabs', figma: 'Nav tabs · 1149:80530' },
  { id: 'navbar', name: 'Navbar', figma: 'Navbar · 1149:74216' },
  { id: 'breadcrumb', name: 'Breadcrumb', figma: 'Breadcrumb · 1148:31317' },
  { id: 'pagination', name: 'Pagination', figma: 'Pagination · 1149:81850' },
  { id: 'table', name: 'Table', figma: 'Table · 1149:87477' },
] as const

const figma = Object.fromEntries(moreSections.map((s) => [s.id, s.figma])) as Record<(typeof moreSections)[number]['id'], string>
const fieldSizes: FieldSize[] = ['sm', 'base', 'lg', 'xl']

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
  </svg>
)
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M4 12 20 4l-6 16-3-7z" strokeLinejoin="round" />
  </svg>
)
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m3 16 5-5 4 4 3-3 6 6" strokeLinejoin="round" />
  </svg>
)
const Logo = () => (
  <span className="flex items-center gap-2">
    <IconShape size="sm" color="brand">
      <CogIcon />
    </IconShape>
    <span className="text-lg font-semibold text-heading">AD Design Kit</span>
  </span>
)

const countries = ['United States', 'Canada', 'Germany', 'India', 'Japan']

function TabsDemo({ variant, withPanels }: { variant: TabsVariant; withPanels?: boolean }) {
  const [value, setValue] = useState('profile')
  const items = [
    { value: 'profile', label: 'Profile' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'settings', label: 'Settings' },
    { value: 'contacts', label: 'Contacts' },
    { value: 'disabled', label: 'Disabled', disabled: true },
  ].map((item) => ({
    ...item,
    content: withPanels ? (
      <div className="rounded-base border border-default bg-neutral-secondary-soft p-4 text-sm text-body">
        Content of the <span className="font-medium text-heading">{item.label}</span> tab.
      </div>
    ) : undefined,
  }))
  return <Tabs variant={variant} items={items} value={value} onValueChange={setValue} label={`${variant} tabs`} />
}

function PaginationDemo({ variant, helper }: { variant: PaginationVariant; helper?: boolean }) {
  const [page, setPage] = useState(3)
  return (
    <Pagination
      className="w-full"
      variant={variant}
      page={page}
      pageCount={10}
      onPageChange={setPage}
      helper={helper ? { from: (page - 1) * 10 + 1, to: page * 10, total: 100 } : undefined}
    />
  )
}

function DropdownDemos() {
  const [cols, setCols] = useState({ name: true, status: true, revenue: false })
  return (
    <Row>
      <Labeled label="Default · Brand trigger">
        <Dropdown label="Actions" trigger={<Button rightIcon={<ChevronDown />}>Dropdown</Button>}>
          <DropdownItem icon={<PlusIcon />}>New project</DropdownItem>
          <DropdownItem icon={<MailIcon />}>Invite people</DropdownItem>
          <DropdownItem icon={<CogIcon />}>Settings</DropdownItem>
          <DropdownItem disabled>Disabled item</DropdownItem>
        </Dropdown>
      </Labeled>
      <Labeled label="User profile · header + separator">
        <Dropdown
          label="Account"
          trigger={
            <Button color="ghost" rightIcon={<ChevronDown />}>
              <Avatar name="Ada Lovelace" size="sm" />
              Ada Lovelace
            </Button>
          }
        >
          <DropdownHeader name="Ada Lovelace" email="ada@ad-design-kit.dev" />
          <DropdownItem>Dashboard</DropdownItem>
          <DropdownItem trailing={<Badge color="white" size="sm">3</Badge>}>Notifications</DropdownItem>
          <DropdownItem description="Billing and invoices">Plan</DropdownItem>
          <DropdownSeparator />
          <DropdownItem>Sign out</DropdownItem>
        </Dropdown>
      </Labeled>
      <Labeled label="Checkbox · stays open">
        <Dropdown label="Columns" trigger={<Button color="secondary" rightIcon={<ChevronDown />}>Columns</Button>}>
          {(Object.keys(cols) as (keyof typeof cols)[]).map((k) => (
            <DropdownCheckboxItem key={k} checked={cols[k]} onCheckedChange={(v) => setCols((c) => ({ ...c, [k]: v }))}>
              {k[0].toUpperCase() + k.slice(1)}
            </DropdownCheckboxItem>
          ))}
        </Dropdown>
      </Labeled>
      <Labeled label="Icon trigger · align end">
        <Dropdown
          label="More"
          align="end"
          trigger={
            <Button color="ghost" iconOnly aria-label="More actions">
              <CogIcon />
            </Button>
          }
        >
          <DropdownItem>Edit</DropdownItem>
          <DropdownItem>Duplicate</DropdownItem>
          <DropdownSeparator />
          <DropdownItem>Delete</DropdownItem>
        </Dropdown>
      </Labeled>
    </Row>
  )
}

type LiveToast = { id: number; color: 'neutral' | 'warning' | 'danger' }

function ToastDemos() {
  const [live, setLive] = useState<LiveToast[]>([])
  const push = (color: LiveToast['color']) => setLive((t) => [...t, { id: Date.now(), color }])
  const remove = (id: number) => setLive((t) => t.filter((x) => x.id !== id))
  return (
    <>
      <Group title="Figma types">
        <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2 xl:grid-cols-3">
          <Labeled label="Icon & text">
            <Toast icon={<InfoIcon />} onDismiss={() => {}}>Item moved successfully.</Toast>
          </Labeled>
          <Labeled label="Icon shape & text">
            <Toast icon={<IconShape color="success" size="sm"><CheckIcon /></IconShape>} onDismiss={() => {}}>Item moved successfully.</Toast>
          </Labeled>
          <Labeled label="Icon shape & buttons">
            <Toast
              icon={<IconShape color="brand" size="sm"><InfoIcon /></IconShape>}
              title="Update available"
              onDismiss={() => {}}
              actions={<><Button size="xs">Update</Button><Button size="xs" color="secondary">Not now</Button></>}
            >
              A new version is ready to install.
            </Toast>
          </Labeled>
          <Labeled label="Avatar & button">
            <Toast icon={<Avatar name="Grace Hopper" size="base" />} title="Grace Hopper" onDismiss={() => {}} actions={<Button size="xs">Reply</Button>}>
              Hi, can we sync on the design review?
            </Toast>
          </Labeled>
          <Labeled label="With header">
            <Toast header={{ title: 'New notification', time: 'a few seconds ago' }} icon={<Avatar name="Alan Turing" size="lg" />} title="Alan Turing" onDismiss={() => {}}>
              Commented on your pull request.
            </Toast>
          </Labeled>
          <Labeled label="With progress bar">
            <Toast icon={<IconShape color="brand" size="sm"><ImageIcon /></IconShape>} title="Uploading files" onDismiss={() => {}}>
              <Progress className="mt-2" value={60} labelPosition="side" />
            </Toast>
          </Labeled>
          <Labeled label="With illustration">
            <Toast title="Your report is ready" onDismiss={() => {}} actions={<Button size="xs">Download</Button>}>
              <div className="mb-3 aspect-video rounded-base bg-neutral-tertiary" aria-hidden />
              Monthly analytics for October.
            </Toast>
          </Labeled>
          <Labeled label='color="warning"'>
            <Toast
              color="warning"
              icon={<InfoIcon />}
              title="Storage almost full"
              onDismiss={() => {}}
              actions={<><Button size="xs" color="warning">Upgrade</Button><Button size="xs" color="warning" outline>Dismiss</Button></>}
            >
              You’ve used 90% of your storage.
            </Toast>
          </Labeled>
          <Labeled label='color="danger" (Figma Error)'>
            <Toast
              color="danger"
              icon={<InfoIcon />}
              title="Payment failed"
              onDismiss={() => {}}
              actions={<><Button size="xs" color="danger">Retry</Button><Button size="xs" color="danger" outline>Cancel</Button></>}
            >
              We couldn’t charge your card.
            </Toast>
          </Labeled>
        </div>
      </Group>
      <Group title="Live (auto-dismiss after 5s, paused on hover)">
        <Row>
          <Button color="secondary" onClick={() => push('neutral')}>Show toast</Button>
          <Button color="warning" outline onClick={() => push('warning')}>Show warning</Button>
          <Button color="danger" outline onClick={() => push('danger')}>Show error</Button>
        </Row>
      </Group>
      <ToastViewport>
        {live.map((t) => (
          <Toast key={t.id} color={t.color} icon={<InfoIcon />} duration={5000} onDismiss={() => remove(t.id)}>
            {t.color === 'neutral' ? 'Changes saved.' : t.color === 'warning' ? 'Storage almost full.' : 'Something went wrong.'}
          </Toast>
        ))}
      </ToastViewport>
    </>
  )
}

function DrawerDemos() {
  const [open, setOpen] = useState<{ placement: DrawerPlacement; size: DrawerSize } | null>(null)
  const configs: { label: string; placement: DrawerPlacement; size: DrawerSize }[] = [
    { label: 'placement="start" size="sm"', placement: 'start', size: 'sm' },
    { label: 'placement="end" size="md"', placement: 'end', size: 'md' },
    { label: 'placement="bottom"', placement: 'bottom', size: 'sm' },
  ]
  return (
    <>
      <Row>
        {configs.map((c) => (
          <Button key={c.label} color="secondary" onClick={() => setOpen(c)}>{c.label}</Button>
        ))}
      </Row>
      <Drawer
        open={!!open}
        onOpenChange={(o) => !o && setOpen(null)}
        placement={open?.placement}
        size={open?.size}
        title="New contact"
        footer={
          <>
            <Button onClick={() => setOpen(null)}>Save contact</Button>
            <Button color="secondary" onClick={() => setOpen(null)}>Cancel</Button>
          </>
        }
      >
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="d-name" required>Name</Label>
          <Input id="d-name" placeholder="Ada Lovelace" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="d-country">Country</Label>
          <Select id="d-country" defaultValue="">
            <option value="" disabled>Choose a country</option>
            {countries.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="d-notes">Notes</Label>
          <Textarea id="d-notes" placeholder="Anything we should know?" />
        </div>
      </Drawer>
    </>
  )
}

const rows = [
  { name: 'Apple MacBook Pro', category: 'Laptop', price: '$2,999', status: 'success' as const, label: 'In stock' },
  { name: 'Microsoft Surface Pro', category: 'Laptop PC', price: '$1,999', status: 'warning' as const, label: 'Low stock' },
  { name: 'Magic Mouse 2', category: 'Accessories', price: '$99', status: 'danger' as const, label: 'Sold out' },
  { name: 'Apple Watch', category: 'Watches', price: '$199', status: 'success' as const, label: 'In stock' },
]

function DemoTable({ striped, withCaption, withToolbar }: { striped?: TableStriped; withCaption?: boolean; withToolbar?: boolean }) {
  return (
    <Table
      striped={striped}
      caption={withCaption ? { title: 'Our products', description: 'Browse the products in stock and their current prices.' } : undefined}
      toolbar={
        withToolbar ? (
          <>
            <Input size="sm" className="w-64" aria-label="Search products" placeholder="Search products" leftIcon={<InfoIcon />} />
            <div className="flex gap-3">
              <Button size="sm" color="secondary">Filters</Button>
              <Button size="sm" leftIcon={<PlusIcon />}>Add product</Button>
            </div>
          </>
        ) : undefined
      }
    >
      <TableHead>
        <TableRow>
          <TableHeaderCell>Product</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell><span className="sr-only">Actions</span></TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.name}>
            <TableCell className="font-semibold">{r.name}</TableCell>
            <TableCell className="text-body">{r.category}</TableCell>
            <TableCell>{r.price}</TableCell>
            <TableCell><Badge color={r.status} size="sm">{r.label}</Badge></TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button size="xs" color="tertiary">Edit</Button>
                <Button size="xs" color="danger">Delete</Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function MoreSections() {
  const [message, setMessage] = useState('')
  return (
    <>
      <Section id="select" title="Select" figma={figma.select} note="Native select on the Input field shell: same 4 sizes and states. Use Radio or ChoiceCard for 4 or fewer options.">
        <Group title="size × state">
          <Matrix
            rows={fieldSizes}
            cols={['Initial', 'Filled', 'Disabled', 'Success', 'Danger'] as const}
            rowLabel={(r) => `size="${r}"`}
            cell={(size, state) => (
              <Select
                size={size}
                className="w-52"
                aria-label={`${state} ${size}`}
                defaultValue={state === 'Initial' || state === 'Disabled' ? '' : 'Canada'}
                disabled={state === 'Disabled'}
                status={state === 'Success' ? 'success' : state === 'Danger' ? 'danger' : undefined}
              >
                <option value="" disabled>Choose a country</option>
                {countries.map((c) => <option key={c}>{c}</option>)}
              </Select>
            )}
          />
        </Group>
        <Group title="Form field (Default) and Inline">
          <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="s-country" required>Country</Label>
              <Select id="s-country" defaultValue="">
                <option value="" disabled>Choose a country</option>
                {countries.map((c) => <option key={c}>{c}</option>)}
              </Select>
              <HelperText>Used for tax calculation.</HelperText>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="s-inline" className="mb-0 shrink-0">Sort by</Label>
              <Select id="s-inline" size="sm" defaultValue="Newest">
                <option>Newest</option>
                <option>Oldest</option>
                <option>Popular</option>
              </Select>
            </div>
          </div>
        </Group>
      </Section>

      <Section id="textarea" title="Textarea" figma={figma.textarea} note="Default, Buttons inside, Buttons outside and Chatroom. Focus is CSS (click into a field).">
        <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
          <Labeled label="Default · Initial">
            <Textarea className="w-full" aria-label="Message" placeholder="Write your thoughts here…" />
          </Labeled>
          <Labeled label="Default · Filled">
            <Textarea className="w-full" aria-label="Filled message" defaultValue="The design system keeps Figma and code in sync." />
          </Labeled>
          <Labeled label='status="danger"'>
            <Textarea className="w-full" aria-label="Invalid message" status="danger" defaultValue="Too short" />
          </Labeled>
          <Labeled label="disabled">
            <Textarea className="w-full" aria-label="Disabled message" disabled placeholder="Disabled" />
          </Labeled>
          <Labeled label="Buttons inside (footer)">
            <Textarea
              className="w-full"
              aria-label="Comment"
              placeholder="Write a comment…"
              footer={
                <>
                  <div className="flex gap-1">
                    <TextareaToolButton label="Attach image"><ImageIcon /></TextareaToolButton>
                    <TextareaToolButton label="Add emoji"><InfoIcon /></TextareaToolButton>
                  </div>
                  <Button size="sm">Post comment</Button>
                </>
              }
            />
          </Labeled>
          <Labeled label="Buttons outside">
            <div className="flex w-full flex-col gap-4">
              <Textarea aria-label="Reply" placeholder="Write a reply…" rows={3} />
              <div><Button size="sm">Publish</Button></div>
            </div>
          </Labeled>
          <Labeled label="Chatroom">
            <form
              className="flex w-full items-center gap-2 rounded-lg bg-neutral-secondary-soft p-2"
              onSubmit={(e) => {
                e.preventDefault()
                setMessage('')
              }}
            >
              <Button color="ghost" size="sm" iconOnly aria-label="Attach image"><ImageIcon /></Button>
              <Input size="sm" className="flex-1" aria-label="Chat message" placeholder="Your message…" value={message} onChange={(e) => setMessage(e.target.value)} />
              <Button color="ghost" size="sm" iconOnly aria-label="Send" type="submit" className="text-fg-brand"><SendIcon /></Button>
            </form>
          </Labeled>
        </div>
      </Section>

      <Section id="dropdown" title="Dropdown" figma={figma.dropdown} note="Click a trigger. Arrow keys move between items, Esc closes and returns focus, clicking outside closes.">
        <DropdownDemos />
      </Section>

      <Section id="toast" title="Toast" figma={figma.toast} note="All 9 Figma types. Live toasts stack bottom-end with role=status (errors role=alert).">
        <ToastDemos />
      </Section>

      <Section id="drawer" title="Drawer" figma={figma.drawer} note="Start, end and bottom placements; 320px (sm) and 384px (md) widths. Esc or backdrop click closes.">
        <DrawerDemos />
      </Section>

      <Section id="tabs" title="Tabs" figma={figma.tabs} note="7 variants. Arrow keys move between tabs; the last tab is disabled.">
        {(['text', 'underline', 'pills', 'button', 'segmented'] as const).map((v) => (
          <Group key={v} title={`variant="${v}"`}>
            <div className="rounded-base border border-default bg-neutral-primary-soft p-5">
              <TabsDemo variant={v} withPanels={v === 'underline'} />
            </div>
          </Group>
        ))}
        <div className="grid gap-6 md:grid-cols-2">
          {(['vertical-pills', 'vertical-list'] as const).map((v) => (
            <Group key={v} title={`variant="${v}"`}>
              <div className="rounded-base border border-default bg-neutral-primary-soft p-5">
                <TabsDemo variant={v} withPanels />
              </div>
            </Group>
          ))}
        </div>
      </Section>

      <Section id="navbar" title="Navbar" figma={figma.navbar} note="Links show from md; below md a menu button opens the mobile menu. Resize the window to see it.">
        <Group title="Default (links + actions)">
          <div className="overflow-hidden rounded-base border border-default">
            <Navbar
              logo={<Logo />}
              links={[
                { label: 'Home', href: '#navbar', current: true },
                { label: 'Services', href: '#navbar' },
                { label: 'Pricing', href: '#navbar' },
                { label: 'Contact', href: '#navbar' },
                { label: 'Careers', href: '#navbar', disabled: true },
              ]}
              actions={<><Button color="secondary">Log in</Button><Button>Get started</Button></>}
            />
          </div>
        </Group>
        <Group title="With search input">
          <div className="overflow-hidden rounded-base border border-default">
            <Navbar
              logo={<Logo />}
              links={[{ label: 'Docs', href: '#navbar', current: true }, { label: 'Components', href: '#navbar' }, { label: 'Blog', href: '#navbar' }]}
              search={<Input size="sm" className="w-56" aria-label="Search" placeholder="Search" leftIcon={<InfoIcon />} />}
            />
          </div>
        </Group>
        <Group title="With icons">
          <div className="overflow-hidden rounded-base border border-default">
            <Navbar
              logo={<Logo />}
              links={[{ label: 'Dashboard', href: '#navbar', current: true }, { label: 'Team', href: '#navbar' }, { label: 'Projects', href: '#navbar' }]}
              actions={
                <>
                  <Button color="ghost" size="sm" iconOnly aria-label="Notifications"><MailIcon /></Button>
                  <Button color="ghost" size="sm" iconOnly aria-label="Settings"><CogIcon /></Button>
                  <Avatar name="Ada Lovelace" size="base" />
                </>
              }
            />
          </div>
        </Group>
      </Section>

      <Section id="breadcrumb" title="Breadcrumb" figma={figma.breadcrumb} note="The last crumb is the current page (aria-current). Use for hierarchies 3+ levels deep.">
        <div className="flex flex-col gap-4 rounded-base border border-default bg-neutral-primary-soft p-5">
          <Labeled label='variant="default"'>
            <Breadcrumb items={[{ label: 'Home', href: '#breadcrumb', icon: <HomeIcon /> }, { label: 'Projects', href: '#breadcrumb' }, { label: 'AD Design Kit' }]} />
          </Labeled>
          <Labeled label='variant="background"'>
            <Breadcrumb variant="background" items={[{ label: 'Home', href: '#breadcrumb', icon: <HomeIcon /> }, { label: 'Projects', href: '#breadcrumb' }, { label: 'AD Design Kit' }]} />
          </Labeled>
          <Labeled label="With badge">
            <Breadcrumb items={[{ label: 'Home', href: '#breadcrumb', icon: <HomeIcon /> }, { label: 'Releases', href: '#breadcrumb' }, { label: <Badge color="brand" size="sm">v2.0</Badge> }]} />
          </Labeled>
          <Labeled label="With dropdown">
            <Breadcrumb
              items={[
                { label: 'Home', href: '#breadcrumb', icon: <HomeIcon /> },
                { label: 'Projects', href: '#breadcrumb' },
                {
                  label: (
                    <Dropdown label="Projects" trigger={<Button size="xs" color="secondary" rightIcon={<ChevronDown />}>AD Design Kit</Button>}>
                      <DropdownItem>AD Design Kit</DropdownItem>
                      <DropdownItem>Marketing site</DropdownItem>
                      <DropdownItem>Mobile app</DropdownItem>
                    </Dropdown>
                  ),
                },
              ]}
            />
          </Labeled>
        </div>
      </Section>

      <Section id="pagination" title="Pagination" figma={figma.pagination} note="Built from Tertiary sm buttons. Figma has no current-page variant; the current page uses the Tertiary Hover style.">
        <div className="flex flex-col gap-6 rounded-base border border-default bg-neutral-primary-soft p-5">
          <Labeled label='variant="default"'><PaginationDemo variant="default" /></Labeled>
          <Labeled label="Buttons & helper text"><PaginationDemo variant="default" helper /></Labeled>
          <Labeled label='variant="arrows"'><PaginationDemo variant="arrows" helper /></Labeled>
          <Labeled label='variant="two-buttons"'><PaginationDemo variant="two-buttons" /></Labeled>
        </div>
      </Section>

      <Section id="table" title="Table" figma={figma.table} note="Striped rows, Striped columns and With table caption, with the optional toolbar row.">
        <Group title='striped="rows" + toolbar'>
          <DemoTable striped="rows" withToolbar />
        </Group>
        <Group title='striped="columns"'>
          <DemoTable striped="columns" />
        </Group>
        <Group title="caption">
          <DemoTable withCaption />
        </Group>
      </Section>
    </>
  )
}
