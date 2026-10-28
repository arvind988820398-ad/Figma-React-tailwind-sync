// Indent details: who asked for what, the requested lines with approved quantities, the review history, and the
// approve / reject actions. Composed from Drawer, Badge, Avatar, Table, Input, Textarea, Timeline and Button.
import { useState } from 'react';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { Input, Label } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { Timeline } from '../../components/ui/Timeline';
import { formatDate, statusBadge, type Indent } from './indents';
import type { IndentDecision } from './store';

export interface IndentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  indent: Indent | null;
  onApprove: (id: string, decision: IndentDecision) => void;
  onReject: (id: string, note?: string) => void;
}

const num = new Intl.NumberFormat('en-IN');

export function IndentDrawer({ open, onOpenChange, indent, onApprove, onReject }: IndentDrawerProps) {
  // The parent remounts this drawer per open (key), so state starts from the indent being reviewed.
  const [approved, setApproved] = useState<string[]>(() => (indent ? indent.lines.map((l) => String(l.approvedQty ?? l.requestedQty)) : []));
  const [note, setNote] = useState('');
  if (!indent) return null;

  const pending = indent.status === 'Pending';
  const decide = (kind: 'approve' | 'reject') => {
    if (kind === 'approve') onApprove(indent.id, { approvedQty: approved.map((v) => Number(v)), note });
    else onReject(indent.id, note);
    onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      placement="end"
      size="md"
      className="w-2xl max-w-full"
      title={`Indent ${indent.number}`}
      footer={
        <div className="flex w-full items-center justify-end gap-3">
          {pending ? (
            <>
              <Button color="danger" outline size="lg" onClick={() => decide('reject')}>
                Reject
              </Button>
              <Button size="lg" onClick={() => decide('approve')} className="min-w-36">
                Approve
              </Button>
            </>
          ) : (
            <Button color="tertiary" size="lg" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color={statusBadge[indent.status]} size="lg">
            {indent.status}
          </Badge>
          <Badge color={indent.priority === 'Urgent' ? 'danger' : 'white'} size="lg">
            {indent.priority}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div className="col-span-2 flex items-center gap-3">
            <Avatar name={indent.requestedBy.name} size="lg" />
            <div className="min-w-0">
              <dt className="text-xs text-body-subtle">Requested by</dt>
              <dd className="font-medium text-heading">{indent.requestedBy.name}</dd>
              <dd className="text-body">{indent.requestedBy.role}</dd>
            </div>
          </div>
          <div>
            <dt className="text-xs text-body-subtle">Site</dt>
            <dd className="font-medium text-heading">{indent.site}</dd>
          </div>
          <div>
            <dt className="text-xs text-body-subtle">Requested on</dt>
            <dd className="font-medium text-heading">{formatDate(indent.requestedOn)}</dd>
          </div>
          <div>
            <dt className="text-xs text-body-subtle">Required by</dt>
            <dd className="font-medium text-heading">{formatDate(indent.requiredBy)}</dd>
          </div>
          <div>
            <dt className="text-xs text-body-subtle">Lines</dt>
            <dd className="font-medium text-heading">{indent.lines.length} material{indent.lines.length === 1 ? '' : 's'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-body-subtle">Purpose</dt>
            <dd className="text-body">{indent.purpose}</dd>
          </div>
        </dl>

        <section className="flex flex-col gap-3" aria-label="Requested materials">
          <h3 className="text-base font-medium text-heading">Requested materials</h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Material</TableHeaderCell>
                <TableHeaderCell>UOM</TableHeaderCell>
                <TableHeaderCell>Requested</TableHeaderCell>
                <TableHeaderCell>Approved</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {indent.lines.map((line, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <span className="flex flex-col gap-1.5">
                      <span>{line.material}</span>
                      {line.specification && <span className="text-xs font-normal text-body">{line.specification}</span>}
                    </span>
                  </TableCell>
                  <TableCell>{line.uom}</TableCell>
                  <TableCell>{num.format(line.requestedQty)}</TableCell>
                  <TableCell>
                    {pending ? (
                      <Input
                        size="sm"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={line.requestedQty}
                        aria-label={`Approved quantity for ${line.material}`}
                        value={approved[i] ?? ''}
                        onChange={(e) => setApproved((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
                        className="w-24"
                      />
                    ) : line.approvedQty === undefined ? (
                      <span className="text-body">-</span>
                    ) : (
                      num.format(line.approvedQty)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {pending && (
          <div>
            <Label htmlFor={`note-${indent.id}`} hint="Optional">
              Note to supervisor
            </Label>
            <Textarea id={`note-${indent.id}`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for a partial approval or a rejection" />
          </div>
        )}

        <section className="flex flex-col gap-3" aria-label="History">
          <h3 className="text-base font-medium text-heading">History</h3>
          <Timeline
            items={indent.history.map((h) => ({
              date: formatDate(h.at),
              title: h.title,
              description: h.description ? `${h.by} · ${h.description}` : h.by,
            }))}
          />
        </section>
      </div>
    </Drawer>
  );
}
