import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { ArrowRightIcon } from '../icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { ChatAudio, ChatBubble, ChatFile, ChatImages, ChatLinkPreview } from './ChatBubble';

// AD Design Kit Chat bubble — mirrors the Figma "Chat bubble" set (node 1149:35720).
const photos = ['forest', 'coast', 'alps', 'desert', 'lake'].map((seed, i) => ({
  src: `https://picsum.photos/seed/${seed}/400/400`,
  alt: `Offsite photo ${i + 1}`,
}));

const meta = {
  title: 'Components/ChatBubble',
  parameters: { design: figmaDesign('ChatBubble') },
  component: ChatBubble,
  args: {
    direction: 'received',
    name: 'Grace Hopper',
    time: '11:46',
    avatar: <Avatar name="Grace Hopper" size="base" />,
    status: 'Delivered',
    clean: false,
    children: 'That’s awesome. I think our users will really appreciate the improvements.',
  },
  argTypes: {
    direction: { control: 'select', options: ['received', 'sent'] },
    avatar: { control: false },
    menu: { control: false },
  },
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Received: Story = {};

export const Sent: Story = {
  args: { direction: 'sent', name: 'Ada Lovelace', time: '11:47', avatar: <Avatar name="Ada Lovelace" size="base" />, status: 'Read', children: 'Thanks! Shipping it today.' },
};

export const WithFile: Story = {
  args: {
    direction: 'sent',
    name: 'Ada Lovelace',
    time: '11:47',
    avatar: <Avatar name="Ada Lovelace" size="base" />,
    status: 'Read',
    children: (
      <>
        Thanks! I’ve attached the release notes.
        <ChatFile
          name="release-notes.pdf"
          meta="12 pages · 18 MB · PDF"
          action={
            <Button size="xs" color="ghost" iconOnly aria-label="Download release-notes.pdf">
              <ArrowRightIcon />
            </Button>
          }
        />
      </>
    ),
  },
};

export const WithAudio: Story = {
  args: { time: '11:48', status: undefined, children: <ChatAudio duration="3:42" progress={0.35} /> },
};

export const WithImages: Story = {
  args: {
    direction: 'sent',
    name: 'Ada Lovelace',
    time: '11:49',
    avatar: <Avatar name="Ada Lovelace" size="base" />,
    status: undefined,
    children: (
      <>
        Photos from the offsite:
        <ChatImages images={photos} />
      </>
    ),
  },
};

export const WithLinkPreview: Story = {
  args: {
    time: '11:50',
    status: undefined,
    children: (
      <ChatLinkPreview
        href="https://ad-design-kit.dev/docs"
        title="AD Design Kit documentation"
        description="ad-design-kit.dev"
        image={<img src="https://picsum.photos/seed/docs/640/360" alt="" className="aspect-video w-full rounded-base object-cover" />}
      />
    ),
  },
};

export const Clean: Story = {
  args: { name: 'Alan Turing', time: '11:51', avatar: <Avatar name="Alan Turing" size="base" />, status: undefined, clean: true, children: '“Clean” bubble: no fill, no padding.' },
};

export const Conversation: Story = {
  render: () => (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ChatBubble name="Grace Hopper" time="11:46" avatar={<Avatar name="Grace Hopper" size="base" />} status="Delivered">
        That’s awesome. I think our users will really appreciate the improvements.
      </ChatBubble>
      <ChatBubble direction="sent" name="Ada Lovelace" time="11:47" avatar={<Avatar name="Ada Lovelace" size="base" />} status="Read">
        Thanks! I’ve attached the release notes.
        <ChatFile name="release-notes.pdf" meta="12 pages · 18 MB · PDF" />
      </ChatBubble>
      <ChatBubble name="Grace Hopper" time="11:48" avatar={<Avatar name="Grace Hopper" size="base" />}>
        <ChatAudio duration="3:42" progress={0.35} />
      </ChatBubble>
    </div>
  ),
};

// width="fluid": full-page chat, the bubble fills 80% of the conversation width (code ahead of Figma, audit row 47).
export const FluidWidth: Story = {
  args: { width: 'fluid', children: 'In a full-page conversation the bubble takes 80% of the available width.' },
  render: (args) => (
    <div className="w-[600px]" data-testid="conversation">{/* ad-design-kit-lint-ignore: fixed story frame to measure the 80% width */}
      <ChatBubble {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByTestId('conversation').firstElementChild as HTMLElement;
    const bubble = canvas.getByText(/80% of the available width/).closest('.rounded-base') as HTMLElement;
    await expect(Math.round((bubble.getBoundingClientRect().width / row.getBoundingClientRect().width) * 100)).toBe(80);
  },
};
