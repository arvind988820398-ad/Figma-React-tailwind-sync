// AD Design Kit Carousel — Figma set "Carousel" (node 1149:41738, page 3284:23924), control 1149:41774, indicator 1149:41777.
// Figma Type → props: Default = slides `indicators={false}` · Default with controls & indicators = slides ·
// With cards = cards `indicators={false}` (dark round controls at the sides, 3 cards per view) ·
// Cards & bottom controls = cards (controls and dots under the row, 4 cards per view). No auto-advance by design.
import { Children, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AngleLeftIcon, AngleRightIcon } from '../icons';

export interface CarouselProps {
  children: ReactNode;
  variant?: 'slides' | 'cards';
  /** Previous / next buttons (Figma control). */
  controls?: boolean;
  /** Slide dots (Figma indicator). On cards they also move the controls under the row (Figma "Cards & bottom controls"). */
  indicators?: boolean;
  /** Cards visible at once from lg up (2 from sm, 1 below). Defaults to Figma: 3 with side controls, 4 with bottom controls. */
  perView?: number;
  /** Accessible name, e.g. "Product photos". */
  label: string;
  className?: string;
}

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (dir === 'left' ? <AngleLeftIcon /> : <AngleRightIcon />);

const overlayControl =
  'inline-flex size-11 items-center justify-center rounded-full bg-overlay-light text-white transition-colors hover:bg-overlay-dark ' +
  'focus-visible:shadow-focus-brand focus-visible:outline-none [&_svg]:size-7';

// Cards controls: dark round buttons; the gray fill marks the end of the row (disabled).
const cardControl =
  'inline-flex shrink-0 items-center justify-center rounded-full bg-dark-strong text-white transition-colors hover:bg-dark ' +
  'focus-visible:shadow-focus-brand focus-visible:outline-none disabled:pointer-events-none disabled:bg-gray [&_svg]:size-7';

function CardsCarousel({ slides, controls, indicators, perView, label, className }: Omit<CarouselProps, 'children' | 'variant'> & { slides: ReactNode[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const bottom = indicators;
  const count = perView ?? (bottom ? 4 : 3);
  const gap = bottom ? 1 : 1.5; // rem: Figma gap 16 / 24
  const basis = { '--carousel-sm': `calc((100% - ${gap}rem) / 2)`, '--carousel-lg': `calc((100% - ${(count - 1) * gap}rem) / ${count})` } as CSSProperties;

  const update = () => {
    const track = trackRef.current;
    if (!track) return;
    const first = track.firstElementChild as HTMLElement | null;
    const step = first ? first.offsetWidth + gap * parseFloat(getComputedStyle(document.documentElement).fontSize) : track.clientWidth;
    setActive(Math.min(slides.length - 1, Math.round(track.scrollLeft / step)));
    setEdges({ start: track.scrollLeft <= 1, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 });
  };
  // Re-measure when the slides change; scrolling updates the rest.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(update, [slides.length]);

  const scroll = (dir: -1 | 1) => trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth, behavior: 'smooth' });
  const goTo = (i: number) => {
    const el = trackRef.current?.children[i] as HTMLElement | undefined;
    if (el) trackRef.current!.scrollTo({ left: el.offsetLeft, behavior: 'smooth' });
  };
  const button = (dir: -1 | 1) => (
    <button
      type="button"
      aria-label={dir < 0 ? 'Previous' : 'Next'}
      disabled={dir < 0 ? edges.start : edges.end}
      onClick={() => scroll(dir)}
      className={cn(cardControl, bottom ? 'size-10' : 'size-11')}
    >
      <Chevron dir={dir < 0 ? 'left' : 'right'} />
    </button>
  );

  const track = (
    <div
      ref={trackRef}
      tabIndex={0}
      aria-label="Slides"
      role="region"
      onScroll={update}
      style={basis}
      className={cn(
        'relative flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] focus-visible:shadow-focus-brand focus-visible:outline-none',
        bottom ? 'gap-4' : 'gap-6',
      )}
    >
      {slides.map((s, i) => (
        <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`} className="shrink-0 grow-0 basis-full snap-start sm:basis-(--carousel-sm) lg:basis-(--carousel-lg)">
          {s}
        </div>
      ))}
    </div>
  );

  return (
    <section aria-roledescription="carousel" aria-label={label} className={cn('flex flex-col gap-8', className)}>
      {bottom ? (
        <>
          {track}
          {(controls || slides.length > 1) && (
            <div className="flex items-center justify-center gap-8">
              {controls && button(-1)}
              {slides.length > 1 && (
                <div className="flex items-center gap-3">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === active || undefined}
                      onClick={() => goTo(i)}
                      className={cn('size-3.5 rounded-full transition-colors focus-visible:shadow-focus-brand focus-visible:outline-none', i === active ? 'bg-dark-strong' : 'bg-quaternary-medium hover:bg-gray')}
                    />
                  ))}
                </div>
              )}
              {controls && button(1)}
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-4 lg:gap-8">
          {controls && button(-1)}
          {track}
          {controls && button(1)}
        </div>
      )}
    </section>
  );
}

export function Carousel({ children, variant = 'slides', controls = true, indicators = true, perView, label, className }: CarouselProps) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const id = useId();
  const go = (i: number) => setIndex((i + slides.length) % slides.length);

  if (variant === 'cards') {
    return <CardsCarousel slides={slides} controls={controls} indicators={indicators} perView={perView} label={label} className={className} />;
  }

  return (
    <section aria-roledescription="carousel" aria-label={label} className={cn('relative overflow-hidden rounded-base bg-gray', className)}>
      <div id={id} aria-live="polite" className="flex transition-transform duration-500 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`} aria-hidden={i !== index} inert={i !== index} className="w-full shrink-0">
            {s}
          </div>
        ))}
      </div>
      {controls && slides.length > 1 && (
        <>
          <button type="button" aria-label="Previous slide" aria-controls={id} onClick={() => go(index - 1)} className={cn(overlayControl, 'absolute start-8 top-1/2 -translate-y-1/2')}>
            <Chevron dir="left" />
          </button>
          <button type="button" aria-label="Next slide" aria-controls={id} onClick={() => go(index + 1)} className={cn(overlayControl, 'absolute end-8 top-1/2 -translate-y-1/2')}>
            <Chevron dir="right" />
          </button>
        </>
      )}
      {indicators && slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index || undefined}
              onClick={() => go(i)}
              className={cn('size-3.5 rounded-full transition-colors focus-visible:shadow-focus-brand focus-visible:outline-none', i === index ? 'bg-white' : 'bg-overlay-light hover:bg-white')}
            />
          ))}
        </div>
      )}
    </section>
  );
}
