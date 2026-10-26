// AuxoKit Input field — Figma set "Input field" (node 1149:46826, page 3279:34618),
// Label (1149:94727) and Helper (1149:94741).
import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type FieldSize = 'sm' | 'base' | 'lg' | 'xl';
export type FieldStatus = 'success' | 'danger';

const sizes: Record<FieldSize, { box: string; withLeft: string; withRight: string; icon: string; iconPos: string }> = {
  sm: { box: 'px-2.5 py-2 text-sm leading-5', withLeft: 'ps-8.5', withRight: 'pe-8.5', icon: '[&_svg]:size-4', iconPos: 'px-2.5' }, // auxokit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
  base: { box: 'px-3 py-2.5 text-sm leading-5', withLeft: 'ps-9', withRight: 'pe-9', icon: '[&_svg]:size-4', iconPos: 'px-3' },
  lg: { box: 'px-3.5 py-3 text-base leading-6', withLeft: 'ps-11', withRight: 'pe-11', icon: '[&_svg]:size-5', iconPos: 'px-3.5' },
  xl: { box: 'px-4 py-3.5 text-base leading-6', withLeft: 'ps-12', withRight: 'pe-12', icon: '[&_svg]:size-5', iconPos: 'px-4' },
};

const statusClasses: Record<'default' | FieldStatus, string> = {
  default:
    'border-default-medium bg-neutral-secondary-medium text-heading placeholder:text-body-subtle ' +
    'focus:border-brand read-only:bg-neutral-tertiary read-only:text-body disabled:text-fg-disabled disabled:placeholder:text-fg-disabled',
  success: 'border-success-subtle bg-success-soft text-fg-success-strong placeholder:text-fg-success-strong',
  danger: 'border-danger-subtle bg-danger-soft text-fg-danger-strong placeholder:text-fg-danger-strong',
};

export function inputVariants({ size = 'base', status }: { size?: FieldSize; status?: FieldStatus } = {}) {
  return cn(
    'block w-full rounded-base border shadow-xs transition-colors',
    'focus:outline-none focus-visible:shadow-focus-brand disabled:cursor-not-allowed',
    sizes[size].box,
    statusClasses[status ?? 'default'],
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: FieldSize;
  status?: FieldStatus;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'base', status, leftIcon, rightIcon, className, ...props },
  ref,
) {
  const s = sizes[size];
  const iconColor = status === 'success' ? 'text-fg-success-strong' : status === 'danger' ? 'text-fg-danger-strong' : 'text-body-subtle';
  const input = (
    <input
      ref={ref}
      aria-invalid={status === 'danger' || undefined}
      className={cn(inputVariants({ size, status }), leftIcon && s.withLeft, rightIcon && s.withRight, !leftIcon && !rightIcon && className)}
      {...props}
    />
  );
  if (!leftIcon && !rightIcon) return input;
  return (
    <div className={cn('relative', className)}>
      {leftIcon && (
        <span className={cn('pointer-events-none absolute inset-y-0 start-0 flex items-center', s.iconPos, iconColor, s.icon)} aria-hidden>
          {leftIcon}
        </span>
      )}
      {input}
      {rightIcon && (
        <span className={cn('absolute inset-y-0 end-0 flex items-center', s.iconPos, iconColor, s.icon)}>{rightIcon}</span>
      )}
    </div>
  );
});

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: ReactNode;
}

export function Label({ required, hint, className, children, ...props }: LabelProps) {
  return (
    <label className={cn('mb-2.5 flex items-center justify-between gap-2 text-sm font-medium leading-5 text-heading', className)} {...props}>
      <span>
        {children}
        {required && <span className="ms-1 text-fg-danger" aria-hidden>*</span>}
      </span>
      {hint && <span className="text-xs font-normal text-body-subtle">{hint}</span>}
    </label>
  );
}

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  status?: FieldStatus;
}

export function HelperText({ status, className, ...props }: HelperTextProps) {
  return (
    <p
      className={cn('mt-2.5 text-xs leading-5', status === 'danger' ? 'text-fg-danger' : status === 'success' ? 'text-fg-success' : 'text-body', className)}
      {...props}
    />
  );
}
