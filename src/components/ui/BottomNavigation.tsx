// AD Design Kit Bottom navigation — Figma set "Bottom navigation" (node 1146:27386, page 208:15901), item 1146:27379.
// Figma Style → variant: Default=default · Bordered=bordered · Action button=action (center Brand icon button).
// Style "Pagination" = `pager` (icon-only items around a "‹ 1 of N ›" pill) · "Segment controls" = `segments` (a segmented
// control above icon-only items).
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';

export type BottomNavigationVariant = 'default' | 'bordered' | 'action';

export interface BottomNavigationItem {
  label: string;
  href: string;
  icon: ReactNode;
  current?: boolean;
}

export interface BottomNavigationProps {
  items: BottomNavigationItem[];
  variant?: BottomNavigationVariant;
  /** "Action button" style: the centered action. */
  action?: { label: string; icon: ReactNode; onClick: () => void };
  /** Figma "Pagination" style: a centered pager pill (Secondary xs) between icon-only items, e.g. a document reader. */
  pager?: { page: number; pageCount: number; onPageChange: (page: number) => void };
  /** Figma "Segment controls" style: a segmented control above icon-only items, e.g. <Tabs variant="segmented">. */
  segments?: ReactNode;
  /** Pin to the bottom of the viewport (mobile). Off for inline previews. */
  fixed?: boolean;
  label?: string;
  className?: string;
}

function Item({ item, iconOnly }: { item: BottomNavigationItem; iconOnly?: boolean }) {
  return (
    <a
      href={item.href}
      aria-current={item.current ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-1 py-2 text-sm font-medium transition-colors focus-visible:shadow-focus-brand focus-visible:outline-none [&_svg]:size-6',
        item.current ? 'text-fg-brand' : 'text-body hover:text-fg-brand',
      )}
    >
      {item.icon}
      <span className={cn(iconOnly && 'sr-only')}>{item.label}</span>
    </a>
  );
}

const Chevron = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function BottomNavigation({ items, variant = 'default', action, pager, segments, fixed, label = 'Bottom navigation', className }: BottomNavigationProps) {
  const shell = cn('w-full bg-neutral-primary-soft', variant === 'bordered' && 'border-t border-default', fixed && 'fixed inset-x-0 bottom-0 z-40', className);
  if (pager) {
    const half = Math.ceil(items.length / 2);
    const step = cn(buttonVariants({ color: 'ghost', size: 'xs', iconOnly: true }), 'size-6 text-body');
    return (
      <nav aria-label={label} className={cn('flex h-16 items-center justify-around', shell)}>
        {items.slice(0, half).map((i) => <Item key={i.label} item={i} iconOnly />)}
        <div className={cn(buttonVariants({ color: 'secondary', size: 'xs' }), 'gap-1 px-1 hover:bg-neutral-secondary-medium')}>
          <button type="button" aria-label="Previous page" className={step} disabled={pager.page <= 1} onClick={() => pager.onPageChange(pager.page - 1)}>
            <Chevron d="m15 6-6 6 6 6" />
          </button>
          <span aria-live="polite">
            {pager.page} of {pager.pageCount}
          </span>
          <button type="button" aria-label="Next page" className={step} disabled={pager.page >= pager.pageCount} onClick={() => pager.onPageChange(pager.page + 1)}>
            <Chevron d="m9 6 6 6-6 6" />
          </button>
        </div>
        {items.slice(half).map((i) => <Item key={i.label} item={i} iconOnly />)}
      </nav>
    );
  }
  if (segments) {
    return (
      <nav aria-label={label} className={cn('flex flex-col items-center gap-4 pt-4 pb-2', shell)}>
        {segments}
        <div className="grid h-10 w-full grid-flow-col auto-cols-fr">
          {items.map((i) => <Item key={i.label} item={i} iconOnly />)}
        </div>
      </nav>
    );
  }
  if (variant === 'action' && action) {
    const half = Math.ceil(items.length / 2);
    return (
      <nav aria-label={label} className={cn('w-full max-w-lg', fixed && 'fixed inset-x-0 bottom-4 z-40 mx-auto', className)}>
        <div className="grid h-16 grid-cols-5 items-center rounded-full border border-default bg-neutral-primary-soft px-2 shadow-xs">
          {items.slice(0, half).map((i) => <Item key={i.label} item={i} />)}
          <div className="flex justify-center">
            <button type="button" aria-label={action.label} onClick={action.onClick} className={cn(buttonVariants({ size: 'base', iconOnly: true }), 'rounded-full')}>
              {action.icon}
            </button>
          </div>
          {items.slice(half).map((i) => <Item key={i.label} item={i} />)}
        </div>
      </nav>
    );
  }
  return (
    <nav
      aria-label={label}
      className={cn(
        'grid h-16 w-full bg-neutral-primary-soft',
        items.length >= 5 ? 'grid-cols-5' : 'grid-cols-4',
        variant === 'bordered' && 'border-t border-default',
        fixed && 'fixed inset-x-0 bottom-0 z-40',
        className,
      )}
    >
      {items.map((i) => <Item key={i.label} item={i} />)}
    </nav>
  );
}
