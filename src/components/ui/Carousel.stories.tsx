import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, waitFor } from 'storybook/test';
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

const visibleSlide = (canvasElement: HTMLElement) =>
  [...canvasElement.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]')].find((el) => el.getAttribute('aria-hidden') !== 'true');

// Interaction: Previous / Next move one slide and wrap around at both ends.
export const SlidesNavigation: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const next = canvas.getByRole('button', { name: 'Next slide' });
    const prev = canvas.getByRole('button', { name: 'Previous slide' });
    const track = canvasElement.querySelector<HTMLElement>('[aria-live="polite"]')!;
    await expect(next).toHaveAttribute('aria-controls', track.id);
    await expect(visibleSlide(canvasElement)).toHaveAttribute('aria-label', '1 of 4');
    await expect(canvas.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute('aria-current', 'true');

    await userEvent.click(next);
    await expect(visibleSlide(canvasElement)).toHaveAttribute('aria-label', '2 of 4');
    await expect(track.style.transform).toBe('translateX(-100%)');
    await expect(canvas.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByRole('button', { name: 'Go to slide 1' })).not.toHaveAttribute('aria-current');

    await userEvent.click(prev);
    await expect(visibleSlide(canvasElement)).toHaveAttribute('aria-label', '1 of 4');

    // Previous on the first slide wraps to the last.
    await userEvent.click(prev);
    await expect(visibleSlide(canvasElement)).toHaveAttribute('aria-label', '4 of 4');
    await expect(track.style.transform).toBe('translateX(-300%)');

    // Next on the last slide wraps to the first.
    await userEvent.click(next);
    await expect(visibleSlide(canvasElement)).toHaveAttribute('aria-label', '1 of 4');
    await expect(track.style.transform).toBe('translateX(0%)');
  },
};

// Interaction: indicator dots jump straight to a slide and mark it current.
export const SlidesIndicators: Story = {
  args: { controls: false },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument();
    const dots = canvas.getAllByRole('button', { name: /Go to slide/ });
    await expect(dots).toHaveLength(4);

    await userEvent.click(canvas.getByRole('button', { name: 'Go to slide 3' }));
    await expect(visibleSlide(canvasElement)).toHaveAttribute('aria-label', '3 of 4');
    await expect(canvas.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getAllByRole('img')).toHaveLength(1);
    await expect(canvas.getByRole('img')).toHaveAccessibleName('Sample landscape 3');

    await userEvent.click(canvas.getByRole('button', { name: 'Go to slide 1' }));
    await expect(visibleSlide(canvasElement)).toHaveAttribute('aria-label', '1 of 4');
  },
};

// A single slide renders no controls or indicators.
export const SingleSlide: Story = {
  args: { children: slides[0] },
  play: async ({ canvas }) => {
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.getByRole('group')).toHaveAttribute('aria-label', '1 of 1');
  },
};

// Interaction: the cards row scrolls with Next / Previous.
export const CardsScrolling: Story = {
  args: { variant: 'cards', label: 'Testimonials', children: cards, className: undefined },
  play: async ({ canvas, userEvent }) => {
    const track = canvas.getByRole('region', { name: 'Slides' });
    await expect(canvas.getAllByRole('group')).toHaveLength(5);
    await expect(track.scrollLeft).toBe(0);

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(0));
    const after = track.scrollLeft;

    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await waitFor(() => expect(track.scrollLeft).toBeLessThan(after));
  },
};
