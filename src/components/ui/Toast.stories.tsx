import { useState } from 'react';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, ToastViewport, type ToastColor, type ToastProps } from './Toast';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { IconShape } from './IconShape';
import { Progress } from './Progress';
import { CheckIcon, InfoCircleIcon } from '../icons';

// AD Design Kit Toast — mirrors the Figma "Toast" set (node 1149:93975).
const colors = ['neutral', 'warning', 'danger'] as const satisfies readonly ToastColor[];

const meta = {
  title: 'Components/Toast',
  parameters: { design: figmaDesign('Toast') },
  component: Toast,
  args: { color: 'neutral', icon: <InfoCircleIcon />, children: 'Item moved successfully.', onDismiss: () => {} },
  argTypes: {
    color: { control: 'select', options: colors },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// Figma "Icon & text".
export const Default: Story = {};

// Figma "Icon shape & text".
export const WithIconShape: Story = {
  args: { icon: <IconShape color="success" size="sm"><CheckIcon /></IconShape> },
};

// Figma "Icon shape & buttons".
export const WithActions: Story = {
  args: {
    icon: <IconShape color="brand" size="sm"><InfoCircleIcon /></IconShape>,
    title: 'Update available',
    children: 'A new version is ready to install.',
    actions: (
      <>
        <Button size="xs">Update</Button>
        <Button size="xs" color="secondary">Not now</Button>
      </>
    ),
  },
};

// Figma "Avatar & button".
export const AvatarAndButton: Story = {
  args: {
    icon: <Avatar name="Grace Hopper" size="base" />,
    title: 'Grace Hopper',
    children: 'Hi, can we sync on the design review?',
    actions: <Button size="xs">Reply</Button>,
  },
};

// Figma "With header": small header row with a timestamp.
export const WithHeader: Story = {
  args: {
    header: { title: 'New notification', time: 'a few seconds ago' },
    icon: <Avatar name="Alan Turing" size="lg" />,
    title: 'Alan Turing',
    children: 'Commented on your pull request.',
  },
};

// Figma "With progress bar".
export const WithProgress: Story = {
  args: {
    icon: <IconShape color="brand" size="sm"><InfoCircleIcon /></IconShape>,
    title: 'Uploading files',
    children: <Progress className="mt-2" value={60} labelPosition="side" />,
  },
};

export const AllColors: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <Toast {...args} color="neutral" title="Changes saved">Your profile has been updated.</Toast>
      <Toast
        {...args}
        color="warning"
        title="Storage almost full"
        actions={
          <>
            <Button size="xs" color="warning">Upgrade</Button>
            <Button size="xs" color="warning" outline>Dismiss</Button>
          </>
        }
      >
        You’ve used 90% of your storage.
      </Toast>
      <Toast
        {...args}
        color="danger"
        title="Payment failed"
        actions={
          <>
            <Button size="xs" color="danger">Retry</Button>
            <Button size="xs" color="danger" outline>Cancel</Button>
          </>
        }
      >
        We couldn’t charge your card.
      </Toast>
    </div>
  ),
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
