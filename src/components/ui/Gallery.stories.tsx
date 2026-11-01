import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { figmaDesign } from '../../../.storybook/ad-design-kit/figma';
import { BriefcaseIcon, GridIcon, TeddyBearIcon, TruckIcon, TShirtIcon } from '../icons';
import { Gallery } from './Gallery';

// AD Design Kit Gallery — mirrors the Figma "Gallery" set (node 1149:56037): one story per Figma Type at Desktop,
// plus the Tablet and Mobile breakpoints Figma draws (Grid 3 columns, Masonry, Featured image).
const categories = ['Business', 'Fashion', 'Toys', 'Cars'];
const photos = Array.from({ length: 12 }, (_, i) => ({
  src: `https://picsum.photos/seed/gallery-${i + 1}/832/768`,
  alt: `Gallery photo ${i + 1}`,
  tags: [categories[i % categories.length]],
}));
// Figma Masonry: three columns of 384px and 784px tall images.
const tall = [false, true, false, false, false, false, true, false, false, true, false, false];
const masonry = photos.map((p, i) => ({ ...p, src: `https://picsum.photos/seed/masonry-${i + 1}/832/${tall[i] ? 1568 : 768}` }));

const meta = {
  title: 'Components/Gallery',
  component: Gallery,
  parameters: { design: figmaDesign('Gallery'), layout: 'padded' },
  args: { images: photos, variant: 'grid-3' },
  argTypes: { variant: { control: 'select', options: ['grid-3', 'grid-2', 'masonry', 'featured', 'carousel', 'filters'] } },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

const mobile = { viewport: { value: 'mobile1', isRotated: false } };
const tablet = { viewport: { value: 'tablet', isRotated: false } };

// Figma "Grid 3 columns": 12 images, 3 columns from md, 2 on Mobile.
export const Grid3Columns: Story = {};

// Figma "Grid 2 columns": 8 wide images.
export const Grid2Columns: Story = {
  args: { variant: 'grid-2', images: photos.slice(0, 8).map((p, i) => ({ ...p, src: `https://picsum.photos/seed/wide-${i + 1}/1264/768` })) },
};

// Figma "Masonry": 3 columns on Desktop, 2 on Tablet and Mobile.
export const Masonry: Story = { args: { variant: 'masonry', images: masonry } };

// Figma "Featured image": a large image above a row of thumbnails (3 per row, 2 on Mobile).
export const FeaturedImage: Story = { args: { variant: 'featured', images: photos.slice(0, 3), className: 'max-w-3xl' } };

// Figma "Carousel": one image with the arrow controls centred below. Interaction: next and previous wrap around.
export const CarouselType: Story = {
  args: { variant: 'carousel', images: photos.slice(0, 3), label: 'Project photos', className: 'max-w-3xl' },
  play: async ({ canvas, userEvent }) => {
    const gallery = within(canvas.getByRole('region', { name: 'Project photos' }));
    await expect(gallery.getByRole('img')).toHaveAccessibleName('Gallery photo 1');
    await userEvent.click(gallery.getByRole('button', { name: 'Next image' }));
    await expect(gallery.getByRole('img')).toHaveAccessibleName('Gallery photo 2');
    await userEvent.click(gallery.getByRole('button', { name: 'Previous image' }));
    await userEvent.click(gallery.getByRole('button', { name: 'Previous image' }));
    await expect(gallery.getByRole('img')).toHaveAccessibleName('Gallery photo 3');
  },
};

// Figma "With filters": Button-type tabs with an icon each, above the 3-column grid.
export const WithFilters: Story = {
  args: {
    variant: 'filters',
    filterIcons: { all: <GridIcon />, Business: <BriefcaseIcon />, Fashion: <TShirtIcon />, Toys: <TeddyBearIcon />, Cars: <TruckIcon /> },
  },
};

export const Grid3ColumnsTablet: Story = { ...Grid3Columns, globals: tablet };
export const Grid3ColumnsMobile: Story = { ...Grid3Columns, globals: mobile };
export const MasonryTablet: Story = { ...Masonry, globals: tablet };
export const MasonryMobile: Story = { ...Masonry, globals: mobile };
export const FeaturedImageMobile: Story = { ...FeaturedImage, globals: mobile };
