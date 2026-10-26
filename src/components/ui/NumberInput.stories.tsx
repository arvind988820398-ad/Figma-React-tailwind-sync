import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { HelperText, Label } from './Input';
import { NumberInput } from './NumberInput';

// AuxoKit Number input — mirrors the Figma "Number form" set (node 1149:46630).
const meta = {
  title: 'AuxoKit/NumberInput',
  component: NumberInput,
  args: { value: 2, onChange: () => {}, min: 0, max: 10, step: 1, variant: 'buttons', size: 'base', disabled: false, 'aria-label': 'Quantity' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'buttons', 'spaced', 'ghost'] },
    size: { control: 'select', options: ['sm', 'base'] },
  },
  render: (args) => <NumberDemo {...args} />,
  decorators: [
    (Story) => (
      <div className="w-48">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function NumberDemo(args: ComponentProps<typeof NumberInput>) {
  const [value, setValue] = useState(args.value);
  return <NumberInput {...args} value={value} onChange={setValue} />;
}

export const Buttons: Story = {};
export const PlainField: Story = { args: { variant: 'default' } };
export const SpacedButtons: Story = { args: { variant: 'spaced' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Small: Story = { args: { size: 'sm' } };
export const Disabled: Story = { args: { disabled: true } };
export const WithStep: Story = { args: { value: 50, min: 0, max: 500, step: 25, 'aria-label': 'Budget' } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2.5">
      <Label htmlFor="num-guests">Guests</Label>
      <NumberDemo {...args} id="num-guests" min={1} max={8} aria-label={undefined} />
      <HelperText>Between 1 and 8 guests.</HelperText>
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['default', 'buttons', 'spaced', 'ghost'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-body-subtle">{variant}</span>
          <NumberDemo {...args} variant={variant} aria-label={`Quantity (${variant})`} />
        </div>
      ))}
    </div>
  ),
};
