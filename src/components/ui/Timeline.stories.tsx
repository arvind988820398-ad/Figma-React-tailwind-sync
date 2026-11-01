import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { ArrowRightIcon, CheckIcon, DownloadIcon, EyeIcon, EyeSlashIcon, GlobeIcon, ListIcon, ReplyIcon } from '../icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Timeline, type TimelineEntry, type TimelineItem } from './Timeline';

// AD Design Kit Timeline — one story per Figma "Timeline" Type (node 1149:91254) at Desktop, plus the Mobile
// breakpoint, with the Figma content. Item 1149:91357, dot 1149:91248.
const photo = (name: string) => `https://picsum.photos/seed/${name.toLowerCase().replace(/\W+/g, '-')}/96/96`;
const description =
  'Get access to over 20+ pages including a dashboard layout, charts, kanban board, calendar, and pre-order E-commerce & Publisher and Marketing pages.';

const download = <Button size="sm" leftIcon={<DownloadIcon />}>Download now</Button>;
const releases: TimelineItem[] = [
  {
    date: '10 May 2025',
    title: 'AD Design Kit Figma Design System',
    description,
    actions: (
      <>
        <Button size="sm" color="secondary" rightIcon={<ArrowRightIcon />}>Read more</Button>
        {download}
      </>
    ),
  },
  {
    date: '14 March 2025',
    title: 'AD Design Kit Figma',
    description,
    actions: (
      <>
        <Button size="sm" color="secondary" leftIcon={<ListIcon />}>Changelog</Button>
        {download}
      </>
    ),
  },
  {
    date: '22 February 2025',
    title: 'AD Design Kit Blocks v.3.0',
    description,
    actions: <Button size="sm" leftIcon={<EyeIcon />}>View blocks</Button>,
  },
  {
    date: '29 October 2024',
    title: 'E-commerce UI Figma & Code',
    description,
    actions: (
      <>
        <Button size="sm" color="secondary" leftIcon={<EyeIcon />}>View in blocks</Button>
        {download}
      </>
    ),
  },
];

const comment =
  "Hi ya'll! I wanted to share a webinar zeroheight is having regarding how to best measure your design system! This is the second session of our new webinar series on #DesignSystems discussions where we'll be speaking about Measurement.";
const commentActions = (
  <>
    <Button size="sm" color="secondary" leftIcon={<EyeIcon />}>View comment</Button>
    <Button size="sm" leftIcon={<ReplyIcon />}>Reply</Button>
  </>
);
const userAvatar = (name: string) => <Avatar name={name} src={photo(name)} size="sm" />;
const activity: TimelineItem[] = [
  {
    date: '2 hours ago',
    avatar: userAvatar('Thomas Lean'),
    title: (
      <>
        <a href="#timeline">Thomas Lean</a> commented on <a href="#timeline">AD Design Kit Pro New Components</a>
      </>
    ),
    description: comment,
    actions: commentActions,
  },
  {
    date: '4 hours ago',
    avatar: userAvatar('Bonnie Green'),
    title: (
      <>
        <a href="#timeline">Bonnie Green</a> moved <a href="#timeline">Jese Leos</a> to <a href="#timeline">Funny Group</a>
      </>
    ),
  },
  {
    date: '1 day ago',
    avatar: userAvatar('Jese Leos'),
    title: (
      <>
        <a href="#timeline">Jese Leos</a> has changed <span className="font-medium text-fg-brand">Homepage redesign</span> task status to{' '}
        <span className="font-medium text-heading">Finished</span>
      </>
    ),
  },
  {
    date: '4 days ago',
    avatar: userAvatar('Joseph McFall'),
    title: (
      <>
        <a href="#timeline">Joseph McFall</a> commented on <a href="#timeline">Top 10 AD Design Kit Dashboards</a>
      </>
    ),
    description: comment,
    actions: commentActions,
  },
];

const privateBadge = (
  <>
    <EyeSlashIcon aria-hidden /> Private
  </>
);
const publicBadge = (
  <>
    <GlobeIcon aria-hidden /> Public
  </>
);
const feed = (first: string): TimelineEntry[] => [
  {
    name: first,
    src: photo(first),
    title: (
      <>
        {first} likes <a href="#timeline">Bonnie Green's post</a> in <a href="#timeline">How to start with AD Design Kit library</a>
      </>
    ),
    description: '"I wanted to share a webinar zeroheight."',
    meta: privateBadge,
  },
  {
    name: 'Lana Byrd',
    src: photo('Lana Byrd'),
    title: (
      <>
        Lana Byrd react to <a href="#timeline">Bonnie Thomas Lean’s comment</a>
      </>
    ),
    meta: publicBadge,
  },
  {
    name: 'Jese Leos',
    src: photo('Jese Leos'),
    title: (
      <>
        <a href="#timeline">Jese Leos</a> moved <a href="#timeline">BonnieGreen</a> to <a href="#timeline">UI/UX Group</a>
      </>
    ),
    description: '“Awesome components 😍”',
    meta: publicBadge,
  },
  {
    name: 'Roberta Casas',
    src: photo('Roberta Casas'),
    title: (
      <>
        Roberta Casas likes <a href="#timeline">Bonnie Green's video</a> in <a href="#timeline">AD Design Kit Crash Course</a>
      </>
    ),
    meta: publicBadge,
  },
];
const stacked: TimelineItem[] = [
  { date: 'February 27, 2025', entries: feed('Neil Sims') },
  { date: 'January 12, 2025', entries: feed('Karen Nelson') },
];

const milestones: TimelineItem[] = ['10 May 2025', '14 March 2025', '22 February 2025', '29 October 2024'].map((date) => ({
  date,
  title: 'Title here',
  description: 'Get access to over 20+ pages including a dashboard layout, charts, kanban.',
  actions: <Button size="sm" color="secondary" rightIcon={<ArrowRightIcon />}>Read more</Button>,
}));

const milestonesAdvanced: TimelineItem[] = Array.from({ length: 4 }, () => ({
  date: '10 May 2025',
  title: 'Title here',
  description: 'Some description here',
  actions: (
    <a href="#timeline" className="inline-flex items-center gap-1.5">
      Read more <ArrowRightIcon className="size-4" />
    </a>
  ),
}));

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: { design: figmaDesign('Timeline'), layout: 'padded' },
  // Figma widths: vertical types 768, horizontal types 1024.
  decorators: [
    (Story, { args }) => (
      <div className={args.variant?.startsWith('horizontal') ? 'w-full max-w-5xl' : 'w-full max-w-3xl'}>
        <Story />
      </div>
    ),
  ],
  args: { items: releases, variant: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'icons', 'cards', 'stacked', 'horizontal', 'horizontal-advanced'] } },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const mobile = { viewport: { value: 'mobile1', isRotated: false } };

// Figma "Default": ellipse dots, gray date badge with a calendar icon, Secondary sm + Brand sm actions.
export const Default: Story = {};

// Figma "Icons & Card": check-icon dots, each event in a card with a brand date badge beside the title.
export const IconsAndCard: Story = { args: { variant: 'icons', items: releases.map((e) => ({ ...e, icon: <CheckIcon /> })) } };

// Figma "User actions": avatar dots, "who did what" cards with a time badge, quoted comments and actions.
export const UserActions: Story = { args: { variant: 'cards', items: activity } };

// Figma "Stacked cards": one card per date, avatar rows with a Private / Public badge.
export const StackedCards: Story = { args: { variant: 'stacked', items: stacked } };

// Figma "Horizontal": a line across the top with dots, Secondary sm "Read more".
export const Horizontal: Story = { args: { variant: 'horizontal', items: milestones } };

// Figma "Horizontal advanced": centred items, the line runs through the dots, brand "Read more" link.
export const HorizontalAdvanced: Story = { args: { variant: 'horizontal-advanced', items: milestonesAdvanced } };

// Figma Breakpoint=Mobile.
export const DefaultMobile: Story = { ...Default, globals: mobile };
export const IconsAndCardMobile: Story = { ...IconsAndCard, globals: mobile };
export const UserActionsMobile: Story = { ...UserActions, globals: mobile };
export const StackedCardsMobile: Story = { ...StackedCards, globals: mobile };
export const HorizontalMobile: Story = { ...Horizontal, globals: mobile };
export const HorizontalAdvancedMobile: Story = { ...HorizontalAdvanced, globals: mobile };

// The timeline is an ordered list in time order; dots are decorative.
export const Semantics: Story = {
  ...UserActions,
  play: async ({ canvasElement }) => {
    const list = canvasElement.querySelector('ol')!;
    const items = within(list).getAllByRole('listitem');
    await expect(items).toHaveLength(activity.length);
    await expect(within(items[0]).getByText('2 hours ago')).toBeVisible();
    await expect(within(items[0]).getByRole('button', { name: 'Reply' })).toBeVisible();
    await expect(list.querySelectorAll('[aria-hidden]').length).toBeGreaterThanOrEqual(activity.length);
  },
};

// Stacked cards: each date is a heading over its own list of activity rows.
export const StackedSemantics: Story = {
  ...StackedCards,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'February 27, 2025' })).toBeVisible();
    const lists = canvas.getAllByRole('list');
    await expect(lists).toHaveLength(3);
    await expect(within(lists[1]).getAllByRole('listitem')).toHaveLength(4);
    await expect(canvas.getAllByText('Public').length).toBeGreaterThan(0);
  },
};
