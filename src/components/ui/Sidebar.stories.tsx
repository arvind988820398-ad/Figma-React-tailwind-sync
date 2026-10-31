import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../icons';
import { Alert } from './Alert';
import { Badge } from './Badge';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { IconShape } from './IconShape';
import { Input } from './Input';
import { Sidebar, type SidebarItem } from './Sidebar';

// AD Design Kit Sidebar — mirrors the Figma "Sidebar (Free component)" set (node 1149:82628). Figma "Contracted" = `collapsed`.
const main: SidebarItem[] = [
  { label: 'Dashboard', href: '#', icon: <CheckIcon />, current: true },
  { label: 'Inbox', href: '#', icon: <MailIcon />, badge: <Badge color="danger" size="sm">3</Badge> },
  { label: 'New project', href: '#', icon: <PlusIcon /> },
];
const more: SidebarItem[] = [
  { label: 'Settings', href: '#', icon: <CogIcon /> },
  { label: 'Billing', href: '#', icon: <InfoIcon />, disabled: true },
];

const TextHeader = () => <span className="text-lg font-medium leading-6 text-heading">AD Design Kit</span>;
const IconHeader = () => (
  <IconShape size="sm" color="brand">
    <CogIcon />
  </IconShape>
);

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: { design: figmaDesign('Sidebar'), layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="h-120 w-fit overflow-hidden rounded-base border border-default">
        <Story />
      </div>
    ),
  ],
  args: { header: <TextHeader />, sections: [main, more], collapsed: false },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Icons only; labels move into tooltips (hover an item).
export const Collapsed: Story = { args: { collapsed: true, header: <IconHeader /> } };

// Figma "Double sidebar": an icon rail for the app's areas, a panel for the pages of the current area.
export const DoubleSidebar: Story = {
  args: {
    rail: {
      header: <IconHeader />,
      sections: [
        [
          { label: 'Dashboard', href: '#', icon: <CheckIcon />, current: true },
          { label: 'Inbox', href: '#', icon: <MailIcon /> },
        ],
        [{ label: 'Settings', href: '#', icon: <CogIcon /> }],
      ],
    },
    label: 'Dashboard pages',
    header: (
      <div className="flex flex-col gap-4">
        <span className="text-base font-semibold text-heading">Dashboard</span>
        <Input size="sm" type="search" placeholder="Search" aria-label="Search pages" />
      </div>
    ),
    sections: [main],
  },
  play: async ({ canvas }) => {
    const areas = canvas.getByRole('navigation', { name: 'Areas' });
    const pages = canvas.getByRole('navigation', { name: 'Dashboard pages' });
    await expect(areas).toHaveClass('w-16', 'border-e');
    await expect(within(areas).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    await expect(within(pages).getByRole('link', { name: /Inbox/ })).toBeVisible();
  },
};

export const WithAlert: Story = {
  args: {
    label: 'Sidebar with alert',
    sections: [main],
    footer: (
      <Alert variant="complex" color="info" title="Beta" onDismiss={() => {}}>
        Preview the new dashboard before everyone else.
      </Alert>
    ),
  },
};

export const WithoutHeader: Story = { args: { header: undefined } };

export const ExpandedAndCollapsed: Story = {
  render: (args) => (
    <div className="flex h-full divide-x divide-default">
      <Sidebar {...args} label="Main navigation (expanded)" />
      <Sidebar {...args} label="Main navigation (collapsed)" collapsed header={<IconHeader />} />
    </div>
  ),
};

// Two-line items (timestamp under the label) with a per-item actions menu beside the link, as in a chat history.
// Code ahead of Figma (figma-audit.md row 48).
const onRename = fn();
const onDelete = fn();
const history: SidebarItem[] = ['Design tokens in Tailwind', 'Dark mode for the dashboard', 'Accessible colour contrast'].map((label, i) => ({
  label,
  href: '#',
  icon: <MailIcon />,
  current: i === 0,
  meta: ['2m ago', '45m ago', 'Yesterday'][i],
  actions: (
    <Dropdown
      align="end"
      label={`Options for ${label}`}
      trigger={
        <Button color="ghost" size="xs" iconOnly aria-label={`Options for ${label}`}>
          <CogIcon />
        </Button>
      }
    >
      <DropdownItem onSelect={() => onRename(label)}>Rename</DropdownItem>
      <DropdownItem onSelect={() => onDelete(label)}>Delete</DropdownItem>
    </Dropdown>
  ),
}));

export const WithMetaAndActions: Story = {
  args: { sections: [history], header: undefined },
  play: async ({ canvas, canvasElement, userEvent }) => {
    // Second line is rendered under the label.
    await expect(canvas.getByRole('link', { name: /Dark mode for the dashboard/ })).toHaveTextContent('45m ago');
    // The actions sit beside the link, not inside it (no interactive content in a link).
    const trigger = canvas.getByRole('button', { name: 'Options for Dark mode for the dashboard' });
    await expect(trigger.closest('a')).toBeNull();
    const wrap = trigger.closest('li')!.querySelector('div.absolute') as HTMLElement;
    await expect(getComputedStyle(wrap).opacity).toBe('0');
    // Keyboard focus reveals it: Tab from the link lands on its menu button.
    canvas.getByRole('link', { name: /Dark mode for the dashboard/ }).focus();
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(wrap).opacity).toBe('1')); // fades in over 150ms
    // The menu opens above the next item and its options work.
    await userEvent.click(trigger);
    const menu = within(canvasElement).getByRole('menu', { name: 'Options for Dark mode for the dashboard' });
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Rename' }));
    await expect(onRename).toHaveBeenCalledWith('Dark mode for the dashboard');
  },
};
