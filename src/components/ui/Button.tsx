// AD Design Kit Button — Figma set "Button" (node 1146:24616, page 2542:21012).
// Variant classes are the exact Figma token bindings; see references/components/actions.md.
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ButtonColor = 'brand' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'dark' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

const base =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-base font-medium shadow-xs transition-colors ' +
  'focus-visible:outline-none disabled:pointer-events-none';

const sizes: Record<ButtonSize, { text: string; icon: string; square: string; iconSvg: string }> = {
  xs: { text: 'px-3 py-1.5 text-xs leading-5', icon: '[&_svg]:size-3.5', square: 'size-8', iconSvg: '[&_svg]:size-4' },
  sm: { text: 'px-3 py-2 text-sm leading-5', icon: '[&_svg]:size-4', square: 'size-9', iconSvg: '[&_svg]:size-4' },
  base: { text: 'px-4 py-2.5 text-sm leading-5', icon: '[&_svg]:size-4', square: 'size-10', iconSvg: '[&_svg]:size-5' },
  lg: { text: 'px-5 py-3 text-base leading-6', icon: '[&_svg]:size-4', square: 'size-12', iconSvg: '[&_svg]:size-5' },
  xl: { text: 'px-6 py-3.5 text-base leading-6', icon: '[&_svg]:size-5', square: 'size-13', iconSvg: '[&_svg]:size-5' },
};

const solidDisabled = 'disabled:border disabled:border-default-medium disabled:bg-disabled disabled:text-fg-disabled';

const colors: Record<ButtonColor, string> = {
  brand: `bg-brand text-white hover:bg-brand-strong focus-visible:bg-brand-strong focus-visible:shadow-focus-brand ${solidDisabled}`,
  secondary:
    'border border-default-medium bg-neutral-secondary-medium text-body hover:bg-neutral-tertiary-medium hover:text-heading ' +
    `focus-visible:bg-neutral-tertiary-medium focus-visible:text-heading focus-visible:shadow-focus-secondary ${solidDisabled}`,
  tertiary:
    'border border-default bg-neutral-primary-soft text-body hover:bg-neutral-secondary-medium hover:text-heading ' +
    `focus-visible:bg-neutral-secondary-soft focus-visible:text-heading focus-visible:shadow-focus-secondary ${solidDisabled}`,
  success: `bg-success text-white hover:bg-success-strong focus-visible:bg-success-strong focus-visible:shadow-focus-success ${solidDisabled}`,
  danger: `bg-danger text-white hover:bg-danger-strong focus-visible:bg-danger-strong focus-visible:shadow-focus-danger ${solidDisabled}`,
  warning: `bg-warning text-white hover:bg-warning-strong focus-visible:bg-warning-strong focus-visible:shadow-focus-warning ${solidDisabled}`,
  dark: `bg-dark text-white hover:bg-dark-strong focus-visible:bg-dark-strong focus-visible:shadow-focus-dark ${solidDisabled}`,
  ghost:
    'bg-transparent text-heading shadow-none hover:bg-neutral-secondary-medium focus-visible:bg-neutral-secondary-medium ' +
    'focus-visible:shadow-focus-secondary disabled:text-fg-disabled',
};

// Figma only defines Outline=True for Success, Danger and Warning.
const outlineColors = {
  success: `border border-success bg-transparent text-fg-success hover:bg-success-strong hover:text-white focus-visible:bg-success-strong focus-visible:text-white focus-visible:shadow-focus-success ${solidDisabled}`,
  danger: `border border-danger bg-transparent text-fg-danger hover:bg-danger-strong hover:text-white focus-visible:bg-danger-strong focus-visible:text-white focus-visible:shadow-focus-danger ${solidDisabled}`,
  warning: `border border-warning bg-transparent text-fg-warning-subtle hover:bg-warning-strong hover:text-white focus-visible:bg-warning-strong focus-visible:text-white focus-visible:shadow-focus-warning ${solidDisabled}`,
} as const;
type OutlineColor = keyof typeof outlineColors;

// The type system enforces the Figma rule: `outline` only with success | danger | warning.
type ColorOptions = { color: OutlineColor; outline: true } | { color?: ButtonColor; outline?: false };

export type ButtonVariantOptions = ColorOptions & {
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
};

export function buttonVariants({ color = 'brand', size = 'base', outline = false, iconOnly = false, className }: ButtonVariantOptions = {}) {
  const s = sizes[size];
  return cn(
    base,
    iconOnly ? cn(s.square, 'p-0', s.iconSvg) : cn(s.text, s.icon),
    outline ? outlineColors[color as OutlineColor] : colors[color],
    className,
  );
}

// Omit<> on a union collapses it; distribute so the outline rule survives into ButtonProps.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> &
  DistributiveOmit<ButtonVariantOptions, 'className'> & {
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { color, size, outline, iconOnly, leftIcon, rightIcon, className, type = 'button', children, ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonVariants({ color, size, outline, iconOnly, className } as ButtonVariantOptions)} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
