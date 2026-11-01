import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { figmaUsers } from '../../assets/avatars';
import { Avatar, AvatarGroup, AvatarGroupLabel, type AvatarProps, type AvatarSize, type AvatarStatus } from './Avatar';

// AD Design Kit Avatar — one story per Figma Type (node 1146:5178): Default, With status, With remove button, Placeholder,
// each in the six sizes and with the twelve Figma users. Dot 1146:5625, remove button 1146:5641, group 1146:5549.
const sizes = ['2xl', 'xl', 'lg', 'base', 'sm', 'xs'] as const satisfies readonly AvatarSize[];
const statuses = ['online', 'offline', 'away'] as const satisfies readonly AvatarStatus[];
const [jese] = figmaUsers;

const meta = {
  title: 'Components/Avatar',
  parameters: { design: figmaDesign('Avatar') },
  component: Avatar,
  args: { name: jese.name, src: jese.src, size: 'lg' },
  argTypes: {
    size: { control: 'select', options: sizes },
    status: { control: 'select', options: [undefined, ...statuses] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// The Figma grid: a row per size (2xl → xs), a column per user.
function UserGrid(props: Partial<AvatarProps>) {
  return (
    <div className="flex flex-col items-start gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex gap-x-8">
          {figmaUsers.map((u) => (
            <div key={u.name} className="flex w-16 justify-center">
              <Avatar name={u.name} src={u.src} size={size} {...props} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Figma Type "Default": a round photo.
export const Default: Story = {};

// Figma Type "With status": a dot on the top-right edge (Online = success, Offline = danger, Alternative = gray).
export const WithStatus: Story = { args: { status: 'online' } };

// Figma Type "With remove button": the button is named after the person and calls onRemove.
export const WithRemoveButton: Story = {
  args: { size: 'xl', onRemove: fn() },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: `Remove ${jese.name}` }));
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};

// Figma Type "Placeholder": initials on a gray circle when there is no photo.
export const Placeholder: Story = { args: { name: 'Paula Harris', src: undefined } };

export const DefaultAllSizes: Story = { render: () => <UserGrid /> };
export const WithStatusAllSizes: Story = { render: () => <UserGrid status="online" /> };
export const WithRemoveButtonAllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex gap-x-8">
          {figmaUsers.map((u) => (
            <div key={u.name} className="flex w-16 justify-center">
              <Avatar name={u.name} src={u.src} size={size} onRemove={() => {}} removeLabel={`Remove ${u.name} (${size})`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};
export const PlaceholderAllSizes: Story = {
  render: () => (
    <div className="flex w-16 flex-col items-center gap-4">
      {sizes.map((size) => (
        <Avatar key={size} name="Paula Harris" size={size} />
      ))}
    </div>
  ),
};

// Figma "Avatar dot" Status: Online, Offline, Alternative.
export const AllStatuses: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      {statuses.map((status, i) => (
        <Avatar key={status} {...args} name={figmaUsers[i].name} src={figmaUsers[i].src} status={status} />
      ))}
    </div>
  ),
};

// Stacked avatars: `bordered` adds the buffer ring where they overlap.
export const Group: Story = {
  render: ({ name: _name, src: _src, ...args }) => (
    <AvatarGroup>
      {figmaUsers.slice(0, 4).map((u) => (
        <Avatar key={u.name} {...args} name={u.name} src={u.src} bordered />
      ))}
    </AvatarGroup>
  ),
};

// Figma "Avatar group label" (1146:5592): Type "Heading & helper text" (with `helper`) and "Text", sizes sm → xl.
export const GroupLabel: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
        <div key={size} className="flex items-center gap-10">
          <AvatarGroupLabel size={size} name={jese.name} src={jese.src} helper="name@addesignkit.com" />
          <AvatarGroupLabel size={size} name={jese.name} src={jese.src} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText(jese.name)).toHaveLength(8);
    await expect(canvas.getAllByText('name@addesignkit.com')).toHaveLength(4);
  },
};
