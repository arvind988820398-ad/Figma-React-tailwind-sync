import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useId, useState, type ComponentProps } from 'react';
import { Avatar, AvatarGroup } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Checkbox, Radio } from './Checkbox';
import { cn } from '../../lib/cn';
import { ChoiceCard, ChoiceGroup } from './ChoiceCard';
import { IconShape } from './IconShape';
import { Rating } from './Rating';
import { Toggle } from './Toggle';
import {
  ArrowRightIcon, CalendarMonthIcon, CheckIcon, EnvelopeIcon, InfoCircleIcon, MastercardIcon, MessageCaptionIcon, ReactIcon, ReceiptIcon,
  RulerCombinedIcon, TruckIcon, VisaIcon, VueIcon,
} from '../icons';

// AD Design Kit Choice cards — mirrors the Figma "Checkbox/Radio form" set (node 1149:54726), groups 1149:55022:
// one story per Figma Type with the Figma texts and icons, each showing an unchecked and a checked option
// (Hover is a CSS state).
const meta = {
  title: 'Components/ChoiceCard',
  parameters: { design: figmaDesign('ChoiceCard') },
  component: ChoiceCard,
  args: { title: 'Starter', description: 'For personal projects', variant: 'card', type: 'radio', disabled: false },
  argTypes: {
    variant: { control: 'select', options: ['card', 'bordered', 'chip', 'circle'] },
    type: { control: 'select', options: ['radio', 'checkbox'] },
  },
  decorators: [
    // Most Figma types are 320px wide; Advanced, Payment and the logo grid are wider.
    (Story, { parameters }) => (
      <div className={parameters.wide ? 'w-3xl max-w-full' : 'w-80'}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChoiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const plans: { value: string; title: string; description: string; price: string; disabled?: boolean }[] = [
  { value: 'starter', title: 'Starter', description: 'For personal projects', price: '$0' },
  { value: 'pro', title: 'Pro', description: 'For growing teams', price: '$29' },
  { value: 'enterprise', title: 'Enterprise', description: 'SSO and audit logs', price: 'Custom', disabled: true },
];

function PlanGroup(args: ComponentProps<typeof ChoiceCard>) {
  const [plan, setPlan] = useState('pro');
  return (
    <ChoiceGroup label="Choose a plan">
      {plans.map((p) => (
        <ChoiceCard
          key={p.value}
          {...args}
          name="plan"
          value={p.value}
          checked={plan === p.value}
          onChange={() => setPlan(p.value)}
          title={p.title}
          description={p.description}
          trailing={p.price}
          disabled={p.disabled}
        />
      ))}
    </ChoiceGroup>
  );
}

// ---- Figma types ---------------------------------------------------------------------------------------------------
const remember = { title: 'Remember me', description: 'Save my credentials for easier sign-in' };
const spacing = { title: 'Spacing and Grid', description: 'Control the spacing and grid settings.' };

// Type = Default: plain checkbox rows.
export const Default: Story = {
  render: () => (
    <ChoiceGroup label="Default">
      <Checkbox label="Remember me" />
      <Checkbox label="Remember me" defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = With helper: plain rows with a helper line.
export const WithHelper: Story = {
  render: () => (
    <ChoiceGroup label="With helper">
      <Checkbox label={remember.title} description={remember.description} />
      <Checkbox label={remember.title} description={remember.description} defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = Left checkbox card
export const LeftCheckboxCard: Story = {
  render: () => (
    <ChoiceGroup label="Left checkbox card">
      <ChoiceCard type="checkbox" {...remember} />
      <ChoiceCard type="checkbox" {...remember} defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = Icon & text: icon above the text, checkbox at the end.
export const IconAndText: Story = {
  render: () => (
    <ChoiceGroup label="Icon & text">
      <ChoiceCard type="checkbox" control="end" iconPlacement="top" icon={<RulerCombinedIcon />} {...spacing} />
      <ChoiceCard type="checkbox" control="end" iconPlacement="top" icon={<RulerCombinedIcon />} {...spacing} defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = With side icon & text: a brand IconShape, the text, a radio at the end.
export const WithSideIconAndText: Story = {
  render: () => (
    <ChoiceGroup label="With side icon & text">
      {['Pick-up point', 'Delivery at home'].map((title, i) => (
        <ChoiceCard
          key={title}
          name="side-icon"
          control="end"
          icon={<IconShape size="base" color="brand"><TruckIcon /></IconShape>}
          title={title}
          description={i ? 'Get it delivered to your door.' : 'Collect it at a store near you.'}
          defaultChecked={i === 1}
        />
      ))}
    </ChoiceGroup>
  ),
};

// Type = Box icon & logo: a logo above the text, no visible control.
export const BoxIconAndLogo: Story = {
  parameters: { wide: true },
  render: () => (
    <ChoiceGroup label="Box icon & logo" columns={2} className="max-w-xl">
      <ChoiceCard type="checkbox" control="none" iconPlacement="top" icon={<VueIcon />} title="Vue" description="A progressive framework for building user interfaces." />
      <ChoiceCard type="checkbox" control="none" iconPlacement="top" icon={<ReactIcon />} title="React" description="A JavaScript library for building user interfaces." defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = Simple: chips.
export const Simple: Story = {
  render: () => (
    <ChoiceGroup label="Simple" className="flex-row flex-wrap">
      <ChoiceCard type="checkbox" variant="chip" title="Web design" />
      <ChoiceCard type="checkbox" variant="chip" title="Web design" defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = Only Icon: icon circles, each with an accessible name.
export const OnlyIcon: Story = {
  render: () => (
    <ChoiceGroup label="Only icon" className="flex-row">
      <ChoiceCard variant="circle" name="only-icon" title={<RulerCombinedIcon />} aria-label="Ruler" />
      <ChoiceCard variant="circle" name="only-icon" title={<RulerCombinedIcon />} aria-label="Grid ruler" defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = Only text: short values in circles.
export const OnlyText: Story = {
  render: () => (
    <ChoiceGroup label="Only text" className="flex-row">
      {['4', '5'].map((n) => (
        <ChoiceCard key={n} variant="circle" name="only-text" title={n} defaultChecked={n === '5'} />
      ))}
    </ChoiceGroup>
  ),
};

// Type = Advanced: title with a details row (warning Badge, comments, avatars).
const advancedDetails = (
  <>
    <Badge size="sm" color="warning" leading={<CalendarMonthIcon className="size-3" />}>Tomorrow</Badge>
    <span className="inline-flex items-center gap-0.5"><MessageCaptionIcon className="size-4" /> 45</span>
    <AvatarGroup className="-space-x-2">
      {['Jese Leos', 'Bonnie Green', 'Roberta Casas', 'Michael Gough'].map((n) => <Avatar key={n} name={n} size="xs" bordered />)}
    </AvatarGroup>
  </>
);
export const Advanced: Story = {
  parameters: { wide: true },
  render: () => (
    <ChoiceGroup label="Advanced">
      <ChoiceCard type="checkbox" title="Customize Themes and Extend Functionality" details={advancedDetails} />
      <ChoiceCard type="checkbox" title="Customize Themes and Extend Functionality" details={advancedDetails} defaultChecked />
    </ChoiceGroup>
  ),
};

// Type = Advanced (Radio inputs): a plan card with a price and summary under the first row.
const planFooter = (
  <>
    <span className="flex items-baseline gap-0.5 border-t border-default pt-4 text-heading">
      <span className="text-4xl font-bold">$19</span>
      <span className="text-base font-medium">/month</span>
    </span>
    <span className="text-base text-body">
      This plan includes hosting for a single website, with 10 GB of SSD storage to ensure fast and reliable performance for your files and content.
    </span>
  </>
);
export const AdvancedRadio: Story = {
  name: 'Advanced (Radio inputs)',
  parameters: { wide: true },
  render: () => (
    <ChoiceGroup label="Advanced (radio inputs)">
      {['Starter plan', 'Team plan'].map((title, i) => (
        <ChoiceCard
          key={title}
          name="plan-advanced"
          control="end"
          icon={<IconShape size="base" color="brand"><ReceiptIcon /></IconShape>}
          title={title}
          description="Perfect for individuals or small teams."
          footer={planFooter}
          defaultChecked={i === 0}
        />
      ))}
    </ChoiceGroup>
  ),
};

// Type = Icons & text: icon, label and an arrow; the card itself shows the choice.
export const IconsAndText: Story = {
  render: () => (
    <ChoiceGroup label="Icons & text">
      {['Web design', 'Brand design', 'UX research'].map((title, i) => (
        <ChoiceCard key={title} type="checkbox" control="none" icon={<RulerCombinedIcon />} title={title} trailing={<ArrowRightIcon />} defaultChecked={i === 2} className="items-center" />
      ))}
    </ChoiceGroup>
  ),
};

// Type = Color: colour swatches, each a radio with a name.
const swatches = [
  { name: 'Blue', fill: 'bg-brand' },
  { name: 'Purple', fill: 'bg-purple' },
  { name: 'Teal', fill: 'bg-teal' },
  { name: 'Pink', fill: 'bg-pink' },
];
export const Color: Story = {
  render: () => (
    <ChoiceGroup label="Color" className="flex-row">
      {swatches.map((c, i) => (
        <label key={c.name} className="relative cursor-pointer">
          <input type="radio" name="swatch" aria-label={c.name} defaultChecked={i === 0} className="peer sr-only" />
          <span className={cn('flex size-8 items-center justify-center rounded text-white peer-focus-visible:shadow-focus-brand [&>svg]:hidden peer-checked:[&>svg]:block', c.fill)}>
            <CheckIcon className="size-5" />
          </span>
        </label>
      ))}
    </ChoiceGroup>
  ),
};

// Type = Rating: checkbox rows with stars and a count (a rating filter).
export const RatingFilter: Story = {
  name: 'Rating',
  render: () => (
    <ChoiceGroup label="Rating">
      {[
        { value: 5, count: 20 },
        { value: 4, count: 15 },
        { value: 3, count: 32 },
      ].map((r, i) => (
        <Checkbox key={r.value} aria-label={`${r.value} stars (${r.count})`} defaultChecked={i === 2} label={<Rating value={r.value} label={`(${r.count})`} />} />
      ))}
    </ChoiceGroup>
  ),
};

// Type = Dots & text: checkbox rows marked by a colour dot.
export const DotsAndText: Story = {
  render: () => (
    <ChoiceGroup label="Dots & text">
      {[
        { label: 'High priority', dot: 'bg-danger' },
        { label: 'Remember me', dot: 'bg-brand' },
      ].map((d, i) => (
        <Checkbox
          key={d.label}
          defaultChecked={i === 1}
          label={
            <span className="inline-flex items-center gap-1.5">
              <span className={cn('size-3 rounded-full', d.dot)} aria-hidden />
              {d.label}
            </span>
          }
        />
      ))}
    </ChoiceGroup>
  ),
};

// Type = Payment: saved cards with a radio, details, Delete / Edit actions and the card logo.
function PaymentDemo() {
  const [card, setCard] = useState('visa');
  const cards = [
    { id: 'visa', name: 'Visa ending in 7658', expiry: 'Expiry 10/2024', logo: <VisaIcon className="h-8 w-14" /> },
    { id: 'mastercard', name: 'Mastercard ending in 8429', expiry: 'Expiry 04/2026', logo: <MastercardIcon className="h-8 w-14" /> },
  ];
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-3 text-sm font-medium text-heading">Payment</legend>
      {cards.map((c) => (
        <div key={c.id} className="flex items-start justify-between gap-4 rounded-base border border-default bg-neutral-primary-soft p-4 shadow-xs">
          <div className="flex flex-col gap-5">
            <Radio name="payment" checked={card === c.id} onChange={() => setCard(c.id)} label={<span className="text-base">{c.name}</span>} description={c.expiry} />
            <div className="flex items-center gap-2">
              <Button size="xs" color="ghost">Delete</Button>
              <span className="h-4 w-px bg-neutral-quaternary" aria-hidden />
              <Button size="xs" color="ghost">Edit</Button>
            </div>
          </div>
          <span aria-hidden>{c.logo}</span>
        </div>
      ))}
    </fieldset>
  );
}
export const Payment: Story = { parameters: { wide: true }, render: () => <PaymentDemo /> };

// Type = Icon & toggle: setting cards whose switch applies at once.
function IconToggleCard({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const id = useId();
  return (
    <div className="flex flex-col gap-2.5 rounded-base border border-default bg-neutral-primary-soft p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <RulerCombinedIcon className="size-6 shrink-0 text-body" />
        <span id={`${id}-title`} className="flex-1 text-sm font-medium text-heading">{spacing.title}</span>
        <Toggle checked={on} onCheckedChange={setOn} aria-labelledby={`${id}-title`} aria-describedby={`${id}-help`} />
      </div>
      <p id={`${id}-help`} className="text-xs text-body">{spacing.description}</p>
    </div>
  );
}
export const IconAndToggle: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <IconToggleCard initial={false} />
      <IconToggleCard initial />
    </div>
  ),
};

// Type = Bordered left input: only the border marks the choice.
export const BorderedLeftInput: Story = {
  render: () => (
    <ChoiceGroup label="Bordered left input">
      <ChoiceCard variant="bordered" name="bordered" {...remember} />
      <ChoiceCard variant="bordered" name="bordered" {...remember} defaultChecked />
    </ChoiceGroup>
  ),
};

// ---- Code-ahead ----------------------------------------------------------------------------------------------------
export const Playground: Story = { args: { defaultChecked: true } };
export const WithIconAndTrailing: Story = {
  args: { type: 'checkbox', icon: <EnvelopeIcon />, title: 'Email', description: 'Weekly summary', trailing: 'Free', defaultChecked: true },
};
export const Disabled: Story = { args: { title: 'Enterprise', description: 'SSO and audit logs', trailing: 'Custom', disabled: true } };

// Controlled radio group (Figma "Left checkbox card" stack).
export const PlanGroupControlled: Story = { render: (args) => <PlanGroup {...args} /> };

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <ChoiceGroup label='variant="card"'>
        <ChoiceCard {...args} variant="card" type="checkbox" icon={<EnvelopeIcon />} title="Email" description="Weekly summary" defaultChecked />
        <ChoiceCard {...args} variant="card" type="checkbox" icon={<InfoCircleIcon />} title="Product updates" description="New features and releases" />
      </ChoiceGroup>
      <ChoiceGroup label='variant="bordered"'>
        <ChoiceCard {...args} variant="bordered" name="ship" title="Standard shipping" description="4–6 business days" defaultChecked />
        <ChoiceCard {...args} variant="bordered" name="ship" title="Express shipping" description="1–2 business days" />
      </ChoiceGroup>
      <ChoiceGroup label='variant="chip"' className="flex-row flex-wrap">
        {['React', 'Vue', 'Svelte'].map((f, i) => (
          <ChoiceCard key={f} {...args} type="checkbox" variant="chip" title={f} defaultChecked={i === 0} />
        ))}
      </ChoiceGroup>
      <ChoiceGroup label='variant="circle"' className="flex-row flex-wrap">
        {['1', '2', '3', '4', '5'].map((n) => (
          <ChoiceCard key={n} {...args} variant="circle" name="rating" value={n} title={n} defaultChecked={n === '4'} />
        ))}
      </ChoiceGroup>
    </div>
  ),
};
