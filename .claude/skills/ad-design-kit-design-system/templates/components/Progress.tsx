// AD Design Kit Progress — Figma sets "Progress Bars" (node 1149:82279) and "Bars" (1149:82364), page 3283:24173.
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ProgressColor = 'brand' | 'gray' | 'dark' | 'success' | 'danger' | 'warning';

const fills: Record<ProgressColor, string> = {
  brand: 'bg-brand', gray: 'bg-gray', dark: 'bg-dark', success: 'bg-success', danger: 'bg-danger', warning: 'bg-warning',
};

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0–100
  color?: ProgressColor;
  size?: 'base' | 'lg';
  label?: ReactNode;
  labelPosition?: 'top' | 'side' | 'bottom';
  showValue?: boolean;
}

export function Progress({ value, color = 'brand', size = 'base', label, labelPosition = 'top', showValue = true, className, ...props }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  const bar = (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={typeof label === 'string' ? label : undefined}
      className={cn('w-full overflow-hidden rounded-base bg-neutral-quaternary', size === 'lg' ? 'h-2.5' : 'h-1.5')}
    >
      <div className={cn('h-full rounded-base transition-[width]', fills[color])} style={{ width: `${pct}%` }} />
    </div>
  );
  const meta = (label || showValue) && (
    <div className="flex items-center justify-between gap-3 text-xs font-medium leading-4 text-body">
      {label && <span>{label}</span>}
      {showValue && <span>{pct}%</span>}
    </div>
  );
  return (
    <div className={cn(labelPosition === 'side' ? 'flex items-center gap-1.5' : 'flex flex-col gap-1.5', className)} {...props}>
      {labelPosition !== 'bottom' && meta}
      {bar}
      {labelPosition === 'bottom' && meta}
    </div>
  );
}
