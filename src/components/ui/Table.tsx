// AuxoKit Table — Figma set "Table (free-component)" (node 1149:87477, page 3284:22719).
// Figma types: Striped rows / Striped columns = `striped`; With table caption = `caption`. Toolbar = `toolbar` slot.
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
}

export function Table({ striped, caption, toolbar, className, children, ...props }: TableProps) {
  return (
    <div className="relative overflow-x-auto rounded-base border border-default bg-neutral-secondary-soft shadow-xs">
      {toolbar && <div className="flex flex-wrap items-center justify-between gap-3 border-b border-default p-4">{toolbar}</div>}
      <table className={cn('w-full text-start text-sm', striped && striping[striped], className)} {...props}>
        {caption && (
          <caption className="border-b border-default bg-neutral-secondary-soft p-5 text-start">
            <span className="block text-lg font-medium leading-none text-heading">{caption.title}</span>
            {caption.description && <span className="mt-2 block text-base font-normal text-body">{caption.description}</span>}
          </caption>
        )}
        {children}
      </table>
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
