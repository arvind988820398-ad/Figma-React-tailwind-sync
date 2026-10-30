import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Avatar, AvatarGroup, type AvatarSize, type AvatarStatus } from './Avatar';

// AD Design Kit Avatar — mirrors the Figma "Avatar" set (node 1146:5178), dot 1146:5625, group 1146:5549.
const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl'] as const satisfies readonly AvatarSize[];
const statuses = ['online', 'offline', 'away'] as const satisfies readonly AvatarStatus[];

const meta = {
  title: 'Components/Avatar',
  parameters: { design: figmaDesign('Avatar') },
  component: Avatar,
  args: { name: 'Ada Lovelace', size: 'base' },
  argTypes: {
    size: { control: 'select', options: sizes },
    status: { control: 'select', options: [undefined, ...statuses] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Without `src` the initials are shown.
export const Initials: Story = {};
export const WithImage: Story = { args: { src: 'https://picsum.photos/seed/ada/96/96' } };
export const WithStatus: Story = { args: { status: 'online', size: 'lg' } };

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-end gap-4">
      {sizes.map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const AllStatuses: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      {statuses.map((status) => (
        <Avatar key={status} {...args} status={status} />
      ))}
    </div>
  ),
};

// Stacked avatars: `bordered` adds the buffer ring where they overlap.
export const Group: Story = {
  args: { size: 'lg' },
  render: ({ name: _name, ...args }) => (
    <AvatarGroup>
      {['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds'].map((name) => (
        <Avatar key={name} {...args} name={name} bordered />
      ))}
    </AvatarGroup>
  ),
};
