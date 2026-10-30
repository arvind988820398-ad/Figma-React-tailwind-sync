import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';
import { Button } from './Button';
import { Input, Label } from './Input';
import { Modal, type ModalProps, type ModalSize } from './Modal';

// AD Design Kit Modal — mirrors the Figma "Modal" set (node 1149:71305), header 1149:71403, footer 1149:71444.
function ModalDemo({ open: _open, onOpenChange, footer, ...args }: ModalProps & { buttonLabel?: string }) {
  const [open, setOpen] = useState(false);
  const change = (o: boolean) => {
    setOpen(o);
    onOpenChange(o);
  };
  return (
    <>
      <Button color="secondary" onClick={() => change(true)}>
        {args.buttonLabel ?? 'Open modal'}
      </Button>
      <Modal
        {...args}
        open={open}
        onOpenChange={change}
        footer={
          footer ?? (
            <>
              <Button color="tertiary" onClick={() => change(false)}>Cancel</Button>
              <Button onClick={() => change(false)}>Accept</Button>
            </>
          )
        }
      />
    </>
  );
}

const meta = {
  title: 'Components/Modal',
  parameters: { design: figmaDesign('Modal') },
  component: Modal,
  args: {
    open: false,
    onOpenChange: () => {},
    title: 'Modal title',
    size: 'md',
    dismissible: true,
    children: <p>Header, body and footer use the Figma Modal recipe; only the width changes per size.</p>,
  },
  argTypes: { size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] } },
  render: (args) => <ModalDemo {...args} />,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma widths: sm 384 (Sign in, Popup, OTP) · md 448 (Share, lists) · lg 576 (Info) · xl.
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(['sm', 'md', 'lg', 'xl'] as ModalSize[]).map((size) => (
        <ModalDemo key={size} {...args} size={size} title={`Modal size="${size}"`} buttonLabel={`size="${size}"`} />
      ))}
    </div>
  ),
};

// Destructive confirmation: Esc and backdrop clicks do not close it.
export const NonDismissibleConfirm: Story = {
  args: {
    size: 'sm',
    dismissible: false,
    title: 'Delete project?',
    children: <p>This can’t be undone. Clicking the backdrop won’t close this dialog.</p>,
  },
  render: (args) => <DeleteDemo {...args} />,
};
function DeleteDemo(args: ModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button color="danger" onClick={() => setOpen(true)}>Delete project</Button>
      <Modal
        {...args}
        open={open}
        onOpenChange={setOpen}
        footer={
          <>
            <Button color="tertiary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="danger" onClick={() => setOpen(false)}>Delete</Button>
          </>
        }
      />
    </>
  );
}

// Figma "Sign in" example: a form in a sm modal.
export const SignInForm: Story = {
  args: {
    size: 'sm',
    title: 'Sign in to AD Design Kit',
    children: (
      <>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="modal-email" required>Email</Label>
          <Input id="modal-email" type="email" placeholder="name@company.com" />
        </div>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="modal-password" required>Password</Label>
          <Input id="modal-password" type="password" placeholder="••••••••" />
        </div>
      </>
    ),
    footer: <Button className="w-full">Sign in</Button>,
  },
};

export const WithoutFooter: Story = {
  args: { title: 'Release notes', children: <p>Only a header and body; the footer slot is left empty.</p> },
  render: (args) => <NoFooterDemo {...args} />,
};
function NoFooterDemo(args: ModalProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button color="secondary" onClick={() => setOpen(true)}>Open modal</Button>
      <Modal {...args} open={open} onOpenChange={setOpen} footer={undefined} />
    </>
  );
}

// ── Interaction tests ────────────────────────────────────────────────────────────────────────────────────────────────
// The native <dialog> lives in the top layer, so it is queried from the document body.

// The header close button closes the dialog, reports onOpenChange(false) and returns focus to the opener.
export const CloseButton: Story = {
  args: { onOpenChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const opener = canvas.getByRole('button', { name: 'Open modal' });

    await userEvent.click(opener);
    const dialog = await body.findByRole('dialog', { name: 'Modal title' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('open');
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
    await expect(within(dialog).getByRole('button', { name: 'Accept' })).toBeVisible();

    // Clicks on content (not the backdrop) keep it open.
    await userEvent.click(within(dialog).getByText(/Header, body and footer/));
    await expect(dialog).toHaveAttribute('open');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(dialog).not.toBeVisible());
    await expect(dialog).not.toHaveAttribute('open');
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(opener).toHaveFocus();
  },
};

// user-event key presses are synthetic and never trigger the browser's native Escape handling on <dialog>, so the
// "cancel" event the browser fires on Escape is dispatched directly; the component decides whether to prevent it.
const pressEscapeOn = (dialog: HTMLElement) => dialog.dispatchEvent(new Event('cancel', { cancelable: true }));

// Escape is allowed (cancel not prevented) and a click on the backdrop closes a dismissible modal.
export const EscapeAndBackdrop: Story = {
  args: { onOpenChange: fn() },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    const opener = canvas.getByRole('button', { name: 'Open modal' });

    await userEvent.click(opener);
    const dialog = await body.findByRole('dialog', { name: 'Modal title' });
    await expect(pressEscapeOn(dialog)).toBe(true);

    // A click whose target is the <dialog> itself is a backdrop click.
    await userEvent.click(dialog);
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await expect(opener).toHaveFocus();
  },
};

// Destructive confirmation: Escape is blocked and backdrop clicks are ignored; only the buttons close it.
export const NonDismissibleBlocksEscapeAndBackdrop: Story = {
  ...NonDismissibleConfirm,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }));
    const dialog = await body.findByRole('dialog', { name: 'Delete project?' });

    await expect(pressEscapeOn(dialog)).toBe(false);
    await userEvent.click(dialog);
    await expect(dialog).toHaveAttribute('open');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  },
};
