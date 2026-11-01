import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ReactNode } from 'react';
import { expect, within } from 'storybook/test';
import { AdjustmentsVerticalIcon, BookmarkIcon, CirclePlusIcon, FileCirclePlusIcon, HomeIcon, MessagesIcon, PlusIcon, UserCircleIcon, WalletIcon } from '../icons';
import { BottomNavigation } from './BottomNavigation';
import { Tabs } from './Tabs';

// AD Design Kit Bottom navigation — mirrors the Figma "Bottom navigation" set (node 1146:27386).
// Shown inline (not `fixed`) so the canvas can display it; pass `fixed` in an app.
// Figma repeats a "Wallet" placeholder on every item; the stories use distinct labels with Figma's icons.
const items = [
  { label: 'Home', href: '#', icon: <HomeIcon />, current: true },
  { label: 'Wallet', href: '#', icon: <WalletIcon /> },
  { label: 'Settings', href: '#', icon: <AdjustmentsVerticalIcon /> },
  { label: 'Profile', href: '#', icon: <UserCircleIcon /> },
];
// Figma "Action button": home, wallet, [circle-plus], adjustments, messages.
const actionItems = [
  { label: 'Home', href: '#', icon: <HomeIcon />, current: true },
  { label: 'Wallet', href: '#', icon: <WalletIcon /> },
  { label: 'Settings', href: '#', icon: <AdjustmentsVerticalIcon /> },
  { label: 'Messages', href: '#', icon: <MessagesIcon /> },
];
const action = { label: 'New item', icon: <CirclePlusIcon />, onClick: () => {} };
// Figma "Pagination": new file and bookmark, the pager, then adjustments and profile.
const readerItems = [
  { label: 'New file', href: '#', icon: <FileCirclePlusIcon /> },
  { label: 'Bookmarks', href: '#', icon: <BookmarkIcon /> },
  { label: 'Settings', href: '#', icon: <AdjustmentsVerticalIcon /> },
  { label: 'Profile', href: '#', icon: <UserCircleIcon /> },
];
// Figma "Segment controls": a plus in the middle of the icon row.
const segmentItems = [
  { label: 'Home', href: '#', icon: <HomeIcon />, current: true },
  { label: 'Wallet', href: '#', icon: <WalletIcon /> },
  { label: 'New', href: '#', icon: <PlusIcon /> },
  { label: 'Settings', href: '#', icon: <AdjustmentsVerticalIcon /> },
  { label: 'Profile', href: '#', icon: <UserCircleIcon /> },
];

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

// Figma "Action button": a rounded bar of icon-only items with dividers; the center action is a brand-coloured icon.
export const ActionButton: Story = { args: { variant: 'action', items: actionItems, action }, render: inScreen };

// Figma "Pagination" style: icon-only items around a "‹ 1 of N ›" pager, e.g. a document reader.
export const Pager: Story = {
  args: { items: readerItems },
  render: function Render(args) {
    const [page, setPage] = useState(1);
    return (
      <Screen>
        <BottomNavigation {...args} pager={{ page, pageCount: 246, onPageChange: setPage }} />
      </Screen>
    );
  },
};

// Interaction: the pager steps pages; item labels stay available to screen readers.
export const PagerInteraction: Story = {
  ...Pager,
  play: async ({ canvas, userEvent }) => {
    const nav = canvas.getByRole('navigation', { name: 'Bottom navigation' });
    await expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(within(nav).getByRole('button', { name: 'Next page' }));
    await expect(nav).toHaveTextContent('2 of 246');
    // Item labels stay available to screen readers.
    await expect(within(nav).getByRole('link', { name: 'Bookmarks' })).toBeVisible();
  },
};

// Figma "Segment controls" style: a segmented control above icon-only items. Figma draws it with the Toggle inputs
// "Advanced" segmented control, which has no code twin yet; Tabs variant="segmented" stands in.
export const SegmentControls: Story = {
  args: { items: segmentItems },
  render: function Render(args) {
    const [view, setView] = useState('day');
    return (
      <Screen>
        <BottomNavigation
          {...args}
          segments={
            <Tabs
              variant="segmented"
              value={view}
              onValueChange={setView}
              items={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
                { value: 'year', label: 'Year' },
              ]}
            />
          }
        />
      </Screen>
    );
  },
};

// Interaction: the segmented control switches views while the current item stays marked.
export const SegmentControlsInteraction: Story = {
  ...SegmentControls,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Week' }));
    await expect(canvas.getByRole('tab', { name: 'Week' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      <Screen><BottomNavigation {...args} variant="default" label="Default" /></Screen>
      <Screen><BottomNavigation {...args} variant="bordered" label="Bordered" /></Screen>
      <Screen><BottomNavigation {...args} variant="action" label="Action" items={actionItems} action={action} /></Screen>
    </div>
  ),
};
