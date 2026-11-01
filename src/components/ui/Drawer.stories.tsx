import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ReactNode } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';
import {
  AdDesignKitIcon,
  AdjustmentsVerticalIcon,
  ArrowRightIcon,
  CalendarMonthIcon,
  CashIcon,
  ChartPieIcon,
  CheckIcon,
  FileIcon,
  FileLinesIcon,
  InboxFullIcon,
  InfoCircleIcon,
  ListIcon,
  PlusIcon,
  ShoppingBagIcon,
  TableRowIcon,
  TicketIcon,
  UserHeadsetIcon,
  UsersGroupIcon,
} from '../icons';
import { Alert } from './Alert';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Drawer, type DrawerPlacement, type DrawerProps } from './Drawer';
import { IconShape } from './IconShape';
import { HelperText, Input, Label } from './Input';
import { Sidebar } from './Sidebar';
import { TagInput } from './TagInput';
import { Textarea } from './Textarea';

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

// ── Figma Type variants ──────────────────────────────────────────────────────────────────────────────────────────────
// One story per Figma "Drawer" Type with Figma's content. Each opens on load in the canvas (play), so the story
// matches the Figma frame; in the docs page it shows its trigger button.

const openOnLoad: Story['play'] = async ({ canvas, canvasElement, userEvent }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open drawer' }));
  await expect(await within(canvasElement.ownerDocument.body).findByRole('dialog')).toBeVisible();
};

const upgradeText = (
  <>
    <p className="text-sm">
      Upgrade your Figma toolkit with a design system built on top{' '}
      <a href="#drawer" className="text-heading underline">AD Design Kit CSS</a> featuring variants, style guide and auto layout.
    </p>
    <p className="text-sm">Recommended for professional developers and companies building enterprise-level.</p>
    <div className="flex items-center gap-3">
      <Button size="sm" color="secondary">Pricing & FAQ</Button>
      <Button size="sm" rightIcon={<ArrowRightIcon />}>Get access</Button>
    </div>
  </>
);

// Figma Type "Default": md (384px), heading icon, text and two buttons under it, no footer.
export const Default: Story = {
  args: { size: 'md', icon: <InfoCircleIcon />, title: 'Drawer heading', children: upgradeText, footer: undefined },
  play: async (ctx) => {
    await openOnLoad(ctx);
    const drawer = within(ctx.canvasElement.ownerDocument.body).getByRole('dialog', { name: 'Drawer heading' });
    await expect(within(drawer).getByRole('heading', { name: 'Drawer heading' }).querySelector('svg')).not.toBeNull();
  },
};

// Figma Type "Navigation": the logo as heading and Sidebar items, no footer.
export const Navigation: Story = {
  args: {
    icon: <AdDesignKitIcon className="text-fg-brand" />,
    title: 'AD Design Kit',
    footer: undefined,
    children: (
      <Sidebar
        label="Drawer navigation"
        className="w-full p-0"
        sections={[
          [
            { label: 'Overview', href: '#drawer', icon: <ChartPieIcon /> },
            { label: 'Pages', href: '#drawer', icon: <FileLinesIcon /> },
            { label: 'Ecommerce', href: '#drawer', icon: <ShoppingBagIcon />, current: true },
            { label: 'Messages', href: '#drawer', icon: <InboxFullIcon />, badge: <Badge color="danger" size="sm" circle>4</Badge> },
            { label: 'Users', href: '#drawer', icon: <UsersGroupIcon /> },
            { label: 'Support', href: '#drawer', icon: <UserHeadsetIcon /> },
          ],
        ]}
      />
    ),
  },
  play: openOnLoad,
};

// Figma Type "With forms": a contact form with a full-width submit button.
export const WithForms: Story = {
  args: {
    title: 'Contact us',
    footer: undefined,
    children: (
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="drawer-email" required>Your email</Label>
          <Input id="drawer-email" type="email" placeholder="name@addesignkit.com" />
        </div>
        <div>
          <Label htmlFor="drawer-subject" required>Subject</Label>
          <Input id="drawer-subject" placeholder="Enter your subject" />
        </div>
        <div>
          <Label htmlFor="drawer-message" required>Your message</Label>
          <Textarea id="drawer-message" rows={5} aria-describedby="drawer-message-help" />
          <HelperText id="drawer-message-help">4/500 words</HelperText>
        </div>
        <Button type="submit" className="w-full">Send message</Button>
      </form>
    ),
  },
  play: openOnLoad,
};

// Figma Type "Advanced": mixed fields (textarea, date, tags) with Close and Create event pinned to the bottom.
function AdvancedForm() {
  const [users, setUsers] = useState(['Roberta', 'Micheal']);
  return (
    <form className="flex flex-1 flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label htmlFor="event-title" required>Event title</Label>
        <Input id="event-title" placeholder="Enter event title" />
      </div>
      <div>
        <Label htmlFor="event-details">Event details</Label>
        <Textarea id="event-details" rows={5} />
      </div>
      <div>
        <Label htmlFor="event-date" required>Start date</Label>
        <Input id="event-date" defaultValue="12/08/2025" leftIcon={<CalendarMonthIcon />} />
      </div>
      <div>
        <Label htmlFor="event-users">Users</Label>
        <TagInput
          id="event-users"
          value={users}
          onChange={setUsers}
          renderLeading={(name) => <Avatar name={name} size="xs" />}
          aria-describedby="event-users-help"
        />
        <HelperText id="event-users-help">Separate with commas or the Enter key.</HelperText>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-4">
        <Button color="secondary">Close</Button>
        <Button type="submit" leftIcon={<PlusIcon />}>Create event</Button>
      </div>
    </form>
  );
}
export const Advanced: Story = {
  args: { title: 'New event', footer: undefined, children: <AdvancedForm /> },
  play: openOnLoad,
};

// Figma Type "With alert": a complex info Alert with a call to action.
export const WithAlert: Story = {
  args: {
    title: 'Notice',
    footer: undefined,
    children: (
      <Alert
        variant="complex"
        color="info"
        icon={<InfoCircleIcon />}
        title="New dashboard"
        actions={<Button size="xs" rightIcon={<ArrowRightIcon />}>Check it out</Button>}
      >
        We have launched the new AD Design Kit Dashboard featuring over 60+ pages!
      </Alert>
    ),
  },
  play: openOnLoad,
};

// Figma Type "With list": md, a key-value tile with order details.
const order: [string, ReactNode][] = [
  ['Order date', 'Jan 12, 2025'],
  ['Status', <Badge key="status" color="success" size="sm" leading={<CheckIcon className="size-3" />}>Approved</Badge>],
  ['Order number', '#7564937'],
  ['Shipping method', 'FedEx Ground'],
  ['Ship charge', '$49'],
  ['Phone', '+12 345 67890'],
  ['Email', 'name@addesignkit.com'],
  ['Estimated time', '3 days'],
];
export const WithList: Story = {
  args: {
    size: 'md',
    title: 'Order info',
    footer: undefined,
    children: (
      <dl className="flex flex-col gap-3 rounded-base border border-default-medium bg-neutral-secondary-medium p-4 text-sm">
        {order.map(([term, value]) => (
          <div key={term} className="flex items-center justify-between gap-4">
            <dt className="text-heading">{term}</dt>
            <dd className="font-medium text-body">{value}</dd>
          </div>
        ))}
      </dl>
    ),
  },
  play: openOnLoad,
};

// Figma Type "Bottom": a full-width sheet with the Default content.
export const Bottom: Story = {
  args: { placement: 'bottom', title: 'Order info', children: upgradeText, footer: undefined },
  play: openOnLoad,
};

// Figma Type "Swipeable": bottom sheet with a drag handle and widget tiles.
const widgets = [
  ['Chart', <ChartPieIcon key="i" />],
  ['Table', <TableRowIcon key="i" />],
  ['Ticket', <TicketIcon key="i" />],
  ['List', <ListIcon key="i" />],
  ['Price', <CashIcon key="i" />],
  ['File', <FileIcon key="i" />],
  ['Users', <UsersGroupIcon key="i" />],
  ['Custom', <AdjustmentsVerticalIcon key="i" />],
] as const;
export const Swipeable: Story = {
  args: {
    placement: 'bottom',
    swipeable: true,
    icon: <PlusIcon />,
    title: 'Add widget',
    footer: undefined,
    children: (
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
        {widgets.map(([name, icon]) => (
          <li key={name}>
            <a
              href="#drawer"
              className="flex flex-col items-center gap-2.5 rounded-base border border-default-medium bg-neutral-secondary-medium p-4 text-sm font-medium text-heading hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-brand focus-visible:outline-none"
            >
              <IconShape color="white" shape="circle">{icon}</IconShape>
              {name}
            </a>
          </li>
        ))}
      </ul>
    ),
  },
  play: async (ctx) => {
    await openOnLoad(ctx);
    const drawer = within(ctx.canvasElement.ownerDocument.body).getByRole('dialog', { name: 'Add widget' });
    await expect(drawer.querySelector('[aria-hidden].rounded-full')).not.toBeNull();
  },
};

// ── Placements and widths ────────────────────────────────────────────────────────────────────────────────────────────

export const End: Story = { args: { placement: 'end' } };

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
    const drawer = await body.findByRole('dialog', { name: 'AD Design Kit' });
    const nav = within(drawer).getByRole('navigation', { name: 'Drawer navigation' });
    await expect(within(nav).getByRole('link', { name: 'Ecommerce' })).toHaveAttribute('aria-current', 'page');
    await expect(drawer.querySelector('footer')).toBeNull();
    // showModal() focuses the first focusable element: the close button.
    await waitFor(() => expect(within(drawer).getByRole('button', { name: 'Close' })).toHaveFocus());
    await userEvent.tab();
    await expect(within(nav).getByRole('link', { name: 'Overview' })).toHaveFocus();
  },
};
