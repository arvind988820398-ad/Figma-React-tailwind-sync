// Material List module: the AD Design Kit Table as designed in Figma (toolbar slot for search/filters/actions, its own header
// surface, row dividers and cell metrics), a selection + pagination footer, and the empty state.
import { useMemo, useState, type ReactNode } from 'react';
import { PlusIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Dropdown, DropdownCheckboxItem, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { Tooltip } from '../../components/ui/Tooltip';
import { ArrowDropDownIcon, ChevronDownIcon, ExcelIcon, InfoOutlineIcon, SearchIcon, SwapVertIcon } from './icons';
import { CATEGORY_OPTIONS, type Material } from './types';

export type EditSection = 'stock' | 'financial' | 'additional';

type ColumnKey = 'category' | 'uom' | 'inStock' | 'minStock' | 'pendingRequest' | 'approvedReqQty' | 'ordered' | 'totalAdded' | 'totalUsed' | 'estimatedQty' | 'estimatedBudget';

interface Column {
  key: ColumnKey;
  label: string;
  info?: string;
  /** Empty values render an "Add" link that opens this drawer section. */
  editable?: EditSection;
  render?: (m: Material) => ReactNode;
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('en-IN');

const COLUMNS: Column[] = [
  { key: 'category', label: 'Category' },
  { key: 'uom', label: 'UOM' },
  { key: 'inStock', label: 'In Stock', editable: 'stock', render: (m) => (m.inStock === undefined ? undefined : `${num.format(m.inStock)} ${m.uom}`) },
  { key: 'minStock', label: 'Min. Stock Alert', editable: 'stock', render: (m) => (m.minStock === undefined ? undefined : `${num.format(m.minStock)} ${m.uom}`) },
  { key: 'pendingRequest', label: 'Pending Request', info: 'Total requested qty. from all indents which have not been approved yet.' },
  { key: 'approvedReqQty', label: 'Approved Req. Qty.', info: 'Total requested qt. from all indents which have not been ordered.' },
  { key: 'ordered', label: 'Ordered' },
  { key: 'totalAdded', label: 'Total Added' },
  { key: 'totalUsed', label: 'Total Used' },
  { key: 'estimatedQty', label: 'Estimated Qty', editable: 'stock', render: (m) => (m.estimatedQty === undefined ? undefined : `${num.format(m.estimatedQty)} ${m.uom}`) },
  { key: 'estimatedBudget', label: 'Estimated Budget', editable: 'financial', render: (m) => (m.estimatedBudget === undefined ? undefined : inr.format(m.estimatedBudget)) },
];

const PERIODS = ['Till Today', 'This Week', 'This Month', 'This Quarter'] as const;
const PAGE_SIZES = [10, 20, 50] as const;

export interface MaterialListProps {
  materials: Material[];
  onAdd: () => void;
  onEdit: (material: Material, section?: EditSection) => void;
  onDelete: (ids: string[]) => void;
  onUpload: () => void;
}

function HeaderLabel({ column, sort, onSort }: { column: Column; sort?: 'asc' | 'desc'; onSort?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1">
      {onSort ? (
        <Button color="ghost" size="xs" onClick={onSort} rightIcon={<SwapVertIcon />} aria-label={`Sort by ${column.label}`} aria-pressed={!!sort} className="-ms-3">
          {column.label}
        </Button>
      ) : (
        column.label
      )}
      {column.info && (
        <Tooltip content={column.info} placement="bottom">
          <Button color="ghost" size="xs" iconOnly aria-label={`About ${column.label}`}>
            <InfoOutlineIcon />
          </Button>
        </Tooltip>
      )}
    </span>
  );
}

export function MaterialList({ materials, onAdd, onEdit, onDelete, onUpload }: MaterialListProps) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [stockAlert, setStockAlert] = useState<'all' | 'below' | 'ok'>('all');
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('Till Today');
  const [hidden, setHidden] = useState<Set<ColumnKey>>(new Set());
  const [sort, setSort] = useState<'asc' | 'desc' | undefined>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(20);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = materials.filter((m) => {
      if (q && !`${m.name} ${m.specifications.join(' ')} ${m.category ?? ''}`.toLowerCase().includes(q)) return false;
      if (categories.size && !categories.has(m.category ?? '')) return false;
      const below = m.minStock !== undefined && (m.inStock ?? 0) < m.minStock;
      if (stockAlert === 'below' && !below) return false;
      if (stockAlert === 'ok' && below) return false;
      return true;
    });
    if (sort) list = [...list].sort((a, b) => a.name.localeCompare(b.name) * (sort === 'asc' ? 1 : -1));
    return list;
  }, [materials, query, categories, stockAlert, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const visibleColumns = COLUMNS.filter((c) => !hidden.has(c.key));
  const allOnPageSelected = rows.length > 0 && rows.every((m) => selected.has(m.id));

  const toggleAll = (checked: boolean) => {
    const next = new Set(selected);
    rows.forEach((m) => (checked ? next.add(m.id) : next.delete(m.id)));
    setSelected(next);
  };
  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  };

  if (materials.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <img src="/materials/empty-state.png" alt="" width={257} height={149} className="h-36 w-64 object-cover object-center" />
        <p className="text-base font-medium text-heading">Add Materials to manage your Inventory.</p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Button color="tertiary" size="lg" leftIcon={<PlusIcon />} onClick={onAdd} className="min-w-48">
            Add Material
          </Button>
          <Button size="lg" leftIcon={<ExcelIcon mono />} onClick={onUpload} className="min-w-48">
            Upload Material
          </Button>
        </div>
      </div>
    );
  }

  const toolbar = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          size="sm"
          placeholder="Search"
          aria-label="Search materials"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          rightIcon={<SearchIcon />}
          className="w-52"
        />
        <Dropdown
          label="Filter by category"
          trigger={
            <Button color={categories.size ? 'secondary' : 'ghost'} size="sm" rightIcon={<ChevronDownIcon />}>
              Category{categories.size ? ` (${categories.size})` : ''}
            </Button>
          }
        >
          {CATEGORY_OPTIONS.map((c) => (
            <DropdownCheckboxItem
              key={c}
              checked={categories.has(c)}
              onCheckedChange={(v) => {
                const next = new Set(categories);
                if (v) next.add(c);
                else next.delete(c);
                setCategories(next);
                setPage(1);
              }}
            >
              {c}
            </DropdownCheckboxItem>
          ))}
          {categories.size > 0 && (
            <>
              <DropdownSeparator />
              <DropdownItem onSelect={() => setCategories(new Set())}>Clear</DropdownItem>
            </>
          )}
        </Dropdown>
        <Dropdown
          label="Filter by stock alert"
          trigger={
            <Button color={stockAlert !== 'all' ? 'secondary' : 'ghost'} size="sm" rightIcon={<ChevronDownIcon />}>
              {stockAlert === 'all' ? 'Stock Alert' : stockAlert === 'below' ? 'Below min. stock' : 'Stock OK'}
            </Button>
          }
        >
          <DropdownItem onSelect={() => setStockAlert('all')}>All materials</DropdownItem>
          <DropdownItem onSelect={() => setStockAlert('below')}>Below minimum stock</DropdownItem>
          <DropdownItem onSelect={() => setStockAlert('ok')}>Stock OK</DropdownItem>
        </Dropdown>
        <Dropdown
          label="Period"
          trigger={
            <Button color="ghost" size="sm" rightIcon={<ChevronDownIcon />}>
              {period}
            </Button>
          }
        >
          {PERIODS.map((p) => (
            <DropdownItem key={p} onSelect={() => setPeriod(p)}>
              {p}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          align="end"
          label="Columns"
          trigger={
            <Button color="secondary" size="sm" rightIcon={<ChevronDownIcon />}>
              Columns
            </Button>
          }
        >
          {COLUMNS.map((c) => (
            <DropdownCheckboxItem
              key={c.key}
              checked={!hidden.has(c.key)}
              onCheckedChange={(v) => {
                const next = new Set(hidden);
                if (v) next.delete(c.key);
                else next.add(c.key);
                setHidden(next);
              }}
            >
              {c.label}
            </DropdownCheckboxItem>
          ))}
        </Dropdown>
        <Dropdown
          align="end"
          label="Excel actions"
          trigger={
            <Button color="secondary" size="sm" aria-label="Excel actions" leftIcon={<ExcelIcon />} rightIcon={<ChevronDownIcon />}>
              Excel
            </Button>
          }
        >
          <DropdownItem onSelect={onUpload}>Upload materials from Excel</DropdownItem>
          <DropdownItem>Download template</DropdownItem>
          <DropdownItem>Export this list</DropdownItem>
        </Dropdown>
        <Button size="sm" leftIcon={<PlusIcon />} onClick={onAdd}>
          Add Material
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
      <Table toolbar={toolbar} stickyHeader containerClassName="min-h-0 flex-1" className="min-w-max">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-12">
              <Checkbox aria-label="Select all on this page" checked={allOnPageSelected} onChange={(e) => toggleAll(e.target.checked)} />
            </TableHeaderCell>
            <TableHeaderCell className="min-w-56">
              <HeaderLabel column={{ key: 'category', label: 'Material Name' }} sort={sort} onSort={() => setSort(sort === 'asc' ? 'desc' : 'asc')} />
            </TableHeaderCell>
            {visibleColumns.map((c) => (
              <TableHeaderCell key={c.key} className="whitespace-nowrap">
                <HeaderLabel column={c} />
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={visibleColumns.length + 2} className="text-center">
                No materials match these filters.
              </TableCell>
            </TableRow>
          )}
          {rows.map((m) => {
            const checked = selected.has(m.id);
            return (
              <TableRow key={m.id} aria-selected={checked}>
                <TableCell>
                  <Checkbox aria-label={`Select ${m.name}`} checked={checked} onChange={(e) => toggleOne(m.id, e.target.checked)} />
                </TableCell>
                <TableCell>
                  <a
                    href={`#material/${m.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(m);
                    }}
                    className="flex max-w-64 flex-col items-start gap-1.5 rounded text-start hover:underline focus-visible:shadow-focus-brand focus-visible:outline-none"
                  >
                    <span className="truncate text-heading">{m.name}</span>
                    <span className="truncate text-xs font-normal text-body">{m.specifications.filter(Boolean).join(' · ') || 'Specification'}</span>
                  </a>
                </TableCell>
                {visibleColumns.map((c) => {
                  const value = c.render ? c.render(m) : m[c.key];
                  return (
                    <TableCell key={c.key} className="whitespace-nowrap">
                      {value !== undefined && value !== '' ? (
                        value
                      ) : c.editable ? (
                        <Button color="ghost" size="xs" onClick={() => onEdit(m, c.editable)} className="-ms-3">
                          Add
                        </Button>
                      ) : (
                        <span className="text-body">-</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-body">
            {selected.size} Item{selected.size === 1 ? '' : 's'} Selected
          </p>
          {selected.size > 0 && (
            <Button
              color="danger"
              outline
              size="sm"
              onClick={() => {
                onDelete([...selected]);
                setSelected(new Set());
              }}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <Dropdown
            align="end"
            label="Rows per page"
            trigger={
              <Button color="ghost" size="sm" rightIcon={<ArrowDropDownIcon />}>
                Rows per page: {pageSize}
              </Button>
            }
          >
            {PAGE_SIZES.map((n) => (
              <DropdownItem
                key={n}
                onSelect={() => {
                  setPageSize(n);
                  setPage(1);
                }}
              >
                {n}
              </DropdownItem>
            ))}
          </Dropdown>
          <Pagination
            variant="arrows"
            page={current}
            pageCount={pageCount}
            onPageChange={setPage}
            helper={{ from: filtered.length === 0 ? 0 : (current - 1) * pageSize + 1, to: Math.min(current * pageSize, filtered.length), total: filtered.length }}
          />
        </div>
      </div>
    </div>
  );
}
