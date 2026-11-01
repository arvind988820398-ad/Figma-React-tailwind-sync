import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, within } from 'storybook/test';
import { figmaUsers } from '../../assets/avatars';
import adDesignKitLogo from '../../assets/logos/ad-design-kit.svg';
import { AngleDownIcon, ArrowRightToBracketIcon, BellIcon, EnvelopeIcon, FlagIcon, MoonIcon, PhoneIcon, SearchIcon } from '../icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Input } from './Input';
import { Navbar, NavLink, type NavbarProps } from './Navbar';

// AD Design Kit Navbar — one story per Figma "Navbar" Type (node 1149:74216) with Figma's content, plus the Tablet and
// Mobile breakpoints, Size=Compact and Width=Fluid. Nav link 1149:74002.

// Figma Logo sm: the gradient mark and a 24px wordmark.
const Logo = () => (
  <span className="flex items-center gap-3">
    <img src={adDesignKitLogo} alt="" className="size-7.5" />
    <span className="text-2xl font-semibold text-heading">AD Design Kit</span>
  </span>
);
const products = { label: 'Products', href: '#', rightIcon: <AngleDownIcon /> };
const links = [
  { label: 'Company', href: '#' },
  { label: 'Marketplace', href: '#' },
  { label: 'Features', href: '#' },
  products,
  { label: 'Team', href: '#' },
  { label: 'Contact', href: '#' },
];
const [, bonnie] = figmaUsers;

const tablet = { viewport: { value: 'tablet', isRotated: false } };
// Figma's Mobile frames are 380px wide: the large-mobile viewport (414px) is the closest preset.
const mobile = { viewport: { value: 'mobile2', isRotated: false } };

// Figma "Default": links, Login and Upgrade to PRO. Tablet keeps two links and a More menu; Mobile keeps Login.
const defaultArgs: Partial<NavbarProps> = {
  links,
  tabletLinks: 2,
  actions: (
    <>
      <Button color="secondary">Login</Button>
      <Button>Upgrade to PRO</Button>
    </>
  ),
  mobileActions: <Button color="secondary">Login</Button>,
};

// Figma "With links": a Search link and a language picker instead of buttons; links only on Desktop.
const withLinksArgs: Partial<NavbarProps> = {
  links,
  linksFrom: 'lg',
  actions: (
    <>
      <NavLink href="#" icon={<SearchIcon />}>Search</NavLink>
      <span className="h-5 border-s border-default" aria-hidden />
      <NavLink href="#" icon={<FlagIcon />} rightIcon={<AngleDownIcon />}>English (US)</NavLink>
    </>
  ),
  mobileActions: <Button color="ghost" size="sm" iconOnly aria-label="Search"><SearchIcon /></Button>,
};

// Figma "Centered logo": links left, logo centred, Talk to sales + Login + Upgrade to PRO right (Desktop).
const centeredArgs: Partial<NavbarProps> = {
  centered: true,
  links: [{ label: 'Home', href: '#' }, products, { label: 'Blog', href: '#' }, { label: 'Contact', href: '#' }],
  actions: (
    <>
      <NavLink href="#" rightIcon={<PhoneIcon />} className="hidden lg:inline-flex">Talk to sales</NavLink>
      <Button color="secondary">Login</Button>
      <Button>Upgrade to PRO</Button>
    </>
  ),
  mobileActions: <Button color="secondary">Login</Button>,
};

// Figma "With icons": theme and notification icon buttons, the user's avatar and a Logout button.
const iconButtons = (
  <>
    <Button color="ghost" size="sm" iconOnly aria-label="Dark mode"><MoonIcon /></Button>
    <Button color="ghost" size="sm" iconOnly aria-label="Notifications"><BellIcon /></Button>
  </>
);
const withIconsArgs: Partial<NavbarProps> = {
  links,
  tabletLinks: 2,
  actions: (
    <>
      {iconButtons}
      <Avatar name={bonnie.name} src={bonnie.src} size="base" />
      <Button color="ghost" size="sm" leftIcon={<ArrowRightToBracketIcon />}>Logout</Button>
    </>
  ),
  mobileActions: (
    <>
      {iconButtons}
      <Avatar name={bonnie.name} src={bonnie.src} size="base" />
    </>
  ),
};

// Figma "With search input": the search field beside the logo; links, icons and Login on the right (links on Desktop).
const withSearchArgs: Partial<NavbarProps> = {
  links: [{ label: 'Quickstart', href: '#' }, products, { label: 'Team', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Pro Version', href: '#' }],
  search: <Input size="sm" className="w-64" aria-label="Search" placeholder="Search" leftIcon={<SearchIcon />} />,
  actions: (
    <>
      <Button color="ghost" size="sm" iconOnly aria-label="Notifications"><BellIcon /></Button>
      <Button color="ghost" size="sm" iconOnly aria-label="Dark mode"><MoonIcon /></Button>
      <Button color="secondary" size="sm" leftIcon={<ArrowRightToBracketIcon />}>Login</Button>
    </>
  ),
  mobileActions: (
    <>
      <Button color="ghost" size="sm" iconOnly aria-label="Notifications"><BellIcon /></Button>
      <Button color="ghost" size="sm" iconOnly aria-label="Dark mode"><MoonIcon /></Button>
    </>
  ),
};

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: { design: figmaDesign('Navbar'), layout: 'fullscreen' },
  args: { logo: <Logo />, sticky: false, ...defaultArgs },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const DefaultTablet: Story = { globals: tablet };
export const DefaultMobile: Story = { globals: mobile };

export const WithLinks: Story = { args: withLinksArgs };
export const WithLinksTablet: Story = { args: withLinksArgs, globals: tablet };
export const WithLinksMobile: Story = { args: withLinksArgs, globals: mobile };

export const CenteredLogo: Story = {
  args: centeredArgs,
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector('nav')!;
    const row = nav.firstElementChild as HTMLElement;
    await expect(row).toHaveClass('lg:grid-cols-3');
    // Links render first in the grid so they sit on the left of the logo.
    await expect(within(nav).getAllByRole('list')[0]).toHaveClass('lg:order-first');
  },
};
export const CenteredLogoTablet: Story = { args: centeredArgs, globals: tablet };
export const CenteredLogoMobile: Story = { args: centeredArgs, globals: mobile };

export const WithIcons: Story = { args: withIconsArgs };
export const WithIconsTablet: Story = { args: withIconsArgs, globals: tablet };
export const WithIconsMobile: Story = { args: withIconsArgs, globals: mobile };

export const WithSearchInput: Story = { args: withSearchArgs };
export const WithSearchInputTablet: Story = { args: withSearchArgs, globals: tablet };
export const WithSearchInputMobile: Story = { args: withSearchArgs, globals: mobile };

// Figma Size=Compact: the same content in a dense bar with sm controls.
export const Compact: Story = {
  args: {
    size: 'compact',
    actions: (
      <>
        <Button color="secondary" size="sm">Login</Button>
        <Button size="sm">Upgrade to PRO</Button>
      </>
    ),
  },
};

// Figma Width=Fluid: the content row spans the full width, for app shells.
export const Fluid: Story = { args: { fluid: true } };
export const CompactFluid: Story = { args: { ...Compact.args, fluid: true } };

// Interaction (tablet): links past the first two move into the More menu.
export const TabletMoreMenu: Story = {
  globals: tablet,
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('link', { name: 'Company' })).toBeVisible();
    await expect(canvas.queryByRole('link', { name: 'Team' })).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: /More/ }));
    await expect(canvas.getByRole('menuitem', { name: 'Team' })).toBeVisible();
  },
};

// Fixtures for the interaction stories below.
const testLinks = [
  { label: 'Home', href: '#', current: true },
  { label: 'Services', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Careers', href: '#', disabled: true },
];
const testActions = (
  <>
    <Button color="secondary">Log in</Button>
    <Button>Get started</Button>
  </>
);

export const LogoOnly: Story = { args: { links: [], actions: undefined, mobileActions: undefined } };

// Scroll the canvas: the bar stays pinned to the top.
export const Sticky: Story = {
  args: { sticky: true, links: testLinks, actions: testActions, tabletLinks: undefined },
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
      <NavLink href="#" icon={<EnvelopeIcon />}>With icon</NavLink>
    </div>
  ),
};

// Interaction (mobile): the menu button opens and closes the menu with links, search and actions.
export const MobileMenu: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    links: testLinks,
    actions: testActions,
    mobileActions: undefined,
    tabletLinks: undefined,
    linksFrom: 'md',
    search: <Input size="sm" aria-label="Search site" placeholder="Search" leftIcon={<SearchIcon />} />,
  },
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
    await expect(m.getAllByRole('listitem')).toHaveLength(testLinks.length);
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
  args: { links: [], actions: undefined, mobileActions: undefined },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open menu' }));
    const toggle = canvas.getByRole('button', { name: 'Close menu' });
    const menu = within(document.getElementById(toggle.getAttribute('aria-controls')!)!);
    await expect(menu.queryAllByRole('listitem')).toHaveLength(0);
    await expect(canvas.queryAllByRole('button')).toHaveLength(1);
  },
};
