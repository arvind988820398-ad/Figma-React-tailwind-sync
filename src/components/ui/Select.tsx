// AD Design Kit Select — Figma set "Select form" (node 1149:46541, page 3279:34618).
// Native <select> on the Input field shell (Default/base) with a trailing chevron; same size scale and states as Input.
// `leftIcon` = Figma's leading icon (e.g. "server" in the 2 inputs type). Joined types compose with <InputGroup>.
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { AngleDownIcon } from '../icons';
import { inputVariants, type FieldSize, type FieldStatus } from './Input';

// Room for the chevron: size padding + 16/20px icon + 8px gap.
const chevronPad: Record<FieldSize, string> = { sm: 'pe-8.5', base: 'pe-9', lg: 'pe-11', xl: 'pe-12' }; // ad-design-kit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
const chevronPos: Record<FieldSize, string> = { sm: 'pe-2.5 [&_svg]:size-4', base: 'pe-3 [&_svg]:size-4', lg: 'pe-3.5 [&_svg]:size-5', xl: 'pe-4 [&_svg]:size-5' };
const iconPad: Record<FieldSize, string> = { sm: 'ps-8.5', base: 'ps-9', lg: 'ps-11', xl: 'ps-12' }; // ad-design-kit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
const iconPos: Record<FieldSize, string> = { sm: 'ps-2.5 [&_svg]:size-4', base: 'ps-3 [&_svg]:size-4', lg: 'ps-3.5 [&_svg]:size-5', xl: 'ps-4 [&_svg]:size-5' };

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: FieldSize;
  status?: FieldStatus;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ size = 'base', status, leftIcon, className, children, ...props }, ref) {
  const iconColor = status === 'success' ? 'text-fg-success-strong' : status === 'danger' ? 'text-fg-danger-strong' : 'text-body-subtle';
  return (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        aria-invalid={status === 'danger' || undefined}
        className={cn(inputVariants({ size, status }), 'appearance-none', chevronPad[size], leftIcon && iconPad[size])}
        {...props}
      >
        {children}
      </select>
      {leftIcon && (
        <span className={cn('pointer-events-none absolute inset-y-0 start-0 flex items-center', iconPos[size], iconColor)} aria-hidden>
          {leftIcon}
        </span>
      )}
      <span className={cn('pointer-events-none absolute inset-y-0 end-0 flex items-center', chevronPos[size], iconColor)} aria-hidden>
        <AngleDownIcon />
      </span>
    </div>
  );
});
