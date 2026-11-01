// AD Design Kit Jumbotron (hero) — Figma set "Jumbotron" (node 1149:67227, page 267:16342).
// Figma Type → variant: Heading + CTA = centered · Text + Illustration / Link + Forms = split (pass `media`) ·
// Bg-image = image (pass `backgroundImage`) · Bg gradient = centered + surface="gradient" + Alert pill eyebrow + inline
// Input form. With navbar and Bento cards are compositions with Navbar / Cards. Breakpoint variants are responsive
// classes: Mobile py-8, title 30px, lead 16px · Tablet (md) py-16, title 48px, lead 20px · Desktop (lg) py-24, title 60px.
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
  /** Section surface: bg-neutral-primary (default), bg-neutral-secondary (Figma "Link + Forms") or the soft brand
   *  gradient of Figma "Bg gradient". */
  surface?: 'primary' | 'secondary' | 'gradient';
  className?: string;
}

const surfaces = { primary: 'bg-neutral-primary', secondary: 'bg-neutral-secondary', gradient: 'bg-neutral-primary' } as const;
// Figma "Bg gradient": brand tint fading into the page. Token CSS variables, since gradient stops have no token classes.
const brandGradient = 'linear-gradient(to bottom, var(--adk-bg-brand-soft), var(--adk-bg-neutral-primary))';

export function Jumbotron({ title, lead, actions, eyebrow, variant = 'centered', media, backgroundImage, surface = 'primary', className }: JumbotronProps) {
  const image = variant === 'image';
  const split = variant === 'split';
  return (
    <section
      className={cn(
        'relative isolate overflow-hidden',
        image ? 'bg-dark bg-cover bg-center py-16 md:py-24 lg:py-56' : 'py-8 md:py-16 lg:py-24',
        !image && surfaces[surface],
        className,
      )}
      style={
        image && backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : !image && surface === 'gradient'
            ? { backgroundImage: brandGradient }
            : undefined
      }
    >
      {image && <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden />}
      <div className={cn('mx-auto max-w-screen-xl px-4', split ? 'grid items-center gap-12 lg:grid-cols-2' : 'flex flex-col items-center text-center')}>
        <div className={cn('flex flex-col gap-6', !split && 'max-w-4xl items-center')}>
          {eyebrow}
          <h1 className={cn('text-3xl font-semibold leading-tight md:text-5xl md:leading-none lg:text-6xl', image ? 'text-white' : 'text-heading')}>{title}</h1>
          {lead && <p className={cn('max-w-3xl text-base md:text-xl md:leading-7', image ? 'text-fg-disabled' : 'text-body')}>{lead}</p>}
          {actions && <div className={cn('flex flex-wrap items-center gap-4', !split && 'justify-center')}>{actions}</div>}
        </div>
        {split && media && <div className="[&_img]:rounded-xl">{media}</div>}
      </div>
    </section>
  );
}
