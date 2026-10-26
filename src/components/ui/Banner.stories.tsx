import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner, type BannerProps } from './Banner';
import { Button } from './Button';
import { Input } from './Input';
import { MailIcon } from '../icons';

// AuxoKit Banner — mirrors the Figma "Banner" set (node 1146:21254).
const meta = {
  title: 'AuxoKit/Banner',
  component: Banner,
  parameters: { layout: 'padded' },
  args: {
    children: (
      <>
        New brand identity has been launched for the <a href="#banner">AuxoKit Library</a>
      </>
    ),
    floating: false,
    sticky: false,
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Default": text with an inline link.
export const Default: Story = {};

// Figma "Icon & link".
export const WithIcon: Story = {
  args: {
    icon: <MailIcon />,
    children: (
      <>
        Get 5% commission per sale. <a href="#banner">Become a partner →</a>
      </>
    ),
  },
};

// Figma "Heading & description": title + Tertiary xs and Brand xs buttons.
export const HeadingAndActions: Story = {
  args: {
    title: 'Integration is the key',
    children: 'You can integrate AuxoKit with React, Vue, Angular and plain HTML.',
    actions: (
      <>
        <Button size="xs" color="tertiary">Learn more</Button>
        <Button size="xs">Get started</Button>
      </>
    ),
  },
};

// Figma "Newsletter": actions hold a small form.
export const Newsletter: Story = {
  args: {
    children: 'Sign up for our newsletter',
    actions: (
      <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
        <Input size="sm" type="email" aria-label="Email address" placeholder="Enter your email" className="w-56" />
        <Button size="sm" type="submit">Subscribe</Button>
      </form>
    ),
  },
};

// Figma "Logo + Button": floating card with the logo divided from the text.
export const Floating: Story = {
  args: {
    floating: true,
    logo: <span className="text-base font-semibold text-heading">AuxoKit</span>,
    children: 'Build websites even faster with components on top of Tailwind CSS',
    actions: <Button size="sm">Sign up</Button>,
  },
};

function DismissibleBanner(args: BannerProps) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <Button size="xs" color="secondary" onClick={() => setOpen(true)}>
        Show banner again
      </Button>
    );
  }
  return <Banner {...args} onDismiss={() => setOpen(false)} />;
}

// Persist dismissal in the app; the demo keeps it in local state.
export const Dismissible: Story = {
  render: (args) => <DismissibleBanner {...args} />,
};
