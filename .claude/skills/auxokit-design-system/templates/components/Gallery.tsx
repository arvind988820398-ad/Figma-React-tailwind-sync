// AuxoKit Gallery — Figma set "Gallery" (node 1149:56037, page 320:17990).
// Figma Type → variant: Grid 3 columns=grid-3 · Grid 2 columns=grid-2 · Masonry=masonry · Featured image=featured.
// "With filters" = <Tabs variant="pills"> above a Gallery; "Carousel" = <Carousel>.
import { useState } from 'react';
import { cn } from '../../lib/cn';

export type GalleryVariant = 'grid-3' | 'grid-2' | 'masonry' | 'featured';

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface GalleryProps {
  images: GalleryImage[];
  variant?: GalleryVariant;
  className?: string;
}

const img = 'h-auto w-full max-w-full rounded-base';

export function Gallery({ images, variant = 'grid-3', className }: GalleryProps) {
  const [featured, setFeatured] = useState(0);

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

  return (
    <div className={cn('grid grid-cols-2 gap-4', variant === 'grid-3' && 'md:grid-cols-3', className)}>
      {images.map((im, i) => (
        <img key={i} src={im.src} alt={im.alt} loading="lazy" className={cn(img, 'aspect-square object-cover')} />
      ))}
    </div>
  );
}
