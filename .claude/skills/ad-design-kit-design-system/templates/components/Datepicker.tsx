// AD Design Kit Datepicker — Figma "Datepicker (ready to use examples)" (node 1149:51284, page 1149:51144),
// cell 1149:51147, controls 1149:51164, menu 1149:51169. Figma Type: Default = mode "single", Range = mode "range"
// (two months). <Calendar> is the menu on its own; <Datepicker> adds the Input trigger and the popup.
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { inputVariants, type FieldSize } from './Input';

/** Split the month grid into weeks so each week is an ARIA row. */
function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export type DateRange = { start: Date | null; end: Date | null };

const sameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && a.toDateString() === b.toDateString();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

function monthGrid(month: Date, weekStart: number) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() - weekStart + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => addDays(first, i - offset));
}

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d={dir === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const navButton =
  'inline-flex size-8 items-center justify-center rounded-base text-heading hover:bg-neutral-tertiary-medium focus-visible:shadow-focus-secondary focus-visible:outline-none [&_svg]:size-4';

interface CalendarBaseProps {
  min?: Date;
  max?: Date;
  /** 0 = Sunday, 1 = Monday. */
  weekStart?: 0 | 1;
  locale?: string;
  className?: string;
  /** Move focus into the grid when the calendar appears (the Datepicker popup does; an inline calendar should not). */
  autoFocus?: boolean;
}

export type CalendarProps = CalendarBaseProps &
  ({ mode?: 'single'; value: Date | null; onChange: (d: Date) => void } | { mode: 'range'; value: DateRange; onChange: (r: DateRange) => void });

/** The Figma "Datepicker menu": month header, weekday row, 6×7 day grid. Range mode shows two months. */
export function Calendar(props: CalendarProps) {
  const { min, max, weekStart = 0, locale, className } = props;
  const range = props.mode === 'range';
  const anchor = range ? props.value.start : props.value;
  const [view, setView] = useState(() => {
    const a = anchor ?? new Date();
    return new Date(a.getFullYear(), a.getMonth(), 1);
  });
  const [focusDay, setFocusDay] = useState<Date>(() => startOfDay(anchor ?? new Date()));
  const gridRef = useRef<HTMLDivElement>(null);
  const [today] = useState(() => startOfDay(new Date()));

  const weekdays = useMemo(() => {
    const base = new Date(2024, 0, 7 + weekStart); // a Sunday (+1 for Monday)
    return Array.from({ length: 7 }, (_, i) => addDays(base, i).toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2));
  }, [weekStart, locale]);

  const disabled = (d: Date) => (min && d < startOfDay(min)) || (max && d > startOfDay(max)) || false;

  const select = (d: Date) => {
    if (disabled(d)) return;
    if (props.mode === 'range') {
      const { start, end } = props.value;
      if (!start || end || d < start) props.onChange({ start: d, end: null });
      else props.onChange({ start, end: d });
    } else props.onChange(d);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(e.key in step)) return;
    e.preventDefault();
    interacted.current = true;
    const next = addDays(focusDay, step[e.key]);
    setFocusDay(next);
    if (next.getMonth() !== focusDay.getMonth() && (next < view || next >= addMonths(view, range ? 2 : 1))) setView(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  // Layout effect: focus moves before the next key press is handled, so fast key repeat is never lost.
  // Hidden outside-month cells share the same date, so only real cells are focused.
  const interacted = useRef(false);
  useLayoutEffect(() => {
    if (!interacted.current && !props.autoFocus) return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay.toDateString()}"]:not([data-outside])`)?.focus({ preventScroll: true });
  }, [focusDay, view, props.autoFocus]);

  const cellClass = (d: Date, inMonth: boolean) => {
    if (!inMonth) return 'invisible';
    if (disabled(d)) return 'rounded text-fg-disabled';
    if (range) {
      const { start, end } = props.value;
      const isStart = sameDay(d, start);
      const isEnd = sameDay(d, end);
      if (isStart || isEnd) return cn('rounded bg-brand text-white', start && end && !sameDay(start, end) && (isStart ? 'rounded-e-none' : 'rounded-s-none'));
      if (start && end && d > start && d < end) return 'rounded-none bg-neutral-tertiary-medium text-heading';
    } else if (sameDay(d, props.value)) return 'rounded bg-brand text-white';
    if (sameDay(d, today)) return 'rounded border border-brand text-heading';
    return 'rounded text-body hover:bg-neutral-tertiary-medium hover:text-heading';
  };

  const months = range ? [view, addMonths(view, 1)] : [view];

  return (
    <div ref={gridRef} onKeyDown={onKeyDown} className={cn('flex flex-col gap-6 sm:flex-row', className)}>
      {months.map((m, mi) => (
        <div key={mi} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            {mi === 0 ? (
              <button type="button" aria-label="Previous month" className={navButton} onClick={() => setView(addMonths(view, -1))}>
                <Chevron dir="left" />
              </button>
            ) : (
              <span className="size-8" />
            )}
            <span className="text-sm font-semibold leading-5 text-heading" aria-live="polite">
              {m.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
            </span>
            {mi === months.length - 1 ? (
              <button type="button" aria-label="Next month" className={navButton} onClick={() => setView(addMonths(view, 1))}>
                <Chevron dir="right" />
              </button>
            ) : (
              <span className="size-8" />
            )}
          </div>
          <div role="grid" aria-label={m.toLocaleDateString(locale, { month: 'long', year: 'numeric' })} className="grid grid-cols-7">
            <div role="row" className="contents">
            {weekdays.map((w) => (
              <span key={w} role="columnheader" className="flex h-6 items-center justify-center text-xs font-semibold leading-3 text-body">
                {w}
              </span>
            ))}
            </div>
            {chunk(monthGrid(m, weekStart), 7)
              // Only weeks that contain a day of this month (an all-hidden row has no cells).
              .filter((week) => week.some((d) => d.getMonth() === m.getMonth()))
              .map((week, wi) => (
            <div key={wi} role="row" className="contents">
            {week.map((d) => {
              const inMonth = d.getMonth() === m.getMonth();
              const selected = range ? sameDay(d, props.value.start) || sameDay(d, props.value.end) : sameDay(d, props.value);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  role="gridcell"
                  data-day={d.toDateString()}
                  data-outside={inMonth ? undefined : ''}
                  tabIndex={inMonth && sameDay(d, focusDay) ? 0 : -1}
                  aria-selected={selected}
                  aria-current={sameDay(d, today) ? 'date' : undefined}
                  aria-label={d.toLocaleDateString(locale, { dateStyle: 'full' })}
                  disabled={!inMonth || disabled(d)}
                  onClick={() => {
                    setFocusDay(d);
                    select(d);
                  }}
                  className={cn(
                    'size-9 text-xs font-semibold leading-4 transition-colors focus-visible:z-10 focus-visible:shadow-focus-brand focus-visible:outline-none',
                    cellClass(d, inMonth),
                  )}
                >
                  {d.getDate()}
                </button>
              );
            })}
            </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
  </svg>
);

export type DatepickerProps = CalendarBaseProps & {
  size?: FieldSize;
  placeholder?: string;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
} & ({ mode?: 'single'; value: Date | null; onChange: (d: Date | null) => void } | { mode: 'range'; value: DateRange; onChange: (r: DateRange) => void });

/** Input + calendar popup with the Figma footer (Secondary "Clear" + Brand "Today" / "Apply"). */
export function Datepicker(props: DatepickerProps) {
  const { size = 'base', placeholder = 'Select date', id, min, max, weekStart, locale, className } = props;
  const [open, setOpen] = useState(false);
  const autoId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const fmt = (d: Date | null) => (d ? d.toLocaleDateString(locale, { dateStyle: 'medium' }) : '');
  const text = props.mode === 'range' ? [fmt(props.value.start), fmt(props.value.end)].filter(Boolean).join(' – ') : fmt(props.value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector<HTMLInputElement>('input')?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const iconPad = size === 'sm' ? 'ps-8.5' : size === 'base' ? 'ps-9' : size === 'lg' ? 'ps-11' : 'ps-12'; // ad-design-kit-lint-ignore: 10px pad + 16px icon + 8px gap = 34px
  const iconPos = size === 'sm' ? 'ps-2.5' : size === 'base' ? 'ps-3' : size === 'lg' ? 'ps-3.5' : 'ps-4';

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <span className={cn('pointer-events-none absolute inset-y-0 start-0 flex items-center text-body-subtle [&_svg]:size-4', iconPos)}>
        <CalendarIcon />
      </span>
      <input
        id={id ?? autoId}
        readOnly
        value={text}
        placeholder={placeholder}
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${id ?? autoId}-dialog` : undefined}
        aria-label={props['aria-label']}
        aria-describedby={props['aria-describedby']}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(inputVariants({ size }), iconPad, 'cursor-pointer read-only:bg-neutral-secondary-medium read-only:text-heading')}
      />
      {open && (
        <div id={`${id ?? autoId}-dialog`} role="dialog" aria-label="Choose date" className="absolute start-0 top-full z-40 mt-2 flex flex-col gap-4 rounded-base border border-default-medium bg-neutral-primary-medium p-5 shadow-lg">
          {props.mode === 'range' ? (
            <Calendar autoFocus mode="range" value={props.value} onChange={props.onChange} min={min} max={max} weekStart={weekStart} locale={locale} />
          ) : (
            <Calendar
              autoFocus
              value={props.value}
              onChange={(d) => {
                props.onChange(d);
                setOpen(false);
              }}
              min={min}
              max={max}
              weekStart={weekStart}
              locale={locale}
            />
          )}
          <div className="flex gap-3">
            <Button
              color="secondary"
              className="flex-1"
              onClick={() => (props.mode === 'range' ? props.onChange({ start: null, end: null }) : props.onChange(null))}
            >
              Clear
            </Button>
            {props.mode === 'range' ? (
              <Button className="flex-1" onClick={() => setOpen(false)}>Apply</Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => {
                  props.onChange(startOfDay(new Date()));
                  setOpen(false);
                }}
              >
                Today
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
