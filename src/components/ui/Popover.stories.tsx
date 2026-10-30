import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, waitFor, within } from 'storybook/test';
import { Popover, PopoverItem, type PopoverPlacement } from './Popover';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { CogIcon, MailIcon, PlusIcon } from '../icons';

// AD Design Kit Popover — mirrors the Figma "Popover" set (node 1149:81090), content 1149:81187.
const placements = ['top', 'right', 'bottom', 'left'] as const satisfies readonly PopoverPlacement[];

const meta = {
  title: 'Components/Popover',
  parameters: { design: figmaDesign('Popover') },
  component: Popover,
  // Room for the panel on every side; click the trigger to open it.
  decorators: [(Story) => <div className="px-40 py-32">{Story()}</div>],
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
export const Bottom: Story = { args: { placement: 'bottom' } };

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

// Figma "Vertical items": icon + text rows, no panel padding.
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
        <PopoverItem icon={<MailIcon />} href="#popover">Messages</PopoverItem>
      </>
    ),
  },
};

export const AllPlacements: Story = {
  render: ({ placement: _placement, trigger: _trigger, ...args }) => (
    <div className="flex flex-wrap items-center justify-center gap-10">
      {placements.map((placement) => (
        <Popover key={placement} {...args} placement={placement} trigger={<Button color="secondary">{placement}</Button>} />
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
        <PopoverItem icon={<MailIcon />}>3 unread messages</PopoverItem>
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
  ...AllPlacements,
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
