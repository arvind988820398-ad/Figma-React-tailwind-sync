// AD Design Kit Floating label input — Figma set "Floating label" (node 1149:50454, page 1149:50453).
// Figma Type → variant: Default=underline · With background=filled · Bordered=outlined. Built with `peer` +
// placeholder=" ": the label rests inside the field and floats when the field is focused or filled.
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { FieldSize, FieldStatus } from './Input';

export type FloatingLabelVariant = 'underline' | 'filled' | 'outlined';

const shells: Record<FloatingLabelVariant, string> = {
  underline: 'rounded-none border-0 border-b-2 bg-transparent px-0',
  filled: 'rounded-t-lg border-0 border-b-2 bg-neutral-secondary-medium px-2.5',
  outlined: 'rounded-base border bg-neutral-primary px-2.5 disabled:bg-neutral-secondary-medium',
};

// underline / outlined use the control size scale; filled leaves room for the floated label inside the box.
const sizes: Record<FloatingLabelVariant, Record<FieldSize, string>> = {
  underline: { sm: 'py-2 text-sm', base: 'py-2.5 text-sm', lg: 'py-3 text-base', xl: 'py-3.5 text-base' },
  outlined: { sm: 'py-2 text-sm', base: 'py-2.5 text-sm', lg: 'py-3 text-base', xl: 'py-3.5 text-base' },
  filled: { sm: 'pt-4 pb-1.5 text-sm', base: 'pt-5 pb-2 text-sm', lg: 'pt-6 pb-2.5 text-base', xl: 'pt-7 pb-3 text-base' },
};

// Floated position per variant; resting position (placeholder shown, not focused) is centered.
const floated: Record<FloatingLabelVariant, string> = {
  underline: 'top-0 -translate-y-3/4 scale-75 peer-focus:top-0 peer-focus:-translate-y-3/4 peer-focus:scale-75',
  filled: 'start-2.5 top-1 translate-y-0 scale-75 peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75',
  outlined:
    'start-1.5 top-0 -translate-y-1/2 scale-75 bg-neutral-primary px-1 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-75 ' +
    'peer-disabled:bg-neutral-secondary-medium',
};
const resting: Record<FloatingLabelVariant, string> = {
  underline: 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100',
  filled: 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100',
  outlined: 'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100',
};

const statusClasses: Record<'default' | FieldStatus, { input: string; label: string }> = {
  default: {
    input: 'border-default-medium text-heading focus:border-brand read-only:text-body disabled:text-fg-disabled',
    label: 'text-body-subtle peer-focus:text-fg-brand peer-disabled:text-fg-disabled',
  },
  success: { input: 'border-success-subtle text-fg-success-strong', label: 'text-fg-success-strong' },
  danger: { input: 'border-danger-subtle text-fg-danger-strong', label: 'text-fg-danger-strong' },
};

export interface FloatingLabelInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'> {
  label: ReactNode;
  variant?: FloatingLabelVariant;
  size?: FieldSize;
  status?: FieldStatus;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(function FloatingLabelInput(
  { label, variant = 'outlined', size = 'base', status, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const s = statusClasses[status ?? 'default'];
  return (
    <div className={cn('relative', variant === 'underline' && 'pt-3', className)}>
      <input
        ref={ref}
        id={inputId}
        placeholder=" "
        aria-invalid={status === 'danger' || undefined}
        className={cn(
          'peer block w-full appearance-none leading-5 transition-colors focus:outline-none disabled:cursor-not-allowed',
          variant === 'outlined' && 'focus-visible:shadow-focus-brand',
          shells[variant],
          sizes[variant][size],
          s.input,
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'pointer-events-none absolute start-0 origin-top-left text-sm leading-5 transition-all duration-200 rtl:origin-top-right',
          variant === 'underline' && 'mt-1.5',
          floated[variant],
          resting[variant],
          s.label,
        )}
      >
        {label}
      </label>
    </div>
  );
});
