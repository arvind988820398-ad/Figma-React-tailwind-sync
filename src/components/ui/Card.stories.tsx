import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardText, CardTitle } from './Card';
import { Button } from './Button';
import { ArrowRightIcon } from '../icons';

// AuxoKit Card — mirrors the Figma "Card" set (node 1149:34153).
const meta = {
  title: 'AuxoKit/Card',
  component: Card,
  args: {
    padding: 'base',
    className: 'w-80',
    children: (
      <>
        <CardTitle>Noteworthy technology acquisitions 2026</CardTitle>
        <CardText>Here are the biggest enterprise technology acquisitions of 2026 so far, in reverse chronological order.</CardText>
        <div>
          <Button rightIcon={<ArrowRightIcon />}>Read more</Button>
        </div>
      </>
    ),
  },
  argTypes: {
    padding: { control: 'select', options: ['base', 'roomy', 'none'] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// p-6 — image, pricing and most card types.
export const Default: Story = {};

// p-7 — Figma "Default" text card and Grid card.
export const Roomy: Story = { args: { padding: 'roomy' } };

// Figma "Image" card: full-bleed media on top of the padded body.
export const WithImage: Story = {
  args: {
    media: <img src="https://picsum.photos/seed/forest/640/360" alt="Forest under morning fog" className="aspect-video w-full object-cover" />,
  },
};

// Horizontal layout: media on the side at sm and up.
export const Horizontal: Story = {
  args: {
    className: 'w-full max-w-2xl sm:flex-row',
    media: <img src="https://picsum.photos/seed/harbor/480/480" alt="Boats in a harbor" className="aspect-square w-full object-cover sm:w-64" />,
  },
};

// `padding="none"` when the content brings its own spacing.
export const NoPadding: Story = {
  args: {
    padding: 'none',
    media: <div className="aspect-video bg-neutral-tertiary" />,
    children: (
      <div className="flex flex-col gap-2 p-4">
        <CardTitle className="text-lg">Custom body spacing</CardTitle>
        <CardText className="text-sm">The card itself adds no padding here.</CardText>
      </div>
    ),
  },
};

export const AllPaddings: Story = {
  render: ({ padding: _padding, ...args }) => (
    <div className="flex flex-wrap items-start gap-6">
      {(['base', 'roomy', 'none'] as const).map((padding) => (
        <Card key={padding} {...args} padding={padding}>
          <CardTitle className="text-lg">padding="{padding}"</CardTitle>
          <CardText className="text-sm">Compare the inner spacing.</CardText>
        </Card>
      ))}
    </div>
  ),
};
