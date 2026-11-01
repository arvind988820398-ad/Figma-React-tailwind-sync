// AD Design Kit Breadcrumb — Figma set "Breadcrumb" (node 1148:31317, page 3284:24206), item 1148:31348.
// The last item is the current page. "With dropdown/badge" types: pass a Dropdown or Badge as the last `label`.
// "With group buttons": a back/forward ButtonGroup in `leading`. "Only buttons": variant="buttons" (Ghost xs crumbs).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AngleRightIcon } from '../icons';
import { buttonVariants } from './Button';

export type BreadcrumbVariant = 'default' | 'background' | 'buttons';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  /** Leading icon, e.g. a home icon on the first crumb. */
  icon?: ReactNode;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** default = text crumbs · background = boxed trail · buttons = Figma "Only buttons" (each crumb a Ghost xs Button). */
  variant?: BreadcrumbVariant;
  /** Figma "With group buttons": controls before the trail, e.g. a back/forward <ButtonGroup size="sm" color="white">. */
  leading?: ReactNode;
}

const itemBase = 'inline-flex items-center gap-1.5 text-sm font-medium leading-5 [&_svg]:size-4';
const buttonCrumb = buttonVariants({ color: 'ghost', size: 'xs' });

export function Breadcrumb({ items, variant = 'default', leading, className, ...props }: BreadcrumbProps) {
  const buttons = variant === 'buttons';
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        variant === 'background' && 'inline-flex rounded-base border border-default-medium bg-neutral-secondary-medium p-2.5 shadow-xs',
        leading && 'flex flex-wrap items-center gap-2.5',
        className,
      )}
      {...props}
    >
      {leading}
      {/* Figma item: text, 6px, a 14px chevron; items 10px apart ("Only buttons": 4px). */}
      <ol className={cn('flex flex-wrap items-center', buttons ? 'gap-1' : 'gap-1.5')}>
        {items.map((item, i) => {
          const current = i === items.length - 1;
          return (
            <li key={i} className={cn('inline-flex items-center', buttons ? 'gap-1' : 'gap-2.5')}>
              {i > 0 && (
                <AngleRightIcon className="size-3.5 text-body-subtle" />
              )}
              {current || !item.href ? (
                <span
                  aria-current={current ? 'page' : undefined}
                  className={buttons ? cn(buttonCrumb, current && 'text-heading') : cn(itemBase, current ? 'text-body-subtle' : 'text-body')}
                >
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={buttons ? buttonCrumb : cn(itemBase, 'text-body hover:text-fg-brand')}>
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
