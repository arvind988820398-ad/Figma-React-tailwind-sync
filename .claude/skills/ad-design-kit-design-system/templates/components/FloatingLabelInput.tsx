// AD Design Kit Floating label input — Figma set "Floating label" (node 1149:50454, page 1149:50453).
// Figma Type → variant: Default=underline · With background=filled · Bordered=outlined. Built with `peer` +
// placeholder=" ": the label rests inside the field (after the icon) and floats, at full text-sm, when the field is
// focused or filled — to a 20px row above the field (underline, filled) or onto the border (outlined).
// Figma shows a leading icon (`icon`) and a trailing clear button (`clearable`) on every variant.
import { forwardRef, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CloseIcon } from '../icons';
import type { FieldSize, FieldStatus } from './Input';

export type FloatingLabelVariant = 'underline' | 'filled' | 'outlined';

// Field row: Figma heights 36 / 40 / 48 / 52; text 14/20 (sm, base) and 16/24 (lg, xl); icons 16 / 20.
const fieldSizes: Record<FieldSize, { pad: string; text: string; icon: string }> = {
  sm: { pad: 'py-2 px-2', text: 'text-sm leading-5', icon: '[&_svg]:size-4' },
  base: { pad: 'py-2.5 px-2.5', text: 'text-sm leading-5', icon: '[&_svg]:size-4' },
  lg: { pad: 'py-3 px-3', text: 'text-base leading-6', icon: '[&_svg]:size-5' },
  xl: { pad: 'py-3.5 px-3.5', text: 'text-base leading-6', icon: '[&_svg]:size-5' },
};

const shells: Record<FloatingLabelVariant, string> = {
  underline: 'rounded-none border-b-2 bg-transparent px-0',
  filled: 'rounded-lg border-b-2 has-focus:rounded-t-none not-has-placeholder-shown:rounded-t-none',
  outlined: 'rounded-base border bg-neutral-primary has-focus-visible:shadow-focus-brand has-disabled:bg-neutral-secondary-medium',
};

// Resting label: vertically centred in the field row (below the 20px label row for underline/filled), after the icon.
const restTop: Record<FloatingLabelVariant, Record<FieldSize, string>> = {
  underline: { sm: 'peer-placeholder-shown:top-7', base: 'peer-placeholder-shown:top-7.5', lg: 'peer-placeholder-shown:top-8.5', xl: 'peer-placeholder-shown:top-9' }, // ad-design-kit-lint-ignore: label-row 20px + field padding (+2px for 24px lines) and icon offsets
  filled: { sm: 'peer-placeholder-shown:top-7', base: 'peer-placeholder-shown:top-7.5', lg: 'peer-placeholder-shown:top-8.5', xl: 'peer-placeholder-shown:top-9' }, // ad-design-kit-lint-ignore: label-row 20px + field padding (+2px for 24px lines) and icon offsets
  outlined: { sm: 'peer-placeholder-shown:top-2', base: 'peer-placeholder-shown:top-2.5', lg: 'peer-placeholder-shown:top-3.5', xl: 'peer-placeholder-shown:top-4' },
};
const restStart: Record<'icon' | 'plain', Record<'flush' | 'padded', Record<FieldSize, string>>> = {
  icon: {
    flush: { sm: 'peer-placeholder-shown:start-6', base: 'peer-placeholder-shown:start-6', lg: 'peer-placeholder-shown:start-7', xl: 'peer-placeholder-shown:start-7' },
    padded: { sm: 'peer-placeholder-shown:start-8', base: 'peer-placeholder-shown:start-8.5', lg: 'peer-placeholder-shown:start-10', xl: 'peer-placeholder-shown:start-10.5' }, // ad-design-kit-lint-ignore: label-row 20px + field padding (+2px for 24px lines) and icon offsets
  },
  plain: {
    flush: { sm: 'peer-placeholder-shown:start-0', base: 'peer-placeholder-shown:start-0', lg: 'peer-placeholder-shown:start-0', xl: 'peer-placeholder-shown:start-0' },
    padded: { sm: 'peer-placeholder-shown:start-2', base: 'peer-placeholder-shown:start-2.5', lg: 'peer-placeholder-shown:start-3', xl: 'peer-placeholder-shown:start-3.5' },
  },
};

// Floated label; `peer-focus:` repeats it so focus wins over the resting `peer-placeholder-shown:` classes.
const floated: Record<FloatingLabelVariant, string> = {
  underline: 'top-0 start-0 peer-focus:top-0 peer-focus:start-0',
  filled:
    'top-0 start-0 end-0 rounded-t-lg bg-neutral-secondary-medium px-2.5 peer-placeholder-shown:end-auto peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 ' +
    'peer-focus:top-0 peer-focus:start-0 peer-focus:end-0 peer-focus:bg-neutral-secondary-medium peer-focus:px-2.5',
  outlined:
    'top-0 start-1.5 -translate-y-1/2 bg-neutral-primary px-1 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:px-0 ' +
    'peer-focus:top-0 peer-focus:start-1.5 peer-focus:-translate-y-1/2 peer-focus:px-1',
};

const statusClasses: Record<'default' | FieldStatus, { field: string; input: string; label: string; icon: string }> = {
  default: {
    field: 'border-default-medium focus-within:border-brand',
    input: 'text-heading read-only:text-body disabled:text-fg-disabled',
    label: 'text-body peer-placeholder-shown:text-body-subtle peer-focus:text-fg-brand peer-disabled:text-fg-disabled',
    icon: 'text-body',
  },
  success: { field: 'border-success-subtle', input: 'text-fg-success-strong', label: 'text-fg-success-strong', icon: 'text-fg-success-strong' },
  danger: { field: 'border-danger-subtle', input: 'text-fg-danger-strong', label: 'text-fg-danger-strong', icon: 'text-fg-danger-strong' },
};
const filledFill: Record<'default' | FieldStatus, string> = {
  default: 'bg-neutral-secondary-medium',
  success: 'bg-success-soft',
  danger: 'bg-danger-soft',
};

const filledLabelFill: Record<FieldStatus, string> = {
  success: 'bg-success-soft peer-focus:bg-success-soft',
  danger: 'bg-danger-soft peer-focus:bg-danger-soft',
};

export interface FloatingLabelInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'> {
  label: ReactNode;
  variant?: FloatingLabelVariant;
  size?: FieldSize;
  status?: FieldStatus;
  /** Leading icon (Figma: user). */
  icon?: ReactNode;
  /** Trailing clear button (Figma: close). Clears the value and fires onChange. */
  clearable?: boolean;
  onClear?: () => void;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(function FloatingLabelInput(
  { label, variant = 'outlined', size = 'base', status, icon, clearable, onClear, id, className, disabled, readOnly, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);
  const s = statusClasses[status ?? 'default'];
  const z = fieldSizes[size];

  const clear = () => {
    const input = inputRef.current;
    if (!input) return;
    // Use the native setter so React sees the change and calls onChange, controlled or not.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
    onClear?.();
  };

  return (
    <div className={cn('relative', variant !== 'outlined' && 'pt-5', className)}>
      <div
        className={cn(
          'flex items-center gap-2 transition-colors',
          z.pad,
          shells[variant],
          variant === 'filled' && filledFill[status ?? 'default'],
          s.field,
        )}
      >
        {icon && <span className={cn('inline-flex shrink-0', z.icon, disabled ? 'text-fg-disabled' : s.icon)} aria-hidden>{icon}</span>}
        <input
          ref={inputRef}
          id={inputId}
          placeholder=" "
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={status === 'danger' || undefined}
          className={cn('peer block w-full min-w-0 appearance-none bg-transparent focus:outline-none disabled:cursor-not-allowed', z.text, s.input)}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute text-sm leading-5 transition-all duration-200',
            size === 'lg' || size === 'xl' ? 'peer-placeholder-shown:text-base peer-focus:text-sm' : '',
            floated[variant],
            variant === 'filled' && status && filledLabelFill[status],
            restTop[variant][size],
            restStart[icon ? 'icon' : 'plain'][variant === 'underline' ? 'flush' : 'padded'][size],
            s.label,
          )}
        >
          {label}
        </label>
        {clearable && !disabled && !readOnly && (
          <button
            type="button"
            aria-label="Clear"
            onClick={clear}
            className={cn('inline-flex shrink-0 items-center justify-center rounded-xs text-heading hover:text-body focus-visible:shadow-focus-secondary focus-visible:outline-none', z.icon)}
          >
            <CloseIcon />
          </button>
        )}
        {clearable && (disabled || readOnly) && (
          <span className={cn('inline-flex shrink-0', z.icon, disabled ? 'text-fg-disabled' : 'text-heading')} aria-hidden>
            <CloseIcon />
          </span>
        )}
      </div>
    </div>
  );
});
