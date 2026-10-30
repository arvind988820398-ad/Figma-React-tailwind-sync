// AD Design Kit Timepicker — Figma "Timepicker form" (node 1149:52636, page 1149:52187), input 1149:52243, menus 1149:52665.
// <TimeInput> = Timepicker input (native type="time" on the Input field shell with a clock icon; `addon` joins a
// bg-neutral-tertiary icon segment). <TimeSlots> = slot menu (selected slot bg-brand text-white). Prefer TimeInput
// unless a slot UI is required.
import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { inputVariants, type FieldSize, type FieldStatus } from './Input';

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: FieldSize;
  status?: FieldStatus;
  /** Figma "Left add-on" / "Right add-on": the clock sits in a joined segment instead of inside the field. */
  addon?: 'start' | 'end';
}

const iconPos: Record<FieldSize, string> = { sm: 'pe-2.5', base: 'pe-3', lg: 'pe-3.5', xl: 'pe-4' };

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(function TimeInput({ size = 'base', status, addon, className, ...props }, ref) {
  const input = (extra?: string) => (
    <input
      ref={ref}
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
          'flex shrink-0 items-center border border-default-medium bg-neutral-tertiary px-2.5 text-body-subtle [&_svg]:size-4',
          addon === 'start' ? 'rounded-s-base border-e-0' : 'rounded-e-base border-s-0',
        )}
        aria-hidden
      >
        <ClockIcon />
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
  return (
    <div className={cn('relative', className)}>
      {input('pe-9')}
      <span
        className={cn(
          'pointer-events-none absolute inset-y-0 end-0 flex items-center [&_svg]:size-4',
          iconPos[size],
          status === 'success' ? 'text-fg-success-strong' : status === 'danger' ? 'text-fg-danger-strong' : 'text-body-subtle',
        )}
        aria-hidden
      >
        <ClockIcon />
      </span>
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
