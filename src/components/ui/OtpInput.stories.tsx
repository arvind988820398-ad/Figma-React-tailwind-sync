import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps } from 'react';
import { OtpInput } from './OtpInput';

// AD Design Kit OTP input — mirrors the Figma "OTP Inputs" boxes (node 1149:49523) and examples (1149:49576).
const meta = {
  title: 'Components/OtpInput',
  parameters: { design: figmaDesign('OtpInput') },
  component: OtpInput,
  args: { value: '', onChange: () => {}, length: 6, variant: 'default', size: 'sm', disabled: false, readOnly: false, label: 'Verification code' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'spaced', 'separator', 'separator-spaced'] },
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
  },
  render: (args) => <OtpDemo {...args} />,
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// Typing advances, Backspace goes back, and pasting a code fills every box.
function OtpDemo(args: ComponentProps<typeof OtpInput>) {
  const [value, setValue] = useState(args.value);
  return <OtpInput {...args} value={value} onChange={setValue} />;
}

export const Default: Story = {};
export const Spaced: Story = { args: { variant: 'spaced' } };
export const Separator: Story = { args: { variant: 'separator' } };
export const Filled: Story = { args: { value: '123456', readOnly: true } };
export const Success: Story = { args: { value: '123456', status: 'success', readOnly: true } };
export const Danger: Story = { args: { value: '123456', status: 'danger' } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['default', 'spaced', 'separator', 'separator-spaced'] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-body-subtle">{variant}</span>
          <OtpDemo {...args} variant={variant} label={`Verification code (${variant})`} />
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-body-subtle">{`size="${size}"`}</span>
          <OtpDemo {...args} size={size} length={4} value="1234" label={`Verification code (${size})`} />
        </div>
      ))}
    </div>
  ),
};

// ---- Interaction tests -------------------------------------------------------------------------------------------
const boxValues = (boxes: HTMLElement[]) => boxes.map((b) => (b as HTMLInputElement).value).join('|');

// Typing advances; non-digits are rejected; Backspace on an empty box clears the previous one and moves back;
// arrows move between boxes; pasting fills every box and focuses the last.
export const TypeNavigateAndPaste: Story = {
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('group', { name: 'Verification code' });
    await expect(group).toBeVisible();
    const boxes = canvas.getAllByRole('textbox');
    await expect(boxes).toHaveLength(6);
    await expect(boxes[0]).toHaveAttribute('inputmode', 'numeric');
    await expect(boxes[0]).toHaveAttribute('autocomplete', 'one-time-code');

    await userEvent.click(boxes[0]);
    await userEvent.keyboard('12');
    await expect(boxValues(boxes)).toBe('1|2||||');
    await expect(boxes[2]).toHaveFocus();

    await userEvent.keyboard('a');
    await expect(boxes[2]).toHaveValue('');
    await expect(boxes[2]).toHaveFocus();

    // Empty box: Backspace clears the previous box and moves there.
    await userEvent.keyboard('{Backspace}');
    await expect(boxValues(boxes)).toBe('1|||||');
    await expect(boxes[1]).toHaveFocus();

    await userEvent.keyboard('5');
    await expect(boxValues(boxes)).toBe('1|5||||');
    await userEvent.keyboard('{ArrowLeft}');
    await expect(boxes[1]).toHaveFocus();
    // Filled box: Backspace clears it and stays.
    await userEvent.keyboard('{Backspace}');
    await expect(boxValues(boxes)).toBe('1|||||');
    await expect(boxes[1]).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(boxes[2]).toHaveFocus();

    // First box: Backspace on an empty first box does nothing more; ArrowLeft stays on the first box.
    await userEvent.click(boxes[0]);
    await userEvent.keyboard('{Backspace}{Backspace}{ArrowLeft}');
    await expect(boxValues(boxes)).toBe('|||||');
    await expect(boxes[0]).toHaveFocus();

    // Pasting keeps only digits and fills from the start.
    await userEvent.paste('12-34 56789');
    await expect(boxValues(boxes)).toBe('1|2|3|4|5|6');
    await expect(boxes[5]).toHaveFocus();

    // A paste with no valid characters changes nothing.
    await userEvent.click(boxes[0]);
    await userEvent.paste('abc');
    await expect(boxValues(boxes)).toBe('1|2|3|4|5|6');
  },
};

// A custom pattern accepts letters (text keyboard); the separator variant splits the boxes in half.
export const Alphanumeric: Story = {
  args: { pattern: /[A-Za-z0-9]/, length: 4, variant: 'separator-spaced', label: 'Invite code' },
  play: async ({ canvas, userEvent }) => {
    const boxes = canvas.getAllByRole('textbox');
    await expect(boxes).toHaveLength(4);
    await expect(boxes[0]).toHaveAttribute('inputmode', 'text');
    await expect(boxes[1]).toHaveAttribute('autocomplete', 'off');
    await userEvent.click(boxes[0]);
    await userEvent.keyboard('aB3');
    await expect(boxValues(boxes)).toBe('a|B|3|');
    await userEvent.keyboard('!');
    await expect(boxes[3]).toHaveValue('');
    await userEvent.keyboard('z');
    await expect(boxValues(boxes)).toBe('a|B|3|z');
    // Focus stays on the last box after it fills.
    await expect(boxes[3]).toHaveFocus();
  },
};
