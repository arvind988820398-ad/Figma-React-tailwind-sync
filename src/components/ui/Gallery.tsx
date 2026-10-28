// AuxoKit Gallery — Figma set "Gallery" (node 1149:56037, page 320:17990).
// Figma Type → variant: Grid 3 columns=grid-3 · Grid 2 columns=grid-2 · Masonry=masonry · Featured image=featured ·
// Carousel=carousel (one image at a time with prev/next) · With filters=filters (pill Tabs above a 3-column grid).
import { useMemo, useState } from 'react';
import { cn } from '../../lib/cn';
import { Carousel } from './Carousel';
import { Tabs } from './Tabs';

export type GalleryVariant = 'grid-3' | 'grid-2' | 'masonry' | 'featured' | 'carousel' | 'filters';

export interface GalleryImage {
  src: string;
  alt: string;
  /** Filter categories for the "filters" variant. */
  tags?: string[];
}

export interface GalleryProps {
  images: GalleryImage[];
  variant?: GalleryVariant;
  /** Accessible name of the carousel variant. */
  label?: string;
  /** "filters": label of the pill that shows every image. */
  allLabel?: string;
  className?: string;
}

const img = 'h-auto w-full max-w-full rounded-base';

function Grid({ images, cols, className }: { images: GalleryImage[]; cols: 2 | 3; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', cols === 3 && 'md:grid-cols-3', className)}>
      {images.map((im, i) => (
        <img key={i} src={im.src} alt={im.alt} loading="lazy" className={cn(img, 'aspect-square object-cover')} />
      ))}
    </div>
  );
}

export function Gallery({ images, variant = 'grid-3', label = 'Gallery', allLabel = 'All categories', className }: GalleryProps) {
  const [featured, setFeatured] = useState(0);
  const [filter, setFilter] = useState('all');
  const tags = useMemo(() => [...new Set(images.flatMap((im) => im.tags ?? []))], [images]);

  if (variant === 'masonry') {
    return (
      <div className={cn('columns-2 gap-4 md:columns-4', className)}>
        {images.map((im, i) => (
          <img key={i} src={im.src} alt={im.alt} loading="lazy" className={cn(img, 'mb-4 break-inside-avoid')} />
        ))}
      </div>
    );
  }

  if (variant === 'featured') {
    const main = images[featured];
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        {main && <img src={main.src} alt={main.alt} className={cn(img, 'aspect-video object-cover')} />}
        <div className="grid grid-cols-5 gap-4">
          {images.map((im, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show ${im.alt}`}
              aria-current={i === featured || undefined}
              onClick={() => setFeatured(i)}
              className={cn(
                'overflow-hidden rounded-base focus-visible:shadow-focus-brand focus-visible:outline-none',
                i === featured ? 'ring-2 ring-brand' : 'opacity-100 hover:ring-2 hover:ring-default-strong',
              )}
            >
              <img src={im.src} alt="" className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'carousel') {
    return (
      <Carousel label={label} indicators={false} className={className}>
        {images.map((im, i) => (
          <img key={i} src={im.src} alt={im.alt} className={cn(img, 'aspect-video object-cover')} />
        ))}
      </Carousel>
    );
  }

  if (variant === 'filters') {
    const shown = filter === 'all' ? images : images.filter((im) => im.tags?.includes(filter));
    return (
      <div className={cn('flex flex-col items-center gap-6', className)}>
        <Tabs
          variant="pills"
          label={`${label} filters`}
          items={[{ value: 'all', label: allLabel }, ...tags.map((t) => ({ value: t, label: t }))]}
          value={filter}
          onValueChange={setFilter}
        />
        <Grid images={shown} cols={3} className="w-full" />
      </div>
    );
  }

  return <Grid images={images} cols={variant === 'grid-3' ? 3 : 2} className={className} />;
}
