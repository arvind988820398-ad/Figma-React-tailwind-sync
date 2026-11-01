import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { figmaUsers } from '../../assets/avatars';
import adDesignKitLogo from '../../assets/logos/ad-design-kit.svg';
import {
  AdjustmentsVerticalIcon,
  ArrowRightIcon,
  BookIcon,
  CartIcon,
  CashRegisterIcon,
  ChartPieIcon,
  CogIcon,
  DatabaseIcon,
  EnvelopeIcon,
  FileLinesIcon,
  FolderIcon,
  GlobeIcon,
  HomeIcon,
  InboxFullIcon,
  InfoCircleIcon,
  InsertTableAltIcon,
  LifeSaverIcon,
  SearchIcon,
  ShoppingBagIcon,
  StoreIcon,
  UserCircleIcon,
  UserHeadsetIcon,
  UsersGroupIcon,
} from '../icons';
import { Alert } from './Alert';
import { Badge } from './Badge';
import { Button } from './Button';
import { Dropdown, DropdownItem } from './Dropdown';
import { Input } from './Input';
import { Sidebar, SidebarUser, type SidebarItem } from './Sidebar';

// AD Design Kit Sidebar — one story per variant of the Figma "Sidebar (Free component)" set (node 1149:82628), with
// Figma's content. Figma "Contracted" = `collapsed`. Note: in Figma the Type=Default variant carries the alert and the
// Type=With alert variant has none (names look swapped); each story follows the Figma variant of the same name.
const sub = (current?: string): SidebarItem[] =>
  ['All products', 'Billing', 'Invoice', 'Transactions'].map((label) => ({ label, href: '#', icon: null, current: label === current }));
const pages: SidebarItem[] = [
  { label: 'Overview', href: '#', icon: <ChartPieIcon />, items: sub() },
  { label: 'Pages', href: '#', icon: <FileLinesIcon />, items: sub() },
  { label: 'Ecommerce', href: '#', icon: <ShoppingBagIcon />, items: sub(), defaultOpen: true, current: true },
  { label: 'Messages', href: '#', icon: <InboxFullIcon />, badge: <Badge color="danger" size="sm" circle>4</Badge> },
  { label: 'Users', href: '#', icon: <UsersGroupIcon />, items: sub() },
  { label: 'Support', href: '#', icon: <UserHeadsetIcon />, items: sub() },
];
const help: SidebarItem[] = [
  { label: 'Docs', href: '#', icon: <BookIcon /> },
  { label: 'Components', href: '#', icon: <DatabaseIcon /> },
  { label: 'Help', href: '#', icon: <LifeSaverIcon /> },
];
// Figma Contracted: the same areas as icons; the cart is current.
const icons: SidebarItem[] = [
  { label: 'Overview', href: '#', icon: <ChartPieIcon /> },
  { label: 'Pages', href: '#', icon: <FileLinesIcon /> },
  { label: 'Ecommerce', href: '#', icon: <CartIcon />, current: true },
  { label: 'Messages', href: '#', icon: <InboxFullIcon /> },
  { label: 'Users', href: '#', icon: <UsersGroupIcon /> },
  { label: 'Support', href: '#', icon: <UserHeadsetIcon /> },
];
// Figma Double sidebar rail: the app's areas.
const areas: SidebarItem[] = [
  { label: 'Home', href: '#', icon: <HomeIcon />, current: true },
  { label: 'Files', href: '#', icon: <FolderIcon /> },
  { label: 'Sales', href: '#', icon: <CashRegisterIcon /> },
  { label: 'Tables', href: '#', icon: <InsertTableAltIcon /> },
  { label: 'Account', href: '#', icon: <UserCircleIcon /> },
  { label: 'Store', href: '#', icon: <StoreIcon /> },
];

// Figma Logo xs: the gradient mark and the wordmark.
const Logo = ({ mark }: { mark?: boolean }) => (
  <span className="flex items-center gap-2">
    <img src={adDesignKitLogo} alt={mark ? 'AD Design Kit' : ''} className="size-6" />
    {!mark && <span className="text-lg font-semibold text-heading">AD Design Kit</span>}
  </span>
);
const [jese] = figmaUsers;
const user = <SidebarUser name={jese.name} email="name@addesignkit.com" src={jese.src} />;

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: { design: figmaDesign('Sidebar'), layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="h-232 w-fit overflow-hidden rounded-base border border-default">
        <Story />
      </div>
    ),
  ],
  args: { header: <Logo />, sections: [pages, help], collapsed: false },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma Type=Default: logo header, the pages with the Ecommerce group open, a help section and the "New dashboard!" alert.
export const Default: Story = {
  args: {
    footer: (
      <Alert
        variant="complex"
        color="info"
        title="New dashboard!"
        icon={<InfoCircleIcon />}
        onDismiss={() => {}}
        actions={<Button size="xs" rightIcon={<ArrowRightIcon />}>Check it out</Button>}
      >
        Preview the new AD Design Kit dashboard navigation! You can turn the new navigation off for a limited time in your profile.
      </Alert>
    ),
  },
};

// Figma Type=With alert: a user select header, the pages, and settings / language / preferences buttons at the bottom.
export const WithAlert: Story = {
  args: {
    header: user,
    headerDivider: false,
    sections: [pages],
    footer: (
      <div className="flex justify-center gap-2">
        <Button color="ghost" size="sm" iconOnly aria-label="Settings"><CogIcon /></Button>
        <Button color="ghost" size="sm" iconOnly aria-label="Language"><GlobeIcon /></Button>
        <Button color="ghost" size="sm" iconOnly aria-label="Preferences"><AdjustmentsVerticalIcon /></Button>
      </div>
    ),
  },
};

// Figma Contracted=True: icons only; labels move into tooltips (hover an item).
export const Collapsed: Story = { args: { collapsed: true, header: <Logo mark />, sections: [icons, help] } };

// Figma "Double sidebar": an icon rail for the app's areas, a panel for the pages of the current area, the user at the bottom.
export const DoubleSidebar: Story = {
  args: {
    rail: { header: <Logo mark />, sections: [areas, help] },
    label: 'Dashboard pages',
    headerDivider: false,
    header: (
      <div className="flex flex-col gap-4">
        <span className="text-base font-semibold text-heading">AD Design Kit dashboard</span>
        <Input size="sm" type="search" placeholder="Search" aria-label="Search pages" leftIcon={<SearchIcon />} />
      </div>
    ),
    sections: [pages],
    footer: user,
  },
  play: async ({ canvas }) => {
    const rail = canvas.getByRole('navigation', { name: 'Areas' });
    const panel = canvas.getByRole('navigation', { name: 'Dashboard pages' });
    await expect(rail).toHaveClass('w-16', 'border-e');
    await expect(within(rail).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await expect(within(panel).getByRole('button', { name: /Jese Leos/ })).toBeVisible();
  },
};

// Interaction: a group's chevron button shows and hides its sub-pages.
export const ExpandableGroup: Story = {
  args: { sections: [pages] },
  play: async ({ canvas, userEvent }) => {
    const ecommerce = canvas.getByRole('button', { name: 'Ecommerce' });
    await expect(ecommerce).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Billing' })).toBeVisible();
    await userEvent.click(ecommerce);
    await expect(ecommerce).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('link', { name: 'Billing' })).toBeNull();
    const users = canvas.getByRole('button', { name: 'Users' });
    await userEvent.click(users);
    await expect(users).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('link', { name: 'Transactions' })).toBeVisible();
  },
};

export const ExpandedAndCollapsed: Story = {
  render: (args) => (
    <div className="flex h-full divide-x divide-default">
      <Sidebar {...args} label="Main navigation (expanded)" />
      <Sidebar {...args} label="Main navigation (collapsed)" collapsed header={<Logo mark />} sections={[icons, help]} />
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
  icon: <EnvelopeIcon />,
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
