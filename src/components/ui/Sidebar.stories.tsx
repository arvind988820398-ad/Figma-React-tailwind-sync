import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon, CogIcon, InfoIcon, MailIcon, PlusIcon } from '../icons';
import { Alert } from './Alert';
import { Badge } from './Badge';
import { IconShape } from './IconShape';
import { Sidebar, type SidebarItem } from './Sidebar';

// AuxoKit Sidebar — mirrors the Figma "Sidebar (Free component)" set (node 1149:82628). Figma "Contracted" = `collapsed`.
const main: SidebarItem[] = [
  { label: 'Dashboard', href: '#', icon: <CheckIcon />, current: true },
  { label: 'Inbox', href: '#', icon: <MailIcon />, badge: <Badge color="danger" size="sm">3</Badge> },
  { label: 'New project', href: '#', icon: <PlusIcon /> },
];
const more: SidebarItem[] = [
  { label: 'Settings', href: '#', icon: <CogIcon /> },
  { label: 'Billing', href: '#', icon: <InfoIcon />, disabled: true },
];

const TextHeader = () => <span className="text-lg font-medium leading-6 text-heading">AuxoKit</span>;
const IconHeader = () => (
  <IconShape size="sm" color="brand">
    <CogIcon />
  </IconShape>
);

const meta = {
  title: 'AuxoKit/Sidebar',
  component: Sidebar,
  parameters: { layout: 'padded' },
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
      <Sidebar {...args} />
      <Sidebar {...args} collapsed header={<IconHeader />} />
    </div>
  ),
};
