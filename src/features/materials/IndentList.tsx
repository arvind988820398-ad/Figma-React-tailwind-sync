// Indent module: every material request raised by site supervisors, with status summary, filters and a details drawer.
// Composed from Card, Table (toolbar slot), Input, Dropdown, Badge, Avatar, Button and Pagination.
import { useMemo, useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardText, CardTitle } from '../../components/ui/Card';
import { Dropdown, DropdownCheckboxItem, DropdownItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { ChevronDownIcon, SearchIcon } from './icons';
import { INDENT_PRIORITIES, INDENT_STATUSES, formatDate, statusBadge, type Indent, type IndentPriority, type IndentStatus } from './indents';

export interface IndentListProps {
  indents: Indent[];
  onOpen: (indent: Indent) => void;
  onExport: () => void;
}

const PAGE_SIZE = 10;

export function IndentList({ indents, onOpen, onExport }: IndentListProps) {
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<Set<IndentStatus>>(new Set());
  const [priority, setPriority] = useState<IndentPriority | 'all'>('all');
  const [supervisors, setSupervisors] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const supervisorNames = useMemo(() => [...new Set(indents.map((i) => i.requestedBy.name))].sort(), [indents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...indents]
      .sort((a, b) => b.requestedOn.localeCompare(a.requestedOn))
      .filter((i) => {
        if (q && !`${i.number} ${i.site} ${i.purpose} ${i.requestedBy.name} ${i.lines.map((l) => l.material).join(' ')}`.toLowerCase().includes(q)) return false;
        if (statuses.size && !statuses.has(i.status)) return false;
        if (priority !== 'all' && i.priority !== priority) return false;
        if (supervisors.size && !supervisors.has(i.requestedBy.name)) return false;
        return true;
      });
  }, [indents, query, statuses, priority, supervisors]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const count = (s: IndentStatus) => indents.filter((i) => i.status === s).length;
  const urgentPending = indents.filter((i) => i.status === 'Pending' && i.priority === 'Urgent').length;

  const toggle = <T,>(set: Set<T>, value: T, setter: (s: Set<T>) => void) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
    setPage(1);
  };

  const toolbar = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          size="sm"
          placeholder="Search indents"
          aria-label="Search indents"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          rightIcon={<SearchIcon />}
          className="w-56"
        />
        <Dropdown
          label="Filter by status"
          trigger={
            <Button color={statuses.size ? 'secondary' : 'ghost'} size="sm" rightIcon={<ChevronDownIcon />}>
              Status{statuses.size ? ` (${statuses.size})` : ''}
            </Button>
          }
        >
          {INDENT_STATUSES.map((s) => (
            <DropdownCheckboxItem key={s} checked={statuses.has(s)} onCheckedChange={() => toggle(statuses, s, setStatuses)}>
              {s}
            </DropdownCheckboxItem>
          ))}
          {statuses.size > 0 && (
            <>
              <DropdownSeparator />
              <DropdownItem onSelect={() => setStatuses(new Set())}>Clear</DropdownItem>
            </>
          )}
        </Dropdown>
        <Dropdown
          label="Filter by priority"
          trigger={
            <Button color={priority !== 'all' ? 'secondary' : 'ghost'} size="sm" rightIcon={<ChevronDownIcon />}>
              {priority === 'all' ? 'Priority' : priority}
            </Button>
          }
        >
          <DropdownItem onSelect={() => setPriority('all')}>All priorities</DropdownItem>
          {INDENT_PRIORITIES.map((p) => (
            <DropdownItem key={p} onSelect={() => setPriority(p)}>
              {p}
            </DropdownItem>
          ))}
        </Dropdown>
        <Dropdown
          label="Filter by supervisor"
          trigger={
            <Button color={supervisors.size ? 'secondary' : 'ghost'} size="sm" rightIcon={<ChevronDownIcon />}>
              Supervisor{supervisors.size ? ` (${supervisors.size})` : ''}
            </Button>
          }
        >
          {supervisorNames.map((n) => (
            <DropdownCheckboxItem key={n} checked={supervisors.has(n)} onCheckedChange={() => toggle(supervisors, n, setSupervisors)}>
              {n}
            </DropdownCheckboxItem>
          ))}
        </Dropdown>
      </div>
      <Button color="secondary" size="sm" onClick={onExport}>
        Export
      </Button>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
      <div className="grid shrink-0 gap-4 md:grid-cols-4">
        <Card>
          <CardText>Pending approval</CardText>
          <CardTitle>{count('Pending')}</CardTitle>
        </Card>
        <Card>
          <CardText>Urgent and pending</CardText>
          <CardTitle>{urgentPending}</CardTitle>
        </Card>
        <Card>
          <CardText>Approved</CardText>
          <CardTitle>{count('Approved') + count('Partially approved')}</CardTitle>
        </Card>
        <Card>
          <CardText>Rejected</CardText>
          <CardTitle>{count('Rejected')}</CardTitle>
        </Card>
      </div>

      <Table toolbar={toolbar} stickyHeader containerClassName="min-h-0 flex-1" className="min-w-max">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="min-w-56">Indent</TableHeaderCell>
            <TableHeaderCell className="min-w-56">Requested by</TableHeaderCell>
            <TableHeaderCell>Site</TableHeaderCell>
            <TableHeaderCell>Materials</TableHeaderCell>
            <TableHeaderCell>Required by</TableHeaderCell>
            <TableHeaderCell>Priority</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Requested on</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No indents match these filters.
              </TableCell>
            </TableRow>
          )}
          {rows.map((i) => (
            <TableRow key={i.id}>
              <TableCell>
                <a
                  href={`#indent/${i.number}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onOpen(i);
                  }}
                  className="flex max-w-72 flex-col items-start gap-1.5 rounded text-start hover:underline focus-visible:shadow-focus-brand focus-visible:outline-none"
                >
                  <span className="text-fg-brand">{i.number}</span>
                  <span className="truncate text-xs font-normal text-body">{i.purpose}</span>
                </a>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-3">
                  <Avatar name={i.requestedBy.name} size="base" />
                  <span className="flex flex-col gap-1">
                    <span>{i.requestedBy.name}</span>
                    <span className="text-xs font-normal text-body">{i.requestedBy.role}</span>
                  </span>
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">{i.site}</TableCell>
              <TableCell>{i.lines.length}</TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(i.requiredBy)}</TableCell>
              <TableCell>
                <Badge color={i.priority === 'Urgent' ? 'danger' : 'white'}>{i.priority}</Badge>
              </TableCell>
              <TableCell>
                <Badge color={statusBadge[i.status]}>{i.status}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">{formatDate(i.requestedOn)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-body">
          {filtered.length} indent{filtered.length === 1 ? '' : 's'}
        </p>
        <Pagination
          variant="arrows"
          page={current}
          pageCount={pageCount}
          onPageChange={setPage}
          helper={{ from: filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1, to: Math.min(current * PAGE_SIZE, filtered.length), total: filtered.length }}
        />
      </div>
    </div>
  );
}
