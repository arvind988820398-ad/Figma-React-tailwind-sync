// AuxoKit Banner — Figma set "Banner" (node 1146:21254, page 248:16106).
// Figma Type → props: Default = children with an inline link · Icon & link = icon + link · Heading & description =
// title + actions · Newsletter = actions holding an Input form · Logo + Button = logo + floating.
// Breakpoint variants are responsive classes. Persist dismissal in the app (one banner at a time).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  icon?: ReactNode;
  /** Right side: Tertiary xs + Brand xs, a newsletter form, or a Brand sm button. */
  actions?: ReactNode;
  /** Figma "Logo + Button": logo divided from the text. */
  logo?: ReactNode;
  /** Floating card (max-w-5xl, rounded, shadow) instead of a full-width strip. */
  floating?: boolean;
  /** Pin to the top of the viewport. */
  sticky?: boolean;
  onDismiss?: () => void;
}

export function Banner({ title, icon, actions, logo, floating, sticky, onDismiss, className, children, ...props }: BannerProps) {
  return (
    <div
      role="region"
      aria-label="Announcement"
      className={cn(
        'flex flex-col gap-3 bg-neutral-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
        floating ? 'mx-auto w-full max-w-5xl rounded-base border border-default shadow-xs' : 'w-full border-b border-default',
        sticky && 'sticky top-0 z-50',
        className,
      )}
      {...props}
    >
      <div className={cn('flex min-w-0 items-center gap-4', floating && logo && 'gap-4')}>
        {logo && <div className="flex shrink-0 items-center border-e border-default pe-4">{logo}</div>}
        {icon && <span className="inline-flex shrink-0 text-body [&_svg]:size-4" aria-hidden>{icon}</span>}
        <div className="flex min-w-0 flex-col gap-1">
          {title && <p className="text-lg font-medium leading-6 text-heading">{title}</p>}
          <div className={cn('text-body [&_a]:font-medium [&_a]:text-fg-brand [&_a]:underline-offset-2 [&_a:hover]:underline', floating ? 'text-base' : 'text-sm')}>{children}</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {actions}
        {onDismiss && (
          <button // auxokit-lint-ignore: Figma dismiss = 32px Ghost icon button, same as Alert/Toast close
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss announcement"
            className="inline-flex size-8 items-center justify-center rounded-base text-heading hover:bg-neutral-secondary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
