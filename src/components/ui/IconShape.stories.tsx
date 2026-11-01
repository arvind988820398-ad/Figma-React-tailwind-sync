import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { IconShape, type IconShapeColor, type IconShapeSize } from './IconShape';
import { FireIcon } from '../icons';

// AD Design Kit Icon Shape — mirrors the Figma "Icon Shape" set (node 1149:56578): Type (Circle, Square) × Size × Color,
// with the Figma fire icon. Figma Color: Green = success, Red = danger, Yellow = warning.
const colors = ['success', 'danger', 'brand', 'warning', 'gray', 'dark', 'white'] as const satisfies readonly IconShapeColor[];
const sizes = ['2xl', 'xl', 'lg', 'base', 'sm', 'xs'] as const satisfies readonly IconShapeSize[];

const meta = {
  title: 'Components/IconShape',
  parameters: { design: figmaDesign('IconShape') },
  component: IconShape,
  args: { children: <FireIcon />, color: 'brand', size: 'lg', shape: 'circle' },
  argTypes: {
    color: { control: 'select', options: colors },
    size: { control: 'select', options: sizes },
    shape: { control: 'select', options: ['circle', 'square'] },
  },
} satisfies Meta<typeof IconShape>;

export default meta;
type Story = StoryObj<typeof meta>;

// The Figma grid for one Type: a column per color, a row per size (2xl → xs).
function Grid({ shape }: { shape: 'circle' | 'square' }) {
  return (
    <div className="flex gap-7">
      {colors.map((color) => (
        <div key={color} className="flex w-24 flex-col items-center gap-3">
          {sizes.map((size) => (
            <IconShape key={size} color={color} size={size} shape={shape}>
              <FireIcon />
            </IconShape>
          ))}
        </div>
      ))}
    </div>
  );
}

// Figma Type "Circle".
export const Circle: Story = {};
// Figma Type "Square".
export const Square: Story = { args: { shape: 'square' } };

export const CircleAllVariants: Story = { render: () => <Grid shape="circle" /> };
export const SquareAllVariants: Story = { render: () => <Grid shape="square" /> };

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
