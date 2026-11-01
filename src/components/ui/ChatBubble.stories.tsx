import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { DotsVerticalIcon, ExpandIcon, FilePdfIcon } from '../icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { ChatAudio, ChatBubble, ChatFile, ChatFileDownload, ChatImages, ChatLinkPreview } from './ChatBubble';

// AD Design Kit Chat bubble — mirrors the Figma "Chat bubble" set (node 1149:35720): one story per Type
// (Text, File, Audio, Calendar, Images, URL) × Direction (Left = received, Right = sent), plus Width = Fluid.
const photo = (seed: string) => `https://picsum.photos/seed/${seed}/400/400`;
const office = ['office-1', 'office-2', 'office-3', 'office-4', 'office-5', 'office-6', 'office-7', 'office-8', 'office-9', 'office-10'].map((seed, i) => ({
  src: photo(seed),
  alt: `New office photo ${i + 1}`,
}));

const menu = (
  <Button size="xs" color="ghost" iconOnly aria-label="Message actions">
    <DotsVerticalIcon />
  </Button>
);

// Figma Type = Calendar is a composition: "Google calendar:" and a day view with a highlighted slot.
const calendar = (
  <>
    <p className="font-medium">Google calendar:</p>
    <div className="relative flex gap-2 rounded-base border border-default bg-neutral-primary-soft p-2">
      <div className="flex w-12 shrink-0 flex-col gap-4 border-e border-light pe-2">
        {['10 am', '11 am', '12 pm', '1 pm', '2 pm'].map((hour) => (
          <span key={hour}>{hour}</span>
        ))}
      </div>
      <div className="flex-1 pt-16">
        <div className="border-s border-warning bg-warning-soft px-2 py-4 text-fg-warning">Available Time</div>
      </div>
      <Button size="xs" color="ghost" iconOnly aria-label="Expand calendar" className="absolute end-1 top-1">
        <ExpandIcon />
      </Button>
    </div>
  </>
);

const content: Record<'text' | 'file' | 'audio' | 'calendar' | 'images' | 'url', ReactNode> = {
  text: 'That’s awesome. I think our users will really appreciate the improvements.',
  file: (
    <ChatFile
      icon={<FilePdfIcon className="text-fg-danger" />}
      name="AD Design Kit Pro Terms & Conditions"
      meta={['12 Pages', '18 MB', 'PDF']}
      action={<ChatFileDownload label="Download AD Design Kit Pro Terms & Conditions" onClick={() => {}} />}
    />
  ),
  audio: <ChatAudio duration="3:42" playing />,
  calendar,
  images: (
    <>
      <p>This is the new office {'<3'}</p>
      <ChatImages images={office} />
    </>
  ),
  url: (
    <>
      <p>Check out this open-source UI component library based on:</p>
      <ChatLinkPreview
        href="https://github.com/themesberg/ad-design-kit"
        title="GitHub - themesberg/AD Design Kit: The most popular and open source library ..."
        description="github.com"
        image={<img src="https://picsum.photos/seed/github/640/400" alt="" className="aspect-video w-full rounded-xl object-cover" />}
      />
    </>
  ),
};

const meta = {
  title: 'Components/ChatBubble',
  parameters: { design: figmaDesign('ChatBubble') },
  component: ChatBubble,
  args: {
    direction: 'received',
    name: 'Joseph McFall',
    time: '11:46',
    avatar: <Avatar name="Joseph McFall" src={photo('joseph')} size="base" />,
    status: 'Delivered',
    menu,
    clean: false,
    children: content.text,
  },
  argTypes: {
    direction: { control: 'select', options: ['received', 'sent'] },
    width: { control: 'select', options: ['fixed', 'fluid'] },
    avatar: { control: false },
    menu: { control: false },
  },
} satisfies Meta<typeof ChatBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

// Direction = Left (received): gray bubble, avatar on the left, menu on the right.
export const Text: Story = {};
export const File: Story = { args: { children: content.file } };
export const Audio: Story = { args: { children: content.audio } };
export const Calendar: Story = { args: { children: content.calendar } };
export const Images: Story = { args: { children: content.images } };
export const Url: Story = { args: { children: content.url } };

// Direction = Right (sent): brand-tinted bubble, avatar on the right, menu on the left.
const sent = { direction: 'sent' } as const;
export const TextSent: Story = { args: { ...sent } };
export const FileSent: Story = { args: { ...sent, children: content.file } };
export const AudioSent: Story = { args: { ...sent, children: content.audio } };
export const CalendarSent: Story = { args: { ...sent, children: content.calendar } };
export const ImagesSent: Story = { args: { ...sent, children: content.images } };
export const UrlSent: Story = { args: { ...sent, children: content.url } };

// Width = Fluid: full-page chat, every type in both directions (Figma frame 960px wide).
export const FluidAllTypes: Story = {
  args: { name: 'Bonnie Green', width: 'fluid' },
  render: (args) => (
    <div className="flex w-240 max-w-full flex-col gap-8">
      {(['received', 'sent'] as const).map((direction) =>
        (Object.keys(content) as (keyof typeof content)[]).map((type) => (
          <ChatBubble key={direction + type} {...args} direction={direction}>
            {content[type]}
          </ChatBubble>
        )),
      )}
    </div>
  ),
};

export const Clean: Story = {
  args: { name: 'Alan Turing', time: '11:51', avatar: <Avatar name="Alan Turing" size="base" />, status: undefined, clean: true, menu: undefined, children: '“Clean” bubble: no fill, no padding.' },
};

export const Conversation: Story = {
  render: () => (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ChatBubble name="Joseph McFall" time="11:46" avatar={<Avatar name="Joseph McFall" src={photo('joseph')} size="base" />} status="Delivered" menu={menu}>
        That’s awesome. I think our users will really appreciate the improvements.
      </ChatBubble>
      <ChatBubble direction="sent" name="Bonnie Green" time="11:47" avatar={<Avatar name="Bonnie Green" src={photo('bonnie')} size="base" />} status="Read" menu={menu}>
        <p>Thanks! I’ve attached the terms.</p>
        {content.file}
      </ChatBubble>
      <ChatBubble name="Joseph McFall" time="11:48" avatar={<Avatar name="Joseph McFall" src={photo('joseph')} size="base" />} menu={menu}>
        <ChatAudio duration="3:42" />
      </ChatBubble>
    </div>
  ),
};

// Interaction: the file download and audio buttons have names; more than four images collapse into a "+N" tile.
export const ContentParts: Story = {
  args: { onClick: undefined },
  render: (args) => {
    const onDownload = fn();
    return (
      <div className="flex flex-col gap-6" data-testid="parts">
        <ChatBubble {...args}>
          <ChatFile name="Terms.pdf" meta={['12 Pages', 'PDF']} action={<ChatFileDownload label="Download Terms.pdf" onClick={onDownload} />} />
        </ChatBubble>
        <ChatBubble {...args}>
          <ChatFile name="Logo.svg" meta="4 KB" action={<ChatFileDownload label="Download Logo.svg" href="#logo" />} />
        </ChatBubble>
        <ChatBubble {...args}>{content.audio}</ChatBubble>
        <ChatBubble {...args}>
          <ChatAudio duration="0:12" />
        </ChatBubble>
        <ChatBubble {...args}>
          <ChatImages images={office} />
        </ChatBubble>
        <ChatBubble {...args}>
          <ChatImages images={office.slice(0, 1)} />
        </ChatBubble>
      </div>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Download Terms.pdf' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Download Logo.svg' })).toHaveAttribute('download');
    await expect(canvas.getByText('PDF')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Pause voice message' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Play voice message' })).toBeVisible();
    const grid = within(canvas.getByTestId('parts'));
    await expect(grid.getByText('+7')).toBeVisible();
    await expect(grid.getAllByRole('img', { name: /New office photo/ })).toHaveLength(4);
  },
};

// width="fluid": full-page chat, the bubble fills 80% of the conversation width (Figma Width = Fluid).
export const FluidWidth: Story = {
  args: { width: 'fluid', menu: undefined, children: 'In a full-page conversation the bubble takes 80% of the available width.' },
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
