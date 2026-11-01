// AD Design Kit Badge — Figma set "Badge" (node 1146:22250, page 3283:24168).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';

export type BadgeColor = 'gray' | 'white' | 'brand' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'lg';

const colors: Record<BadgeColor, string> = {
  gray: 'bg-neutral-secondary border-default-medium text-heading',
  white: 'bg-neutral-primary-soft border-default text-heading',
  brand: 'bg-brand-softer border-brand-subtle text-fg-brand-strong',
  success: 'bg-success-soft border-success-subtle text-fg-success-strong',
  warning: 'bg-warning-soft border-warning-subtle text-fg-warning',
  danger: 'bg-danger-soft border-danger-subtle text-fg-danger-strong',
};

// Figma "With loader": the Spinner takes the badge's color (gray and white keep the default brand spinner).
const loaderColors: Partial<Record<BadgeColor, string>> = {
  brand: '[&_[data-spinner=track]]:fill-brand-soft',
  success: '[&_[data-spinner=track]]:fill-success-medium [&_[data-spinner=indicator]]:fill-success',
  warning: '[&_[data-spinner=track]]:fill-warning-medium [&_[data-spinner=indicator]]:fill-warning',
  danger: '[&_[data-spinner=track]]:fill-danger-medium [&_[data-spinner=indicator]]:fill-danger',
};

const sizes: Record<BadgeSize, { pill: string; round: string; text: string }> = {
  sm: { pill: 'gap-1 px-1 py-0.5 text-xs leading-4 [&_svg]:size-3', round: 'size-5 text-xs [&_svg]:size-3', text: 'gap-1.5' },
  lg: { pill: 'gap-1.5 px-1.5 py-1 text-sm leading-4 [&_svg]:size-3.5', round: 'size-6 text-xs [&_svg]:size-3.5', text: 'gap-2' },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: BadgeSize;
  /** Figma Type: With dot / With avatar / With loader — pass the element (e.g. <span className="size-1.5 rounded-full bg-brand" />). */
  leading?: ReactNode;
  rightIcon?: ReactNode;
  /** Figma "With secondary text": a value after a divider, e.g. <Badge secondary="Pro">Plan</Badge>. */
  secondary?: ReactNode;
  /** Figma close icon: renders a remove button after the label. */
  onRemove?: () => void;
  /** Accessible name of the remove button. Default: "Remove". */
  removeLabel?: string;
  /** Figma "Only text": round counter of 1–2 characters. */
  circle?: boolean;
  /** Figma "Only icon": round badge holding just an icon (the child). Give it an aria-label so it has a name. */
  iconOnly?: boolean;
}

export function Badge({ color = 'gray', size = 'sm', leading, rightIcon, secondary, onRemove, removeLabel = 'Remove', circle, iconOnly, className, children, ...props }: BadgeProps) {
  // An aria-label needs a role: an icon-only badge is announced as an image with that name.
  const role = props.role ?? (props['aria-label'] ? 'img' : undefined);
  return (
    <span
      role={role}
      className={cn(
        'inline-flex items-center border font-medium',
        circle || iconOnly ? cn('justify-center rounded-full p-0', sizes[size].round) : cn('rounded-sm', sizes[size].pill),
        colors[color],
        loaderColors[color],
        className,
      )}
      {...props}
    >
      {leading}
      {secondary ? (
        <span className={cn('inline-flex items-center', sizes[size].text)}>
          {children}
          <span aria-hidden className="h-3 border-s border-inherit" />
          <span className="font-normal">{secondary}</span>
        </span>
      ) : (
        children
      )}
      {rightIcon}
      {onRemove && (
        <button type="button" aria-label={removeLabel} onClick={onRemove} className="inline-flex rounded-xs focus-visible:shadow-focus-secondary focus-visible:outline-none">
          <CloseIcon />
        </button>
      )}
    </span>
  );
}
