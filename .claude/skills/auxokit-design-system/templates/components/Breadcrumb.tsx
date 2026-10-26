// AuxoKit Breadcrumb — Figma set "Breadcrumb" (node 1148:31317, page 3284:24206), item 1148:31348.
// The last item is the current page. "With dropdown/badge/group buttons" types: pass a Button or Badge as the last `label`.
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BreadcrumbVariant = 'default' | 'background';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  /** Leading icon, e.g. a home icon on the first crumb. */
  icon?: ReactNode;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  variant?: BreadcrumbVariant;
}

const itemBase = 'inline-flex items-center gap-1.5 text-sm font-medium leading-5 [&_svg]:size-4';

export function Breadcrumb({ items, variant = 'default', className, ...props }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        variant === 'background' && 'inline-flex rounded-base border border-default-medium bg-neutral-secondary-medium p-2.5 shadow-xs',
        className,
      )}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-2.5">
        {items.map((item, i) => {
          const current = i === items.length - 1;
          return (
            <li key={i} className="inline-flex items-center gap-2.5">
              {i > 0 && (
                <svg viewBox="0 0 24 24" className="size-4 text-body-subtle" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {current || !item.href ? (
                <span aria-current={current ? 'page' : undefined} className={cn(itemBase, current ? 'text-body-subtle' : 'text-body')}>
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={cn(itemBase, 'text-body hover:text-fg-brand')}>
                  {item.icon}
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
