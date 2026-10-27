import type { Meta, StoryObj } from '@storybook/react-vite';
import { figmaDesign } from '../../../.storybook/auxokit/figma';
import { useState } from 'react';
import { Gallery, type GalleryProps } from './Gallery';
import { Tabs } from './Tabs';

// AuxoKit Gallery — mirrors the Figma "Gallery" set (node 1149:56037).
const photos = ['forest', 'coast', 'alps', 'desert', 'lake', 'city'].map((seed, i) => ({
  src: `https://picsum.photos/seed/${seed}/800/800`,
  alt: `Sample landscape ${i + 1}`,
}));

const meta = {
  title: 'Components/Gallery',
  component: Gallery,
  parameters: { design: figmaDesign('Gallery'), layout: 'padded' },
  args: { images: photos, variant: 'grid-3' },
  argTypes: {
    variant: { control: 'select', options: ['grid-3', 'grid-2', 'masonry', 'featured'] },
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grid3Columns: Story = {};
export const Grid2Columns: Story = { args: { variant: 'grid-2', images: photos.slice(0, 4) } };

export const Masonry: Story = {
  args: {
    variant: 'masonry',
    // Mixed heights make the masonry layout visible.
    images: photos.map((p, i) => ({ ...p, src: `https://picsum.photos/seed/${['forest', 'coast', 'alps', 'desert', 'lake', 'city'][i]}/600/${i % 2 ? 900 : 500}` })),
  },
};

export const FeaturedImage: Story = { args: { variant: 'featured', className: 'max-w-3xl' } };

// Figma "With filters": Tabs (pills) above a grid.
function FilteredGallery(args: GalleryProps) {
  const [tab, setTab] = useState('all');
  return (
    <Tabs
      variant="pills"
      label="Filter photos"
      value={tab}
      onValueChange={setTab}
      items={[
        { value: 'all', label: 'All', content: <Gallery {...args} /> },
        { value: 'nature', label: 'Nature', content: <Gallery {...args} images={args.images.slice(0, 3)} /> },
        { value: 'city', label: 'City', content: <Gallery {...args} images={args.images.slice(3)} /> },
      ]}
    />
  );
}

export const WithFilters: Story = { render: (args) => <FilteredGallery {...args} /> };
