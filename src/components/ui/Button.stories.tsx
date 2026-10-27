import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { Button } from './Button';

// AuxoKit Button — mirrors the Figma "Button" set (node 1146:24616).
const meta = {
  title: 'Components/Button',
  parameters: { design: figmaDesign('Button') },
  component: Button,
  args: { children: 'Button', color: 'brand', size: 'base', disabled: false },
  argTypes: {
    color: {
      control: 'select',
      options: ['brand', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'],
    },
    size: { control: 'select', options: ['xs', 'sm', 'base', 'lg', 'xl'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Brand: Story = {};
export const Secondary: Story = { args: { color: 'secondary' } };
export const Tertiary: Story = { args: { color: 'tertiary' } };
export const Ghost: Story = { args: { color: 'ghost' } };
export const Disabled: Story = { args: { disabled: true } };

// Figma only defines Outline=True for Success, Danger and Warning.
export const OutlineDanger: Story = { args: { color: 'danger', outline: true, children: 'Delete' } };

export const AllColors: Story = {
  // `outline` is only valid with success | danger | warning, so it is dropped before spreading.
  render: ({ outline: _outline, color: _color, ...args }) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['brand', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'dark', 'ghost'] as const).map((color) => (
        <Button key={color} {...args} color={color}>
          {color}
        </Button>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['xs', 'sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <Button key={size} {...args} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};
