// Gallery sections for Button group, Speed dial, Bottom navigation, Number / Phone / Copy / Tag / OTP inputs,
// Floating label input and Choice cards.
import { useState } from 'react'
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../components/icons'
import { Avatar } from '../components/ui/Avatar'
import { BottomNavigation, type BottomNavigationVariant } from '../components/ui/BottomNavigation'
import { ButtonGroup, ButtonGroupItem, type ButtonGroupColor, type ButtonGroupSize } from '../components/ui/ButtonGroup'
import { ChoiceCard, ChoiceGroup } from '../components/ui/ChoiceCard'
import { CopyInput, type CopyInputVariant } from '../components/ui/CopyInput'
import { FloatingLabelInput, type FloatingLabelVariant } from '../components/ui/FloatingLabelInput'
import { HelperText, Label, type FieldSize } from '../components/ui/Input'
import { NumberInput, type NumberInputVariant } from '../components/ui/NumberInput'
import { OtpInput, type OtpInputVariant } from '../components/ui/OtpInput'
import { PhoneInput } from '../components/ui/PhoneInput'
import { SpeedDial, type SpeedDialDirection, type SpeedDialVariant } from '../components/ui/SpeedDial'
import { TagInput } from '../components/ui/TagInput'
import { Group, Labeled, Matrix, Row, Section } from './gallery-layout'

export const inputSections = [
  { id: 'button-group', name: 'Button group', figma: 'Group button · 1149:31694' },
  { id: 'speed-dial', name: 'Speed dial', figma: 'Speed dial · 1149:84847' },
  { id: 'bottom-navigation', name: 'Bottom navigation', figma: 'Bottom navigation · 1146:27386' },
  { id: 'number-input', name: 'Number input', figma: 'Number form · 1149:46630' },
  { id: 'phone-input', name: 'Phone input', figma: 'Phone form · 1149:46719' },
  { id: 'copy-input', name: 'Copy to clipboard', figma: 'Copy to clipboard form · 1149:46768' },
  { id: 'tag-input', name: 'Tag input', figma: 'Tag input · 1149:49173' },
  { id: 'otp-input', name: 'OTP input', figma: 'OTP Inputs · 1149:49523' },
  { id: 'floating-label', name: 'Floating label input', figma: 'Floating label · 1149:50454' },
  { id: 'choice-card', name: 'Choice cards', figma: 'Checkbox/Radio form · 1149:54726' },
] as const

const figma = Object.fromEntries(inputSections.map((s) => [s.id, s.figma])) as Record<(typeof inputSections)[number]['id'], string>
const fieldSizes: FieldSize[] = ['sm', 'base', 'lg', 'xl']

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
  </svg>
)
const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <circle cx="18" cy="5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="19" r="2.5" />
    <path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" />
  </svg>
)
const PrintIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z" strokeLinejoin="round" />
  </svg>
)
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function ButtonGroupDemo() {
  const [view, setView] = useState('Month')
  return (
    <>
      <Group title="size × color (Gray = Secondary items, White = Tertiary items)">
        <Matrix
          rows={['white', 'gray'] as ButtonGroupColor[]}
          cols={['xs', 'sm', 'base', 'lg'] as ButtonGroupSize[]}
          rowLabel={(r) => `color="${r}"`}
          cell={(color, size) => (
            <ButtonGroup color={color} size={size} label={`${color} ${size}`}>
              <ButtonGroupItem>Profile</ButtonGroupItem>
              <ButtonGroupItem>Settings</ButtonGroupItem>
              <ButtonGroupItem>Messages</ButtonGroupItem>
            </ButtonGroup>
          )}
        />
      </Group>
      <Group title="Examples">
        <Row>
          <Labeled label="Selected item (aria-pressed)">
            <ButtonGroup label="Calendar view">
              {['Day', 'Week', 'Month'].map((v) => (
                <ButtonGroupItem key={v} active={view === v} onClick={() => setView(v)}>{v}</ButtonGroupItem>
              ))}
            </ButtonGroup>
          </Labeled>
          <Labeled label="Only icons">
            <ButtonGroup label="Share actions" size="sm">
              <ButtonGroupItem iconOnly aria-label="Share"><ShareIcon /></ButtonGroupItem>
              <ButtonGroupItem iconOnly aria-label="Print"><PrintIcon /></ButtonGroupItem>
              <ButtonGroupItem iconOnly aria-label="Download"><DownloadIcon /></ButtonGroupItem>
            </ButtonGroup>
          </Labeled>
          <Labeled label="Plus & minus">
            <ButtonGroup label="Zoom" size="sm" color="gray">
              <ButtonGroupItem aria-label="Zoom out">−</ButtonGroupItem>
              <ButtonGroupItem>100%</ButtonGroupItem>
              <ButtonGroupItem aria-label="Zoom in">+</ButtonGroupItem>
            </ButtonGroup>
          </Labeled>
          <Labeled label="vertical">
            <ButtonGroup label="Vertical" vertical size="sm">
              <ButtonGroupItem>Top</ButtonGroupItem>
              <ButtonGroupItem>Middle</ButtonGroupItem>
              <ButtonGroupItem>Bottom</ButtonGroupItem>
            </ButtonGroup>
          </Labeled>
        </Row>
      </Group>
    </>
  )
}

const dialActions = [
  { label: 'Share', icon: <ShareIcon /> },
  { label: 'Print', icon: <PrintIcon /> },
  { label: 'Download', icon: <DownloadIcon /> },
  { label: 'Copy', icon: <CheckIcon />, disabled: true },
]

function BottomNavDemo() {
  const items = [
    { label: 'Home', href: '#bottom-navigation', icon: <HomeIcon />, current: true },
    { label: 'Inbox', href: '#bottom-navigation', icon: <MailIcon /> },
    { label: 'Info', href: '#bottom-navigation', icon: <InfoIcon /> },
    { label: 'Settings', href: '#bottom-navigation', icon: <CogIcon /> },
  ]
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {(['default', 'bordered', 'action'] as BottomNavigationVariant[]).map((v) => (
        <Labeled key={v} label={`variant="${v}"`}>
          <div className="flex h-40 w-full max-w-sm flex-col justify-end overflow-hidden rounded-base border border-default bg-neutral-secondary-soft p-2">
            <BottomNavigation
              variant={v}
              label={`Bottom navigation ${v}`}
              items={items}
              action={{ label: 'New item', icon: <PlusIcon />, onClick: () => {} }}
            />
          </div>
        </Labeled>
      ))}
    </div>
  )
}

function NumberDemo() {
  const [n, setN] = useState(3)
  return (
    <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
      {(['buttons', 'spaced', 'ghost', 'default'] as NumberInputVariant[]).map((v) => (
        <Labeled key={v} label={`variant="${v}"`}>
          <NumberInput className="max-w-48" variant={v} value={n} onChange={setN} min={0} max={10} aria-label={`Quantity (${v})`} />
        </Labeled>
      ))}
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="n-guests">Guests</Label>
        <NumberInput id="n-guests" className="max-w-48" value={n} onChange={setN} min={1} max={8} />
        <HelperText>Between 1 and 8 guests.</HelperText>
      </div>
    </div>
  )
}

function PhoneDemo() {
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('US')
  return (
    <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="p-phone">Phone number</Label>
        <PhoneInput id="p-phone" aria-describedby="p-phone-help" value={phone} onChange={setPhone} country={country} onCountryChange={setCountry} />
        <HelperText id="p-phone-help">We’ll text a verification code.</HelperText>
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="p-phone-bad">Phone number (danger)</Label>
        <PhoneInput id="p-phone-bad" value="12" onChange={() => {}} country="GB" onCountryChange={() => {}} status="danger" />
        <HelperText status="danger">Enter a full phone number.</HelperText>
      </div>
    </div>
  )
}

function TagDemo() {
  const [tags, setTags] = useState(['design', 'tokens'])
  const [emails, setEmails] = useState(['ada@ad-design-kit.dev'])
  return (
    <>
      <Group title="size">
        <div className="grid gap-4 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
          {fieldSizes.map((size) => (
            <Labeled key={size} label={`size="${size}"`}>
              <TagInput size={size} value={tags} onChange={setTags} aria-label={`Tags ${size}`} />
            </Labeled>
          ))}
        </div>
      </Group>
      <Group title="States and leading avatar">
        <div className="grid gap-4 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
          <Labeled label="renderLeading (Avatar)">
            <TagInput value={emails} onChange={setEmails} placeholder="Add email…" aria-label="Invite emails" renderLeading={(t) => <Avatar name={t} size="xs" />} />
          </Labeled>
          <Labeled label="disabled"><TagInput value={['locked']} onChange={() => {}} disabled aria-label="Disabled tags" /></Labeled>
          <Labeled label='status="success"'><TagInput value={['valid']} onChange={() => {}} status="success" aria-label="Valid tags" /></Labeled>
          <Labeled label='status="danger"'><TagInput value={['too-long-tag-name']} onChange={() => {}} status="danger" aria-label="Invalid tags" /></Labeled>
        </div>
      </Group>
    </>
  )
}

function OtpDemo() {
  const [code, setCode] = useState('')
  return (
    <>
      <Group title="Examples (Figma uses sm boxes)">
        <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
          {(['default', 'spaced', 'separator', 'separator-spaced'] as OtpInputVariant[]).map((v) => (
            <Labeled key={v} label={`variant="${v}"`}>
              <OtpInput variant={v} value={code} onChange={setCode} label={`Verification code (${v})`} />
            </Labeled>
          ))}
        </div>
      </Group>
      <Group title="size × state">
        <Matrix
          rows={fieldSizes}
          cols={['Filled', 'Disabled', 'Read-only', 'Success', 'Danger'] as const}
          rowLabel={(r) => `size="${r}"`}
          cell={(size, state) => (
            <OtpInput
              length={4}
              size={size}
              value={state === 'Disabled' ? '' : '1234'}
              onChange={() => {}}
              disabled={state === 'Disabled'}
              readOnly={state === 'Read-only' || state === 'Filled'}
              status={state === 'Success' ? 'success' : state === 'Danger' ? 'danger' : undefined}
              label={`${state} ${size}`}
            />
          )}
        />
      </Group>
    </>
  )
}

function ChoiceDemo() {
  const [plan, setPlan] = useState('pro')
  const [rating, setRating] = useState('4')
  return (
    <div className="grid gap-8 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-2">
      <ChoiceGroup label='variant="card" · radio (Left checkbox card)'>
        {[
          { v: 'starter', t: 'Starter', d: 'For personal projects', p: '$0' },
          { v: 'pro', t: 'Pro', d: 'For growing teams', p: '$29' },
          { v: 'enterprise', t: 'Enterprise', d: 'SSO and audit logs', p: 'Custom', disabled: true },
        ].map((o) => (
          <ChoiceCard key={o.v} name="plan" value={o.v} checked={plan === o.v} onChange={() => setPlan(o.v)} title={o.t} description={o.d} trailing={o.p} disabled={o.disabled} />
        ))}
      </ChoiceGroup>
      <ChoiceGroup label='variant="card" · checkbox with icon (Icon & text)'>
        <ChoiceCard type="checkbox" defaultChecked icon={<MailIcon />} title="Email" description="Weekly summary" />
        <ChoiceCard type="checkbox" icon={<InfoIcon />} title="Product updates" description="New features and releases" />
      </ChoiceGroup>
      <ChoiceGroup label='variant="bordered" (Bordered left input)'>
        <ChoiceCard variant="bordered" name="ship" defaultChecked title="Standard shipping" description="4–6 business days" />
        <ChoiceCard variant="bordered" name="ship" title="Express shipping" description="1–2 business days" />
      </ChoiceGroup>
      <div className="flex flex-col gap-6">
        <ChoiceGroup label='variant="chip" (Simple)' className="flex-row flex-wrap">
          {['React', 'Vue', 'Svelte'].map((f, i) => (
            <ChoiceCard key={f} type="checkbox" variant="chip" title={f} defaultChecked={i === 0} />
          ))}
        </ChoiceGroup>
        <ChoiceGroup label='variant="circle" (Only text / Rating)' className="flex-row flex-wrap">
          {['1', '2', '3', '4', '5'].map((n) => (
            <ChoiceCard key={n} variant="circle" name="circle-rating" value={n} checked={rating === n} onChange={() => setRating(n)} title={n} />
          ))}
        </ChoiceGroup>
      </div>
    </div>
  )
}

export default function InputSections() {
  const [dialVariant, setDialVariant] = useState<SpeedDialVariant>('default')
  return (
    <>
      <Section id="button-group" title="Button group" figma={figma['button-group']} note="Joined Buttons for 2–5 related actions. Use Tabs (segmented) instead when it switches content panels.">
        <ButtonGroupDemo />
      </Section>

      <Section id="speed-dial" title="Speed dial" figma={figma['speed-dial']} note="Click a + button. 4 types × 4 directions; Esc or an outside click closes it. In an app, pass `fixed` to pin it to the bottom-end corner.">
        <ButtonGroup label="Speed dial type">
          {(['default', 'rounded', 'menu', 'dropdown'] as SpeedDialVariant[]).map((v) => (
            <ButtonGroupItem key={v} active={dialVariant === v} onClick={() => setDialVariant(v)}>{v}</ButtonGroupItem>
          ))}
        </ButtonGroup>
        <div className="grid grid-cols-2 gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-4">
          {(['top', 'bottom', 'left', 'right'] as SpeedDialDirection[]).map((d) => (
            <div key={d} className="flex h-80 flex-col items-center justify-center gap-2">
              <SpeedDial variant={dialVariant} direction={d} actions={dialActions} label={`Quick actions (${d})`} />
              <span className="text-xs text-body-subtle">direction="{d}"</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="bottom-navigation" title="Bottom navigation" figma={figma['bottom-navigation']} note="Mobile bars shown inline here; pass `fixed` in an app. Pagination and Segment-controls styles are compositions.">
        <BottomNavDemo />
      </Section>

      <Section id="number-input" title="Number input" figma={figma['number-input']} note="With buttons, With spaced buttons, Ghost input and a plain field. Buttons disable at min/max.">
        <NumberDemo />
      </Section>

      <Section id="phone-input" title="Phone input" figma={figma['phone-input']} note="Country selector (Secondary button + Dropdown) joined to the field.">
        <PhoneDemo />
      </Section>

      <Section id="copy-input" title="Copy to clipboard" figma={figma['copy-input']} note="Read-only field + copy button; “Copied” is announced to screen readers.">
        <div className="grid gap-6 rounded-base border border-default bg-neutral-primary-soft p-5 md:grid-cols-3">
          {(['joined', 'inner', 'icon'] as CopyInputVariant[]).map((v) => (
            <Labeled key={v} label={`variant="${v}"`}>
              <CopyInput className="w-full" variant={v} value="npm install ad-design-kit" aria-label={`Install command (${v})`} />
            </Labeled>
          ))}
        </div>
      </Section>

      <Section id="tag-input" title="Tag input" figma={figma['tag-input']} note="Type and press Enter or comma to add; Backspace removes the last tag.">
        <TagDemo />
      </Section>

      <Section id="otp-input" title="OTP input" figma={figma['otp-input']} note="Typing advances, Backspace goes back, and pasting a code fills every box.">
        <OtpDemo />
      </Section>

      <Section id="floating-label" title="Floating label input" figma={figma['floating-label']} note="3 types × 4 sizes × states. Click a field to see the label float.">
        {(['underline', 'filled', 'outlined'] as FloatingLabelVariant[]).map((variant) => (
          <Group key={variant} title={`variant="${variant}"`}>
            <Matrix
              rows={fieldSizes}
              cols={['Initial', 'Filled', 'Disabled', 'Read only', 'Success', 'Danger'] as const}
              rowLabel={(r) => `size="${r}"`}
              cell={(size, state) => (
                <FloatingLabelInput
                  className="w-44"
                  variant={variant}
                  size={size}
                  label="Email"
                  defaultValue={state === 'Initial' || state === 'Disabled' ? undefined : 'ada@ad-design-kit.dev'}
                  disabled={state === 'Disabled'}
                  readOnly={state === 'Read only'}
                  status={state === 'Success' ? 'success' : state === 'Danger' ? 'danger' : undefined}
                />
              )}
            />
          </Group>
        ))}
      </Section>

      <Section id="choice-card" title="Choice cards" figma={figma['choice-card']} note="The whole card is a label around a real checkbox or radio. Checked cards use bg-brand-softer with border-brand-subtle">
        <ChoiceDemo />
      </Section>
    </>
  )
}
