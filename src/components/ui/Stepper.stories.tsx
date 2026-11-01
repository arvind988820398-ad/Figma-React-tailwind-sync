import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { ClipboardListIcon, CreditCardIcon, UserCircleIcon, UserIcon } from '../icons';
import { Button } from './Button';
import { Stepper, type Step, type StepperProps, type StepperVariant } from './Stepper';

// AD Design Kit Stepper — one story per Figma "Stepper navigation" Type (node 1149:84064), with Figma's content.
// Breakpoint=Mobile stories render the same steps at phone width.
const steps: Step[] = [
  { title: 'Personal Info', description: 'Helper text here', icon: <UserIcon /> },
  { title: 'Account Info', description: 'Helper text here', icon: <UserCircleIcon /> },
  { title: 'Payment Info', description: 'Helper text here', icon: <CreditCardIcon /> },
  { title: 'Review', description: 'Helper text here', icon: <ClipboardListIcon /> },
];
// Figma "Cards" titles.
const cardSteps: Step[] = [{ title: 'Personal Info' }, { title: 'Account Settings' }, { title: 'Payment Details' }, { title: 'Review' }];

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

// Figma's Mobile frames are 380px wide: the large-mobile viewport (414px) is the closest preset.
const mobile = { viewport: { value: 'mobile2', isRotated: false } };

// Figma "Default": numbered circles and labels joined by thin connectors.
export const Default: Story = {};
// Figma "Only icons": large icon shapes joined by thick connectors; titles are screen-reader text.
export const OnlyIcons: Story = { args: { variant: 'only-icons' } };
// Figma "Icons & text": icon shapes with a title and helper text.
export const IconsAndText: Story = { args: { variant: 'icons' } };
// Figma "With dots": labels above dots on one line.
export const WithDots: Story = { args: { variant: 'dots' } };
// Figma "Vertical": icon shapes with a title and helper text, stacked with connectors.
export const Vertical: Story = { args: { variant: 'vertical' } };
// Figma "Cards": stacked step cards; the done step shows a check, the current one an arrow.
export const Cards: Story = { args: { variant: 'cards', steps: cardSteps } };

export const DefaultMobile: Story = { ...Default, globals: mobile };
export const OnlyIconsMobile: Story = { ...OnlyIcons, globals: mobile };
export const IconsAndTextMobile: Story = { ...IconsAndText, globals: mobile };
export const WithDotsMobile: Story = { ...WithDots, globals: mobile };
export const VerticalMobile: Story = { ...Vertical, globals: mobile };
export const CardsMobile: Story = { ...Cards, globals: mobile };

// `status` overrides the state derived from `current`.
export const ErrorAndDisabled: Story = {
  args: { steps: [{ title: 'Personal Info' }, { title: 'Payment Info', status: 'error' }, { title: 'Review', status: 'disabled' }] },
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
// Interaction: Next moves the current step; finished steps say "completed" to screen readers.
export const Interactive: Story = {
  args: { current: 0 },
  render: (args) => <StepperDemo {...args} />,
  play: async ({ canvas, userEvent }) => {
    const items = () => canvas.getAllByRole('listitem');
    await expect(items()[0]).toHaveAttribute('aria-current', 'step');
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(items()[1]).toHaveAttribute('aria-current', 'step');
    await expect(items()[0]).toHaveTextContent('Personal Info (completed)');
    await expect(canvas.getByRole('button', { name: 'Back' })).toBeEnabled();
  },
};
