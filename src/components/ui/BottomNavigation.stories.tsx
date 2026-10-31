import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ReactNode } from 'react';
import { expect, within } from 'storybook/test';
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../icons';
import { BottomNavigation } from './BottomNavigation';
import { Tabs } from './Tabs';

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

// Figma "Pagination" style: icon-only items around a "‹ 1 of N ›" pager, e.g. a document reader.
export const Pager: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    return (
      <Screen>
        <BottomNavigation {...args} pager={{ page, pageCount: 246, onPageChange: setPage }} />
      </Screen>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const nav = canvas.getByRole('navigation', { name: 'Bottom navigation' });
    await expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(within(nav).getByRole('button', { name: 'Next page' }));
    await expect(nav).toHaveTextContent('2 of 246');
    // Item labels stay available to screen readers.
    await expect(within(nav).getByRole('link', { name: 'Inbox' })).toBeVisible();
  },
};

// Figma "Segment controls" style: a segmented control above icon-only items.
export const SegmentControls: Story = {
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
              ]}
            />
          }
        />
      </Screen>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('tab', { name: 'Week' }));
    await expect(canvas.getByRole('tab', { name: 'Week' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  },
};

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
