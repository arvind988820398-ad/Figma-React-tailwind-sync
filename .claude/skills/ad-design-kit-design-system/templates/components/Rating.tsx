// AD Design Kit Rating — Figma set "Rating" (node 1149:82444, page 1149:82443).
// Default / With badge = <Rating> (display only; the badge follows the stars). Radio input = <RatingInput>: a joined row of
// ChoiceCard "Only text" cells (e.g. 0–5) between optional start and end labels ("Not likely" … "Very likely").
import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

const STAR = 'M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z';

export interface RatingProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  /** Text after the stars, e.g. "4.95 out of 5" or "73 reviews". */
  label?: ReactNode;
  /** "With badge": a score badge after the stars, e.g. <Badge color="brand">4.8 out of 5</Badge>. */
  badge?: ReactNode;
}

export function Rating({ value, max = 5, label, badge, className, ...props }: RatingProps) {
  const filled = Math.round(value);
  return (
    <div className={cn('flex items-center gap-2', className)} {...props}>
      <span className="flex items-center gap-1" role="img" aria-label={`${value} out of ${max} stars`}>
        {Array.from({ length: max }, (_, i) => (
          <svg key={i} viewBox="0 0 20 20" className={cn('size-5', i < filled ? 'fill-fg-yellow' : 'fill-neutral-quaternary')} aria-hidden>
            <path d={STAR} />
          </svg>
        ))}
      </span>
      {badge}
      {label && <span className="text-sm leading-none text-body">{label}</span>}
    </div>
  );
}

export interface RatingInputProps {
  value: number | null;
  onChange: (value: number) => void;
  /** First value; Figma's satisfaction scale runs 0–5. */
  min?: number;
  max?: number;
  /** Text before and after the scale, e.g. "Not likely" and "Very likely". */
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  /** Group label for assistive tech. */
  label: string;
  name?: string;
  className?: string;
}

/** min–max rating as a joined radio group: Initial border-default → checked bg-brand-softer border-brand-subtle. */
export function RatingInput({ value, onChange, min = 1, max = 5, startLabel, endLabel, label, name, className }: RatingInputProps) {
  const autoName = useId();
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <fieldset className={cn('flex items-center gap-4', className)}>
      <legend className="sr-only">{label}</legend>
      {startLabel && <span className="text-sm leading-none text-heading" aria-hidden>{startLabel}</span>}
      <div className="flex -space-x-px">
        {values.map((n, i) => (
          <label key={n} className={cn('relative', value === n && 'z-10')}>
            <input type="radio" name={name ?? autoName} value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
            <span
              className={cn(
                'inline-flex size-9 cursor-pointer items-center justify-center border text-sm font-medium transition-colors',
                'peer-focus-visible:shadow-focus-brand',
                i === 0 && 'rounded-s-base',
                i === values.length - 1 && 'rounded-e-base',
                value === n
                  ? 'border-brand-subtle bg-brand-softer text-fg-brand-strong'
                  : 'border-default bg-neutral-primary-soft text-heading hover:bg-neutral-secondary-medium',
              )}
            >
              {n}
            </span>
          </label>
        ))}
      </div>
      {endLabel && <span className="text-sm leading-none text-heading" aria-hidden>{endLabel}</span>}
    </fieldset>
  );
}
