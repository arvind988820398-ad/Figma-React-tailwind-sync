// AuxoKit Icon Shape — Figma set "Icon Shape" (node 1149:56578, page 1149:56577).
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type IconShapeSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type IconShapeColor = 'brand' | 'success' | 'danger' | 'warning' | 'gray' | 'dark' | 'white';

const sizes: Record<IconShapeSize, string> = {
  xs: 'size-4 [&_svg]:size-2.5',
  sm: 'size-6 [&_svg]:size-4',
  base: 'size-9 [&_svg]:size-5',
  lg: 'size-12 [&_svg]:size-7',
  xl: 'size-16 [&_svg]:size-9',
  '2xl': 'size-24 [&_svg]:size-14',
};

const colors: Record<IconShapeColor, string> = {
  brand: 'bg-brand-softer text-fg-brand',
  success: 'bg-success-soft text-fg-success-strong',
  danger: 'bg-danger-soft text-fg-danger-strong',
  warning: 'bg-warning-soft text-fg-warning',
  gray: 'bg-neutral-tertiary text-body',
  dark: 'bg-dark text-white',
  white: 'border border-default-medium bg-neutral-primary-medium text-body',
};

export interface IconShapeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: IconShapeSize;
  color?: IconShapeColor;
  shape?: 'square' | 'circle';
}

export function IconShape({ size = 'base', color = 'brand', shape = 'square', className, ...props }: IconShapeProps) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center', shape === 'circle' ? 'rounded-full' : 'rounded-base', sizes[size], colors[color], className)}
      {...props}
    />
  );
}
