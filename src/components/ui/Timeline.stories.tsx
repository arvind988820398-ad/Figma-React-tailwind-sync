import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckIcon, CogIcon, InfoIcon } from '../icons';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Timeline, type TimelineItem } from './Timeline';

// AuxoKit Timeline — mirrors the Figma "Timeline" set (node 1149:91254), item 1149:91357, dot 1149:91248.
const events: TimelineItem[] = [
  { date: 'March 2026', title: 'Figma file published', description: 'Tokens, themes and 58 component sets released to the team.' },
  { date: 'May 2026', title: 'React library', description: 'Every component mapped to a React template with the same variants.' },
  { date: 'October 2026', title: 'Design review skill', description: 'Code is checked against Figma automatically before merge.' },
];
const icons = [<CheckIcon key="check" />, <CogIcon key="cog" />, <InfoIcon key="info" />];
const people = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing'];
const actions = (
  <>
    <Button size="sm" color="secondary">Learn more</Button>
    <Button size="sm">Download</Button>
  </>
);

const meta = {
  title: 'AuxoKit/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-full max-w-3xl"><Story /></div>],
  args: { items: events, variant: 'default' },
  argTypes: { variant: { control: 'select', options: ['default', 'icons', 'cards', 'horizontal'] } },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Figma "Icons & Card": icon dots.
export const Icons: Story = { args: { variant: 'icons', items: events.map((e, i) => ({ ...e, icon: icons[i] })) } };

// Figma "User actions / Stacked cards": avatar dots, quoted description, action buttons.
export const Cards: Story = {
  args: {
    variant: 'cards',
    items: events.map((e, i) => ({ ...e, avatar: <Avatar name={people[i]} size="xs" />, actions: i === 1 ? actions : undefined })),
  },
};

export const Horizontal: Story = {
  args: { variant: 'horizontal', items: events.map((e) => ({ ...e, actions: <a href="#">Read more →</a> })) },
};

export const WithActions: Story = { args: { items: events.map((e, i) => ({ ...e, actions: i === 0 ? actions : undefined })) } };
