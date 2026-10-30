import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { FloatingLabelInput } from './FloatingLabelInput';

// AD Design Kit Floating label input — mirrors the Figma "Floating label" set (node 1149:50454).
const meta = {
  title: 'Components/FloatingLabelInput',
  parameters: { design: figmaDesign('FloatingLabelInput') },
  component: FloatingLabelInput,
  args: { label: 'Email', variant: 'outlined', size: 'base', disabled: false },
  argTypes: {
    variant: { control: 'select', options: ['outlined', 'filled', 'underline'] },
    size: { control: 'select', options: ['sm', 'base', 'lg', 'xl'] },
    status: { control: 'select', options: ['success', 'danger'] },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FloatingLabelInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {};
export const Filled: Story = { args: { variant: 'filled' } };
export const Underline: Story = { args: { variant: 'underline' } };
export const WithValue: Story = { args: { defaultValue: 'ada@ad-design-kit.dev' } };
export const Success: Story = { args: { status: 'success', defaultValue: 'ada@ad-design-kit.dev' } };
export const Danger: Story = { args: { status: 'danger', defaultValue: 'ada@' } };
export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['outlined', 'filled', 'underline'] as const).map((variant) => (
        <FloatingLabelInput key={variant} {...args} variant={variant} label={`${variant} label`} />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <FloatingLabelInput key={size} {...args} size={size} label={`size="${size}"`} />
      ))}
    </div>
  ),
};
