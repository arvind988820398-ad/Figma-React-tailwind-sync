// AD Design Kit Range slider — Figma "Range Slider examples" (node 1149:54340, page 1149:54339), helper 1149:54358,
// bar 1149:54365, thumb 1149:54373. Figma Type: Default = one value, Range = [low, high] with two thumbs.
// Thumbs are role="slider" with arrow / Page / Home / End keys; a value tooltip shows while dragging or focused.
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

type Value = number | [number, number];

export interface RangeSliderProps<V extends Value> {
  value: V;
  onChange: (value: V) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accessible name(s): one label, or [low, high] for a range. */
  label: V extends number ? string : [string, string];
  /** Show min/max under the track (Figma helper "Left & Right text"). */
  showMinMax?: boolean;
  /** Optional icons beside the track (size-6 text-body). */
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  formatValue?: (n: number) => string;
  disabled?: boolean;
  className?: string;
}

export function RangeSlider<V extends Value>({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showMinMax,
  startIcon,
  endIcon,
  formatValue = String,
  disabled,
  className,
}: RangeSliderProps<V>) {
  const uid = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const isRange = Array.isArray(value);
  const values: number[] = isRange ? [...(value as [number, number])] : [value as number];
  const labels: string[] = isRange ? (label as [string, string]) : [label as string];
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  const snap = (n: number) => Math.min(max, Math.max(min, Math.round((n - min) / step) * step + min));

  const emit = (i: number, n: number) => {
    const next = [...values];
    next[i] = snap(n);
    if (isRange) {
      if (i === 0) next[0] = Math.min(next[0], next[1]);
      else next[1] = Math.max(next[1], next[0]);
      onChange(next as V);
    } else onChange(next[0] as V);
  };

  const fromPointer = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect();
    const ratio = (clientX - r.left) / r.width;
    return min + (document.dir === 'rtl' ? 1 - ratio : ratio) * (max - min);
  };

  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const n = fromPointer(e.clientX);
    const i = isRange && Math.abs(n - values[1]) < Math.abs(n - values[0]) ? 1 : 0;
    emit(i, n);
    setDragging(i);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.getElementById(`${uid}-thumb-${i}`)?.focus();
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLSpanElement>) => {
    const big = Math.max(step, (max - min) / 10);
    const delta: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big };
    if (e.key in delta) emit(i, values[i] + delta[e.key]);
    else if (e.key === 'Home') emit(i, min);
    else if (e.key === 'End') emit(i, max);
    else return;
    e.preventDefault();
  };

  const lo = isRange ? values[0] : min;
  const hi = isRange ? values[1] : values[0];

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center gap-4">
        {startIcon && <span className="inline-flex shrink-0 text-body [&_svg]:size-6" aria-hidden>{startIcon}</span>}
        <div
          ref={trackRef}
          onPointerDown={onTrackDown}
          onPointerMove={(e) => dragging !== null && emit(dragging, fromPointer(e.clientX))}
          onPointerUp={() => setDragging(null)}
          className={cn('relative flex h-5 flex-1 touch-none items-center', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
        >
          <div className="h-2 w-full rounded-base bg-neutral-quaternary" />
          <div
            className={cn('absolute h-2 rounded-base', disabled ? 'bg-neutral-tertiary-medium' : 'bg-brand')}
            style={{ insetInlineStart: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
          />
          {values.map((v, i) => (
            <span
              key={i}
              id={`${uid}-thumb-${i}`}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label={labels[i]}
              aria-valuemin={isRange && i === 1 ? values[0] : min}
              aria-valuemax={isRange && i === 0 ? values[1] : max}
              aria-valuenow={v}
              aria-valuetext={formatValue(v)}
              aria-disabled={disabled || undefined}
              onKeyDown={(e) => !disabled && onKey(i, e)}
              className={cn(
                'group absolute size-5 -translate-x-1/2 rounded-full border bg-neutral-primary-medium shadow-md transition-colors rtl:translate-x-1/2',
                'focus-visible:border-brand focus-visible:outline-none',
                dragging === i ? 'border-brand' : 'border-default-medium',
              )}
              style={{ insetInlineStart: `${pct(v)}%` }}
            >
              <span
                className={cn(
                  'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-base bg-dark px-2 py-1 text-xs font-medium text-white shadow-md',
                  dragging === i ? 'block' : 'hidden group-focus-visible:block',
                )}
              >
                {formatValue(v)}
              </span>
            </span>
          ))}
        </div>
        {endIcon && <span className="inline-flex shrink-0 text-body [&_svg]:size-6" aria-hidden>{endIcon}</span>}
      </div>
      {showMinMax && (
        <div className="flex justify-between text-sm font-medium text-body">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      )}
    </div>
  );
}
