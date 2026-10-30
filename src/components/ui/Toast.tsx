// AD Design Kit Toast — Figma set "Toast" (node 1149:93975, page 3337:16705).
// Figma types map to props: Icon & text / Icon shape & text = icon + children; Icon shape & buttons / With progress bar /
// With illustration / Avatar & button = title + actions (+ children); With header = header; Warning / Error = color.
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ToastColor = 'neutral' | 'warning' | 'danger';

const colors: Record<ToastColor, { box: string; icon: string; title: string; body: string }> = {
  neutral: { box: 'border-default-medium bg-neutral-primary-medium', icon: 'text-fg-brand', title: 'text-heading', body: 'text-body' },
  warning: { box: 'border-warning-subtle bg-warning-soft', icon: 'text-fg-warning', title: 'text-fg-warning', body: 'text-fg-warning' },
  danger: { box: 'border-danger-subtle bg-danger-soft', icon: 'text-fg-danger-strong', title: 'text-fg-danger-strong', body: 'text-fg-danger-strong' },
};

export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  color?: ToastColor;
  /** Leading icon, IconShape or Avatar. */
  icon?: ReactNode;
  title?: ReactNode;
  /** Figma "With header": small header row with a timestamp. */
  header?: { title: ReactNode; time?: ReactNode };
  actions?: ReactNode;
  onDismiss?: () => void;
  /** Auto-dismiss after this many ms (paused while hovered). Needs onDismiss. */
  duration?: number;
}

export function Toast({ color = 'neutral', icon, title, header, actions, onDismiss, duration, className, children, ...props }: ToastProps) {
  const c = colors[color];
  const timer = useRef<number | undefined>(undefined);
  const start = () => {
    if (duration && onDismiss) timer.current = window.setTimeout(onDismiss, duration);
  };
  const stop = () => window.clearTimeout(timer.current);

  useEffect(() => {
    start();
    return stop;
    // Restart only when the timing inputs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, onDismiss]);

  const rich = !!(title || header || actions);
  const dismiss = onDismiss && (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Close"
      className="-m-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-base text-heading hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none"
    >
      <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
      </svg>
    </button>
  );

  return (
    <div
      role={color === 'danger' ? 'alert' : 'status'}
      onMouseEnter={stop}
      onMouseLeave={start}
      className={cn('w-80 max-w-full rounded-base border shadow-lg', header ? 'p-3' : 'p-4', c.box, className)}
      {...props}
    >
      {header && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-heading">{header.title}</span>
          <span className="flex items-center gap-3">
            {header.time && <span className="text-xs text-fg-brand">{header.time}</span>}
            {dismiss}
          </span>
        </div>
      )}
      <div className={cn('flex gap-3', rich ? 'items-start' : 'items-center gap-2.5')}>
        {icon && <span className={cn('inline-flex shrink-0 [&>svg]:size-5', c.icon)} aria-hidden>{icon}</span>}
        <div className={cn('min-w-0 flex-1 text-sm', c.body)}>
          {title && <p className={cn('mb-1.5 text-base font-semibold leading-6', c.title)}>{title}</p>}
          {children}
          {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
        </div>
        {!header && dismiss}
      </div>
    </div>
  );
}

/** Fixed stack for toasts; one placement app-wide (bottom-end by default). */
export function ToastViewport({ placement = 'bottom-end', className, ...props }: HTMLAttributes<HTMLDivElement> & { placement?: 'bottom-end' | 'top-end' }) {
  return (
    <div
      aria-live="polite"
      className={cn('fixed end-5 z-60 flex flex-col gap-3', placement === 'top-end' ? 'top-5' : 'bottom-5', className)}
      {...props}
    />
  );
}
