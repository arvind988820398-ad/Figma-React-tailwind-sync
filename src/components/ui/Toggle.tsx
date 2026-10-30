// AD Design Kit Toggle — Figma set "Toggle switches" (node 1149:54432, page 1149:54431).
import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type ToggleSize = 'base' | 'lg';

const sizes: Record<ToggleSize, { track: string; knob: string; on: string }> = {
  base: { track: 'h-5 w-9', knob: 'size-4', on: 'translate-x-4' },
  lg: { track: 'h-6 w-11', knob: 'size-5', on: 'translate-x-5' },
};

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: ToggleSize;
  /** Visible label; omit only when an external <label> or aria-label is provided. */
  children?: ReactNode;
  description?: ReactNode;
}

export function Toggle({ checked, onCheckedChange, size = 'base', disabled, children, description, className, id, ...props }: ToggleProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const s = sizes[size];
  const control = (
    <button
      id={switchId}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full border p-px transition-colors',
        'focus-visible:outline-none focus-visible:shadow-focus-brand disabled:cursor-not-allowed',
        s.track,
        disabled
          ? 'border-light-medium bg-neutral-tertiary-medium'
          : checked
            ? 'border-brand-light bg-brand'
            : 'border-default-strong bg-neutral-tertiary-medium',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'rounded-full shadow-xs transition-transform',
          s.knob,
          disabled ? 'bg-neutral-secondary-soft' : 'bg-white',
          checked && s.on,
        )}
      />
    </button>
  );
  if (!children) return control;
  return (
    <div className="flex items-start gap-3">
      {control}
      <div className="text-sm">
        <label htmlFor={switchId} className={cn('font-medium', disabled ? 'text-fg-disabled' : 'text-heading')}>{children}</label>
        {description && <p className="text-body">{description}</p>}
      </div>
    </div>
  );
}
