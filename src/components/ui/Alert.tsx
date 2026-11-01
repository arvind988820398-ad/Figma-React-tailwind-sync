// AD Design Kit Alert — Figma set "Alert" (node 1146:15151, page 3284:18927).
// Figma Type → variant: Default = icon + text + dismiss in one row · Complex = title row (icon, title, dismiss),
// full-width text and actions · Small = `pill` with a "New" `badge` and an arrow · Border top = the border-top variant.
// Figma Color Default = `neutral`, Info = `info`.
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';

export type AlertColor = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type AlertVariant = 'default' | 'complex' | 'pill' | 'border-top';

const colors: Record<AlertColor, string> = {
  neutral: 'bg-neutral-secondary-medium border-default-medium text-heading',
  info: 'bg-brand-softer border-brand-subtle text-fg-brand-strong',
  success: 'bg-success-soft border-success-subtle text-fg-success-strong',
  warning: 'bg-warning-soft border-warning-subtle text-fg-warning',
  danger: 'bg-danger-soft border-danger-subtle text-fg-danger-strong',
};

// Fill of the pill's "New" badge (Figma Type = Small).
const badgeColors: Record<AlertColor, string> = {
  neutral: 'bg-neutral-quaternary',
  info: 'bg-brand-soft',
  success: 'bg-success-medium',
  warning: 'bg-warning-medium',
  danger: 'bg-danger-medium',
};

const variants: Record<AlertVariant, string> = {
  default: 'rounded-base border p-4 text-sm leading-5',
  complex: 'rounded-base border p-4 text-sm leading-5',
  pill: 'inline-flex items-center gap-2 rounded-full border py-1 ps-1 pe-2 text-sm leading-5',
  'border-top': 'rounded-none border-0 border-t-4 p-4 text-sm leading-5',
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  color?: AlertColor;
  variant?: AlertVariant;
  icon?: ReactNode;
  title?: ReactNode;
  /** Pill only: the label in the leading badge, e.g. "New". */
  badge?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
}

export function Alert({ color = 'neutral', variant = 'default', icon, title, badge, actions, onDismiss, className, children, ...props }: AlertProps) {
  const role = color === 'danger' ? 'alert' : 'status';
  const iconEl = icon && <span className="inline-flex shrink-0 [&_svg]:size-4" aria-hidden>{icon}</span>;
  const dismiss = onDismiss && (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss"
      className="-m-2 inline-flex size-8 shrink-0 items-center justify-center rounded-base hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none"
    >
      <CloseIcon className="size-4" />
    </button>
  );

  if (variant === 'pill') {
    return (
      <div role={role} className={cn(variants.pill, colors[color], className)} {...props}>
        {badge && <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium leading-4', badgeColors[color])}>{badge}</span>}
        {iconEl}
        {children}
      </div>
    );
  }

  return (
    <div role={role} className={cn(variants[variant], colors[color], className)} {...props}>
      {title ? (
        <>
          <div className="flex items-center gap-2">
            {iconEl}
            <p className="min-w-0 flex-1 text-base font-medium leading-4">{title}</p>
            {dismiss}
          </div>
          <div className="mt-2">{children}</div>
          {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
        </>
      ) : (
        <div className="flex items-start gap-2">
          {iconEl && <span className="mt-0.5 inline-flex shrink-0">{iconEl}</span>}
          <div className="min-w-0 flex-1">
            {children}
            {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
          </div>
          {dismiss && <span className="mt-0.5 inline-flex shrink-0">{dismiss}</span>}
        </div>
      )}
    </div>
  );
}
