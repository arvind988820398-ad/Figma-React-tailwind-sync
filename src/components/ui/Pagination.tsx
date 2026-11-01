// AD Design Kit Pagination — Figma set "Pagination" (node 1149:81850, page 3284:22482).
// Built from Tertiary sm Buttons joined into one row. The current page uses the selected style (brand tint +
// aria-current="page"), distinct from hover, matching the Figma Pagination current-page button.
// Figma Types: Default · Arrows · Two buttons · Text buttons (`labeled`) · Simple with input (`jump`) ·
// Dropdown & buttons (`select`); With dropdown = `pageSize`, With input = `jumpTo`, Buttons & helper text = `helper`.
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { AngleLeftIcon, AngleRightIcon } from '../icons';
import { buttonVariants } from './Button';
import { Input } from './Input';
import { Select } from './Select';

export type PaginationVariant = 'default' | 'arrows' | 'two-buttons' | 'labeled' | 'jump' | 'select';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
  /** default = numbers + icon prev/next · labeled = numbers + "Previous"/"Next" · arrows = icon prev/next only ·
   *  two-buttons = separate Previous / Next · jump = "Go to page" field + Go · select = page select + "of N pages" + arrows. */
  variant?: PaginationVariant;
  /** Figma "Buttons & helper text": shows "Showing 1–10 of 100". */
  helper?: { from: number; to: number; total: number };
  /** Figma "With dropdown": a rows-per-page select after the page buttons. */
  pageSize?: { value: number; options: number[]; onChange: (size: number) => void };
  /** Figma "With input": a "Go to [page] Page" field after the page buttons. */
  jumpTo?: boolean;
  /** Page numbers shown on each side of the current page before an ellipsis. */
  siblings?: number;
}

const joined = 'rounded-none shadow-none first:rounded-s-base last:rounded-e-base';
const current = 'relative z-10 border-brand-subtle bg-brand-softer text-fg-brand hover:bg-brand-softer hover:text-fg-brand';

function pageList(page: number, count: number, siblings: number): (number | 'gap')[] {
  const pages = new Set([1, count]);
  for (let p = page - siblings; p <= page + siblings; p++) if (p >= 1 && p <= count) pages.add(p);
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (dir === 'left' ? <AngleLeftIcon /> : <AngleRightIcon />);

/** "Go to [n] Page" field: jumps on Enter (and on the Go button in the `jump` variant). */
function JumpField({ pageCount, onGo, before, after, button }: { pageCount: number; onGo: (p: number) => void; before: string; after?: string; button?: boolean }) {
  const [draft, setDraft] = useState('');
  const id = useId();
  const submit = () => {
    const n = Number(draft);
    if (Number.isInteger(n) && n >= 1) onGo(n);
    setDraft('');
  };
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-body">
        <label htmlFor={id}>{before}</label>
        <Input
          id={id}
          size="sm"
          inputMode="numeric"
          className="w-14"
          placeholder={String(pageCount)}
          aria-describedby={after ? `${id}-after` : undefined}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        {after && <span id={`${id}-after`}>{after}</span>}
      </div>
      {button && (
        <button type="button" className={buttonVariants({ size: 'sm' })} onClick={submit}>
          Go
        </button>
      )}
    </div>
  );
}

export function Pagination({ page, pageCount, onPageChange, variant = 'default', helper, pageSize, jumpTo, siblings = 1, className, ...props }: PaginationProps) {
  const go = (p: number) => onPageChange(Math.min(pageCount, Math.max(1, p)));
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;
  const arrowBtn = cn(buttonVariants({ color: 'tertiary', size: 'sm', iconOnly: true }), joined, 'text-heading');

  let controls: ReactNode;
  if (variant === 'jump') {
    controls = <JumpField pageCount={pageCount} onGo={go} before="Go to page" button />;
  } else if (variant === 'select') {
    controls = (
      <div className="flex items-center gap-3">
        <Select size="sm" aria-label="Page" value={page} onChange={(e) => go(Number(e.target.value))}>
          {Array.from({ length: pageCount }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {String(i + 1).padStart(2, '0')}
            </option>
          ))}
        </Select>
        <span className="text-sm font-medium text-body">of {pageCount} pages</span>
        <div className="flex -space-x-px rounded-base shadow-xs">
          <button type="button" aria-label="Previous page" className={arrowBtn} disabled={prevDisabled} onClick={() => go(page - 1)}>
            <Chevron dir="left" />
          </button>
          <button type="button" aria-label="Next page" className={arrowBtn} disabled={nextDisabled} onClick={() => go(page + 1)}>
            <Chevron dir="right" />
          </button>
        </div>
      </div>
    );
  } else if (variant === 'two-buttons') {
    controls = (
      <div className="flex gap-3">
        <button type="button" className={buttonVariants({ color: 'tertiary', size: 'sm' })} disabled={prevDisabled} onClick={() => go(page - 1)}>
          Previous
        </button>
        <button type="button" className={buttonVariants({ color: 'tertiary', size: 'sm' })} disabled={nextDisabled} onClick={() => go(page + 1)}>
          Next
        </button>
      </div>
    );
  } else {
    const numberBtn = cn(buttonVariants({ color: 'tertiary', size: 'sm', iconOnly: true }), joined);
    const text = variant === 'labeled';
    const textBtn = cn(buttonVariants({ color: 'tertiary', size: 'sm' }), joined);
    controls = (
      <div className="flex -space-x-px rounded-base shadow-xs">
        <button type="button" aria-label={text ? undefined : 'Previous page'} className={text ? textBtn : arrowBtn} disabled={prevDisabled} onClick={() => go(page - 1)}>
          {text ? 'Previous' : <Chevron dir="left" />}
        </button>
        {variant !== 'arrows' &&
          pageList(page, pageCount, siblings).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className={cn(numberBtn, 'pointer-events-none')} aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
                className={cn(numberBtn, p === page && current)}
                onClick={() => go(p)}
              >
                {p}
              </button>
            ),
          )}
        <button type="button" aria-label={text ? undefined : 'Next page'} className={text ? textBtn : arrowBtn} disabled={nextDisabled} onClick={() => go(page + 1)}>
          {text ? 'Next' : <Chevron dir="right" />}
        </button>
      </div>
    );
  }

  const extras = (pageSize || jumpTo) && (
    <div className="flex flex-wrap items-center gap-4">
      {controls}
      {pageSize && (
        <Select size="sm" aria-label="Rows per page" value={pageSize.value} onChange={(e) => pageSize.onChange(Number(e.target.value))}>
          {pageSize.options.map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </Select>
      )}
      {jumpTo && <JumpField pageCount={pageCount} onGo={go} before="Go to" after="Page" />}
    </div>
  );

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center justify-between gap-4', className)} {...props}>
      {helper && (
        <p className="text-sm text-body">
          Showing <span className="font-semibold text-heading">{helper.from}–{helper.to}</span> of{' '}
          <span className="font-semibold text-heading">{helper.total}</span>
        </p>
      )}
      {extras || controls}
    </nav>
  );
}
