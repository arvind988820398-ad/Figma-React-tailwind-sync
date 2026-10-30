import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ComponentProps } from 'react';
import { RangeSlider } from './RangeSlider';

// AD Design Kit Range slider — mirrors the Figma "Range Slider examples" (node 1149:54340), bar 1149:54365, thumb 1149:54373.
const meta = {
  title: 'Components/RangeSlider',
  parameters: { design: figmaDesign('RangeSlider') },
  component: RangeSlider,
  args: { value: 40, onChange: () => {}, label: 'Volume', min: 0, max: 100, step: 1, showMinMax: false, disabled: false },
  render: (args) => <SingleDemo {...args} />,
  decorators: [
    (Story) => (
      <div className="w-80 pt-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

type SliderArgs = ComponentProps<typeof RangeSlider>;

// Figma Type "Default": one value. The generic needs an explicit <number> once value/label are narrowed.
function SingleDemo({ value: initial, onChange: _onChange, label, ...args }: SliderArgs) {
  const [value, setValue] = useState(Array.isArray(initial) ? initial[0] : initial);
  return <RangeSlider<number> {...args} label={Array.isArray(label) ? label[0] : label} value={value} onChange={setValue} />;
}

// Figma Type "Range": [low, high] with two thumbs.
function RangeDemo({ value: initial, onChange: _onChange, label, ...args }: SliderArgs) {
  const [value, setValue] = useState<[number, number]>(Array.isArray(initial) ? initial : [initial, args.max ?? 100]);
  return <RangeSlider<[number, number]> {...args} label={Array.isArray(label) ? label : [`Minimum ${label}`, `Maximum ${label}`]} value={value} onChange={setValue} />;
}

export const Default: Story = {};
export const WithMinMax: Story = { args: { showMinMax: true, formatValue: (n) => `${n}%` } };
export const Stepped: Story = { args: { value: 250, min: 0, max: 1000, step: 50, showMinMax: true, label: 'Budget', formatValue: (n) => `$${n}` } };
export const Disabled: Story = { args: { value: 60, disabled: true } };

export const Range: Story = {
  args: { value: [200, 800], label: ['Minimum price', 'Maximum price'], min: 0, max: 1000, step: 10, showMinMax: true, formatValue: (n) => `$${n}` },
  render: (args) => <RangeDemo {...args} />,
};

export const RangeDisabled: Story = {
  args: { value: [20, 70], label: ['Minimum', 'Maximum'], disabled: true },
  render: (args) => <RangeDemo {...args} />,
};
