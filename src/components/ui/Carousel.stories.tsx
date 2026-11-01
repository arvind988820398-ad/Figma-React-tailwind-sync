import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { expect, waitFor } from 'storybook/test';
import { ArrowRightIcon, CartIcon, ImageIcon } from '../icons';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardText, CardTitle } from './Card';
import { Carousel } from './Carousel';
import { Rating } from './Rating';

// AD Design Kit Carousel — one story per Figma "Carousel" Type (node 1149:41738): Default, Default with controls &
// indicators, With cards (E-commerce cards, side controls) and Cards & bottom controls (image cards, controls + dots).
const photos = ['forest', 'coast', 'alps', 'desert'].map((seed, i) => ({
  src: `https://picsum.photos/seed/${seed}/1200/675`,
  alt: `Sample landscape ${i + 1}`,
}));

const slides = photos.map((p) => <img key={p.src} src={p.src} alt={p.alt} className="aspect-video w-full object-cover" />);

// Figma image placeholder ("Put your image here") inside the card padding.
const placeholder = (
  <div className="flex h-48 items-center justify-center rounded-base bg-neutral-tertiary text-body-subtle" aria-hidden>
    <ImageIcon className="size-20" />
  </div>
);

// Figma Card Type=E-commerce, as in "With cards".
const productCards = Array.from({ length: 6 }, (_, i) => (
  <Card key={i} className="h-full">
    {placeholder}
    <Rating value={5} label={<Badge color="brand" size="sm">4.8 out of 5</Badge>} />
    <CardTitle className="text-xl">Apple Watch Series 7 GPS, Aluminium Case, Starlight Sport</CardTitle>
    <div className="mt-auto flex items-center justify-between gap-4">
      <span className="text-3xl font-extrabold text-heading">$599</span>
      <Button leftIcon={<CartIcon />}>Add to cart</Button>
    </div>
  </Card>
));

// Figma Card Type=With Image, as in "Cards & bottom controls".
const articleCards = ['Our design process', 'Modern AD Design Kit API', 'Latest frameworks', 'Design fast with us', 'Accessible by default', 'Tokens that sync'].map((title) => (
  <Card key={title} className="h-full">
    {placeholder}
    <div className="flex flex-col gap-3">
      <CardTitle>{title}</CardTitle>
      <CardText>In today’s fast-paced digital landscape, fostering seamless collaboration among Developers and IT Operations.</CardText>
    </div>
    <div className="mt-auto">
      <Button color="secondary" rightIcon={<ArrowRightIcon />}>
        Read more
      </Button>
    </div>
  </Card>
));

const cards = articleCards;

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

// Figma "Default": an image slide with previous / next controls.
export const Default: Story = { args: { indicators: false } };

// Figma "Default with controls & indicators".
export const DefaultWithControlsAndIndicators: Story = {};

export const SlidesWithoutControls: Story = { args: { controls: false } };
export const SlidesPlain: Story = { args: { controls: false, indicators: false } };

// Figma "With cards": E-commerce cards, three per view, dark round controls at the sides.
export const WithCards: Story = {
  args: { variant: 'cards', indicators: false, label: 'Products', children: productCards, className: undefined },
};

// Figma "Cards & bottom controls": image cards, four per view, controls and dots under the row.
export const CardsAndBottomControls: Story = {
  args: { variant: 'cards', label: 'Articles', children: articleCards, className: undefined },
};

export const CardsWithoutControls: Story = {
  args: { variant: 'cards', label: 'Articles', children: cards, controls: false, className: undefined },
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

// Interaction: the cards row scrolls with Next / Previous; Previous is disabled at the start and the dots follow.
export const CardsScrolling: Story = {
  args: { variant: 'cards', label: 'Articles', children: cards, className: undefined },
  play: async ({ canvas, userEvent }) => {
    const track = canvas.getByRole('region', { name: 'Slides' });
    await expect(canvas.getAllByRole('group')).toHaveLength(6);
    await expect(track.scrollLeft).toBe(0);
    await expect(canvas.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Go to slide 1' })).toHaveAttribute('aria-current', 'true');

    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(0));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Previous' })).toBeEnabled());
    const after = track.scrollLeft;

    await userEvent.click(canvas.getByRole('button', { name: 'Previous' }));
    await waitFor(() => expect(track.scrollLeft).toBeLessThan(after));
  },
};

// Interaction: a dot scrolls its card into view and becomes current.
export const CardsIndicators: Story = {
  args: { variant: 'cards', label: 'Articles', children: cards, perView: 1, className: undefined },
  play: async ({ canvas, userEvent }) => {
    const track = canvas.getByRole('region', { name: 'Slides' });
    await userEvent.click(canvas.getByRole('button', { name: 'Go to slide 3' }));
    await waitFor(() => expect(track.scrollLeft).toBeGreaterThan(0));
    await waitFor(() => expect(canvas.getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute('aria-current', 'true'));
  },
};

// Interaction (With cards): side controls, no dots.
export const WithCardsControls: Story = {
  args: { ...WithCards.args },
  play: async ({ canvas }) => {
    await expect(canvas.queryAllByRole('button', { name: /Go to slide/ })).toHaveLength(0);
    await expect(canvas.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Next' })).toBeEnabled();
  },
};
