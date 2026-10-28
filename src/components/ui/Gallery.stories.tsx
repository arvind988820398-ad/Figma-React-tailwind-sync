import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { Gallery } from './Gallery';

// AuxoKit Gallery — mirrors the Figma "Gallery" set (node 1149:56037).
const categories = ['Business', 'Fashion', 'Toys', 'Cars'];
const photos = Array.from({ length: 9 }, (_, i) => ({
  src: `https://picsum.photos/seed/gallery-${i + 1}/640/640`,
  alt: `Gallery photo ${i + 1}`,
  tags: [categories[i % categories.length]],
}));

const meta = {
  title: 'Components/Gallery',
  component: Gallery,
  parameters: { design: figmaDesign('Gallery'), layout: 'padded' },
  args: { images: photos, variant: 'grid-3' },
  argTypes: { variant: { control: 'select', options: ['grid-3', 'grid-2', 'masonry', 'featured', 'carousel', 'filters'] } },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid3Columns: Story = {};
export const Grid2Columns: Story = { args: { variant: 'grid-2', images: photos.slice(0, 4) } };
export const Masonry: Story = {
  args: {
    variant: 'masonry',
    images: photos.map((p, i) => ({ ...p, src: `https://picsum.photos/seed/masonry-${i + 1}/480/${[640, 420, 560, 360][i % 4]}` })),
  },
};
export const FeaturedImage: Story = { args: { variant: 'featured', className: 'max-w-3xl' } };
/** Figma "Carousel": one image at a time with previous / next controls. */
export const CarouselType: Story = { args: { variant: 'carousel', label: 'Project photos', className: 'max-w-2xl' } };
/** Figma "With filters": pill tabs built from each image's tags. */
export const WithFilters: Story = { args: { variant: 'filters' } };
