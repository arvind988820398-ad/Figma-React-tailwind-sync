import type { Meta, StoryObj } from '@storybook/react-vite';
import { CopyInput } from './CopyInput';
import { HelperText, Label } from './Input';

// AuxoKit Copy to clipboard — mirrors the Figma "Copy to clipboard form" set (node 1149:46768).
const meta = {
  title: 'AuxoKit/CopyInput',
  component: CopyInput,
  args: { value: 'npm install auxokit', variant: 'joined', 'aria-label': 'Install command' },
  argTypes: {
    variant: { control: 'select', options: ['joined', 'inner', 'icon'] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CopyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Joined: Story = {};
export const InnerButton: Story = { args: { variant: 'inner' } };
export const IconButton: Story = { args: { variant: 'icon' } };
export const LongValue: Story = { args: { value: 'https://auxokit.dev/share/8f3a2c1d-77b4-4e0e-9c52-1a2b3c4d5e6f', 'aria-label': 'Share link' } };

export const WithLabelAndHelperText: Story = {
  render: (args) => (
    <div>
      <Label htmlFor="copy-key">API key</Label>
      <CopyInput {...args} id="copy-key" value="sk_live_51Hx…9Qz" aria-label={undefined} />
      <HelperText>Keep this secret. It will not be shown again.</HelperText>
    </div>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(['joined', 'inner', 'icon'] as const).map((variant) => (
        <CopyInput key={variant} {...args} variant={variant} aria-label={`Install command (${variant})`} />
      ))}
    </div>
  ),
};
