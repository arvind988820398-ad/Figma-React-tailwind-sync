import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { useState, type ReactNode } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';
import {
  AdDesignKitIcon,
  ArrowRightIcon,
  DatabaseIcon,
  DownloadIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  FileCopyIcon,
  GithubIcon,
  GoogleIcon,
  LinkedinIcon,
  LinkIcon,
  ListIcon,
  LockIcon,
  MobilePhoneIcon,
  PaletteIcon,
  QuestionCircleIcon,
  ReactIcon,
  RedditIcon,
  SwatchbookIcon,
  TruckIcon,
  WalletIcon,
  XIcon,
} from '../icons';
import { Button } from './Button';
import { ChoiceCard } from './ChoiceCard';
import { IconShape } from './IconShape';
import { HelperText, Input, Label } from './Input';
import { List, ListItem } from './List';
import { Modal, type ModalProps, type ModalSize } from './Modal';
import { OtpInput } from './OtpInput';
import { Progress } from './Progress';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Timeline } from './Timeline';

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

// ── Figma Type variants ──────────────────────────────────────────────────────────────────────────────────────────────
// One story per Figma "Modal" Type with Figma's content. Each opens on load in the canvas (play), so the story
// matches the Figma frame; in the docs page it shows its trigger button.

type FigmaModalProps = Omit<ModalProps, 'open' | 'onOpenChange' | 'children' | 'footer'> & {
  children: (close: () => void) => ReactNode;
  footer?: (close: () => void) => ReactNode;
};

function FigmaModal({ children, footer, ...props }: FigmaModalProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button color="secondary" onClick={() => setOpen(true)}>Open modal</Button>
      <Modal {...props} open={open} onOpenChange={setOpen} footer={footer?.(close)}>
        {children(close)}
      </Modal>
    </>
  );
}

const openOnLoad: Story['play'] = async ({ canvas, canvasElement, userEvent }) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open modal' }));
  await expect(await within(canvasElement.ownerDocument.body).findByRole('dialog')).toBeVisible();
};

// A Label followed by its field (Label carries the 10px gap below it); `hint` adds Figma's question-circle label icon.
function Field({ id, label, hint, children }: { id: string; label: ReactNode; hint?: boolean; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} icon={hint ? <QuestionCircleIcon /> : undefined}>{label}</Label>
      {children}
    </div>
  );
}

// Figma Type "Info": lg, text with links, Confirm + Close footer.
export const Info: Story = {
  render: () => (
    <FigmaModal
      size="lg"
      title="Modal header"
      footer={(close) => (
        <>
          <Button onClick={close}>Confirm</Button>
          <Button color="secondary" onClick={close}>Close</Button>
        </>
      )}
    >
      {() => (
        <>
          <p>
            Designed to accelerate your development process, AD Design Kit provides everything from responsive navigation bars
            and buttons to complex dashboards, modals, and forms.
          </p>
          <p>
            With its focus on flexibility and ease of use, developers can quickly customize and integrate these atomic
            components into their projects without starting from scratch, saving time.
          </p>
          <p className="font-medium text-heading">Get started today and bring your web projects to life:</p>
          <ul className="flex list-disc flex-col gap-2 ps-6 font-medium text-fg-brand marker:text-fg-brand">
            <li><a href="#modal" className="hover:underline">Explore AD Design Kit Components</a></li>
            <li><a href="#modal" className="hover:underline">View Live Demos</a></li>
            <li><a href="#modal" className="hover:underline">Start with AD Design Kit Pro for Advanced Features</a></li>
          </ul>
          <p>Ready to level up your UI? Dive into AD Design Kit and experience effortless design and development!</p>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "Popup": sm, no header; icon, question and centred buttons. Esc and backdrop do not close it.
export const Popup: Story = {
  render: () => (
    <FigmaModal size="sm" header={false} dismissible={false} title="Delete product">
      {(close) => (
        <div className="flex flex-col items-center gap-4 text-center">
          <ExclamationCircleIcon className="size-12 text-body-subtle" />
          <p>Are you sure you want to delete this product from your account?</p>
          <div className="flex items-center gap-4">
            <Button onClick={close}>Confirm</Button>
            <Button color="secondary" onClick={close}>No, cancel</Button>
          </div>
        </div>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "Sign In": sm, logo header with supporting text, social buttons, email and password fields.
export const SignIn: Story = {
  render: () => (
    <FigmaModal size="sm" icon={<AdDesignKitIcon />} title="Sign in to AD Design Kit" description="Enter your details">
      {(close) => (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Button color="secondary" leftIcon={<GoogleIcon />}>Google</Button>
            <Button color="secondary">Meta</Button>
            <Button color="secondary" leftIcon={<GithubIcon />}>Github</Button>
          </div>
          <div className="flex items-center gap-3 text-sm text-body">
            <span className="h-px flex-1 bg-neutral-quaternary" aria-hidden />
            or sign in with
            <span className="h-px flex-1 bg-neutral-quaternary" aria-hidden />
          </div>
          <Field id="modal-email" label="Email">
            <Input id="modal-email" type="email" placeholder="name@example.com" leftIcon={<EnvelopeIcon />} />
          </Field>
          <div className="flex flex-col gap-2.5">
            <Field id="modal-password" label="Password">
              <Input id="modal-password" type="password" placeholder="••••••••" leftIcon={<LockIcon />} />
            </Field>
            <a href="#modal" className="self-start text-xs text-body underline hover:text-heading">Forgot password?</a>
          </div>
          <Button className="w-full" onClick={close}>Sign in to your account</Button>
          <p className="text-sm text-body">
            Not registered? <a href="#modal" className="font-medium text-fg-brand hover:underline">Create account</a>
          </p>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "Create product": sm form with Input, Select and Textarea, Confirm + Cancel footer.
export const CreateProduct: Story = {
  render: () => (
    <FigmaModal
      size="sm"
      title="Add product"
      footer={(close) => (
        <>
          <Button onClick={close}>Confirm</Button>
          <Button color="secondary" onClick={close}>Cancel</Button>
        </>
      )}
    >
      {() => (
        <>
          <Field id="product-name" label="Product name" hint>
            <Input id="product-name" placeholder="e.g iMac Pro" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="product-price" label="Price">
              <Input id="product-price" placeholder="$2999" />
            </Field>
            <Field id="product-category" label="Category">
              <Select id="product-category" defaultValue="">
                <option value="" disabled>Select category</option>
                <option>Electronics</option>
                <option>Accessories</option>
              </Select>
            </Field>
          </div>
          <Field id="product-description" label="Product description" hint>
            <Textarea id="product-description" rows={6} placeholder="Write product description here" />
          </Field>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "With radio inputs": sm, ChoiceCard radios with icon shapes and a full-width Next step button.
const positions = [
  { title: 'UI/UX Engineer', company: 'AD Design Kit', icon: <SwatchbookIcon /> },
  { title: 'React Developer', company: 'Alphabet Inc.', icon: <ReactIcon /> },
  { title: 'Full Stack Engineer', company: 'Meta Inc.', icon: <TruckIcon /> },
  { title: 'Graphic designer', company: 'Microsoft Corporation', icon: <PaletteIcon /> },
];
export const WithRadioInputs: Story = {
  render: () => (
    <FigmaModal size="sm" title="Open positions">
      {(close) => (
        <>
          <p className="text-sm">Select your desired position:</p>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Position">
            {positions.map((p) => (
              <ChoiceCard
                key={p.title}
                name="position"
                value={p.title}
                defaultChecked={p.title === 'Full Stack Engineer'}
                title={p.title}
                description={p.company}
                icon={<IconShape color="gray" size="base">{p.icon}</IconShape>}
              />
            ))}
          </div>
          <Button className="w-full" rightIcon={<ArrowRightIcon />} onClick={close}>Next step</Button>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "With timeline": md, a Timeline changelog with actions and a full-width My Downloads button.
export const WithTimeline: Story = {
  render: () => (
    <FigmaModal size="md" title="Changelog">
      {(close) => (
        <>
          <Timeline
            items={[
              {
                date: '10 May 2025',
                title: 'AD Design Kit Figma v.2.10',
                description: '500+ components & over 50 new pages',
                actions: <Button size="sm" color="secondary" leftIcon={<DownloadIcon />}>Download</Button>,
              },
              {
                date: '14 March 2025',
                title: 'AD Design Kit Application UI',
                description: 'Over 70 new pages',
                actions: (
                  <>
                    <Button size="sm" color="secondary" leftIcon={<ListIcon />}>Changelog</Button>
                    <Button size="sm" leftIcon={<DownloadIcon />}>Download now</Button>
                  </>
                ),
              },
              {
                date: '22 February 2025',
                title: 'AD Design Kit Free',
                description: 'All atomic components',
                actions: <Button size="sm" color="secondary" leftIcon={<FileCopyIcon />}>Duplicate in Figma</Button>,
              },
            ]}
          />
          <Button className="w-full" onClick={close}>My Downloads</Button>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "With progress bar": sm, no header; icon, title, text, a danger Progress and Confirm + Cancel.
export const WithProgressBar: Story = {
  render: () => (
    <FigmaModal size="sm" header={false} title="Approaching Full Capacity">
      {(close) => (
        <>
          <DatabaseIcon className="size-10 text-body-subtle" />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold leading-7 text-heading">Approaching Full Capacity</p>
            <p>Choosing the right server storage solution is essential for maintaining data integrity.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-medium leading-4 text-body">
              <span>My storage</span>
              <span>376,3 of 500 GB used</span>
            </div>
            <Progress value={75} color="danger" showValue={false} aria-label="My storage: 376.3 of 500 GB used" />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={close}>Confirm</Button>
            <Button color="secondary" onClick={close}>Cancel</Button>
          </div>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "With list": md, CTA list rows for wallet providers and a help link.
const wallets = [
  ['MetaMask', 'The leading self-custodial wallet'],
  ['Coinbase Wallet', 'The most user-friendly wallet'],
  ['Opera Wallet', 'A secure wallet for everyone'],
  ['WalletConnect', 'A decentralized future'],
  ['Fortmatic', 'Don’t settle for less'],
];
export const WithList: Story = {
  render: () => (
    <FigmaModal size="md" title="Connect wallet">
      {() => (
        <>
          <p className="text-sm">Connect with one of our available wallet providers or create a new one.</p>
          <List variant="cta">
            {wallets.map(([name, text]) => (
              <ListItem key={name} cta href="#modal" description={text} media={<IconShape color="gray"><WalletIcon /></IconShape>}>
                {name}
              </ListItem>
            ))}
          </List>
          <a href="#modal" className="inline-flex items-center gap-1.5 self-start text-sm text-body hover:text-heading hover:underline">
            <QuestionCircleIcon className="size-4" /> Why do I need to connect with my wallet?
          </a>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "OTP": sm, icon-shape header with supporting text, OtpInput and a full-width Next step button.
function OtpBody({ close }: { close: () => void }) {
  const [code, setCode] = useState('357');
  return (
    <>
      <div>
        <Label required icon={<QuestionCircleIcon />}>Enter verification code</Label>
        <OtpInput value={code} onChange={setCode} label="Verification code" size="lg" />
        <HelperText>Please enter the one-time code sent to your phone.</HelperText>
      </div>
      <Button className="w-full" rightIcon={<ArrowRightIcon />} onClick={close}>Next step</Button>
    </>
  );
}
export const Otp: Story = {
  name: 'OTP',
  render: () => (
    <FigmaModal
      size="sm"
      icon={<IconShape size="lg" color="white"><MobilePhoneIcon /></IconShape>}
      title="Check the phone"
      description="We’ve sent a code to you"
    >
      {(close) => <OtpBody close={close} />}
    </FigmaModal>
  ),
  play: openOnLoad,
};

// Figma Type "Share": md, text with a link, a share URL field with Create link, and social buttons.
export const Share: Story = {
  render: () => (
    <FigmaModal size="md" title="Share link">
      {() => (
        <>
          <p className="text-sm">
            Your name, custom instructions, and any messages you add after sharing stay private.{' '}
            <a href="#modal" className="text-heading underline">Learn more</a>
          </p>
          <div>
            <div className="flex gap-4">
              <Input aria-label="Share link" readOnly defaultValue="https://addesignkit.ai/share/..." className="min-w-0 flex-1" />
              <Button leftIcon={<LinkIcon />}>Create link</Button>
            </div>
            <HelperText>A past version of this chat has already been shared. Manage previously shared chats via Settings.</HelperText>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button color="secondary" leftIcon={<LinkedinIcon />}>Linkedin</Button>
            <Button color="secondary" leftIcon={<RedditIcon />}>Reddit</Button>
            <Button color="secondary" leftIcon={<XIcon />}>x.com</Button>
          </div>
        </>
      )}
    </FigmaModal>
  ),
  play: openOnLoad,
};

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
