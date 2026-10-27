import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { CogIcon, InfoIcon, MailIcon } from '../icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { IconShape } from './IconShape';
import { Input } from './Input';
import { Navbar, NavLink } from './Navbar';

// AuxoKit Navbar — mirrors the Figma "Navbar" set (node 1149:74216) and "Nav link" (1149:74002).
const Logo = () => (
  <span className="flex items-center gap-2">
    <IconShape size="sm" color="brand">
      <CogIcon />
    </IconShape>
    <span className="text-lg font-semibold text-heading">AuxoKit</span>
  </span>
);

const links = [
  { label: 'Home', href: '#', current: true },
  { label: 'Services', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Careers', href: '#', disabled: true },
];

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: { design: figmaDesign('Navbar'), layout: 'fullscreen' },
  args: {
    logo: <Logo />,
    links,
    actions: (
      <>
        <Button color="secondary">Log in</Button>
        <Button>Get started</Button>
      </>
    ),
    sticky: false,
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSearch: Story = {
  args: {
    links: [{ label: 'Docs', href: '#', current: true }, { label: 'Components', href: '#' }, { label: 'Blog', href: '#' }],
    actions: undefined,
    search: <Input size="sm" className="w-56" aria-label="Search" placeholder="Search" leftIcon={<InfoIcon />} />,
  },
};

export const WithIconActions: Story = {
  args: {
    links: [{ label: 'Dashboard', href: '#', current: true }, { label: 'Team', href: '#' }, { label: 'Projects', href: '#' }],
    actions: (
      <>
        <Button color="ghost" size="sm" iconOnly aria-label="Notifications"><MailIcon /></Button>
        <Button color="ghost" size="sm" iconOnly aria-label="Settings"><CogIcon /></Button>
        <Avatar name="Ada Lovelace" size="base" />
      </>
    ),
  },
};

export const LogoOnly: Story = { args: { links: [], actions: undefined } };

// Scroll the canvas: the bar stays pinned to the top.
export const Sticky: Story = {
  args: { sticky: true },
  render: (args) => (
    <div className="h-dvh overflow-y-auto bg-neutral-secondary-soft">
      <Navbar {...args} />
      <div className="h-256 p-6 text-body">Page content below the sticky navbar.</div>
    </div>
  ),
};

// Figma "Nav link": Initial · Current (Hover/Active) · Disabled · With icon.
export const NavLinkStates: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div className="flex items-center gap-8">
      <NavLink href="#">Default</NavLink>
      <NavLink href="#" current>Current</NavLink>
      <NavLink href="#" disabled>Disabled</NavLink>
      <NavLink href="#" icon={<MailIcon />}>With icon</NavLink>
    </div>
  ),
};
