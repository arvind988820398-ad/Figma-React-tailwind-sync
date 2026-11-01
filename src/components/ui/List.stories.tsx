import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { figmaUsers } from '../../assets/avatars';
import adDesignKitLogo from '../../assets/logos/ad-design-kit.svg';
import figmaLogo from '../../assets/logos/figma.svg';
import tailwindLogo from '../../assets/logos/tailwind-css.svg';
import {
  ArchiveIcon,
  BookIcon,
  CheckCircleIcon,
  DesktopPcIcon,
  GridIcon,
  HomeIcon,
  ReactIcon,
  StoreIcon,
  TShirtIcon,
  TeddyBearIcon,
  TruckIcon,
  VideoCameraIcon,
} from '../icons';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { List, ListItem } from './List';

// AD Design Kit List — one story per Figma Type (node 1149:70444) with the Figma content; item states from 1149:70209.
const meta = {
  title: 'Components/List',
  parameters: { design: figmaDesign('List') },
  component: List,
  args: { variant: 'default' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'divider', 'card', 'cta'] },
    children: { control: false },
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Default": a plan checklist; features not included are Disabled (struck through).
export const Default: Story = {
  render: (args) => (
    <List {...args} className="w-72">
      {['2 team members', '20GB Cloud storage', 'Integration help', 'Sketch Files'].map((t) => (
        <ListItem key={t} icon={<CheckCircleIcon />}>{t}</ListItem>
      ))}
      {['API Access', 'Complete documentation', '24×7 phone & email support'].map((t) => (
        <ListItem key={t} icon={<CheckCircleIcon />} disabled>{t}</ListItem>
      ))}
    </List>
  ),
};

// Figma "Divider": icon rows with a value, divided by lines.
const categories = [
  { icon: <DesktopPcIcon />, label: 'Electronics', value: '$5B' },
  { icon: <TShirtIcon />, label: 'Fashion', value: '$2.78B' },
  { icon: <HomeIcon />, label: 'Home Furnishings', value: '$1.8B' },
  { icon: <TruckIcon />, label: 'Auto', value: '$1.1B' },
  { icon: <StoreIcon />, label: 'Food and Beverage', value: '$987M' },
  { icon: <TeddyBearIcon />, label: 'Toys', value: '$705M' },
  { icon: <BookIcon />, label: 'Books & Music', value: '$688M' },
  { icon: <ArchiveIcon />, label: 'Office Equipment', value: '$534M' },
  { icon: <VideoCameraIcon />, label: 'Audio & Video Equipment', value: '$502M' },
  { icon: <GridIcon />, label: 'Other Categories', value: '$95M' },
];
export const Divider: Story = {
  args: { variant: 'divider' },
  render: (args) => (
    <List {...args} className="w-80">
      {categories.map((c) => (
        <ListItem key={c.label} icon={c.icon} trailing={c.value}>
          {c.label}
        </ListItem>
      ))}
    </List>
  ),
};

// Figma "Card": a Card with a title, a View all link and customer rows (avatar, name, helper, amount).
const customers = [
  { user: figmaUsers[1], description: 'Helper text here', value: '$599' },
  { user: figmaUsers[0], description: 'Helper text here', value: '$325' },
  { user: figmaUsers[2], description: 'name@example.com', value: '$127' },
  { user: figmaUsers[4], description: 'Helper text here', value: '$1,264' },
  { user: figmaUsers[7], description: 'Helper text here', value: '$688' },
  { user: figmaUsers[9], description: 'Helper text here', value: '$89' },
];
export const InsideCard: Story = {
  args: { variant: 'card' },
  render: (args) => (
    <Card className="w-96">
      <div className="flex items-center justify-between gap-2.5">
        <h3 className="text-xl font-semibold text-heading">Latest customers</h3>
        <a href="#list" className="text-base font-medium text-fg-brand hover:underline">View all</a>
      </div>
      <List {...args}>
        {customers.map((c) => (
          <ListItem key={c.user.name} media={<Avatar name={c.user.name} src={c.user.src} size="base" />} description={c.description} trailing={c.value}>
            {c.user.name}
          </ListItem>
        ))}
      </List>
    </Card>
  ),
};

// Figma "CTA": card rows with a 36px logo, a title, a helper line and an arrow. Hover or press a row for the
// Figma Hover/Active state (brand tint, shown on "Figma App" in Figma).
const logo = (src: string) => <img src={src} alt="" className="size-9 object-contain p-0.5" />;
export const Cta: Story = {
  args: { variant: 'cta' },
  render: (args) => (
    <List {...args} className="w-128">
      <ListItem cta href="#list" media={logo(adDesignKitLogo)} description="Take your website or app to the next level.">
        AD Design Kit
      </ListItem>
      <ListItem cta href="#list" media={logo(figmaLogo)} description="Get started with our Figma Design System">
        Figma App
      </ListItem>
      <ListItem cta href="#list" media={logo(tailwindLogo)} description="The most popular utility-first framework">
        Tailwind CSS
      </ListItem>
      <ListItem cta href="#list" media={<ReactIcon className="size-9 p-0.5 text-heading" />} description="The library for web and native user interfaces.">
        React JS
      </ListItem>
    </List>
  ),
};

// Rich rows with a Badge or a Secondary xs Button on the right (List item types "Avatar & text + badge", "Image & buttons").
export const DividerWithActions: Story = {
  args: { variant: 'divider' },
  render: (args) => (
    <List {...args} className="w-80">
      <ListItem media={<Avatar name={figmaUsers[1].name} src={figmaUsers[1].src} size="base" />} description="bonnie@example.com" trailing={<Badge color="success" size="sm">Paid</Badge>}>
        {figmaUsers[1].name}
      </ListItem>
      <ListItem media={<Avatar name={figmaUsers[0].name} src={figmaUsers[0].src} size="base" />} description="jese@example.com" trailing={<Button size="xs" color="secondary">View</Button>}>
        {figmaUsers[0].name}
      </ListItem>
    </List>
  ),
};

// Links and disabled rows: a disabled row is struck through, out of the tab order and marked aria-disabled.
export const LinkAndDisabled: Story = {
  render: (args) => (
    <List {...args} className="w-72">
      <ListItem icon={<CheckCircleIcon />} href="#list">Integration help</ListItem>
      <ListItem icon={<CheckCircleIcon />} href="#list" disabled>API Access</ListItem>
    </List>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Integration help' })).toBeVisible();
    const disabled = canvas.getByRole('link', { name: 'API Access' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(disabled).toHaveAttribute('tabindex', '-1');
  },
};
