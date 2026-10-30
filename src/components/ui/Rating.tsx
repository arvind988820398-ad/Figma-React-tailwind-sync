// AD Design Kit Rating — Figma set "Rating" (node 1149:82444, page 1149:82443).
// Default / With badge = <Rating> (display only). Radio input = <RatingInput> (ChoiceCard "Only text" circles).
import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

const STAR = 'M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z';

export interface RatingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  /** Text after the stars, e.g. "4.95 out of 5" or "73 reviews". */
  label?: ReactNode;
  /** "With badge": a score badge before the stars. */
  badge?: ReactNode;
}

export function Rating({ value, max = 5, label, badge, className, ...props }: RatingProps) {
  const filled = Math.round(value);
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      {badge}
      <span className="flex items-center gap-1" role="img" aria-label={`${value} out of ${max} stars`}>
        {Array.from({ length: max }, (_, i) => (
          <svg key={i} viewBox="0 0 20 20" className={cn('size-4.5', i < filled ? 'fill-fg-yellow' : 'fill-neutral-quaternary')} aria-hidden>
            <path d={STAR} />
          </svg>
        ))}
      </span>
      {label && <span className="text-sm leading-none text-body">{label}</span>}
    </div>
  );
}

export interface RatingInputProps {
  value: number | null;
  onChange: (value: number) => void;
  max?: number;
  /** Group label for assistive tech. */
  label: string;
  name?: string;
  className?: string;
}

/** 1–N rating as a radio group of circles: Initial border-default → checked bg-brand-softer border-brand-subtle. */
export function RatingInput({ value, onChange, max = 5, label, name, className }: RatingInputProps) {
  const autoName = useId();
  return (
    <fieldset className={cn('flex items-center gap-4', className)}>
      <legend className="sr-only">{label}</legend>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <label key={n} className="relative">
          <input type="radio" name={name ?? autoName} value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
          <span
            className={cn(
              'inline-flex size-9 cursor-pointer items-center justify-center rounded-full border text-sm font-medium shadow-xs transition-colors',
              'peer-focus-visible:shadow-focus-brand',
              value === n
                ? 'border-brand-subtle bg-brand-softer text-fg-brand-strong'
                : 'border-default bg-neutral-primary-soft text-heading hover:bg-neutral-secondary-medium',
            )}
          >
            {n}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
