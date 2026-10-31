import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, within } from 'storybook/test';
import { CogIcon, InfoIcon, MailIcon } from '../icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { IconShape } from './IconShape';
import { Input } from './Input';
import { Navbar, NavLink } from './Navbar';

// AD Design Kit Navbar — mirrors the Figma "Navbar" set (node 1149:74216) and "Nav link" (1149:74002).
const Logo = () => (
  <span className="flex items-center gap-2">
    <IconShape size="sm" color="brand">
      <CogIcon />
    </IconShape>
    <span className="text-lg font-semibold text-heading">AD Design Kit</span>
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

// Figma Type "Centered logo": links left, logo centred, actions right (md and up; below md it collapses like Default).
export const CenteredLogo: Story = {
  args: { centered: true },
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('nav')!;
    const row = nav.firstElementChild as HTMLElement;
    await expect(row).toHaveClass('md:grid-cols-3');
    // Links render first in the grid so they sit on the left of the logo.
    await expect(within(nav).getAllByRole('list')[0]).toHaveClass('md:order-first');
  },
};

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

/** Code-ahead `size="compact"`: a 44px app bar (py-1 with sm controls). */
export const Compact: Story = {
  args: {
    size: 'compact',
    logo: <span className="text-sm font-semibold text-heading">AD Design Kit</span>,
    actions: (
      <>
        <Button color="tertiary" size="sm">
          Log in
        </Button>
        <Button size="sm">Get started</Button>
      </>
    ),
  },
};

/** Code-ahead `fluid`: the content row spans the full width, for app shells. */
export const Fluid: Story = { args: { ...Compact.args, fluid: true }, parameters: { layout: 'fullscreen' } };

// Interaction (mobile): the menu button opens and closes the menu with links, search and actions.
export const MobileMenu: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { search: <Input size="sm" aria-label="Search site" placeholder="Search" leftIcon={<InfoIcon />} /> },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', { name: 'Open menu' });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(document.getElementById(toggle.getAttribute('aria-controls')!)).toBeNull();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAccessibleName('Close menu');
    const menu = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    await expect(menu).toBeVisible();
    const m = within(menu);
    await expect(m.getAllByRole('listitem')).toHaveLength(links.length);
    await expect(m.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    await expect(m.getByRole('link', { name: 'Pricing' })).not.toHaveAttribute('aria-current');
    await expect(m.getByText('Careers')).toHaveAttribute('aria-disabled', 'true');
    await expect(m.getByRole('textbox', { name: 'Search site' })).toBeVisible();
    await expect(m.getByRole('button', { name: 'Get started' })).toBeVisible();
    await expect(m.getByRole('button', { name: 'Log in' })).toBeVisible();

    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAccessibleName('Open menu');
    await expect(menu).not.toBeInTheDocument();
  },
};

// Interaction (mobile): with only a logo the menu opens to an empty list and no actions row.
export const MobileMenuLogoOnly: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { links: [], actions: undefined },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    const toggle = canvas.getByRole('button', { name: 'Close menu' });
    const menu = within(document.getElementById(toggle.getAttribute('aria-controls')!)!);
    await expect(menu.queryAllByRole('listitem')).toHaveLength(0);
    await expect(canvas.queryAllByRole('button')).toHaveLength(1);
  },
};
