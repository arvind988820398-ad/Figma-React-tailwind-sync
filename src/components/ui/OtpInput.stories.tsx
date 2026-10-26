import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { OtpInput } from './OtpInput';

// AuxoKit OTP input — mirrors the Figma "OTP Inputs" boxes (node 1149:49523) and examples (1149:49576).
const meta = {
  title: 'AuxoKit/OtpInput',
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
