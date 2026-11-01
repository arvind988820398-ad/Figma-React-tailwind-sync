import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, waitFor, within } from 'storybook/test';
import { Popover, PopoverItem, type PopoverPlacement } from './Popover';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { CogIcon, EnvelopeIcon, FacebookIcon, InstagramIcon, LinkedinIcon, PlusIcon, XIcon, YoutubeIcon } from '../icons';

// AD Design Kit Popover — mirrors the Figma "Popover" set (node 1149:81090), content 1149:81187.
const placements = ['top', 'right', 'bottom', 'left'] as const satisfies readonly PopoverPlacement[];

const meta = {
  title: 'Components/Popover',
  parameters: { design: figmaDesign('Popover') },
  component: Popover,
  // Room for the panel on every side; click the trigger to open it.
  decorators: [(Story) => <div className="flex justify-center px-72 py-40">{Story()}</div>],
  args: {
    trigger: <Button color="secondary">Open popover</Button>,
    title: 'Popover title',
    children: 'And here’s some amazing content. It’s very engaging. Right?',
    placement: 'top',
    padding: 'text',
  },
  argTypes: {
    placement: { control: 'select', options: placements },
    padding: { control: 'select', options: ['text', 'rich', 'none'] },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutTitle: Story = { args: { title: undefined } };

// Figma Type "Default" × Position: shown open, the arrow pointing at the trigger.
export const Top: Story = { args: { placement: 'top', defaultOpen: true } };
export const Bottom: Story = { args: { placement: 'bottom', defaultOpen: true } };
export const Left: Story = { args: { placement: 'left', defaultOpen: true } };
export const Right: Story = { args: { placement: 'right', defaultOpen: true } };

// Figma Type "Vertical items": social share rows divided by borders; the panel hugs its rows.
const shareItems = (
  <>
    <PopoverItem icon={<XIcon />} href="#popover">Tweet</PopoverItem>
    <PopoverItem icon={<FacebookIcon />} href="#popover">Share</PopoverItem>
    <PopoverItem icon={<InstagramIcon />} href="#popover">Like</PopoverItem>
    <PopoverItem icon={<LinkedinIcon />} href="#popover">Share</PopoverItem>
    <PopoverItem icon={<YoutubeIcon />} href="#popover">Like</PopoverItem>
  </>
);
const verticalItems = { padding: 'none', title: undefined, label: 'Share', defaultOpen: true, children: shareItems, trigger: <Button color="secondary">Share</Button> } as const;
export const VerticalItemsTop: Story = { args: { ...verticalItems, placement: 'top' } };
export const VerticalItemsBottom: Story = { args: { ...verticalItems, placement: 'bottom' } };
export const VerticalItemsLeft: Story = { args: { ...verticalItems, placement: 'left' } };
export const VerticalItemsRight: Story = { args: { ...verticalItems, placement: 'right' } };

// Figma "Rich" content: profile card with avatar, text and a link.
export const RichContent: Story = {
  args: {
    placement: 'bottom',
    padding: 'rich',
    title: undefined,
    trigger: (
      <Button color="ghost">
        <Avatar name="Ada Lovelace" size="sm" /> Ada Lovelace
      </Button>
    ),
    children: (
      <>
        <div className="flex items-center justify-between">
          <Avatar name="Ada Lovelace" size="lg" />
          <Button size="xs">Follow</Button>
        </div>
        <p className="text-sm font-semibold leading-none text-heading">Ada Lovelace</p>
        <p className="text-sm text-body">First programmer. Writes about engines and analysis.</p>
        <a href="#popover" className="text-sm font-medium text-fg-brand">View profile</a>
      </>
    ),
  },
};

// Vertical items with app actions instead of share links.
export const VerticalItems: Story = {
  args: {
    placement: 'bottom',
    padding: 'none',
    title: undefined,
    trigger: <Button color="secondary">Vertical items</Button>,
    children: (
      <>
        <PopoverItem icon={<PlusIcon />} href="#popover">New project</PopoverItem>
        <PopoverItem icon={<CogIcon />} href="#popover">Settings</PopoverItem>
        <PopoverItem icon={<EnvelopeIcon />} href="#popover">Messages</PopoverItem>
      </>
    ),
  },
};

// All four Figma positions side by side, open.
export const AllPlacements: Story = {
  render: ({ placement: _placement, trigger: _trigger, defaultOpen: _open, ...args }) => (
    <div className="grid grid-cols-2 place-items-center gap-x-96 gap-y-40">
      {placements.map((placement) => (
        <Popover key={placement} {...args} defaultOpen placement={placement} trigger={<Button color="secondary">{placement}</Button>} />
      ))}
    </div>
  ),
};

// ── Interaction tests ────────────────────────────────────────────────────────────────────────────────────────────────

// Click opens a dialog named by its title; Escape closes it and returns focus to the trigger.
export const OpenAndEscape: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Open popover' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);
    const dialog = canvas.getByRole('dialog', { name: 'Popover title' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveTextContent('amazing content');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-controls', dialog.id);

    // Other keys are ignored.
    await userEvent.keyboard('a');
    await expect(dialog).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).not.toHaveAttribute('aria-controls');
    await expect(trigger).toHaveFocus();
  },
};

// Clicks inside the panel keep it open; the trigger toggles it; a click outside closes it.
export const DismissOnOutsideClick: Story = {
  args: { ...RichContent.args },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: /Ada Lovelace/ });

    await userEvent.click(trigger);
    const dialog = canvas.getByRole('dialog');
    await expect(within(dialog).getByRole('link', { name: 'View profile' })).toBeVisible();
    await userEvent.click(within(dialog).getByText(/First programmer/));
    await expect(dialog).toBeVisible();

    await userEvent.click(trigger);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await userEvent.click(canvasElement.ownerDocument.body);
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

// Vertical items: link rows and plain (non-link) rows, opened to the right with no panel padding.
export const VerticalItemsOpen: Story = {
  args: {
    ...VerticalItems.args,
    placement: 'right',
    title: 'Shortcuts',
    children: (
      <>
        <PopoverItem icon={<PlusIcon />} href="#popover">New project</PopoverItem>
        <PopoverItem icon={<EnvelopeIcon />}>3 unread messages</PopoverItem>
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Vertical items' }));
    const dialog = canvas.getByRole('dialog', { name: 'Shortcuts' });
    await expect(within(dialog).getByRole('link', { name: 'New project' })).toHaveAttribute('href', '#popover');
    // The plain row is text, not a link.
    await expect(within(dialog).getAllByRole('link')).toHaveLength(1);
    await expect(within(dialog).getByText('3 unread messages')).toBeVisible();
    await expect(dialog).toHaveClass('left-full');
  },
};

// Opening each placement once; without a title the dialog has no aria-labelledby.
export const OpenEachPlacement: Story = {
  render: ({ placement: _placement, trigger: _trigger, ...args }) => (
    <div className="flex flex-wrap items-center justify-center gap-10">
      {placements.map((placement) => (
        <Popover key={placement} {...args} placement={placement} trigger={<Button color="secondary">{placement}</Button>} />
      ))}
    </div>
  ),
  play: async ({ canvas, userEvent }) => {
    for (const placement of placements) {
      await userEvent.click(canvas.getByRole('button', { name: placement }));
      const dialog = canvas.getByRole('dialog', { name: 'Popover title' });
      await expect(dialog).toBeVisible();
      await userEvent.keyboard('{Escape}');
      await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    }
  },
};

export const UntitledOpenThenClosed: Story = {
  args: { title: undefined, placement: 'left' },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Open popover' });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).not.toHaveAttribute('aria-labelledby');
    await expect(dialog).toHaveTextContent('amazing content');
    // Closed again before the a11y scan: an untitled dialog has no accessible name (see report).
    await userEvent.click(trigger);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
