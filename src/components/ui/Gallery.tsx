// AD Design Kit Gallery — Figma set "Gallery" (node 1149:56037, page 320:17990).
// Figma Type → variant: Grid 3 columns=grid-3 · Grid 2 columns=grid-2 · Masonry=masonry · Featured image=featured ·
// Carousel=carousel (one image at a time, arrow controls centred below) · With filters=filters (Button-type Tabs with
// icons above a 3-column grid). Breakpoints: grid-3 is 2 columns on Mobile and 3 from md; masonry 2 columns, 3 from lg.
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ArrowLeftIcon, ArrowRightIcon } from '../icons';
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
  /** "filters": label of the tab that shows every image. */
  allLabel?: string;
  /** "filters": an icon per tag, plus `all` for the "All categories" tab (Figma shows one on every tab). */
  filterIcons?: Partial<Record<string, ReactNode>>;
  className?: string;
}

// Figma image frames: rounded-base on bg-neutral-tertiary (shown while the photo loads).
const img = 'h-auto w-full max-w-full rounded-base bg-neutral-tertiary';

function Grid({ images, cols, className }: { images: GalleryImage[]; cols: 2 | 3; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', cols === 3 && 'md:grid-cols-3', className)}>
      {images.map((im, i) => (
        <img key={i} src={im.src} alt={im.alt} loading="lazy" className={cn(img, 'object-cover', cols === 3 ? 'aspect-13/12' : 'aspect-5/3')} />
      ))}
    </div>
  );
}

export function Gallery({ images, variant = 'grid-3', label = 'Gallery', allLabel = 'All categories', filterIcons = {}, className }: GalleryProps) {
  const [featured, setFeatured] = useState(0);
  const [slide, setSlide] = useState(0);
  const [filter, setFilter] = useState('all');
  const tags = useMemo(() => [...new Set(images.flatMap((im) => im.tags ?? []))], [images]);

  if (variant === 'masonry') {
    return (
      <div className={cn('columns-2 gap-4 lg:columns-3', className)}>
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
    const current = images[slide];
    const go = (step: number) => setSlide((i) => (i + step + images.length) % images.length);
    // Figma draws the controls as bare 44px arrow icons.
    const arrow =
      'inline-flex size-11 items-center justify-center rounded-base text-heading hover:bg-neutral-secondary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none [&_svg]:size-8';
    return (
      <section aria-roledescription="carousel" aria-label={label} className={cn('flex flex-col items-center gap-4', className)}>
        {current && (
          <img key={slide} src={current.src} alt={current.alt} className={cn(img, 'aspect-video object-cover')} />
        )}
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Previous image" onClick={() => go(-1)} className={arrow}>
            <ArrowLeftIcon />
          </button>
          <button type="button" aria-label="Next image" onClick={() => go(1)} className={arrow}>
            <ArrowRightIcon />
          </button>
        </div>
      </section>
    );
  }

  if (variant === 'filters') {
    const shown = filter === 'all' ? images : images.filter((im) => im.tags?.includes(filter));
    return (
      <div className={cn('flex flex-col items-center gap-8', className)}>
        <Tabs
          variant="button"
          label={`${label} filters`}
          items={[{ value: 'all', label: allLabel, icon: filterIcons.all }, ...tags.map((t) => ({ value: t, label: t, icon: filterIcons[t] }))]}
          value={filter}
          onValueChange={setFilter}
        />
        <Grid images={shown} cols={3} className="w-full" />
      </div>
    );
  }

  return <Grid images={images} cols={variant === 'grid-3' ? 3 : 2} className={className} />;
}
