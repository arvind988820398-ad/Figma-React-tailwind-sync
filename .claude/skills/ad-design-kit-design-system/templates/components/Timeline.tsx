// AD Design Kit Timeline — Figma set "Timeline" (node 1149:91254, page 1149:91247), item 1149:91357, dot 1149:91248.
// Figma Type → variant: Default=default (ellipse dots) · Icons & Card=icons (icon dots; set `card` for card items) ·
// User actions / Stacked cards=cards · Horizontal / Horizontal advanced=horizontal.
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Badge } from './Badge';

export type TimelineVariant = 'default' | 'icons' | 'cards' | 'horizontal';

export interface TimelineItem {
  date: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Icon for the "icons" dot (size-2.5 text-fg-brand). */
  icon?: ReactNode;
  /** Avatar image for an avatar dot (cards variant). */
  avatar?: ReactNode;
  /** Secondary sm + Brand sm buttons, or a link. */
  actions?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  variant?: TimelineVariant;
  className?: string;
}

function Dot({ variant, item }: { variant: TimelineVariant; item: TimelineItem }) {
  if (variant === 'icons' || (variant === 'cards' && item.icon && !item.avatar)) {
    return (
      <span className="absolute -start-2.5 mt-1 flex size-5 items-center justify-center rounded-full border-2 border-buffer bg-brand-softer text-fg-brand [&_svg]:size-2.5" aria-hidden>
        {item.icon}
      </span>
    );
  }
  if (item.avatar) {
    return (
      <span className="absolute -start-2.5 mt-1 flex size-5 overflow-hidden rounded-full border-2 border-buffer [&>*]:size-full" aria-hidden>
        {item.avatar}
      </span>
    );
  }
  return <span className="absolute -start-1.5 mt-1.5 size-3 rounded-full border border-buffer bg-neutral-tertiary" aria-hidden />;
}

export function Timeline({ items, variant = 'default', className }: TimelineProps) {
  if (variant === 'horizontal') {
    return (
      <ol className={cn('flex flex-col gap-8 sm:flex-row sm:gap-11', className)}>
        {items.map((item, i) => (
          <li key={i} className="relative flex-1 border-t border-default pt-5">
            <span className="absolute -top-1.5 start-0 size-3 rounded-full border border-buffer bg-neutral-tertiary" aria-hidden />
            <div className="flex flex-col gap-2">
              <Badge color="gray" size="sm" className="self-start">{item.date}</Badge>
              <h3 className="text-lg font-semibold leading-7 text-heading">{item.title}</h3>
              {item.description && <p className="text-base text-body">{item.description}</p>}
              {item.actions && <div className="text-sm font-medium text-fg-brand">{item.actions}</div>}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const cards = variant === 'cards';
  return (
    <ol className={cn('relative flex flex-col gap-11 border-s border-default', variant === 'default' ? 'ps-4' : 'ps-6', className)}>
      {items.map((item, i) => (
        // Dots are absolutely placed against the <ol> (the line); mt aligns them with the first text row.
        <li key={i}>
          <Dot variant={variant} item={item} />
          <div
            className={cn(
              'flex flex-col gap-5',
              cards && 'rounded-base border border-default bg-neutral-primary-soft p-6 shadow-xs',
            )}
          >
            <div className="flex flex-col gap-2">
              <Badge color="gray" size="sm" className="self-start">{item.date}</Badge>
              <h3 className="text-lg font-semibold leading-7 text-heading">{item.title}</h3>
              {item.description &&
                (cards ? (
                  <div className="rounded border border-default-medium bg-neutral-secondary-medium p-3 text-sm italic text-body">{item.description}</div>
                ) : (
                  <p className="text-base text-body">{item.description}</p>
                ))}
            </div>
            {item.actions && <div className="flex flex-wrap gap-3">{item.actions}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}
