// Pieces every tab of the material app shares, composed from AD Design Kit components.
import type { ReactNode } from 'react';
import { AngleDownIcon, ArchiveIcon, ChevronSortIcon, InfoCircleIcon } from '../../components/icons';
import { Badge, type BadgeColor } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Dropdown, DropdownCheckboxItem } from '../../components/ui/Dropdown';
import { IconShape } from '../../components/ui/IconShape';
import { Pagination } from '../../components/ui/Pagination';
import { Tooltip } from '../../components/ui/Tooltip';

/** Status text → Badge colour. The reference's purple and dark-grey pills map to brand and gray. */
const statusColor: Record<string, BadgeColor> = {
  'Approval Pending': 'gray',
  Approved: 'brand',
  'Partially Approved': 'warning',
  Rejected: 'danger',
  'Partially PO Converted': 'warning',
  'Converted to PO': 'success',
  'Partially Delivered': 'warning',
  Delivered: 'success',
  'Delivery Closed': 'brand',
  'Waiting for Approval': 'warning',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge color={statusColor[status] ?? 'gray'} size="lg" className="whitespace-nowrap">
      {status}
    </Badge>
  );
}

/** Zero state: illustration stand-in, one line of text and the actions that fill the list. */
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-10 text-center">
      <IconShape size="2xl" color="brand">
        <ArchiveIcon />
      </IconShape>
      <p className="text-base font-medium text-heading">{title}</p>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

/** A multi-select filter: a Secondary sm trigger opening checkbox items. */
export function FilterMenu({ label, options, selected, onChange, icon }: { label: string; options: string[]; selected: string[]; onChange: (next: string[]) => void; icon?: ReactNode }) {
  return (
    <Dropdown
      label={label}
      className="w-60"
      menuClassName="max-h-72 overflow-y-auto"
      trigger={
        <Button color="secondary" size="sm" leftIcon={icon} rightIcon={<AngleDownIcon />}>
          {label}
          {selected.length > 0 && <Badge color="brand" circle>{selected.length}</Badge>}
        </Button>
      }
    >
      {options.map((o) => (
        <DropdownCheckboxItem key={o} checked={selected.includes(o)} onCheckedChange={(on) => onChange(on ? [...selected, o] : selected.filter((x) => x !== o))}>
          {o}
        </DropdownCheckboxItem>
      ))}
    </Dropdown>
  );
}

/** A sortable column header (Table doc: a ghost xs Button with chevron-sort; the cell sets aria-sort). */
export function SortButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button color="ghost" size="xs" rightIcon={<ChevronSortIcon />} onClick={onClick} className="-ms-3">
      {label}
    </Button>
  );
}

/** A column header with an explanation (the reference's ⓘ tooltips). */
export function InfoHeader({ label, hint }: { label: string; hint: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip content={hint} placement="bottom">
        <Button color="ghost" size="xs" iconOnly aria-label={`About ${label}`}>
          <InfoCircleIcon />
        </Button>
      </Tooltip>
    </span>
  );
}

/** Figma "Table Footer": the selection count, then rows per page and pages. */
export function TableFooter({ selected, page, pageCount, onPage, pageSize, onPageSize, total }: { selected?: number; page: number; pageCount: number; onPage: (p: number) => void; pageSize: number; onPageSize: (n: number) => void; total: number }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <>
      <span>{selected !== undefined ? `${selected} item${selected === 1 ? '' : 's'} selected` : `Showing ${from}–${to} of ${total}`}</span>
      <Pagination page={page} pageCount={Math.max(1, pageCount)} onPageChange={onPage} variant="arrows" pageSize={{ value: pageSize, options: [10, 20, 50], onChange: onPageSize }} />
    </>
  );
}

/** Material name, specification and the stock line, as the reference shows it in every list. */
export function MaterialCell({ name, spec, children }: { name: ReactNode; spec?: string; children?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="font-medium text-heading">{name}</span>
      {spec && <span className="text-xs text-body">{spec}</span>}
      {children}
    </span>
  );
}

/** Key facts at the top of a record drawer (project, people, dates, amounts), as a Card with a description list.
 *  The reference tints this band brand blue; AD Design Kit has no tinted summary yet. */
// ad-design-kit-gap: tinted-summary
export function SummaryCard({ items, columns = 4 }: { items: [string, ReactNode][]; columns?: 3 | 4 }) {
  return (
    <Card>
      <dl className={`grid grid-cols-2 gap-4 ${columns === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
        {items.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1">
            <dt className="text-xs text-body">{k}</dt>
            <dd className="text-sm font-medium text-heading">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
