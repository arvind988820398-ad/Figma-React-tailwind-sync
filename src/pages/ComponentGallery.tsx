// Every Figma variant of each AuxoKit React component, laid out as labelled grids.
// Interaction states (Hover / Focus / Active) are CSS states in code — hover or Tab to see them.
import { Fragment, useState } from 'react'
import { ArrowRightIcon, CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../components/icons'
import { Alert, type AlertColor, type AlertVariant } from '../components/ui/Alert'
import { Avatar, AvatarGroup, type AvatarSize, type AvatarStatus } from '../components/ui/Avatar'
import { Badge, type BadgeColor, type BadgeSize } from '../components/ui/Badge'
import { Button, type ButtonColor, type ButtonSize } from '../components/ui/Button'
import { Card, CardText, CardTitle } from '../components/ui/Card'
import { Checkbox, Radio } from '../components/ui/Checkbox'
import { IconShape, type IconShapeColor, type IconShapeSize } from '../components/ui/IconShape'
import { HelperText, Input, Label, type FieldSize } from '../components/ui/Input'
import { Modal, type ModalSize } from '../components/ui/Modal'
import { Progress, type ProgressColor } from '../components/ui/Progress'
import { Spinner, type SpinnerSize } from '../components/ui/Spinner'
import { Toggle, type ToggleSize } from '../components/ui/Toggle'
import { Tooltip, type TooltipPlacement } from '../components/ui/Tooltip'
import { Group, Labeled, Matrix, Row, Section } from './gallery-layout'
import MoreSections, { moreSections } from './MoreSections'
import ContentSections, { contentSections } from './ContentSections'
import InputSections, { inputSections } from './InputSections'
import FinalSections, { finalSections } from './FinalSections'

const buttonColors: ButtonColor[] = ['brand', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost']
const buttonSizes: ButtonSize[] = ['xs', 'sm', 'base', 'lg', 'xl']
const outlineColors = ['success', 'danger', 'warning'] as const
const badgeColors: BadgeColor[] = ['gray', 'white', 'brand', 'success', 'warning', 'danger']
const badgeSizes: BadgeSize[] = ['sm', 'lg']
const alertColors: AlertColor[] = ['neutral', 'info', 'success', 'warning', 'danger']
const alertVariants: AlertVariant[] = ['default', 'complex', 'pill', 'border-top'] // auxokit-lint-ignore: Alert prop values, not classes
const fieldSizes: FieldSize[] = ['sm', 'base', 'lg', 'xl']
const avatarSizes: AvatarSize[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl']
const avatarStatuses: AvatarStatus[] = ['online', 'offline', 'away']
const iconShapeColors: IconShapeColor[] = ['brand', 'success', 'danger', 'warning', 'gray', 'dark', 'white']
const iconShapeSizes: IconShapeSize[] = ['xs', 'sm', 'base', 'lg', 'xl', '2xl']
const progressColors: ProgressColor[] = ['brand', 'gray', 'dark', 'success', 'danger', 'warning']
const spinnerSizes: SpinnerSize[] = ['xs', 'sm', 'md', 'lg', 'xl']
const toggleSizes: ToggleSize[] = ['base', 'lg']
const tooltipPlacements: TooltipPlacement[] = ['top', 'right', 'bottom', 'left']
const modalSizes: ModalSize[] = ['sm', 'md', 'lg', 'xl']

const sections = [
  { id: 'button', name: 'Button', figma: 'Button · 1146:24616' },
  { id: 'badge', name: 'Badge', figma: 'Badge · 1146:22250' },
  { id: 'alert', name: 'Alert', figma: 'Alert · 1146:15151' },
  { id: 'input', name: 'Input, Label, HelperText', figma: 'Input field · 1149:46826' },
  { id: 'checkbox', name: 'Checkbox & Radio', figma: 'Checkbox input · 1149:54707' },
  { id: 'toggle', name: 'Toggle', figma: 'Toggle switches · 1149:54432' },
  { id: 'card', name: 'Card', figma: 'Card · 1149:34153' },
  { id: 'avatar', name: 'Avatar', figma: 'Avatar · 1146:5507' },
  { id: 'icon-shape', name: 'Icon shape', figma: 'Icon Shape' },
  { id: 'progress', name: 'Progress', figma: 'Progress bar' },
  { id: 'spinner', name: 'Spinner', figma: 'Spinner · 1149:83311' },
  { id: 'tooltip', name: 'Tooltip', figma: 'Tooltip · 1149:93859' },
  { id: 'modal', name: 'Modal', figma: 'Modal' },
] as const

function ToggleDemo({ size, initial, disabled, label }: { size: ToggleSize; initial: boolean; disabled?: boolean; label: string }) {
  const [on, setOn] = useState(initial)
  return (
    <Toggle size={size} checked={on} onCheckedChange={setOn} disabled={disabled}>
      {label}
    </Toggle>
  )
}

export default function ComponentGallery() {
  const [openModal, setOpenModal] = useState<ModalSize | 'confirm' | null>(null)

  return (
    <div className="mx-auto flex max-w-7xl gap-10 px-4 py-10">
      <nav aria-label="Components" className="sticky top-24 hidden h-fit w-52 shrink-0 flex-col gap-1 lg:flex">
        {[...sections, ...moreSections, ...contentSections, ...inputSections, ...finalSections].map((s) => (
          <a key={s.id} href={`#${s.id}`} className="rounded-base px-3 py-2 text-sm font-medium text-body hover:bg-neutral-secondary-medium hover:text-heading">
            {s.name}
          </a>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col gap-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold leading-9 text-heading">Component variants</h1>
          <p className="text-base text-body">
            Every Figma variant of all 56 AuxoKit components with React code, labelled with the props that produce it. Hover, Focus and Active are CSS
            states: hover a component or press Tab to see them. Switch the theme in the header to see all variants re-theme.
          </p>
        </div>

        <Section id="button" title="Button" figma={sections[0].figma} note="8 colors × 5 sizes. Disabled is the native disabled attribute; outline exists only for success, danger and warning.">
          <Group title="color × size">
            <Matrix rows={buttonColors} cols={buttonSizes} rowLabel={(r) => `color="${r}"`} cell={(color, size) => <Button color={color} size={size}>Button</Button>} />
          </Group>
          <Group title="Disabled">
            <Matrix rows={['disabled'] as const} cols={buttonColors} cell={(_, color) => <Button color={color} disabled>Button</Button>} />
          </Group>
          <Group title="outline (success · danger · warning)">
            <Matrix rows={outlineColors} cols={buttonSizes} rowLabel={(r) => `color="${r}" outline`} cell={(color, size) => <Button color={color} outline size={size}>Button</Button>} />
          </Group>
          <Group title="iconOnly × size">
            <Matrix
              rows={buttonColors}
              cols={buttonSizes}
              rowLabel={(r) => `color="${r}"`}
              cell={(color, size) => (
                <Button color={color} size={size} iconOnly aria-label="Settings">
                  <CogIcon />
                </Button>
              )}
            />
          </Group>
          <Group title="Icons">
            <Row>
              <Labeled label="leftIcon"><Button leftIcon={<PlusIcon />}>New project</Button></Labeled>
              <Labeled label="rightIcon"><Button color="secondary" rightIcon={<ArrowRightIcon />}>Continue</Button></Labeled>
              <Labeled label="both"><Button color="dark" leftIcon={<MailIcon />} rightIcon={<ArrowRightIcon />}>Send</Button></Labeled>
            </Row>
          </Group>
        </Section>

        <Section id="badge" title="Badge" figma={sections[1].figma} note="6 colors × 2 sizes, plus the Figma types With dot, With loader, With avatar, Only text and Only icon.">
          <Group title="color × size">
            <Matrix rows={badgeColors} cols={badgeSizes} rowLabel={(r) => `color="${r}"`} cell={(color, size) => <Badge color={color} size={size}>Badge</Badge>} />
          </Group>
          <Group title="Types (leading / circle / rightIcon)">
            <Matrix
              rows={badgeSizes}
              cols={['With dot', 'With loader', 'With avatar', 'Right icon', 'Only text', 'Only icon'] as const}
              rowLabel={(r) => `size="${r}"`}
              cell={(size, type) => {
                switch (type) {
                  case 'With dot':
                    return <Badge color="success" size={size} leading={<span className="size-1.5 rounded-full bg-success" />}>Online</Badge>
                  case 'With loader':
                    return <Badge color="brand" size={size} leading={<Spinner size="xs" label="Syncing" />}>Syncing</Badge>
                  case 'With avatar':
                    return <Badge size={size} leading={<Avatar name="Ada Lovelace" size="xs" />}>Ada</Badge>
                  case 'Right icon':
                    return <Badge color="brand" size={size} rightIcon={<CheckIcon />}>Verified</Badge>
                  case 'Only text':
                    return <Badge color="danger" size={size} circle>8</Badge>
                  case 'Only icon':
                    return <Badge color="brand" size={size} circle aria-label="Verified"><CheckIcon /></Badge>
                }
              }}
            />
          </Group>
        </Section>

        <Section id="alert" title="Alert" figma={sections[2].figma} note="5 colors × 4 variants. Complex alerts add a title, actions and a dismiss button.">
          {alertVariants.map((variant) => (
            <Group key={variant} title={`variant="${variant}"`}>
              <div className="flex flex-col items-start gap-3">
                {alertColors.map((color) =>
                  variant === 'complex' ? (
                    <Alert
                      key={color}
                      className="w-full"
                      variant="complex"
                      color={color}
                      icon={<InfoIcon />}
                      title={`${color[0].toUpperCase() + color.slice(1)} alert`}
                      onDismiss={() => {}}
                      actions={
                        <>
                          <Button size="xs" color={color === 'danger' ? 'danger' : color === 'success' ? 'success' : color === 'warning' ? 'warning' : 'brand'}>View more</Button>
                          <Button size="xs" color="tertiary">Dismiss</Button>
                        </>
                      }
                    >
                      More detail about this {color} message goes here.
                    </Alert>
                  ) : variant === 'pill' ? (
                    <Alert key={color} variant="pill" color={color}>
                      <span className="flex items-center gap-2">
                        <Badge color={color === 'neutral' ? 'gray' : color === 'info' ? 'brand' : color} size="sm">New</Badge>
                        color="{color}"
                      </span>
                    </Alert>
                  ) : (
                    <Alert key={color} className="w-full" variant={variant} color={color} icon={<InfoIcon />}>
                      <span className="font-medium">color="{color}"</span> — a short message for the user.
                    </Alert>
                  ),
                )}
              </div>
            </Group>
          ))}
        </Section>

        <Section id="input" title="Input, Label, HelperText" figma={sections[3].figma} note="4 sizes × 7 states. Focus/Typing is CSS (click a field). Add-on icon uses leftIcon / rightIcon.">
          <Group title="size × state">
            <Matrix
              rows={fieldSizes}
              cols={['Initial', 'Filled', 'Disabled', 'Read-only', 'Success', 'Danger'] as const}
              rowLabel={(r) => `size="${r}"`}
              cell={(size, state) => {
                const common = { size, className: 'w-52', 'aria-label': `${state} ${size}` }
                switch (state) {
                  case 'Initial':
                    return <Input {...common} placeholder="name@company.com" />
                  case 'Filled':
                    return <Input {...common} defaultValue="ada@auxokit.dev" />
                  case 'Disabled':
                    return <Input {...common} disabled placeholder="Disabled" />
                  case 'Read-only':
                    return <Input {...common} readOnly defaultValue="Read only" />
                  case 'Success':
                    return <Input {...common} status="success" defaultValue="Available" />
                  case 'Danger':
                    return <Input {...common} status="danger" aria-invalid defaultValue="Taken" />
                }
              }}
            />
          </Group>
          <Group title="Add-on icon">
            <Row>
              <Labeled label="leftIcon"><Input aria-label="Email" className="w-64" leftIcon={<MailIcon />} placeholder="Email" /></Labeled>
              <Labeled label="rightIcon"><Input aria-label="Search" className="w-64" rightIcon={<InfoIcon />} placeholder="Search" /></Labeled>
            </Row>
          </Group>
          <Group title="Label + HelperText">
            <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-3">
              <div>
                <Label htmlFor="g-name" required>Full name</Label>
                <Input id="g-name" placeholder="Ada Lovelace" />
                <HelperText>As it appears on your ID.</HelperText>
              </div>
              <div>
                <Label htmlFor="g-user">Username</Label>
                <Input id="g-user" status="success" defaultValue="ada" />
                <HelperText status="success">Username is available.</HelperText>
              </div>
              <div>
                <Label htmlFor="g-mail">Email</Label>
                <Input id="g-mail" status="danger" aria-invalid defaultValue="ada@" />
                <HelperText status="danger">Enter a valid email address.</HelperText>
              </div>
            </div>
          </Group>
        </Section>

        <Section id="checkbox" title="Checkbox & Radio" figma={sections[4].figma} note="Checked × Initial/Disabled. Focus is CSS (Tab to a box).">
          <Matrix
            rows={['Checkbox', 'Radio'] as const}
            cols={['Unchecked', 'Checked', 'Disabled', 'Disabled checked', 'With description'] as const}
            cell={(type, state) => {
              const C = type === 'Checkbox' ? Checkbox : Radio
              const id = `g-${type}-${state}`.replace(/\s+/g, '-')
              return (
                <C
                  id={id}
                  name={type === 'Radio' ? id : undefined}
                  label="Label"
                  defaultChecked={state === 'Checked' || state === 'Disabled checked'}
                  disabled={state.startsWith('Disabled')}
                  description={state === 'With description' ? 'Helper text' : undefined}
                />
              )
            }}
          />
        </Section>

        <Section id="toggle" title="Toggle" figma={sections[5].figma} note="2 sizes × Checked × Initial/Disabled. Click to toggle; Focus is CSS.">
          <Matrix
            rows={toggleSizes}
            cols={['Off', 'On', 'Disabled off', 'Disabled on'] as const}
            rowLabel={(r) => `size="${r}"`}
            cell={(size, state) => <ToggleDemo size={size} initial={state.endsWith('On') || state.endsWith('on')} disabled={state.startsWith('Disabled')} label="Label" />}
          />
        </Section>

        <Section id="card" title="Card" figma={sections[6].figma} note="Shell paddings used across the Figma card types. Composite types (Pricing, Login form…) are compositions of these.">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardTitle>padding="base"</CardTitle>
              <CardText>p-6 — image, pricing and most card types.</CardText>
            </Card>
            <Card padding="roomy">
              <CardTitle>padding="roomy"</CardTitle>
              <CardText>p-7 — Figma "Default" text card and Grid card.</CardText>
            </Card>
            <Card padding="none" media={<div className="aspect-video bg-neutral-tertiary" />}>
              <div className="flex flex-col gap-2 p-6">
                <CardTitle>media + padding="none"</CardTitle>
                <CardText>Full-bleed image on top.</CardText>
              </div>
            </Card>
          </div>
        </Section>

        <Section id="avatar" title="Avatar" figma={sections[7].figma} note="6 sizes × Default / With status. Placeholder initials are shown; pass src for a photo.">
          <Matrix
            rows={['Default', ...avatarStatuses] as const}
            cols={avatarSizes}
            rowLabel={(r) => (r === 'Default' ? 'default' : `status="${r}"`)}
            cell={(type, size) => <Avatar name="Ada Lovelace" size={size} status={type === 'Default' ? undefined : type} />}
          />
          <Group title="AvatarGroup">
            <Row>
              <AvatarGroup>
                {['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson'].map((n) => (
                  <Avatar key={n} name={n} size="lg" bordered />
                ))}
              </AvatarGroup>
            </Row>
          </Group>
        </Section>

        <Section id="icon-shape" title="Icon shape" figma={sections[8].figma} note="7 colors × 6 sizes × square/circle.">
          {(['square', 'circle'] as const).map((shape) => (
            <Group key={shape} title={`shape="${shape}"`}>
              <Matrix
                rows={iconShapeColors}
                cols={iconShapeSizes}
                rowLabel={(r) => `color="${r}"`}
                cell={(color, size) => (
                  <IconShape color={color} size={size} shape={shape}>
                    <InfoIcon />
                  </IconShape>
                )}
              />
            </Group>
          ))}
        </Section>

        <Section id="progress" title="Progress" figma={sections[9].figma} note="6 colors × 2 sizes, label top / side / bottom.">
          <Group title="color × size">
            <div className="grid gap-5 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
              {progressColors.map((color) => (
                <Fragment key={color}>
                  <Progress value={65} color={color} label={`color="${color}"`} />
                  <Progress value={65} color={color} size="lg" label={`color="${color}" size="lg"`} />
                </Fragment>
              ))}
            </div>
          </Group>
          <Group title="labelPosition">
            <div className="grid gap-5 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-3">
              {(['top', 'side', 'bottom'] as const).map((p) => (
                <Progress key={p} value={40} label={`labelPosition="${p}"`} labelPosition={p} />
              ))}
            </div>
          </Group>
        </Section>

        <Section id="spinner" title="Spinner" figma={sections[10].figma} note="5 sizes (12 / 24 / 50 / 75 / 100 px) × track.">
          <Matrix
            rows={['track', 'no track'] as const}
            cols={spinnerSizes}
            cell={(t, size) => <Spinner size={size} track={t === 'track'} />}
          />
        </Section>

        <Section id="tooltip" title="Tooltip" figma={sections[11].figma} note="4 placements. Hover or focus a button to open its tooltip.">
          <div className="flex flex-wrap items-center justify-center gap-10 rounded-base border border-default bg-neutral-primary-soft px-5 py-16">
            {tooltipPlacements.map((placement) => (
              <Tooltip key={placement} content={`placement="${placement}"`} placement={placement}>
                <Button color="secondary">{placement}</Button>
              </Tooltip>
            ))}
          </div>
        </Section>

        <Section id="modal" title="Modal" figma={sections[12].figma} note="4 widths. Destructive confirmations use dismissible={false} (no backdrop-click close).">
          <Row>
            {modalSizes.map((size) => (
              <Button key={size} color="secondary" onClick={() => setOpenModal(size)}>size="{size}"</Button>
            ))}
            <Button color="danger" onClick={() => setOpenModal('confirm')}>dismissible=false</Button>
          </Row>
        </Section>

        <MoreSections />
        <ContentSections />
        <InputSections />
        <FinalSections />
      </div>

      {modalSizes.map((size) => (
        <Modal
          key={size}
          open={openModal === size}
          onOpenChange={(o) => setOpenModal(o ? size : null)}
          size={size}
          title={`Modal size="${size}"`}
          footer={
            <>
              <Button color="tertiary" onClick={() => setOpenModal(null)}>Cancel</Button>
              <Button onClick={() => setOpenModal(null)}>Accept</Button>
            </>
          }
        >
          <p className="text-base text-body">Header, body and footer use the Figma Modal recipe; only the width changes per size.</p>
        </Modal>
      ))}
      <Modal
        open={openModal === 'confirm'}
        onOpenChange={(o) => setOpenModal(o ? 'confirm' : null)}
        size="sm"
        dismissible={false}
        title="Delete project?"
        footer={
          <>
            <Button color="tertiary" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button color="danger" onClick={() => setOpenModal(null)}>Delete</Button>
          </>
        }
      >
        <p className="text-base text-body">This can’t be undone. Clicking the backdrop won’t close this dialog.</p>
      </Modal>
    </div>
  )
}
