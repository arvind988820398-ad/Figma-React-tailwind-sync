import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress, type ProgressColor } from './Progress';

// AuxoKit Progress — mirrors the Figma "Progress Bars" set (node 1149:82279) and "Bars" (1149:82364).
const colors = ['brand', 'gray', 'dark', 'success', 'danger', 'warning'] as const satisfies readonly ProgressColor[];

const meta = {
  title: 'AuxoKit/Progress',
  component: Progress,
  decorators: [(Story) => <div className="w-80">{Story()}</div>],
  args: { value: 45, color: 'brand', size: 'base', labelPosition: 'top', showValue: true },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    color: { control: 'select', options: colors },
    size: { control: 'select', options: ['base', 'lg'] },
    labelPosition: { control: 'select', options: ['top', 'side', 'bottom'] },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithLabel: Story = { args: { label: 'Uploading files' } };
export const Large: Story = { args: { size: 'lg', label: 'Storage used', value: 72 } };
export const LabelSide: Story = { args: { labelPosition: 'side' } };
export const LabelBottom: Story = { args: { labelPosition: 'bottom', label: 'Progress' } };

// Bar only: no label and no value text.
export const BarOnly: Story = { args: { showValue: false } };

export const AllColors: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {colors.map((color) => (
        <Progress key={color} {...args} color={color} label={color} />
      ))}
    </div>
  ),
};
