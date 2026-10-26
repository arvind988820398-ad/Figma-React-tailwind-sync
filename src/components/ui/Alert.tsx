// AuxoKit Alert — Figma set "Alert" (node 1146:15151, page 3284:18927).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type AlertColor = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type AlertVariant = 'default' | 'complex' | 'pill' | 'border-top';

const colors: Record<AlertColor, string> = {
  neutral: 'bg-neutral-secondary-medium border-default-medium text-heading',
  info: 'bg-brand-softer border-brand-subtle text-fg-brand-strong',
  success: 'bg-success-soft border-success-subtle text-fg-success-strong',
  warning: 'bg-warning-soft border-warning-subtle text-fg-warning',
  danger: 'bg-danger-soft border-danger-subtle text-fg-danger-strong',
};

const variants: Record<AlertVariant, string> = {
  default: 'flex items-start gap-3 rounded-base border p-4 text-sm leading-5',
  complex: 'flex items-start gap-3 rounded-base border p-4 text-sm leading-5',
  pill: 'inline-flex items-center gap-2 rounded-full border py-1 ps-1 pe-2 text-sm',
  'border-top': 'flex items-start gap-3 rounded-none border-0 border-t-4 p-4 text-sm leading-5',
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  color?: AlertColor;
  variant?: AlertVariant;
  icon?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
}

export function Alert({ color = 'neutral', variant = 'default', icon, title, actions, onDismiss, className, children, ...props }: AlertProps) {
  return (
    <div role={color === 'danger' ? 'alert' : 'status'} className={cn(variants[variant], colors[color], className)} {...props}>
      {icon && <span className="mt-0.5 shrink-0 [&_svg]:size-4" aria-hidden>{icon}</span>}
      <div className="min-w-0 flex-1">
        {title && <p className="text-base font-medium">{title}</p>}
        <div className={cn(title && 'mt-1.5')}>{children}</div>
        {actions && <div className="mt-3 flex gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-base hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
