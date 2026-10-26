import { useEffect, useState, type ReactNode } from 'react'
import { CogIcon, InfoIcon, PlusIcon } from './components/icons'
import { Alert } from './components/ui/Alert'
import { Avatar, AvatarGroup } from './components/ui/Avatar'
import { Badge } from './components/ui/Badge'
import { Button, buttonVariants } from './components/ui/Button'
import { Card, CardText, CardTitle } from './components/ui/Card'
import { Checkbox, Radio } from './components/ui/Checkbox'
import { IconShape } from './components/ui/IconShape'
import { HelperText, Input, Label, inputVariants } from './components/ui/Input'
import { Modal } from './components/ui/Modal'
import { Progress } from './components/ui/Progress'
import { Spinner } from './components/ui/Spinner'
import { Toggle } from './components/ui/Toggle'
import { Tooltip } from './components/ui/Tooltip'
import { loadTheme, setTheme, themes, type AuxoTheme } from './lib/theme'
import ComponentGallery from './pages/ComponentGallery'

type Page = 'overview' | 'components'
const pagePath: Record<Page, string> = { overview: '/', components: '/components' }
const pageFromPath = (): Page => (window.location.pathname.startsWith('/components') ? 'components' : 'overview')

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold leading-7 text-heading">{title}</h2>
      {children}
    </section>
  )
}

export default function App() {
  const initial = loadTheme()
  const [theme, setThemeState] = useState<AuxoTheme>(initial.theme)
  const [dark, setDark] = useState(initial.dark)
  const [notify, setNotify] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState<Page>(pageFromPath)

  useEffect(() => {
    const onPop = () => setPage(pageFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = (next: Page) => {
    if (next === page) return
    window.history.pushState(null, '', pagePath[next])
    setPage(next)
    window.scrollTo(0, 0)
  }

  const applyTheme = (next: AuxoTheme, nextDark: boolean) => {
    setThemeState(next)
    setDark(nextDark)
    setTheme(next, nextDark)
  }

  return (
    <div className="min-h-screen bg-neutral-primary font-sans">
      <header className="sticky top-0 z-40 border-b border-default bg-neutral-primary-soft">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <IconShape size="sm" color="brand">
              <CogIcon />
            </IconShape>
            <span className="text-base font-semibold text-heading">AuxoKit starter</span>
            <nav aria-label="Pages" className="ms-4 flex gap-1">
              {(['overview', 'components'] as const).map((p) => (
                <a
                  key={p}
                  href={pagePath[p]}
                  aria-current={page === p ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    navigate(p)
                  }}
                  className={buttonVariants({ color: 'ghost', size: 'sm', className: page === p ? 'bg-neutral-secondary-medium text-fg-brand' : 'text-body' })}
                >
                  {p === 'overview' ? 'Overview' : 'Components'}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label htmlFor="theme" className="sr-only">
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => applyTheme(e.target.value as AuxoTheme, dark)}
              className={inputVariants({ size: 'sm' })}
            >
              {themes.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <Toggle checked={dark} onCheckedChange={(d) => applyTheme(theme, d)}>
              Dark mode
            </Toggle>
          </div>
        </div>
      </header>

      {page === 'components' ? (
        <main>
          <ComponentGallery />
        </main>
      ) : (
        <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold leading-9 text-heading">Your design system is wired up</h1>
            <p className="text-base text-body">
              Every class on this page is an AuxoKit token. Switch the theme or dark mode above and every color, radius and font follows Figma.
            </p>
          </div>

          <Section title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button leftIcon={<PlusIcon />}>Create project</Button>
              <Button color="secondary">Secondary</Button>
              <Button color="tertiary">Tertiary</Button>
              <Button color="dark">Dark</Button>
              <Button color="ghost">Ghost</Button>
              <Button color="danger" outline>
                Delete
              </Button>
              <Button color="success">Success</Button>
              <Button disabled>Disabled</Button>
              <Tooltip content="Settings">
                <Button color="secondary" iconOnly aria-label="Settings">
                  <CogIcon />
                </Button>
              </Tooltip>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="base">Base</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra large</Button>
            </div>
          </Section>

          <Section title="Badges">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Gray</Badge>
              <Badge color="brand">Brand</Badge>
              <Badge color="success" leading={<span className="size-1.5 rounded-full bg-success" />}>
                Active
              </Badge>
              <Badge color="warning">Pending</Badge>
              <Badge color="danger" size="lg">
                Failed
              </Badge>
              <Badge color="brand" circle>
                3
              </Badge>
            </div>
          </Section>

          <Section title="Alerts">
            <Alert color="info" icon={<InfoIcon />} title="Heads up">
              Tokens in this app are generated from the Figma file.
            </Alert>
            <Alert color="success" icon={<InfoIcon />}>
              Your changes were saved.
            </Alert>
            <Alert color="danger" icon={<InfoIcon />}>
              We couldn’t reach the server. Try again.
            </Alert>
          </Section>

          <div className="grid gap-8 md:grid-cols-2">
            <Section title="Form">
              <Card className="flex flex-col gap-5">
                <div>
                  <Label htmlFor="email" required>
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="name@company.com" />
                  <HelperText>We’ll never share your email.</HelperText>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" status="danger" defaultValue="taken-name" aria-invalid aria-describedby="username-error" />
                  <HelperText id="username-error" status="danger">
                    That username is already taken.
                  </HelperText>
                </div>
                <Checkbox id="terms" label="I agree to the terms" description="You can withdraw consent at any time." />
                <fieldset className="flex flex-col gap-3">
                  <legend className="mb-2 text-sm font-medium text-heading">Plan</legend>
                  <Radio id="plan-free" name="plan" label="Free" defaultChecked />
                  <Radio id="plan-pro" name="plan" label="Pro" />
                </fieldset>
                <Toggle checked={notify} onCheckedChange={setNotify} description="Applies immediately.">
                  Email notifications
                </Toggle>
                <div className="flex justify-end gap-3">
                  <Button color="tertiary">Cancel</Button>
                  <Button onClick={() => setModalOpen(true)}>Save</Button>
                </div>
              </Card>
            </Section>

            <Section title="Data display">
              <Card padding="roomy" className="flex flex-col gap-4">
                <CardTitle>Team</CardTitle>
                <CardText>Avatars, progress and status in a card surface.</CardText>
                <AvatarGroup>
                  <Avatar name="Ada Lovelace" bordered />
                  <Avatar name="Grace Hopper" bordered />
                  <Avatar name="Alan Turing" bordered />
                </AvatarGroup>
                <div className="flex items-center gap-3">
                  <Avatar name="Katherine Johnson" size="lg" status="online" />
                  <div>
                    <p className="text-base font-medium text-heading">Katherine Johnson</p>
                    <p className="text-sm text-body">Online</p>
                  </div>
                </div>
                <Progress value={64} label="Storage" />
                <Progress value={88} color="success" label="Uploads" />
              </Card>
              <div className="flex items-center gap-4">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <IconShape color="success" shape="circle">
                  <InfoIcon />
                </IconShape>
                <IconShape color="warning">
                  <InfoIcon />
                </IconShape>
              </div>
            </Section>
          </div>
          <p className="text-base text-body">
            Want every variant?{' '}
            <a
              href={pagePath.components}
              onClick={(e) => {
                e.preventDefault()
                navigate('components')
              }}
              className="font-medium text-fg-brand hover:underline"
            >
              Open the component gallery
            </a>
            .
          </p>
        </main>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Save changes?"
        footer={
          <>
            <Button color="tertiary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Save</Button>
          </>
        }
      >
        <p className="text-base text-body">Your profile and notification settings will be updated.</p>
      </Modal>
    </div>
  )
}
