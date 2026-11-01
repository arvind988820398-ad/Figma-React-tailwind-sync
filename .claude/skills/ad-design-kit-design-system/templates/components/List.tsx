// AD Design Kit List — Figma set "List" (node 1149:70444, page 3284:24113), item 1149:70209.
// Figma Type → variant: Default=default · Divider=divider · CTA=cta. Figma "Card" = <Card> wrapping a divider list.
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AngleRightIcon } from '../icons';

export type ListVariant = 'default' | 'divider' | 'cta';

const lists: Record<ListVariant, string> = {
  default: 'flex flex-col gap-4',
  divider: 'flex flex-col divide-y divide-default [&>li]:py-3 [&>li:first-child]:pt-0 [&>li:last-child]:pb-0',
  cta: 'flex flex-col gap-3',
};

export interface ListProps extends HTMLAttributes<HTMLUListElement> {
  variant?: ListVariant;
}

export function List({ variant = 'default', className, ...props }: ListProps) {
  return <ul className={cn(lists[variant], className)} {...props} />;
}

export interface ListItemProps {
  /** Simple items: leading icon (size-5 text-body-subtle). */
  icon?: ReactNode;
  /** Rich items: 32px avatar / image / IconShape. */
  media?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  /** Right side: value, Badge or Secondary xs Button. */
  trailing?: ReactNode;
  href?: string;
  disabled?: boolean;
  /** Figma "CTA" item: bordered card row with a trailing chevron. Use inside <List variant="cta">. */
  cta?: boolean;
  className?: string;
}

export function ListItem({ icon, media, children, description, trailing, href, disabled, cta, className }: ListItemProps) {
  const rich = !!(media || description || cta);
  const body = (
    <>
      {icon && <span className={cn('inline-flex shrink-0 [&_svg]:size-5', disabled ? 'text-fg-disabled' : 'text-body-subtle group-hover:text-heading')}>{icon}</span>}
      {media && <span className="inline-flex shrink-0">{media}</span>}
      {rich ? (
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className={cn('text-base leading-4', cta ? 'font-semibold' : 'font-medium', disabled ? 'text-fg-disabled' : 'text-heading')}>{children}</span>
          {description && <span className={cn('text-sm', disabled ? 'text-fg-disabled' : 'text-body')}>{description}</span>}
        </span>
      ) : (
        <span className="min-w-0 flex-1">{children}</span>
      )}
      {trailing && <span className="ms-auto flex shrink-0 items-center text-base font-medium text-heading">{trailing}</span>}
      {cta && (
        <AngleRightIcon className="ms-auto size-5 shrink-0 text-body-subtle" />
      )}
    </>
  );
  const row = cn(
    'group flex items-center text-base transition-colors',
    rich ? 'gap-2' : 'gap-1.5',
    cta && 'gap-6 rounded-base border border-default bg-neutral-secondary-soft p-4',
    disabled ? 'pointer-events-none text-fg-disabled' : 'text-body',
    href && !disabled && 'hover:text-heading focus-visible:shadow-focus-brand focus-visible:outline-none',
    href && cta && !disabled && 'hover:bg-neutral-secondary-medium',
    className,
  );
  return (
    <li>
      {href ? (
        <a href={href} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} className={cn(row, !cta && 'rounded')}>
          {body}
        </a>
      ) : (
        <div aria-disabled={disabled || undefined} className={row}>{body}</div>
      )}
    </li>
  );
}
