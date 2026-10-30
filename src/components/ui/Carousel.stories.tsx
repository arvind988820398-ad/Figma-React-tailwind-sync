import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { Card, CardText, CardTitle } from './Card';
import { Carousel } from './Carousel';

// AD Design Kit Carousel — mirrors the Figma "Carousel" set (node 1149:41738).
const photos = ['forest', 'coast', 'alps', 'desert'].map((seed, i) => ({
  src: `https://picsum.photos/seed/${seed}/1200/675`,
  alt: `Sample landscape ${i + 1}`,
}));

const slides = photos.map((p) => <img key={p.src} src={p.src} alt={p.alt} className="aspect-video w-full object-cover" />);

const cards = ['Ada', 'Grace', 'Alan', 'Katherine', 'Margaret'].map((n) => (
  <Card key={n} className="flex h-full flex-col gap-3">
    <CardTitle>“Figma and code finally match.”</CardTitle>
    <CardText>— {n}, design engineer</CardText>
  </Card>
));

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  parameters: { design: figmaDesign('Carousel'), layout: 'padded' },
  args: { label: 'Sample photos', variant: 'slides', controls: true, indicators: true, children: slides, className: 'aspect-video max-w-3xl' },
  argTypes: {
    variant: { control: 'select', options: ['slides', 'cards'] },
    children: { control: false },
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Slides: Story = {};
export const SlidesWithoutControls: Story = { args: { controls: false } };
export const SlidesWithoutIndicators: Story = { args: { indicators: false } };
export const SlidesPlain: Story = { args: { controls: false, indicators: false } };

export const Cards: Story = {
  args: { variant: 'cards', label: 'Testimonials', children: cards, className: undefined },
};

export const CardsWithoutControls: Story = {
  args: { variant: 'cards', label: 'Testimonials', children: cards, controls: false, className: undefined },
};
