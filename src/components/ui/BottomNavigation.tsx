// AuxoKit Bottom navigation — Figma set "Bottom navigation" (node 1146:27386, page 208:15901), item 1146:27379.
// Figma Style → variant: Default=default · Bordered=bordered · Action button=action (center Brand icon button).
// Pagination and Segment controls styles are compositions (add Buttons / a segmented control above the items).
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
  /** Pin to the bottom of the viewport (mobile). Off for inline previews. */
  fixed?: boolean;
  label?: string;
  className?: string;
}

function Item({ item }: { item: BottomNavigationItem }) {
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
      <span>{item.label}</span>
    </a>
  );
}

export function BottomNavigation({ items, variant = 'default', action, fixed, label = 'Bottom navigation', className }: BottomNavigationProps) {
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
