import { useState } from 'react';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { AdDesignKitIcon, ArrowRightIcon, BookIcon, BullhornIcon, EnvelopeIcon, QuestionCircleIcon, SalePercentIcon } from '../icons';
import { Banner, type BannerProps } from './Banner';
import { Button } from './Button';
import { IconShape } from './IconShape';
import { Input, Label } from './Input';

// AD Design Kit Banner — one story per Figma "Banner" Type (node 1146:21254), Desktop breakpoint.
// Every Figma type shows the dismiss button, so every story passes onDismiss.
const meta = {
  title: 'Components/Banner',
  component: Banner,
  parameters: { design: figmaDesign('Banner'), layout: 'padded' },
  args: { floating: false, centered: false, sticky: false, onDismiss: fn() },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Default": centred text with an inline link, after a gray round icon shape.
export const Default: Story = {
  args: {
    centered: true,
    icon: (
      <IconShape size="sm" color="gray" shape="circle">
        <BullhornIcon />
      </IconShape>
    ),
    children: (
      <>
        New brand identity has been launched for the <a href="#banner">AD Design Kit Library</a>
      </>
    ),
  },
};

// Figma "Icon & link": centred offer with a brand square icon shape and a link with an arrow.
export const IconAndLink: Story = {
  args: {
    centered: true,
    icon: (
      <IconShape size="xs" color="brand">
        <SalePercentIcon />
      </IconShape>
    ),
    children: (
      <>
        Get 2% pricing commission.{' '}
        <a href="#banner" className="inline-flex items-center gap-1.5 font-medium">
          Become a partner <ArrowRightIcon className="size-4" />
        </a>
      </>
    ),
  },
};

// Figma "Heading & description": title and text with Tertiary xs and Brand xs buttons.
export const HeadingAndDescription: Story = {
  args: {
    title: 'Integration is the key',
    children: 'You can integrate AD Design Kit with many tools to make your work even more efficient.',
    actions: (
      <>
        <Button size="xs" color="tertiary" leftIcon={<BookIcon />}>Learn more</Button>
        <Button size="xs" rightIcon={<ArrowRightIcon />}>Get started</Button>
      </>
    ),
  },
};

// Figma "Logo + Button": floating card with the logo divided from the text and a Brand sm button.
// Tablet and Mobile show the logo mark only; Mobile puts Sign up and a Tertiary Close button full width.
export const LogoAndButton: Story = {
  args: {
    floating: true,
    logo: (
      <span className="inline-flex items-center gap-2 text-lg font-semibold text-heading">
        <AdDesignKitIcon className="size-6 text-fg-brand" /> <span className="sr-only lg:not-sr-only">AD Design Kit</span>
      </span>
    ),
    children: 'Build websites even faster with components on top of Tailwind CSS.',
    actions: <Button size="sm" className="flex-1 sm:flex-none">Sign up now</Button>,
  },
};

// Figma "Newsletter": a centred inline form (Label + Input with an envelope icon) and a Brand sm button.
// Mobile: a "Sign up to our newsletter" heading replaces the visible label and the field and button go full width.
export const Newsletter: Story = {
  args: {
    centered: true,
    actions: (
      <form className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4" onSubmit={(e) => e.preventDefault()}>
        <p className="text-sm font-medium text-heading sm:hidden">Sign up to our newsletter</p>
        <div className="flex items-center gap-3">
          <Label htmlFor="banner-email" required icon={<QuestionCircleIcon />} className="mb-0 max-sm:sr-only">
            Email
          </Label>
          <Input id="banner-email" size="sm" type="email" placeholder="Enter your email" leftIcon={<EnvelopeIcon />} className="w-full sm:w-64" />
        </div>
        <Button size="sm" type="submit" className="w-full sm:w-auto">Subscribe</Button>
      </form>
    ),
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
  return <Banner {...args} onDismiss={() => { setOpen(false); args.onDismiss?.(); }} />;
}

// Interaction: the dismiss button closes the banner. Persist dismissal in the app; the demo keeps it in local state.
export const Dismissible: Story = {
  args: { ...Default.args },
  render: (args) => <DismissibleBanner {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    const banner = canvas.getByRole('region', { name: 'Announcement' });
    await expect(within(banner).getByRole('link', { name: 'AD Design Kit Library' })).toBeVisible();
    await userEvent.click(within(banner).getByRole('button', { name: 'Dismiss announcement' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('region', { name: 'Announcement' })).toBeNull();
  },
};

// The newsletter form sits inside the centred group, before the dismiss button.
export const NewsletterLayout: Story = {
  ...Newsletter,
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: /Email/ });
    await expect(field).toBeVisible();
    const banner = canvas.getByRole('region', { name: 'Announcement' });
    const dismiss = within(banner).getByRole('button', { name: 'Dismiss announcement' });
    await expect(field.compareDocumentPosition(dismiss) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  },
};

// Figma Breakpoint = Mobile and Tablet: the same types at narrow widths, laid out by responsive classes.
const mobile = { viewport: { value: 'mobile1', isRotated: false } };
const tablet = { viewport: { value: 'tablet', isRotated: false } };

export const DefaultMobile: Story = { ...Default, globals: mobile };
export const IconAndLinkMobile: Story = { ...IconAndLink, globals: mobile };
export const HeadingAndDescriptionMobile: Story = { ...HeadingAndDescription, globals: mobile };
export const HeadingAndDescriptionTablet: Story = { ...HeadingAndDescription, globals: tablet };
export const NewsletterMobile: Story = { ...Newsletter, globals: mobile };

// Interaction (mobile): the floating card swaps the dismiss icon for a full-width Close button.
export const LogoAndButtonMobile: Story = {
  ...LogoAndButton,
  globals: mobile,
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.queryByRole('button', { name: 'Dismiss announcement' })).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Sign up now' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};
