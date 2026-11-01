import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { CheckIcon, CogIcon, InfoCircleIcon, EnvelopeIcon } from '../icons';
import { Button } from './Button';
import { Stepper, type Step, type StepperProps, type StepperVariant } from './Stepper';

// AD Design Kit Stepper — mirrors the Figma "Stepper navigation" set (node 1149:84064), step 1149:84155.
const steps: Step[] = [
  { title: 'Account', icon: <EnvelopeIcon /> },
  { title: 'Profile', icon: <InfoCircleIcon /> },
  { title: 'Payment', icon: <CogIcon /> },
  { title: 'Confirm', icon: <CheckIcon /> },
];

const variants: StepperVariant[] = ['default', 'dots', 'icons', 'only-icons', 'cards', 'vertical'];

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: { design: figmaDesign('Stepper'), layout: 'padded' },
  args: { steps, current: 1, variant: 'default' },
  argTypes: { variant: { control: 'select', options: variants } },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dots: Story = { args: { variant: 'dots' } };
export const IconsAndText: Story = { args: { variant: 'icons' } };
export const OnlyIcons: Story = { args: { variant: 'only-icons' } };
export const Cards: Story = { args: { variant: 'cards' } };

// Figma "Vertical" (Number & text steps) with descriptions.
export const Vertical: Story = {
  args: {
    variant: 'vertical',
    steps: [
      { title: 'Personal info', description: 'Name and email' },
      { title: 'Company', description: 'Size and industry' },
      { title: 'Plan', description: 'Choose a subscription' },
    ],
  },
};

// `status` overrides the state derived from `current`.
export const ErrorAndDisabled: Story = {
  args: { steps: [{ title: 'Account' }, { title: 'Payment', status: 'error' }, { title: 'Confirm', status: 'disabled' }] },
};

function StepperDemo({ current: initial, ...args }: StepperProps) {
  const [current, setCurrent] = useState(initial);
  const last = args.steps.length - 1;
  return (
    <div className="flex flex-col gap-6">
      <Stepper {...args} current={current} />
      <div className="flex gap-3">
        <Button color="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Back</Button>
        <Button disabled={current === last} onClick={() => setCurrent((c) => c + 1)}>Next</Button>
      </div>
    </div>
  );
}
export const Interactive: Story = { args: { current: 0 }, render: (args) => <StepperDemo {...args} /> };
