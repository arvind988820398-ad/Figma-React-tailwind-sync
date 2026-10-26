// AuxoKit Select — Figma set "Select form" (node 1149:46541, page 3279:34618).
// Native <select> on the Input field shell (Default/base) with a trailing chevron; same size scale and states as Input.
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { inputVariants, type FieldSize, type FieldStatus } from './Input';

// Room for the chevron: size padding + 16/20px icon + 8px gap.
const chevronPad: Record<FieldSize, string> = { sm: 'pe-8.5', base: 'pe-9', lg: 'pe-11', xl: 'pe-12' }; // auxokit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
const chevronPos: Record<FieldSize, string> = { sm: 'pe-2.5 [&_svg]:size-4', base: 'pe-3 [&_svg]:size-4', lg: 'pe-3.5 [&_svg]:size-5', xl: 'pe-4 [&_svg]:size-5' };

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: FieldSize;
  status?: FieldStatus;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ size = 'base', status, className, children, ...props }, ref) {
  const iconColor = status === 'success' ? 'text-fg-success-strong' : status === 'danger' ? 'text-fg-danger-strong' : 'text-body-subtle';
  return (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        aria-invalid={status === 'danger' || undefined}
        className={cn(inputVariants({ size, status }), 'appearance-none', chevronPad[size])}
        {...props}
      >
        {children}
      </select>
      <span className={cn('pointer-events-none absolute inset-y-0 end-0 flex items-center', chevronPos[size], iconColor)} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  );
});
