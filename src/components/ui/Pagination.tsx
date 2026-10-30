// AD Design Kit Pagination — Figma set "Pagination" (node 1149:81850, page 3284:22482).
// Built from Tertiary sm Buttons joined into one row. Figma has no "current" variant; the current page uses the
// Tertiary Hover style (figma-audit.md #42).
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { buttonVariants } from './Button';

export type PaginationVariant = 'default' | 'arrows' | 'two-buttons';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
  /** default = numbers + prev/next · arrows = icon prev/next only · two-buttons = separate Previous / Next. */
  variant?: PaginationVariant;
  /** Figma "Buttons & helper text": shows "Showing 1–10 of 100". */
  helper?: { from: number; to: number; total: number };
  /** Page numbers shown on each side of the current page before an ellipsis. */
  siblings?: number;
}

const joined = 'rounded-none shadow-none first:rounded-s-base last:rounded-e-base';
const current = 'bg-neutral-secondary-medium text-heading';

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

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d={dir === 'left' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Pagination({ page, pageCount, onPageChange, variant = 'default', helper, siblings = 1, className, ...props }: PaginationProps) {
  const go = (p: number) => onPageChange(Math.min(pageCount, Math.max(1, p)));
  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  let controls: ReactNode;
  if (variant === 'two-buttons') {
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
    const iconBtn = cn(numberBtn, 'text-heading');
    controls = (
      <div className="flex -space-x-px rounded-base shadow-xs">
        <button type="button" aria-label="Previous page" className={iconBtn} disabled={prevDisabled} onClick={() => go(page - 1)}>
          <Chevron dir="left" />
        </button>
        {variant === 'default' &&
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
        <button type="button" aria-label="Next page" className={iconBtn} disabled={nextDisabled} onClick={() => go(page + 1)}>
          <Chevron dir="right" />
        </button>
      </div>
    );
  }

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center justify-between gap-4', className)} {...props}>
      {helper && (
        <p className="text-sm text-body">
          Showing <span className="font-semibold text-heading">{helper.from}–{helper.to}</span> of{' '}
          <span className="font-semibold text-heading">{helper.total}</span>
        </p>
      )}
      {controls}
    </nav>
  );
}
