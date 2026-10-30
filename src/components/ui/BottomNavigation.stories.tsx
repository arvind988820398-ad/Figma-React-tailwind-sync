import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import type { ReactNode } from 'react';
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../icons';
import { BottomNavigation } from './BottomNavigation';

// AD Design Kit Bottom navigation — mirrors the Figma "Bottom navigation" set (node 1146:27386).
// Shown inline (not `fixed`) so the canvas can display it; pass `fixed` in an app.
const items = [
  { label: 'Home', href: '#', icon: <CheckIcon />, current: true },
  { label: 'Inbox', href: '#', icon: <MailIcon /> },
  { label: 'Info', href: '#', icon: <InfoIcon /> },
  { label: 'Settings', href: '#', icon: <CogIcon /> },
];
const action = { label: 'New item', icon: <PlusIcon />, onClick: () => {} };

// A short "screen" so the bar sits at the bottom like on a phone.
const Screen = ({ children }: { children: ReactNode }) => (
  <div className="flex h-40 w-full max-w-sm flex-col justify-end overflow-hidden rounded-base border border-default bg-neutral-secondary-soft p-2">
    {children}
  </div>
);

const meta = {
  title: 'Components/BottomNavigation',
  component: BottomNavigation,
  parameters: { design: figmaDesign('BottomNavigation'), layout: 'padded' },
  args: { items, variant: 'default', fixed: false },
  argTypes: { variant: { control: 'select', options: ['default', 'bordered', 'action'] } },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const inScreen: Story['render'] = (args) => (
  <Screen>
    <BottomNavigation {...args} />
  </Screen>
);

export const Default: Story = { render: inScreen };
export const Bordered: Story = { args: { variant: 'bordered' }, render: inScreen };

// Centered Brand icon button between the items.
export const ActionButton: Story = { args: { variant: 'action', action }, render: inScreen };

export const FiveItems: Story = {
  args: { items: [...items, { label: 'New', href: '#', icon: <PlusIcon /> }] },
  render: inScreen,
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      <Screen><BottomNavigation {...args} variant="default" label="Default" /></Screen>
      <Screen><BottomNavigation {...args} variant="bordered" label="Bordered" /></Screen>
      <Screen><BottomNavigation {...args} variant="action" label="Action" action={action} /></Screen>
    </div>
  ),
};
