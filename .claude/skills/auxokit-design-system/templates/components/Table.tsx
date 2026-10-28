// AuxoKit Table — Figma set "Table (free-component)" (node 1149:87477, page 3284:22719).
// Figma types: Striped rows / Striped columns = `striped`; With table caption = `caption`. Toolbar = `toolbar` slot.
// `stickyHeader` keeps the header row visible while the body scrolls inside the wrapper; bound the wrapper's height
// with `containerClassName` (e.g. `max-h-96`, or `min-h-0 flex-1` in a flex column).
import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type TableStriped = 'rows' | 'columns';

const striping: Record<TableStriped, string> = {
  rows: '[&_tbody_tr:nth-child(even)]:bg-neutral-secondary-medium',
  columns: '[&_tbody_td:nth-child(even)]:bg-neutral-secondary-medium',
};

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: TableStriped;
  /** Figma "With table caption": title + description block above the table. */
  caption?: { title: ReactNode; description?: ReactNode };
  /** Row above the table: search Input, Secondary "Filters", Brand "Add …". */
  toolbar?: ReactNode;
  /** Header row stays visible while the rows scroll; give the wrapper a height with `containerClassName`. */
  stickyHeader?: boolean;
  /** Layout classes for the scrolling wrapper (height, flex sizing). */
  containerClassName?: string;
}

// With border-collapse the header's bottom border stays behind when the cells stick, so the line is drawn by the cell.
const stickyHead =
  '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 ' +
  '[&_thead_th]:after:pointer-events-none [&_thead_th]:after:absolute [&_thead_th]:after:inset-x-0 [&_thead_th]:after:bottom-0 ' +
  '[&_thead_th]:after:h-px [&_thead_th]:after:bg-neutral-quaternary';

export function Table({ striped, caption, toolbar, stickyHeader, containerClassName, className, children, ...props }: TableProps) {
  return (
    <div className={cn('relative flex flex-col rounded-base border border-default bg-neutral-secondary-soft shadow-xs', containerClassName)}>
      {toolbar && <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-default p-4">{toolbar}</div>}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className={cn('w-full text-start text-sm', striped && striping[striped], stickyHeader && stickyHead, className)} {...props}>
          {caption && (
            <caption className="border-b border-default bg-neutral-secondary-soft p-5 text-start">
              <span className="block text-lg font-medium leading-none text-heading">{caption.title}</span>
              {caption.description && <span className="mt-2 block text-base font-normal text-body">{caption.description}</span>}
            </caption>
          )}
          {children}
        </table>
      </div>
    </div>
  );
}

export function TableHead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-default last:border-b-0', className)} {...props} />;
}

export function TableHeaderCell({ className, scope = 'col', ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn('h-11 border-b border-default bg-neutral-secondary-medium px-5 text-start text-sm font-medium leading-none text-body', className)}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('h-14 px-5 text-sm font-medium leading-none text-heading', className)} {...props} />;
}
