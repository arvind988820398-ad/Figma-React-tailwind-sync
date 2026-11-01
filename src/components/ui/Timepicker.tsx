// AD Design Kit Timepicker — Figma "Timepicker form" (node 1149:52636, page 1149:52187), input 1149:52243, menus 1149:52665.
// <TimeInput> = Timepicker input (native type="time" on the Input field shell with a clock icon; `addon` joins a
// bg-neutral-tertiary icon segment; `icon` swaps the clock, e.g. for an angle-down; `clearable` adds the Range clear button). <TimeSlots> = slot menu (selected slot bg-brand text-white). Prefer TimeInput
// unless a slot UI is required.
import { forwardRef, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { ClockIcon, CloseIcon } from '../icons';
import { inputVariants, type FieldSize, type FieldStatus } from './Input';

export interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: FieldSize;
  status?: FieldStatus;
  /** Figma "Left add-on" / "Right add-on": the clock sits in a joined segment instead of inside the field. */
  addon?: 'start' | 'end';
  /** Icon inside the field (default: clock). Figma "With Dropdown" / "With button" use an angle-down. */
  icon?: ReactNode;
  /** Side of the icon inside the field (default end). `clearable` puts it at the start. */
  iconPosition?: 'start' | 'end';
  /** Trailing clear button (Figma Range fields). */
  clearable?: boolean;
  onClear?: () => void;
}

const iconPos: Record<FieldSize, { start: string; end: string }> = {
  sm: { start: 'ps-2.5', end: 'pe-2.5' },
  base: { start: 'ps-3', end: 'pe-3' },
  lg: { start: 'ps-3.5', end: 'pe-3.5' },
  xl: { start: 'ps-4', end: 'pe-4' },
};
// Room for a 16px (sm, base) or 20px (lg, xl) icon plus the 8px gap.
const iconPad: Record<FieldSize, { start: string; end: string }> = {
  sm: { start: 'ps-8.5', end: 'pe-8.5' }, // ad-design-kit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
  base: { start: 'ps-9', end: 'pe-9' },
  lg: { start: 'ps-11', end: 'pe-11' },
  xl: { start: 'ps-12', end: 'pe-12' },
};

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput(
  { size = 'base', status, addon, icon = <ClockIcon />, iconPosition, clearable, onClear, className, ...props },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!);
  const side = clearable ? 'start' : (iconPosition ?? 'end');
  const tone = status === 'success' ? 'text-fg-success-strong' : status === 'danger' ? 'text-fg-danger-strong' : 'text-heading';

  const input = (extra?: string) => (
    <input
      ref={inputRef}
      type="time"
      aria-invalid={status === 'danger' || undefined}
      // Hide the browser's own clock button; the AD Design Kit icon replaces it.
      className={cn(inputVariants({ size, status }), '[&::-webkit-calendar-picker-indicator]:hidden', extra)}
      {...props}
    />
  );
  if (addon) {
    const segment = (
      <span
        className={cn(
          'flex shrink-0 items-center border border-default-medium bg-neutral-tertiary px-2.5 text-body [&_svg]:size-4',
          addon === 'start' ? 'rounded-s-base border-e-0' : 'rounded-e-base border-s-0',
        )}
        aria-hidden
      >
        {icon}
      </span>
    );
    return (
      <div className={cn('flex rounded-base shadow-xs', className)}>
        {addon === 'start' && segment}
        {input(cn('shadow-none', addon === 'start' ? 'rounded-s-none' : 'rounded-e-none'))}
        {addon === 'end' && segment}
      </div>
    );
  }

  const clear = () => {
    const el = inputRef.current;
    if (!el) return;
    // Use the native setter so React sees the change and calls onChange, controlled or not.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
    onClear?.();
  };

  return (
    <div className={cn('group relative', className)}>
      {input(cn(iconPad[size][side], clearable && iconPad[size].end))}
      <span
        className={cn(
          'pointer-events-none absolute inset-y-0 flex items-center group-focus-within:text-fg-brand',
          size === 'lg' || size === 'xl' ? '[&_svg]:size-5' : '[&_svg]:size-4',
          side === 'start' ? 'start-0' : 'end-0',
          iconPos[size][side],
          props.disabled ? 'text-fg-disabled' : tone,
        )}
        aria-hidden
      >
        {icon}
      </span>
      {clearable && !props.disabled && !props.readOnly && (
        <button
          type="button"
          aria-label="Clear time"
          onClick={clear}
          className={cn(
            'absolute inset-y-0 end-0 my-auto flex h-fit items-center rounded-xs text-heading hover:text-body focus-visible:shadow-focus-secondary focus-visible:outline-none',
            size === 'lg' || size === 'xl' ? '[&_svg]:size-5' : '[&_svg]:size-4',
            iconPos[size].end,
          )}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
});

export interface TimeSlotsProps {
  slots: string[];
  value: string | null;
  onChange: (slot: string) => void;
  /** Slots that are already taken. */
  unavailable?: string[];
  label: string;
  /** Optional header row ("Advanced" menus). */
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

/** Figma "Timepicker dropdown menus" slot list. Rendered inline; put it in a Popover or Dropdown when needed. */
export function TimeSlots({ slots, value, onChange, unavailable = [], label, title, columns = 3, className }: TimeSlotsProps) {
  const name = useId();
  return (
    <fieldset className={cn('flex flex-col gap-4 rounded-base border border-default-medium bg-neutral-primary-medium p-4 shadow-lg', className)}>
      <legend className="sr-only">{label}</legend>
      {title && <p className="border-b border-default-medium pb-3 text-sm font-semibold text-heading">{title}</p>}
      <div className={cn('grid gap-2', columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
        {slots.map((slot) => {
          const taken = unavailable.includes(slot);
          return (
            <label key={slot} className={cn('relative', taken ? 'cursor-not-allowed' : 'cursor-pointer')}>
              <input type="radio" name={name} value={slot} checked={value === slot} disabled={taken} onChange={() => onChange(slot)} className="peer sr-only" />
              <span
                className={cn(
                  'flex items-center justify-center rounded-base px-2 py-2.5 text-base font-semibold leading-4 transition-colors',
                  'peer-focus-visible:shadow-focus-brand peer-checked:bg-brand peer-checked:text-white peer-checked:hover:bg-brand',
                  taken ? 'text-fg-disabled line-through' : 'text-heading hover:bg-neutral-tertiary-medium',
                )}
              >
                {slot}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
