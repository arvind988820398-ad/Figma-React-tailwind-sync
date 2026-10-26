// AuxoKit Jumbotron (hero) — Figma set "Jumbotron" (node 1149:67227, page 267:16342).
// Figma Type → variant: Heading + CTA = centered · Text + Illustration / Link + Forms = split (pass `media`) ·
// Bg-image = image (pass `backgroundImage`). Bg gradient, With navbar and Bento cards are compositions of these
// sections with Navbar / Alert pill / Cards. Breakpoint variants are responsive classes.
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface JumbotronProps {
  title: ReactNode;
  lead?: ReactNode;
  /** Up to 2 CTAs: Brand lg + Secondary lg (Tertiary lg on images). */
  actions?: ReactNode;
  /** Small element above the title, e.g. <Alert variant="pill" color="info">. */
  eyebrow?: ReactNode;
  variant?: 'centered' | 'split' | 'image';
  /** Split: illustration, screenshot or a Card (Figma "Link + Forms"). */
  media?: ReactNode;
  /** Image variant: background image URL (gets the bg-black/60 overlay). */
  backgroundImage?: string;
  /** Section surface: bg-neutral-primary (default) or bg-neutral-secondary (Figma "Link + Forms"). */
  surface?: 'primary' | 'secondary';
  className?: string;
}

export function Jumbotron({ title, lead, actions, eyebrow, variant = 'centered', media, backgroundImage, surface = 'primary', className }: JumbotronProps) {
  const image = variant === 'image';
  const split = variant === 'split';
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        image ? 'bg-dark bg-cover bg-center py-32 md:py-56' : 'py-16 md:py-24',
        !image && (surface === 'secondary' ? 'bg-neutral-secondary' : 'bg-neutral-primary'),
        className,
      )}
      style={image && backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {image && <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden />}
      <div className={cn('mx-auto max-w-screen-xl px-4', split ? 'grid items-center gap-12 lg:grid-cols-2' : 'flex flex-col items-center text-center')}>
        <div className={cn('flex flex-col gap-6', !split && 'max-w-4xl items-center')}>
          {eyebrow}
          <h1 className={cn('text-4xl font-semibold leading-none md:text-6xl', image ? 'text-white' : 'text-heading')}>{title}</h1>
          {lead && <p className={cn('text-xl leading-7', image ? 'text-fg-disabled' : 'text-body')}>{lead}</p>}
          {actions && <div className={cn('flex flex-col gap-4 sm:flex-row', !split && 'justify-center')}>{actions}</div>}
        </div>
        {split && media && <div className="[&_img]:rounded-xl [&_img]:shadow-md">{media}</div>}
      </div>
    </section>
  );
}
