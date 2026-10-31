import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';
import { InfoIcon, PlusIcon } from '../icons';
import { Button } from './Button';
import { Drawer, type DrawerPlacement, type DrawerProps } from './Drawer';
import { Input, Label } from './Input';
import { NavLink } from './Navbar';

// AD Design Kit Drawer — mirrors the Figma "Drawer" set (node 1149:37097), heading 1149:37184, footer 1149:37232.
function DrawerDemo({ open: _open, onOpenChange, ...args }: DrawerProps & { buttonLabel?: string }) {
  const [open, setOpen] = useState(false);
  const change = (o: boolean) => {
    setOpen(o);
    onOpenChange(o);
  };
  return (
    <>
      <Button color="secondary" onClick={() => change(true)}>
        {args.buttonLabel ?? 'Open drawer'}
      </Button>
      <Drawer {...args} open={open} onOpenChange={change} />
    </>
  );
}

const meta = {
  title: 'Components/Drawer',
  parameters: { design: figmaDesign('Drawer') },
  component: Drawer,
  args: {
    open: false,
    onOpenChange: () => {},
    title: 'Drawer title',
    placement: 'start',
    size: 'sm',
    children: <p>Body content is composed from other AD Design Kit components: forms, lists, alerts or navigation.</p>,
    footer: (
      <>
        <Button>Save</Button>
        <Button color="secondary">Cancel</Button>
      </>
    ),
  },
  argTypes: {
    placement: { control: 'select', options: ['start', 'end', 'bottom'] },
    size: { control: 'select', options: ['sm', 'md'] },
  },
  render: (args) => <DrawerDemo {...args} />,
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const End: Story = { args: { placement: 'end' } };

// Figma Type "Bottom": a full-width sheet.
export const Bottom: Story = { args: { placement: 'bottom' } };

// Figma heading with "Show heading left icon" on (Type "Default").
export const WithHeadingIcon: Story = {
  args: { icon: <InfoIcon />, title: 'Drawer heading' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const drawer = await body.findByRole('dialog', { name: 'Drawer heading' });
    await expect(within(drawer).getByRole('heading', { name: 'Drawer heading' }).querySelector('svg')).not.toBeNull();
  },
};

// Figma Type "Swipeable": bottom sheet with a drag handle on its top edge.
export const Swipeable: Story = {
  args: { placement: 'bottom', swipeable: true, icon: <PlusIcon />, title: 'Add widget', footer: undefined },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const drawer = await body.findByRole('dialog', { name: 'Add widget' });
    await expect(drawer.querySelector('[aria-hidden].rounded-full')).not.toBeNull();
  },
};

// Plain bottom sheets have no handle.
export const BottomHasNoHandle: Story = {
  args: { placement: 'bottom' },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const drawer = await body.findByRole('dialog', { name: 'Drawer title' });
    await expect(drawer.querySelector('[aria-hidden].rounded-full')).toBeNull();
  },
};

// Figma 384px width (default / list content).
export const MediumWidth: Story = { args: { size: 'md', placement: 'end' } };

export const AllPlacements: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(['start', 'end', 'bottom'] as DrawerPlacement[]).map((placement) => (
        <DrawerDemo key={placement} {...args} placement={placement} title={`placement="${placement}"`} buttonLabel={placement} />
      ))}
    </div>
  ),
};

// Figma "Contact form" example (320px).
export const ContactForm: Story = {
  args: {
    title: 'New contact',
    children: (
      <>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="drawer-name" required>Name</Label>
          <Input id="drawer-name" placeholder="Ada Lovelace" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="drawer-email" required>Email</Label>
          <Input id="drawer-email" type="email" placeholder="name@company.com" />
        </div>
      </>
    ),
    footer: (
      <>
        <Button>Save contact</Button>
        <Button color="secondary">Cancel</Button>
      </>
    ),
  },
};

// Figma "Navigation" example: links in a start drawer, no footer.
export const Navigation: Story = {
  args: {
    title: 'Menu',
    footer: undefined,
    children: (
      <nav aria-label="Drawer navigation" className="flex flex-col gap-3">
        <NavLink href="#" current>Dashboard</NavLink>
        <NavLink href="#">Projects</NavLink>
        <NavLink href="#">Team</NavLink>
        <NavLink href="#" disabled>Billing</NavLink>
      </nav>
    ),
  },
};

// ── Interaction tests ────────────────────────────────────────────────────────────────────────────────────────────────
// The native <dialog> lives in the top layer, so it is queried from the document body.

// The close button closes the drawer, reports onOpenChange(false) and returns focus to the opener.
export const CloseButton: Story = {
  args: { onOpenChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const opener = canvas.getByRole('button', { name: 'Open drawer' });

    await userEvent.click(opener);
    const drawer = await body.findByRole('dialog', { name: 'Drawer title' });
    await expect(drawer).toBeVisible();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await expect(within(drawer).getByRole('button', { name: 'Save' })).toBeVisible();

    // Clicks on content keep it open.
    await userEvent.click(within(drawer).getByText(/Body content/));
    await expect(drawer).toHaveAttribute('open');

    await userEvent.click(within(drawer).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(drawer).not.toHaveAttribute('open'));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(opener).toHaveFocus();
  },
};

// A click on the backdrop (target is the <dialog> itself) closes the bottom sheet.
export const BackdropClickClosesBottomSheet: Story = {
  args: { onOpenChange: fn(), placement: 'bottom' },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const drawer = await body.findByRole('dialog', { name: 'Drawer title' });
    await expect(drawer).toHaveClass('bottom-0');

    await userEvent.click(drawer);
    await waitFor(() => expect(drawer).not.toHaveAttribute('open'));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

// Navigation drawer: focus starts inside, links are reachable by keyboard, no footer is rendered.
export const NavigationKeyboard: Story = {
  ...Navigation,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
    const drawer = await body.findByRole('dialog', { name: 'Menu' });
    const nav = within(drawer).getByRole('navigation', { name: 'Drawer navigation' });
    await expect(within(nav).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    await expect(drawer.querySelector('footer')).toBeNull();
    // showModal() focuses the first focusable element: the close button.
    await waitFor(() => expect(within(drawer).getByRole('button', { name: 'Close' })).toHaveFocus());
    await userEvent.tab();
    await expect(within(nav).getByRole('link', { name: 'Dashboard' })).toHaveFocus();
  },
};
