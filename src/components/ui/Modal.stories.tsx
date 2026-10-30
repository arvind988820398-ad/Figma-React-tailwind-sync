import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState } from 'react';
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
