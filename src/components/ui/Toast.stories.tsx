import { useState } from 'react';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import walletIllustration from '../../../.storybook/assets/toast-wallet-illustration.svg';
import { Toast, ToastViewport, type ToastColor, type ToastProps } from './Toast';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { IconShape } from './IconShape';
import { Progress } from './Progress';
import {
  CheckIcon,
  CloudArrowUpIcon,
  DownloadIcon,
  ExclamationCircleIcon,
  FingerprintIcon,
  InfoCircleIcon,
  PaperPlaneHorizontalIcon,
  RefreshIcon,
  ReplyIcon,
  UploadIcon,
} from '../icons';

// AD Design Kit Toast — one story per Figma "Toast" Type (node 1149:93975), with Figma's content.
const colors = ['neutral', 'warning', 'danger'] as const satisfies readonly ToastColor[];

const meta = {
  title: 'Components/Toast',
  parameters: { design: figmaDesign('Toast') },
  component: Toast,
  args: { color: 'neutral', onDismiss: fn() },
  argTypes: {
    color: { control: 'select', options: colors },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Icon & text": brand icon, then the message after a divider.
export const Default: Story = {
  args: {
    icon: <PaperPlaneHorizontalIcon />,
    children: <span className="block border-s border-default ps-4">Message sent successfully.</span>,
  },
};

// Figma "Icon shape & text".
export const WithIconShape: Story = {
  args: {
    icon: <IconShape color="success"><CheckIcon /></IconShape>,
    children: 'Notification message here!',
  },
};

// Figma "Icon shape & buttons".
export const WithActions: Story = {
  args: {
    icon: <IconShape color="brand"><RefreshIcon /></IconShape>,
    title: 'Update available',
    children: 'The latest software version is now accessible for download.',
    actions: (
      <>
        <Button size="xs" color="secondary" className="flex-1">Not now</Button>
        <Button size="xs" leftIcon={<DownloadIcon />} className="flex-1">Update</Button>
      </>
    ),
  },
};

// Figma "Avatar & button".
export const AvatarAndButton: Story = {
  args: {
    className: 'w-95',
    icon: <Avatar name="Bonnie Green" />,
    title: 'Bonnie Green',
    children: '“Hi Bonnie, I appreciate you sharing your insights on AD Design Kit.”',
    actions: <Button size="xs" leftIcon={<ReplyIcon />}>Reply</Button>,
  },
};

// Figma "With header": header bar, a person, a timestamp and full-width Close + Reply buttons (no dismiss icon).
export const WithHeader: Story = {
  args: {
    onDismiss: undefined,
    header: { title: 'New notification', time: 'a few seconds ago' },
    icon: <Avatar name="Bonnie Green" />,
    title: 'Bonnie Green',
    children: 'commented on your photo',
    actions: (
      <>
        <Button size="xs" color="secondary" className="flex-1">Close</Button>
        <Button size="xs" leftIcon={<ReplyIcon />} className="flex-1">Reply</Button>
      </>
    ),
  },
};

// Figma "With progress bar": icon shape above the text, side-label progress and two buttons.
export const WithProgress: Story = {
  args: {
    stacked: true,
    icon: <IconShape color="brand"><CloudArrowUpIcon /></IconShape>,
    title: 'Uploading in progress',
    children: (
      <>
        Please wait while your file is being uploaded. This may take a moment.
        <Progress className="mt-3.5" value={75} labelPosition="side" aria-label="Upload progress" />
      </>
    ),
    actions: (
      <>
        <Button size="xs" color="secondary" className="flex-1">Cancel</Button>
        <Button size="xs" className="flex-1">Go to uploads</Button>
      </>
    ),
  },
};

// Figma "With illustration".
export const WithIllustration: Story = {
  args: {
    className: 'w-96',
    onDismiss: undefined,
    icon: <img src={walletIllustration} alt="" className="h-24 w-21" />,
    title: 'Connect your wallet',
    children: 'Connect your wallet by clicking the bottom-right blue button.',
    actions: (
      <>
        <Button size="xs" color="secondary" className="flex-1">Close</Button>
        <Button size="xs" leftIcon={<FingerprintIcon />} className="flex-1">Connect</Button>
      </>
    ),
  },
};

// Figma "Warning": no dismiss icon; Warning xs outline + solid actions.
export const Warning: Story = {
  args: {
    color: 'warning',
    className: 'w-160',
    onDismiss: undefined,
    icon: <ExclamationCircleIcon />,
    title: 'Upload your invoice',
    children:
      'Upload your invoice in one of the supported formats (PDF, JPG, PNG) with a maximum file size of 5MB. Ensure that all relevant details are visible for verification.',
    actions: (
      <>
        <Button size="xs" color="warning" outline>Remind me later</Button>
        <Button size="xs" color="warning" leftIcon={<UploadIcon />}>Upload invoice</Button>
      </>
    ),
  },
};

// Figma "Error": no dismiss icon; Danger xs outline + solid actions.
export const ErrorToast: Story = {
  name: 'Error',
  args: {
    color: 'danger',
    className: 'w-96',
    onDismiss: undefined,
    icon: <InfoCircleIcon />,
    title: 'Whoops! Something went wrong',
    children: 'The file format is not supported. Please upload a valid file type (PDF, JPG, PNG).',
    actions: (
      <>
        <Button size="xs" color="danger" outline>Close</Button>
        <Button size="xs" color="danger" leftIcon={<UploadIcon />}>Try again</Button>
      </>
    ),
  },
};

// Interaction: the dismiss icon button closes the toast.
export const Dismiss: Story = {
  ...WithActions,
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

type LiveToast = { id: number; color: ToastColor };
const messages: Record<ToastColor, string> = { neutral: 'Changes saved.', warning: 'Storage almost full.', danger: 'Something went wrong.' };

function LiveToastsDemo({ duration = 5000 }: ToastProps) {
  const [live, setLive] = useState<LiveToast[]>([]);
  const push = (color: ToastColor) => setLive((t) => [...t, { id: Date.now(), color }]);
  const remove = (id: number) => setLive((t) => t.filter((x) => x.id !== id));
  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button color="secondary" onClick={() => push('neutral')}>Show toast</Button>
        <Button color="warning" outline onClick={() => push('warning')}>Show warning</Button>
        <Button color="danger" outline onClick={() => push('danger')}>Show error</Button>
      </div>
      <ToastViewport>
        {live.map((t) => (
          <Toast key={t.id} color={t.color} icon={<InfoCircleIcon />} duration={duration} onDismiss={() => remove(t.id)}>
            {messages[t.color]}
          </Toast>
        ))}
      </ToastViewport>
    </>
  );
}

// Toasts stacked in a ToastViewport; auto-dismiss after `duration` ms, paused while hovered.
export const LiveViewport: Story = {
  parameters: { layout: 'padded' },
  args: { duration: 5000 },
  render: (args) => <LiveToastsDemo {...args} />,
};
