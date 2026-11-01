// Reference "Site Transfers" and "Material Issue": stock leaving a project, either to another site (approved first,
// as in the reference's "Approval Confirmation" dialog) or issued to a task or a subcontractor.
import { useState, type ReactNode } from 'react';
import { PlusIcon, TrashBinIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { HelperText, Input, Label } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Radio } from '../../components/ui/Checkbox';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { usePaged } from './hooks';
import { fmtDateTime, ME, qty, useStore, type SiteTransfer } from './model';
import { EmptyState, MaterialCell, StatusBadge, TableFooter } from './shared';

type Line = { materialId: string; qty: number };

/** Material lines limited by the project's stock. */
function LinesEditor({ projectId, lines, onChange, tried }: { projectId: string; lines: Line[]; onChange: (l: Line[]) => void; tried: boolean }) {
  const { state, material } = useStore();
  const stock = (id: string) => state.projectMaterials.find((r) => r.projectId === projectId && r.materialId === id)?.inStock ?? 0;
  const options = state.projectMaterials.filter((r) => r.projectId === projectId && r.inStock > 0 && !lines.some((l) => l.materialId === r.materialId));
  const over = lines.filter((l) => l.qty > stock(l.materialId));
  return (
    <div className="flex flex-col gap-3">
      {options.length > 0 && (
        <Select size="sm" aria-label="Add material" value="" onChange={(e) => onChange([...lines, { materialId: e.target.value, qty: 0 }])} className="w-60">
          <option value="">+ Add material</option>
          {options.map((r) => (
            <option key={r.materialId} value={r.materialId}>
              {material(r.materialId).name}
            </option>
          ))}
        </Select>
      )}
      <Table aria-label="Materials">
        <TableHead>
          <TableRow className="whitespace-nowrap">
            <TableHeaderCell className="min-w-64">Material</TableHeaderCell>
            <TableHeaderCell>In stock</TableHeaderCell>
            <TableHeaderCell>Quantity</TableHeaderCell>
            <TableHeaderCell>
              <span className="sr-only">Remove</span>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lines.map((l, i) => {
            const m = material(l.materialId);
            const bad = l.qty > stock(l.materialId) || (tried && !(l.qty > 0));
            return (
              <TableRow key={l.materialId}>
                <TableCell>
                  <MaterialCell name={m.name} spec={m.spec} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{qty(stock(l.materialId), m.uom)}</TableCell>
                <TableCell>
                  <Input
                    size="sm"
                    inputMode="decimal"
                    aria-label={`Quantity of ${m.name}`}
                    placeholder="Enter"
                    value={l.qty ? String(l.qty) : ''}
                    onChange={(e) => onChange(lines.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 } : x)))}
                    rightIcon={<span className="text-xs">{m.uom}</span>}
                    status={bad ? 'danger' : undefined}
                    aria-invalid={bad || undefined}
                    className="w-32"
                  />
                </TableCell>
                <TableCell>
                  <Button color="ghost" size="xs" iconOnly aria-label={`Remove ${m.name}`} onClick={() => onChange(lines.filter((_, j) => j !== i))}>
                    <TrashBinIcon />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {lines.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Add materials that are in stock on this project.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {over.length > 0 && <HelperText status="danger">A quantity is more than the stock on this project.</HelperText>}
    </div>
  );
}

const linesValid = (lines: Line[], stock: (id: string) => number) => lines.length > 0 && lines.every((l) => l.qty > 0 && l.qty <= stock(l.materialId));

function ListShell({ label, empty, emptyAction, toolbar, children, footer }: { label: string; empty: string | null; emptyAction: ReactNode; toolbar: ReactNode; children: ReactNode; footer: ReactNode }) {
  if (empty) return <EmptyState title={empty}>{emptyAction}</EmptyState>;
  return (
    <Table aria-label={label} stickyHeader containerClassName="min-h-0 flex-1" toolbar={toolbar} footer={footer}>
      {children}
    </Table>
  );
}

export function SiteTransfers() {
  const { state, dispatch, material, project, notify } = useStore();
  const [creating, setCreating] = useState(false);
  const [deciding, setDeciding] = useState<{ t: SiteTransfer; status: 'Approved' | 'Rejected' } | null>(null);
  const [remark, setRemark] = useState('');
  const { visible, footer } = usePaged(state.transfers);
  const create = (
    <Button size="sm" leftIcon={<PlusIcon />} onClick={() => setCreating(true)}>
      Create Site Transfer
    </Button>
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <ListShell label="Site transfers" empty={state.transfers.length ? null : 'Move stock between your sites.'} emptyAction={create} toolbar={<><span className="text-sm text-body">Stock moves between sites once the transfer is approved.</span>{create}</>} footer={<TableFooter {...footer} />}>
        <TableHead>
          <TableRow className="whitespace-nowrap">
            <TableHeaderCell>Transfer ID</TableHeaderCell>
            <TableHeaderCell>From</TableHeaderCell>
            <TableHeaderCell>To</TableHeaderCell>
            <TableHeaderCell>Materials</TableHeaderCell>
            <TableHeaderCell>Created by</TableHeaderCell>
            <TableHeaderCell>Created on</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>
              <span className="sr-only">Actions</span>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="whitespace-nowrap">{t.id}</TableCell>
              <TableCell className="whitespace-nowrap">{project(t.fromProjectId).name}</TableCell>
              <TableCell className="whitespace-nowrap">{project(t.toProjectId).name}</TableCell>
              <TableCell>{t.items.map((i) => `${material(i.materialId).name} × ${qty(i.qty, material(i.materialId).uom)}`).join(', ')}</TableCell>
              <TableCell className="whitespace-nowrap">{t.createdBy}</TableCell>
              <TableCell className="whitespace-nowrap">{fmtDateTime(t.createdOn)}</TableCell>
              <TableCell>
                <StatusBadge status={t.status} />
              </TableCell>
              <TableCell>
                {t.status === 'Approval Pending' && (
                  <div className="flex gap-2">
                    <Button color="success" outline size="xs" onClick={() => setDeciding({ t, status: 'Approved' })}>
                      Approve
                    </Button>
                    <Button color="danger" outline size="xs" onClick={() => setDeciding({ t, status: 'Rejected' })}>
                      Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ListShell>

      {creating && <CreateTransfer onClose={() => setCreating(false)} />}

      <Modal
        open={deciding !== null}
        onOpenChange={(o) => !o && setDeciding(null)}
        title={deciding?.status === 'Rejected' ? 'Rejection Confirmation' : 'Approval Confirmation'}
        footer={
          <>
            <Button color="tertiary" onClick={() => setDeciding(null)}>
              Cancel
            </Button>
            <Button
              color={deciding?.status === 'Rejected' ? 'danger' : 'brand'}
              onClick={() => {
                dispatch({ type: 'decideTransfer', id: deciding!.t.id, status: deciding!.status });
                notify(`${deciding!.t.id} ${deciding!.status === 'Approved' ? 'approved: stock moved' : 'rejected'}`);
                setDeciding(null);
                setRemark('');
              }}
            >
              {deciding?.status === 'Rejected' ? 'Reject' : 'Approve'}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-body">
            Are you sure you want to {deciding?.status === 'Rejected' ? 'reject' : 'approve'} Site Transfer <b className="text-heading">{deciding?.t.id}</b>?
          </p>
          <div>
            <Label htmlFor="transfer-remark">Remark</Label>
            <Textarea id="transfer-remark" rows={3} placeholder="Enter here" value={remark} onChange={(e) => setRemark(e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function CreateTransfer({ onClose }: { onClose: () => void }) {
  const { state, dispatch, notify } = useStore();
  const [from, setFrom] = useState(state.projects[0].id);
  const [to, setTo] = useState(state.projects[1]?.id ?? '');
  const [lines, setLines] = useState<Line[]>([]);
  const [remark, setRemark] = useState('');
  const [tried, setTried] = useState(false);
  const stock = (id: string) => state.projectMaterials.find((r) => r.projectId === from && r.materialId === id)?.inStock ?? 0;
  const ok = linesValid(lines, stock) && to && to !== from;
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      placement="end"
      className="w-2xl"
      title="Create Site Transfer"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button color="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTried(true);
              if (!ok) return;
              dispatch({ type: 'addTransfer', transfer: { fromProjectId: from, toProjectId: to, createdBy: ME, createdOn: new Date(), items: lines, remark: remark.trim() } });
              notify('Site transfer sent for approval');
              onClose();
            }}
          >
            Send for approval
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="st-from">Transfer from</Label>
            <Select
              id="st-from"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setLines([]);
              }}
            >
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="st-to">Transfer to</Label>
            <Select id="st-to" value={to} onChange={(e) => setTo(e.target.value)} status={tried && to === from ? 'danger' : undefined}>
              {state.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            {tried && to === from && <HelperText status="danger">Choose a different site.</HelperText>}
          </div>
        </div>
        <LinesEditor projectId={from} lines={lines} onChange={setLines} tried={tried} />
        <div>
          <Label htmlFor="st-remark">Remark</Label>
          <Textarea id="st-remark" rows={3} placeholder="Enter here" value={remark} onChange={(e) => setRemark(e.target.value)} />
        </div>
      </div>
    </Drawer>
  );
}

export function MaterialIssues() {
  const { state, material, project } = useStore();
  const [creating, setCreating] = useState(false);
  const { visible, footer } = usePaged(state.issues);
  const create = (
    <Button size="sm" leftIcon={<PlusIcon />} onClick={() => setCreating(true)}>
      Issue Material
    </Button>
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      <ListShell label="Material issues" empty={state.issues.length ? null : 'Issue material to a task or a subcontractor.'} emptyAction={create} toolbar={<><span className="text-sm text-body">Issued material leaves the project's stock and counts as used.</span>{create}</>} footer={<TableFooter {...footer} />}>
        <TableHead>
          <TableRow className="whitespace-nowrap">
            <TableHeaderCell>Issue ID</TableHeaderCell>
            <TableHeaderCell>Project</TableHeaderCell>
            <TableHeaderCell>Issued to</TableHeaderCell>
            <TableHeaderCell>Materials</TableHeaderCell>
            <TableHeaderCell>Issued by</TableHeaderCell>
            <TableHeaderCell>Issued on</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="whitespace-nowrap">{i.id}</TableCell>
              <TableCell className="whitespace-nowrap">{project(i.projectId).name}</TableCell>
              <TableCell>
                <MaterialCell name={i.issuedToName} spec={i.issuedTo} />
              </TableCell>
              <TableCell>{i.items.map((x) => `${material(x.materialId).name} × ${qty(x.qty, material(x.materialId).uom)}`).join(', ')}</TableCell>
              <TableCell className="whitespace-nowrap">{i.createdBy}</TableCell>
              <TableCell className="whitespace-nowrap">{fmtDateTime(i.createdOn)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </ListShell>
      {creating && <CreateIssue onClose={() => setCreating(false)} />}
    </div>
  );
}

function CreateIssue({ onClose }: { onClose: () => void }) {
  const { state, dispatch, notify } = useStore();
  const [projectId, setProjectId] = useState(state.projects[0].id);
  const [to, setTo] = useState<'Task' | 'Subcontractor'>('Task');
  const [name, setName] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [tried, setTried] = useState(false);
  const stock = (id: string) => state.projectMaterials.find((r) => r.projectId === projectId && r.materialId === id)?.inStock ?? 0;
  const ok = linesValid(lines, stock) && name.trim();
  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      placement="end"
      className="w-2xl"
      title="Issue Material"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button color="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTried(true);
              if (!ok) return;
              dispatch({ type: 'addIssue', issue: { projectId, issuedTo: to, issuedToName: name.trim(), createdBy: ME, createdOn: new Date(), items: lines } });
              notify('Material issued and stock updated');
              onClose();
            }}
          >
            Issue
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <Label htmlFor="issue-project">Project</Label>
          <Select
            id="issue-project"
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setLines([]);
            }}
          >
            {state.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium text-heading">Issue to</legend>
          <div className="flex gap-6">
            <Radio name="issue-to" label="Task" checked={to === 'Task'} onChange={() => setTo('Task')} />
            <Radio name="issue-to" label="Subcontractor" checked={to === 'Subcontractor'} onChange={() => setTo('Subcontractor')} />
          </div>
        </fieldset>
        <div>
          <Label htmlFor="issue-name" required>
            {to === 'Task' ? 'Task' : 'Subcontractor'}
          </Label>
          <Input id="issue-name" placeholder={to === 'Task' ? 'e.g. Floor 2 · Flat 201 · Electrical work' : 'e.g. Kumar Masonry Works'} value={name} onChange={(e) => setName(e.target.value)} status={tried && !name.trim() ? 'danger' : undefined} />
          {tried && !name.trim() && <HelperText status="danger">Enter who receives the material.</HelperText>}
        </div>
        <LinesEditor projectId={projectId} lines={lines} onChange={setLines} tried={tried} />
      </div>
    </Drawer>
  );
}
