import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Badge, type BadgeColor } from './Badge';
import { Avatar } from './Avatar';
import { Spinner } from './Spinner';
import { CheckIcon } from '../icons';

// AD Design Kit Badge — mirrors the Figma "Badge" set (node 1146:22250).
const colors = ['gray', 'white', 'brand', 'success', 'warning', 'danger'] as const satisfies readonly BadgeColor[];

const meta = {
  title: 'Components/Badge',
  parameters: { design: figmaDesign('Badge') },
  component: Badge,
  args: { children: 'Badge', color: 'gray', size: 'sm', circle: false },
  argTypes: {
    color: { control: 'select', options: colors },
    size: { control: 'select', options: ['sm', 'lg'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma Type "With dot".
export const WithDot: Story = {
  args: { color: 'success', children: 'Online', leading: <span className="size-1.5 rounded-full bg-success" /> },
};

// Figma Type "With loader".
export const WithLoader: Story = {
  args: { color: 'brand', children: 'Syncing', leading: <Spinner size="xs" label="Syncing" /> },
};

// Figma Type "With avatar".
export const WithAvatar: Story = {
  args: { children: 'Ada', leading: <Avatar name="Ada Lovelace" size="xs" /> },
};

export const WithIcon: Story = { args: { color: 'brand', children: 'Verified', rightIcon: <CheckIcon /> } };

// Figma "Only text" / "Only icon": round counter or icon badge.
export const Counter: Story = { args: { color: 'danger', circle: true, children: '8' } };
export const IconOnly: Story = { args: { color: 'brand', iconOnly: true, children: <CheckIcon />, 'aria-label': 'Verified' } };

export const AllColors: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {colors.map((color) => (
        <Badge key={color} {...args} color={color}>
          {color}
        </Badge>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {(['sm', 'lg'] as const).map((size) => (
        <Badge key={size} {...args} size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};
