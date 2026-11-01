import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps } from 'react';
import { ChoiceCard, ChoiceGroup } from './ChoiceCard';
import { InfoCircleIcon, EnvelopeIcon } from '../icons';

// AD Design Kit Choice cards — mirrors the Figma "Checkbox/Radio form" set (node 1149:54726), groups 1149:55022.
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
    (Story) => (
      <div className="w-80">
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

export const Default: Story = { args: { defaultChecked: true } };
export const WithIconAndTrailing: Story = {
  args: { type: 'checkbox', icon: <EnvelopeIcon />, title: 'Email', description: 'Weekly summary', trailing: 'Free', defaultChecked: true },
};
export const Bordered: Story = { args: { variant: 'bordered', title: 'Standard shipping', description: '4–6 business days', defaultChecked: true } };
export const Chip: Story = { args: { variant: 'chip', type: 'checkbox', title: 'React', defaultChecked: true } };
export const Circle: Story = { args: { variant: 'circle', title: '4', defaultChecked: true } };
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
