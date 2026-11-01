// AD Design Kit List — Figma set "List" (node 1149:70444, page 3284:24113), item 1149:70209.
// Figma Type → variant: Default=default · Divider=divider · CTA=cta · Card=card (the divider list with 16px rows, inside a <Card>).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ArrowRightIcon } from '../icons';

export type ListVariant = 'default' | 'divider' | 'cta' | 'card';

const divided = 'flex flex-col divide-y divide-default [&>li:first-child]:pt-0 [&>li:last-child]:pb-0';
const lists: Record<ListVariant, string> = {
  default: 'flex flex-col gap-4',
  divider: cn(divided, '[&>li]:py-3'),
  cta: 'flex flex-col gap-4',
  card: cn(divided, '[&>li]:py-4'),
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
  /** Rich items: 32px avatar / image / IconShape (36px logo in CTA rows). */
  media?: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  /** Right side: value (14px next to an icon, 16px next to media), Badge or Secondary xs Button. */
  trailing?: ReactNode;
  href?: string;
  disabled?: boolean;
  /** Figma "CTA" item: bordered card row with a 36px logo and a trailing arrow. Use inside <List variant="cta">. */
  cta?: boolean;
  className?: string;
}

export function ListItem({ icon, media, children, description, trailing, href, disabled, cta, className }: ListItemProps) {
  const rich = !!(media || description || cta);
  // Figma Hover/Active: simple rows turn text-heading; CTA rows turn brand (bg-brand-softer, text-fg-brand-strong).
  const hover = href && !disabled;
  const body = (
    <>
      {icon && <span className={cn('inline-flex shrink-0 [&_svg]:size-5', disabled ? 'text-fg-disabled' : 'text-body-subtle group-hover:text-heading')}>{icon}</span>}
      {media && <span className="inline-flex shrink-0">{media}</span>}
      {rich ? (
        <span className={cn('flex min-w-0 flex-1 flex-col', cta ? 'gap-0.5 ps-3.5' : 'gap-px')}>
          <span
            className={cn(
              'text-base leading-4',
              cta ? 'font-semibold' : 'font-medium',
              disabled ? 'text-fg-disabled' : 'text-heading',
              hover && cta && 'group-hover:text-fg-brand-strong',
            )}
          >
            {children}
          </span>
          {description && (
            <span className={cn('text-sm', disabled ? 'text-fg-disabled' : 'text-body', hover && (cta ? 'group-hover:text-fg-brand-strong' : 'group-hover:text-heading'))}>
              {description}
            </span>
          )}
        </span>
      ) : (
        <span className={cn('min-w-0 flex-1', disabled && 'line-through')}>{children}</span>
      )}
      {trailing && (
        <span className={cn('ms-auto flex shrink-0 items-center font-medium', rich ? 'text-base' : 'text-sm', disabled ? 'text-fg-disabled' : 'text-body', disabled && !rich && 'line-through', hover && !rich && 'group-hover:text-heading')}>
          {trailing}
        </span>
      )}
      {cta && <ArrowRightIcon className={cn('ms-4 size-6 shrink-0', disabled ? 'text-fg-disabled' : 'text-body-subtle', hover && 'group-hover:text-fg-brand-strong')} />}
    </>
  );
  const row = cn(
    'group flex items-center text-base transition-colors',
    rich ? 'gap-2' : 'gap-1.5',
    cta && 'rounded-base border border-default bg-neutral-secondary-soft p-4',
    disabled ? 'pointer-events-none text-fg-disabled' : 'text-body',
    hover && 'hover:text-heading focus-visible:shadow-focus-brand focus-visible:outline-none',
    hover && cta && 'hover:border-brand-subtle hover:bg-brand-softer active:border-brand-subtle active:bg-brand-softer',
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
