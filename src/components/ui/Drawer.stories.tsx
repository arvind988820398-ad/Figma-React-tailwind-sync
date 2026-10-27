import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { useState } from 'react';
import { Button } from './Button';
import { Drawer, type DrawerPlacement, type DrawerProps } from './Drawer';
import { Input, Label } from './Input';
import { NavLink } from './Navbar';

// AuxoKit Drawer — mirrors the Figma "Drawer" set (node 1149:37097), heading 1149:37184, footer 1149:37232.
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
    children: <p>Body content is composed from other AuxoKit components: forms, lists, alerts or navigation.</p>,
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

// Bottom sheet: full width with a drag handle.
export const Bottom: Story = { args: { placement: 'bottom' } };

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
