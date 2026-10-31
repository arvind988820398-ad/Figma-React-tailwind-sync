// AD Design Kit Badge — Figma set "Badge" (node 1146:22250, page 3283:24168).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

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

const sizes: Record<BadgeSize, { pill: string; round: string }> = {
  sm: { pill: 'gap-1 px-1 py-0.5 text-xs leading-4 [&_svg]:size-3', round: 'size-5 text-xs [&_svg]:size-3' },
  lg: { pill: 'gap-1.5 px-1.5 py-1 text-sm leading-4 [&_svg]:size-3.5', round: 'size-6 text-xs [&_svg]:size-3.5' },
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  size?: BadgeSize;
  /** Figma Type: With dot / With avatar / With loader — pass the element (e.g. <span className="size-1.5 rounded-full bg-brand" />). */
  leading?: ReactNode;
  rightIcon?: ReactNode;
  /** Figma "Only text": round counter of 1–2 characters. */
  circle?: boolean;
  /** Figma "Only icon": round badge holding just an icon (the child). Give it an aria-label so it has a name. */
  iconOnly?: boolean;
}

export function Badge({ color = 'gray', size = 'sm', leading, rightIcon, circle, iconOnly, className, children, ...props }: BadgeProps) {
  // An aria-label needs a role: an icon-only badge is announced as an image with that name.
  const role = props.role ?? (props['aria-label'] ? 'img' : undefined);
  return (
    <span
      role={role}
      className={cn(
        'inline-flex items-center border font-medium',
        circle || iconOnly ? cn('justify-center rounded-full p-0', sizes[size].round) : cn('rounded-sm', sizes[size].pill),
        colors[color],
        className,
      )}
      {...props}
    >
      {leading}
      {children}
      {rightIcon}
    </span>
  );
}
