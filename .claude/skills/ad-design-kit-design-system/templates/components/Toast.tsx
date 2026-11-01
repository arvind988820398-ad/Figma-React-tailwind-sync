// AD Design Kit Toast — Figma set "Toast" (node 1149:93975, page 3337:16705).
// Figma types map to props: Icon & text / Icon shape & text = icon + children; Icon shape & buttons / With illustration /
// Avatar & button = title + actions (+ children); With progress bar = `stacked` (icon above the text); With header = header;
// Warning / Error = color (no dismiss button in Figma).
import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';

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
  /** Figma "With header": a filled header bar; `time` shows under the message. */
  header?: { title: ReactNode; time?: ReactNode };
  /** Figma "With progress bar": icon above the text instead of beside it. */
  stacked?: boolean;
  actions?: ReactNode;
  onDismiss?: () => void;
  /** Auto-dismiss after this many ms (paused while hovered). Needs onDismiss. */
  duration?: number;
}

export function Toast({ color = 'neutral', icon, title, header, stacked, actions, onDismiss, duration, className, children, ...props }: ToastProps) {
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
      <CloseIcon className="size-4" />
    </button>
  );

  return (
    <div
      role={color === 'danger' ? 'alert' : 'status'}
      onMouseEnter={stop}
      onMouseLeave={start}
      className={cn('relative w-80 max-w-full rounded-base border shadow-lg', header ? 'p-3' : 'p-4', c.box, className)}
      {...props}
    >
      {header && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-sm bg-neutral-secondary-strong px-2.5 py-2">
          <span className="text-sm font-medium leading-4 text-heading">{header.title}</span>
          {dismiss}
        </div>
      )}
      <div className={cn('flex', stacked ? 'flex-col gap-3.5' : rich ? 'items-start gap-3' : 'items-center gap-2.5')}>
        {icon && <span className={cn('inline-flex shrink-0 [&>svg]:size-5', c.icon)} aria-hidden>{icon}</span>}
        <div className={cn('min-w-0 flex-1 text-sm', c.body)}>
          {title && <p className={cn('mb-2 text-base font-semibold leading-4', c.title)}>{title}</p>}
          {children}
          {header?.time && <p className="mt-1 text-xs text-fg-brand">{header.time}</p>}
          {actions && <div className={cn('flex flex-wrap gap-3', header ? 'mt-4' : stacked ? 'mt-3.5' : 'mt-3')}>{actions}</div>}
        </div>
        {!header && !stacked && dismiss}
      </div>
      {stacked && dismiss && <span className="absolute end-4 top-4 inline-flex">{dismiss}</span>}
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
