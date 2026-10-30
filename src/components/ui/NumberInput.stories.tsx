import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, fn } from 'storybook/test';
import { useState, type ComponentProps } from 'react';
import { HelperText, Label } from './Input';
import { NumberInput } from './NumberInput';

// AD Design Kit Number input — mirrors the Figma "Number form" set (node 1149:46630).
const meta = {
  title: 'Components/NumberInput',
  parameters: { design: figmaDesign('NumberInput') },
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

// ---- Interaction tests ----------------------------------------------------------------------------------------------

// Like NumberDemo, but also forwards every change to args.onChange so tests can assert the emitted values.
function NumberSpyDemo({ onChange, ...args }: ComponentProps<typeof NumberInput>) {
  const [value, setValue] = useState(args.value);
  return (
    <NumberInput
      {...args}
      value={value}
      onChange={(n) => {
        setValue(n);
        onChange(n);
      }}
    />
  );
}

export const StepWithButtons: Story = {
  args: { value: 8, onChange: fn() },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });
    const inc = canvas.getByRole('button', { name: 'Increase' });
    const dec = canvas.getByRole('button', { name: 'Decrease' });

    await userEvent.click(inc);
    await expect(field).toHaveValue(9);
    await userEvent.click(inc);
    await expect(field).toHaveValue(10);
    await expect(args.onChange).toHaveBeenLastCalledWith(10);
    // At max the + button is disabled.
    await expect(inc).toBeDisabled();
    await userEvent.click(dec);
    await expect(field).toHaveValue(9);
    await expect(inc).toBeEnabled();
    await expect(args.onChange).toHaveBeenCalledTimes(3);
  },
};

export const StepWithKeyboard: Story = {
  args: { value: 1, onChange: fn(), variant: 'spaced' },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });
    const dec = canvas.getByRole('button', { name: 'Decrease' });

    // Tab order: −, field, +. Enter and Space activate the buttons.
    await userEvent.tab();
    await expect(dec).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveValue(0);
    await expect(dec).toBeDisabled();
    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Increase' })).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.keyboard('{Enter}');
    await expect(field).toHaveValue(2);
    await expect(args.onChange).toHaveBeenLastCalledWith(2);
  },
};

export const TypeAValue: Story = {
  args: { value: 2, onChange: fn(), variant: 'ghost', step: 1 },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const field = canvas.getByRole('spinbutton', { name: 'Quantity' });

    // Clearing the field emits nothing, and the field really is empty so a new number can be typed.
    await userEvent.clear(field);
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(field).toHaveValue(null);
    await userEvent.type(field, '7');
    await expect(field).toHaveValue(7);
    await expect(args.onChange).toHaveBeenLastCalledWith(7);

    // Select the current value and type over it.
    await userEvent.keyboard('{Control>}a{/Control}3');
    await expect(field).toHaveValue(3);
    await expect(args.onChange).toHaveBeenLastCalledWith(3);

    // Out-of-range text stays as typed until the field loses focus, then it is clamped to max.
    await userEvent.keyboard('{Control>}a{/Control}42');
    await expect(args.onChange).toHaveBeenLastCalledWith(4); // the in-range "4" while typing; "42" is held as a draft
    await expect(field).toHaveValue(42);
    await userEvent.tab();
    await expect(args.onChange).toHaveBeenLastCalledWith(10);
    await expect(field).toHaveValue(10);
    await expect(canvas.getByRole('button', { name: 'Increase' })).toBeDisabled();

    // Leaving the field empty restores the last valid value.
    await userEvent.clear(field);
    await userEvent.tab();
    await expect(field).toHaveValue(10);
  },
};

export const DisabledButtons: Story = {
  args: { value: 5, onChange: fn(), disabled: true },
  render: (args) => <NumberSpyDemo {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('spinbutton', { name: 'Quantity' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Increase' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Decrease' })).toBeDisabled();
    await userEvent.tab();
    await expect(document.body).toHaveFocus(); // nothing in the disabled control is focusable
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
