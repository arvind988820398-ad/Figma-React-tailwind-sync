// AD Design Kit Carousel — Figma set "Carousel" (node 1149:41738, page 3284:23924), control 1149:41774, indicator 1149:41777.
// Figma Type → variant: Default / Default with controls & indicators = slides (toggle `controls` / `indicators`) ·
// With cards / Cards & bottom controls = cards (scrolling row, controls under it). No auto-advance by design.
import { Children, useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';

export interface CarouselProps {
  children: ReactNode;
  variant?: 'slides' | 'cards';
  /** Previous / next buttons (Figma control). */
  controls?: boolean;
  /** Slide dots (Figma indicator); slides variant only. */
  indicators?: boolean;
  /** Accessible name, e.g. "Product photos". */
  label: string;
  className?: string;
}

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d={dir === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const overlayControl =
  'inline-flex size-11 items-center justify-center rounded-full bg-overlay-light text-white transition-colors hover:bg-overlay-dark ' +
  'focus-visible:shadow-focus-brand focus-visible:outline-none [&_svg]:size-7';

export function Carousel({ children, variant = 'slides', controls = true, indicators = true, label, className }: CarouselProps) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const go = (i: number) => setIndex((i + slides.length) % slides.length);

  if (variant === 'cards') {
    const scroll = (dir: -1 | 1) => trackRef.current?.scrollBy({ left: dir * trackRef.current.clientWidth * 0.8, behavior: 'smooth' });
    return (
      <section aria-roledescription="carousel" aria-label={label} className={cn('flex flex-col gap-6', className)}>
        <div ref={trackRef} tabIndex={0} aria-label="Slides" role="region" className="flex snap-x snap-mandatory gap-8 overflow-x-auto rounded-base pb-2 [scrollbar-width:none] focus-visible:shadow-focus-brand focus-visible:outline-none">
          {slides.map((s, i) => (
            <div key={i} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`} className="w-72 shrink-0 snap-start">
              {s}
            </div>
          ))}
        </div>
        {controls && (
          <div className="flex justify-center gap-4">
            <button type="button" aria-label="Previous" onClick={() => scroll(-1)} className={buttonVariants({ color: 'secondary', iconOnly: true })}>
              <Chevron dir="left" />
            </button>
            <button type="button" aria-label="Next" onClick={() => scroll(1)} className={buttonVariants({ color: 'secondary', iconOnly: true })}>
              <Chevron dir="right" />
            </button>
          </div>
        )}
      </section>
    );
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
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3">
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
