// AD Design Kit Banner — Figma set "Banner" (node 1146:21254, page 248:16106).
// Figma Type → props: Default = `centered` + icon (IconShape sm gray circle) + children with an inline link ·
// Icon & link = `centered` + icon (IconShape xs brand square) + link with an arrow · Heading & description =
// title + actions · Newsletter = `centered` + actions holding an inline Input form · Logo + Button = logo + floating.
// Every Figma type has the dismiss button (`onDismiss`).
// Breakpoint variants are responsive classes: content stacks on Mobile with the dismiss button top-right;
// Heading & description keeps its buttons under the text up to Desktop (lg); the floating card swaps the
// dismiss icon for a full-width Tertiary "Close" button on Mobile. Persist dismissal in the app (one banner at a time).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';
import { Button } from './Button';

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  icon?: ReactNode;
  /** Right side: Tertiary xs + Brand xs, a newsletter form, or a Brand sm button. */
  actions?: ReactNode;
  /** Figma "Logo + Button": logo divided from the text. */
  logo?: ReactNode;
  /** Floating card (max-w-5xl, rounded, shadow) instead of a full-width strip. */
  floating?: boolean;
  /** Figma Default, Icon & link and Newsletter: content (and actions) centred in the strip, dismiss on the right. */
  centered?: boolean;
  /** Pin to the top of the viewport. */
  sticky?: boolean;
  onDismiss?: () => void;
}

export function Banner({ title, icon, actions, logo, floating, centered, sticky, onDismiss, className, children, ...props }: BannerProps) {
  const closeButton = floating && onDismiss;
  return (
    <div
      role="region"
      aria-label="Announcement"
      className={cn(
        'flex items-start gap-3 bg-neutral-primary-soft p-4',
        title ? 'lg:items-center' : 'sm:items-center',
        floating ? 'mx-auto w-full max-w-5xl rounded-base border border-default shadow-xs' : 'w-full border-b border-default',
        sticky && 'sticky top-0 z-50',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-3',
          title ? 'lg:flex-row lg:items-center lg:justify-between lg:gap-4' : 'sm:flex-row sm:items-center sm:gap-4',
          centered ? 'sm:justify-center' : 'sm:justify-between',
        )}
      >
        {(logo || icon || title || children) && (
          <div className={cn('flex min-w-0', logo ? 'items-center' : 'items-start sm:items-center', centered ? 'gap-2.5' : 'gap-4')}>
            {logo && <div className="flex shrink-0 items-center border-e border-default pe-4">{logo}</div>}
            {icon && <span className="inline-flex shrink-0 text-body [&>svg]:size-4" aria-hidden>{icon}</span>}
            {(title || children) && (
              <div className="flex min-w-0 flex-col gap-1">
                {title && <p className="text-lg font-medium leading-6 text-heading">{title}</p>}
                {children && (
                  <div className={cn('text-body [&_a]:text-fg-brand [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-fg-brand-strong', floating ? 'text-base' : 'text-sm')}>{children}</div>
                )}
              </div>
            )}
          </div>
        )}
        {(actions || closeButton) && (
          <div className="flex shrink-0 items-center gap-3">
            {actions}
            {closeButton && (
              <Button size="sm" color="tertiary" leftIcon={<CloseIcon />} onClick={onDismiss} className="flex-1 sm:hidden">
                Close
              </Button>
            )}
          </div>
        )}
      </div>
      {onDismiss && (
        <button // ad-design-kit-lint-ignore: Figma dismiss = 32px Ghost icon button, same as Alert/Toast close
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss announcement"
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-base text-heading hover:bg-neutral-secondary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none',
            floating && 'max-sm:hidden',
          )}
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
