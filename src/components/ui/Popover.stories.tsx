import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover, PopoverItem, type PopoverPlacement } from './Popover';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { CogIcon, MailIcon, PlusIcon } from '../icons';

// AuxoKit Popover — mirrors the Figma "Popover" set (node 1149:81090), content 1149:81187.
const placements = ['top', 'right', 'bottom', 'left'] as const satisfies readonly PopoverPlacement[];

const meta = {
  title: 'AuxoKit/Popover',
  component: Popover,
  // Room for the panel on every side; click the trigger to open it.
  decorators: [(Story) => <div className="px-40 py-32">{Story()}</div>],
  args: {
    trigger: <Button color="secondary">Open popover</Button>,
    title: 'Popover title',
    children: 'And here’s some amazing content. It’s very engaging. Right?',
    placement: 'top',
    padding: 'text',
  },
  argTypes: {
    placement: { control: 'select', options: placements },
    padding: { control: 'select', options: ['text', 'rich', 'none'] },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutTitle: Story = { args: { title: undefined } };
export const Bottom: Story = { args: { placement: 'bottom' } };

// Figma "Rich" content: profile card with avatar, text and a link.
export const RichContent: Story = {
  args: {
    placement: 'bottom',
    padding: 'rich',
    title: undefined,
    trigger: (
      <Button color="ghost">
        <Avatar name="Ada Lovelace" size="sm" /> Ada Lovelace
      </Button>
    ),
    children: (
      <>
        <div className="flex items-center justify-between">
          <Avatar name="Ada Lovelace" size="lg" />
          <Button size="xs">Follow</Button>
        </div>
        <p className="text-sm font-semibold leading-none text-heading">Ada Lovelace</p>
        <p className="text-sm text-body">First programmer. Writes about engines and analysis.</p>
        <a href="#popover" className="text-sm font-medium text-fg-brand">View profile</a>
      </>
    ),
  },
};

// Figma "Vertical items": icon + text rows, no panel padding.
export const VerticalItems: Story = {
  args: {
    placement: 'bottom',
    padding: 'none',
    title: undefined,
    trigger: <Button color="secondary">Vertical items</Button>,
    children: (
      <>
        <PopoverItem icon={<PlusIcon />} href="#popover">New project</PopoverItem>
        <PopoverItem icon={<CogIcon />} href="#popover">Settings</PopoverItem>
        <PopoverItem icon={<MailIcon />} href="#popover">Messages</PopoverItem>
      </>
    ),
  },
};

export const AllPlacements: Story = {
  render: ({ placement: _placement, trigger: _trigger, ...args }) => (
    <div className="flex flex-wrap items-center justify-center gap-10">
      {placements.map((placement) => (
        <Popover key={placement} {...args} placement={placement} trigger={<Button color="secondary">{placement}</Button>} />
      ))}
    </div>
  ),
};
