import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { IconShape, type IconShapeColor, type IconShapeSize } from './IconShape';
import { CogIcon } from '../icons';

// AuxoKit Icon Shape — mirrors the Figma "Icon Shape" set (node 1149:56578).
const colors = ['brand', 'success', 'danger', 'warning', 'gray', 'dark', 'white'] as const satisfies readonly IconShapeColor[];
const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl'] as const satisfies readonly IconShapeSize[];

const meta = {
  title: 'Components/IconShape',
  parameters: { design: figmaDesign('IconShape') },
  component: IconShape,
  args: { children: <CogIcon />, color: 'brand', size: 'base', shape: 'square' },
  argTypes: {
    color: { control: 'select', options: colors },
    size: { control: 'select', options: sizes },
    shape: { control: 'select', options: ['square', 'circle'] },
  },
} satisfies Meta<typeof IconShape>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Square: Story = {};
export const Circle: Story = { args: { shape: 'circle' } };
export const Success: Story = { args: { color: 'success' } };

export const AllColors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {colors.map((color) => (
        <IconShape key={color} {...args} color={color} />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-3">
      {sizes.map((size) => (
        <IconShape key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const ColorsAndShapes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      {(['square', 'circle'] as const).map((shape) => (
        <div key={shape} className="flex flex-wrap items-center gap-3">
          {colors.map((color) => (
            <IconShape key={color} {...args} color={color} shape={shape} />
          ))}
        </div>
      ))}
    </div>
  ),
};
