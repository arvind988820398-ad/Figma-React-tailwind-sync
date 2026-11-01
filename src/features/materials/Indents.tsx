// Reference "Indent": the indents table (filters, show deleted, export), the indent drawer with per-material
// approval, and "Create Indent" in two steps (select materials, then quantities and delivery).
import { useMemo, useState } from 'react';
import { CheckIcon, CloseIcon, DotsVerticalIcon, DownloadIcon, FileCopyIcon, FileCsvIcon, FilePdfIcon, PlusIcon, SearchIcon, TrashBinIcon } from '../../components/icons';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Datepicker } from '../../components/ui/Datepicker';
import { Drawer } from '../../components/ui/Drawer';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { FileDropzone } from '../../components/ui/FileUpload';
import { HelperText, Input, Label } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Stepper } from '../../components/ui/Stepper';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { Toggle } from '../../components/ui/Toggle';
import { usePaged, useSelection } from './hooks';
import { delayDays, fmtDate, fmtDateTime, ME, qty, useStore, type Indent, type IndentItem, type IndentStatus } from './model';
import { EmptyState, FilterMenu, InfoHeader, MaterialCell, SortButton, StatusBadge, SummaryCard, TableFooter } from './shared';

const STATUSES: IndentStatus[] = ['Approval Pending', 'Approved', 'Partially Approved', 'Rejected', 'Partially PO Converted', 'Converted to PO'];
const TEAM = ['Sathish', 'Arvind', 'Rajan Singh', 'Manish Sharma'];

export function Indents({ openId, onOpen, onCreatePo, createFor, onCreateDone }: {
  openId?: string;
  onOpen: (id?: string) => void;
  onCreatePo: (indentId: string) => void;
  /** Open "Create Indent" with these materials already picked (from the Material List selection). */
  createFor?: { projectId: string; materialIds: string[] } | null;
  onCreateDone: () => void;
}) {
  const { state, material, project } = useStore();
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [creators, setCreators] = useState<string[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [newestFirst, setNewestFirst] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [duplicateOf, setDuplicateOf] = useState<Indent | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.indents
      .filter((i) => (showDeleted ? i.deleted : !i.deleted))
      .filter((i) => !q || i.id.toLowerCase().includes(q) || i.items.some((x) => material(x.materialId).name.toLowerCase().includes(q)))
      .filter((i) => statuses.length === 0 || statuses.includes(i.status))
      .filter((i) => projects.length === 0 || projects.includes(project(i.projectId).name))
      .filter((i) => creators.length === 0 || creators.includes(i.createdBy))
      .sort((a, b) => (b.createdOn.getTime() - a.createdOn.getTime()) * (newestFirst ? 1 : -1));
  }, [state.indents, query, statuses, projects, creators, showDeleted, newestFirst, material, project]);

  const { visible, footer } = usePaged(rows);
  const sel = useSelection(visible.map((i) => i.id));
  const open = state.indents.find((i) => i.id === openId);
  const creating = createOpen || !!createFor || !!duplicateOf;

  const toolbar = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Input size="sm" type="search" aria-label="Search indents" placeholder="Search ID or material" leftIcon={<SearchIcon />} value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
        <FilterMenu label="Project" options={state.projects.map((p) => p.name)} selected={projects} onChange={setProjects} />
        <FilterMenu label="Indent Status" options={STATUSES} selected={statuses} onChange={setStatuses} />
        <FilterMenu label="Created by" options={[...new Set(state.indents.map((i) => i.createdBy))]} selected={creators} onChange={setCreators} />
        <Toggle checked={showDeleted} onCheckedChange={setShowDeleted}>
          Show deleted indents
        </Toggle>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" leftIcon={<PlusIcon />} onClick={() => setCreateOpen(true)}>
          Create Indent
        </Button>
        <Button color="tertiary" size="sm" leftIcon={<FileCsvIcon />} onClick={() => window.print()}>
          Export
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      {state.indents.length === 0 ? (
        <EmptyState title="Start managing your indents.">
          <Button onClick={() => setCreateOpen(true)}>Create Indent</Button>
        </EmptyState>
      ) : (
        <Table aria-label="Indents" stickyHeader containerClassName="min-h-0 flex-1" toolbar={toolbar} footer={<TableFooter selected={sel.selected.size} {...footer} />}>
          <TableHead>
            <TableRow className="whitespace-nowrap">
              <TableHeaderCell className="w-14">
                <Checkbox aria-label="Select all indents on this page" checked={sel.all} onChange={sel.toggleAll} />
              </TableHeaderCell>
              <TableHeaderCell>IDs</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell className="min-w-64">Material Name</TableHeaderCell>
              <TableHeaderCell>Created by</TableHeaderCell>
              <TableHeaderCell aria-sort={newestFirst ? 'descending' : 'ascending'}>
                <SortButton label="Created on" onClick={() => setNewestFirst((n) => !n)} />
              </TableHeaderCell>
              <TableHeaderCell>Expected delivery</TableHeaderCell>
              <TableHeaderCell>Received on</TableHeaderCell>
              <TableHeaderCell>Delayed by</TableHeaderCell>
              <TableHeaderCell>Assigned to</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>
                <span className="sr-only">Actions</span>
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((i) => {
              const delay = i.status === 'Rejected' ? 0 : delayDays(i.expectedDelivery, i.receivedOn);
              const first = material(i.items[0].materialId);
              return (
                <TableRow key={i.id} aria-selected={sel.selected.has(i.id)}>
                  <TableCell>
                    <Checkbox aria-label={`Select ${i.id}`} checked={sel.selected.has(i.id)} onChange={() => sel.toggle(i.id)} />
                  </TableCell>
                  <TableCell>
                    <a href={`#/indent/${i.id}`} className="font-medium text-fg-brand hover:underline focus-visible:shadow-focus-brand focus-visible:outline-none">
                      {i.id}
                    </a>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{project(i.projectId).name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {first.name}
                    {i.items.length > 1 && <span className="text-body"> +{i.items.length - 1}</span>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{i.createdBy}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDateTime(i.createdOn)}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDate(i.expectedDelivery)}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDate(i.receivedOn)}</TableCell>
                  <TableCell className="whitespace-nowrap">{delay ? <Badge color="danger">{delay} {delay === 1 ? 'Day' : 'Days'}</Badge> : '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{i.assignedTo}</TableCell>
                  <TableCell>
                    <StatusBadge status={i.status} />
                  </TableCell>
                  <TableCell>
                    <IndentMenu indent={i} onCreatePo={onCreatePo} onDuplicate={() => setDuplicateOf(i)} />
                  </TableCell>
                </TableRow>
              );
            })}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center">
                  {showDeleted ? 'No deleted indents.' : 'No indents match these filters.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {open && <IndentDrawer key={open.id} indent={open} onClose={() => onOpen(undefined)} onCreatePo={onCreatePo} onDuplicate={() => setDuplicateOf(open)} />}
      {creating && (
        <CreateIndentDrawer
          initial={duplicateOf ? { projectId: duplicateOf.projectId, materialIds: duplicateOf.items.map((x) => x.materialId), quantities: Object.fromEntries(duplicateOf.items.map((x) => [x.materialId, x.requested])) } : createFor ?? undefined}
          onClose={() => {
            setCreateOpen(false);
            setDuplicateOf(null);
            onCreateDone();
          }}
        />
      )}
    </div>
  );
}

function IndentMenu({ indent, onCreatePo, onDuplicate }: { indent: Indent; onCreatePo: (id: string) => void; onDuplicate: () => void }) {
  const { dispatch, notify } = useStore();
  const canPo = indent.status === 'Approved' || indent.status === 'Partially Approved' || indent.status === 'Partially PO Converted';
  return (
    <Dropdown
      align="end"
      label={`Actions for ${indent.id}`}
      trigger={
        <Button color="ghost" size="xs" iconOnly aria-label={`Actions for ${indent.id}`}>
          <DotsVerticalIcon />
        </Button>
      }
    >
      <DropdownItem onSelect={() => window.location.assign(`#/indent/${indent.id}`)}>View details</DropdownItem>
      {canPo && <DropdownItem onSelect={() => onCreatePo(indent.id)}>Create PO</DropdownItem>}
      <DropdownItem icon={<FileCopyIcon />} onSelect={onDuplicate}>
        Duplicate indent
      </DropdownItem>
      {!indent.deleted && (
        <DropdownItem
          color="danger"
          icon={<TrashBinIcon />}
          onSelect={() => {
            dispatch({ type: 'deleteIndent', id: indent.id });
            notify(`${indent.id} deleted`);
          }}
        >
          Delete
        </DropdownItem>
      )}
    </Dropdown>
  );
}

/** The indent drawer: actions, details, materials with per-row approval, remark, attachments and approvers. */
function IndentDrawer({ indent, onClose, onCreatePo, onDuplicate }: { indent: Indent; onClose: () => void; onCreatePo: (id: string) => void; onDuplicate: () => void }) {
  const { state, dispatch, material, project, notify } = useStore();
  const pending = indent.status === 'Approval Pending' && !indent.deleted;
  const [items, setItems] = useState<IndentItem[]>(indent.items);
  const [confirm, setConfirm] = useState<'approve' | 'reject' | 'submit' | null>(null);
  const [remark, setRemark] = useState('');
  const decided = items.every((x) => x.decision);
  const canPo = indent.status === 'Approved' || indent.status === 'Partially Approved' || indent.status === 'Partially PO Converted';

  const setItem = (i: number, patch: Partial<IndentItem>) => setItems((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const finish = () => {
    const final = confirm === 'approve' ? items.map((x) => ({ ...x, decision: 'approved' as const })) : confirm === 'reject' ? items.map((x) => ({ ...x, decision: 'rejected' as const, approved: 0 })) : items;
    dispatch({ type: 'decideIndent', id: indent.id, items: final, remark: remark.trim() ? `${ME}: ${remark.trim()}` : undefined });
    notify(`${indent.id} ${confirm === 'reject' ? 'rejected' : 'updated'}`);
    setConfirm(null);
    onClose();
  };

  return (
    <>
      <Drawer
        open
        onOpenChange={(o) => !o && onClose()}
        placement="end"
        className="w-3xl"
        title={
          <span className="flex items-center gap-3">
            {indent.id} <StatusBadge status={indent.deleted ? 'Rejected' : indent.status} />
          </span>
        }
        footer={
          pending ? (
            <div className="flex w-full justify-end gap-3">
              <Button color="tertiary" onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={!decided} onClick={() => setConfirm('submit')}>
                Submit decision
              </Button>
            </div>
          ) : canPo ? (
            <div className="flex w-full justify-end">
              <Button onClick={() => onCreatePo(indent.id)}>Create PO</Button>
            </div>
          ) : undefined
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap justify-end gap-2">
            <Button color="ghost" size="sm" leftIcon={<DownloadIcon />} onClick={() => window.print()}>
              PDF
            </Button>
            <Button color="ghost" size="sm" leftIcon={<FileCopyIcon />} onClick={onDuplicate}>
              Duplicate Indent
            </Button>
          </div>

          <SummaryCard
            columns={4}
            items={[
              ['Project Name', project(indent.projectId).name],
              ['Created by', indent.createdBy],
              ['Created On', fmtDateTime(indent.createdOn)],
              ['Expected Delivery', fmtDate(indent.expectedDelivery)],
            ]}
          />

          {pending && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-body">Approve or reject each material, or all at once.</p>
              <div className="flex gap-3">
                <Button color="success" outline size="sm" onClick={() => setConfirm('approve')}>
                  Approve All
                </Button>
                <Button color="danger" outline size="sm" onClick={() => setConfirm('reject')}>
                  Reject All
                </Button>
              </div>
            </div>
          )}

          <Table aria-label={`Materials in ${indent.id}`}>
            <TableHead>
              <TableRow className="whitespace-nowrap">
                <TableHeaderCell className="min-w-64">Material Name</TableHeaderCell>
                <TableHeaderCell>Requested</TableHeaderCell>
                <TableHeaderCell>{pending ? 'Approved Quantity' : 'Approved'}</TableHeaderCell>
                <TableHeaderCell>{pending ? 'Action' : 'Decision'}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((x, i) => {
                const m = material(x.materialId);
                const row = state.projectMaterials.find((r) => r.projectId === indent.projectId && r.materialId === x.materialId);
                const balance = row ? Math.max(0, row.estimatedQty - row.inStock - row.totalUsed) : 0;
                return (
                  <TableRow key={x.materialId}>
                    <TableCell>
                      <MaterialCell name={m.name} spec={m.spec}>
                        <span className="flex flex-wrap items-center gap-x-3 text-xs text-body">
                          <span>
                            In stock: <b className="text-heading">{qty(row?.inStock ?? 0, m.uom)}</b>
                          </span>
                          <span className="inline-flex items-center">
                            <InfoHeader label="Bal. estimated qty" hint="Estimated qty − (in stock + used stock + upcoming deliveries)" />: <b className="ms-1 text-heading">{qty(balance, m.uom)}</b>
                          </span>
                        </span>
                      </MaterialCell>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <b className="text-heading">{qty(x.requested, m.uom)}</b>
                    </TableCell>
                    <TableCell>
                      {pending ? (
                        <Input
                          size="sm"
                          inputMode="decimal"
                          aria-label={`Approved quantity of ${m.name}`}
                          value={String(x.approved)}
                          onChange={(e) => setItem(i, { approved: Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0) })}
                          rightIcon={<span className="text-xs">{m.uom}</span>}
                          className="w-32"
                          disabled={x.decision === 'rejected'}
                        />
                      ) : (
                        <span className="whitespace-nowrap">{x.decision === 'approved' ? qty(x.approved, m.uom) : '-'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {pending ? (
                        <div className="flex gap-2">
                          <Button color="success" outline size="xs" leftIcon={x.decision === 'approved' ? <CheckIcon /> : undefined} aria-pressed={x.decision === 'approved'} onClick={() => setItem(i, { decision: 'approved' })}>
                            Approve
                          </Button>
                          <Button color="danger" outline size="xs" leftIcon={x.decision === 'rejected' ? <CloseIcon /> : undefined} aria-pressed={x.decision === 'rejected'} onClick={() => setItem(i, { decision: 'rejected' })}>
                            Reject
                          </Button>
                        </div>
                      ) : x.decision ? (
                        <StatusBadge status={x.decision === 'approved' ? 'Approved' : 'Rejected'} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {indent.remark && (
            <section className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-heading">Remark</h3>
              <p className="whitespace-pre-line text-sm text-body">{indent.remark}</p>
            </section>
          )}

          {indent.attachments.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-heading">Attachments</h3>
              <ul className="flex flex-wrap gap-2">
                {indent.attachments.map((a) => (
                  <li key={a}>
                    <Badge color="white" size="lg" leading={<FilePdfIcon />}>
                      {a}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="flex flex-col gap-3 border-t border-default pt-5">
            <h3 className="text-base font-semibold text-heading">Approver information</h3>
            <ul className="flex flex-col gap-3">
              {indent.approvers.map((p) => (
                <li key={p.name} className="flex items-center gap-3">
                  <Avatar name={p.name} size="sm" />
                  <span className="min-w-36 text-sm font-medium text-heading">{p.name}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>

      </Drawer>
        <Modal
          open={confirm !== null}
          onOpenChange={(o) => !o && setConfirm(null)}
          title={confirm === 'reject' ? 'Rejection Confirmation' : 'Approval Confirmation'}
          footer={
            <>
              <Button color="tertiary" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button color={confirm === 'reject' ? 'danger' : 'brand'} onClick={finish}>
                {confirm === 'reject' ? 'Reject' : confirm === 'approve' ? 'Approve' : 'Submit'}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-body">
              {confirm === 'reject' ? 'Are you sure you want to reject indent ' : confirm === 'approve' ? 'Are you sure you want to approve indent ' : 'Submit your decision for indent '}
              <b className="text-heading">{indent.id}</b>?
            </p>
            <div>
              <Label htmlFor="decision-remark">Remark</Label>
              <Textarea id="decision-remark" rows={3} placeholder="Enter here" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
          </div>
        </Modal>
    </>
  );
}

/** "Create Indent": step 1 selects materials of a project (low stock first on request), step 2 sets quantities. */
function CreateIndentDrawer({ initial, onClose }: { initial?: { projectId: string; materialIds: string[]; quantities?: Record<string, number> }; onClose: () => void }) {
  const { state, dispatch, material, notify } = useStore();
  const [step, setStep] = useState(initial?.materialIds.length ? 1 : 0);
  const [projectId, setProjectId] = useState(initial?.projectId ?? state.projects[0].id);
  const [picked, setPicked] = useState<string[]>(initial?.materialIds ?? []);
  const [lowOnly, setLowOnly] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, string>>(Object.fromEntries(Object.entries(initial?.quantities ?? {}).map(([k, v]) => [k, String(v)])));
  const [expected, setExpected] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [assignee, setAssignee] = useState(TEAM[0]);
  const [remark, setRemark] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const [today] = useState(() => new Date());

  const list = state.projectMaterials
    .filter((r) => r.projectId === projectId)
    .map((r) => ({ ...r, m: material(r.materialId), low: r.minStock > 0 && r.inStock < r.minStock }))
    .filter((r) => !lowOnly || r.low);
  const missing = picked.filter((id) => !(Number(quantities[id]) > 0));

  const submit = () => {
    setTried(true);
    if (missing.length || !expected) return;
    dispatch({
      type: 'addIndent',
      indent: {
        projectId,
        createdBy: ME,
        createdOn: new Date(),
        expectedDelivery: expected,
        assignedTo: assignee,
        items: picked.map((id) => ({ materialId: id, requested: Number(quantities[id]), approved: Number(quantities[id]) })),
        remark: remark.trim(),
        attachments: files,
      },
    });
    notify('Indent created and sent for approval');
    onClose();
  };

  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      placement="end"
      className="w-3xl"
      title={`Create Indent - Step ${step + 1}: ${step === 0 ? 'Select Materials' : 'Quantities & Delivery'}`}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <span className="text-sm text-body">{picked.length} item{picked.length === 1 ? '' : 's'} selected</span>
          <div className="flex gap-3">
            {step === 1 ? (
              <>
                <Button color="tertiary" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button onClick={submit}>Create Indent</Button>
              </>
            ) : (
              <>
                <Button color="tertiary" onClick={onClose}>
                  Cancel
                </Button>
                <Button disabled={picked.length === 0} onClick={() => setStep(1)}>
                  Next
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <Stepper current={step} steps={[{ title: 'Select materials' }, { title: 'Quantities & delivery' }]} />

        {step === 0 ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="w-64">
                <Label htmlFor="indent-project">Project</Label>
                <Select
                  id="indent-project"
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    setPicked([]);
                  }}
                >
                  {state.projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Toggle checked={lowOnly} onCheckedChange={setLowOnly}>
                Show low stock only
              </Toggle>
            </div>
            <Table aria-label="Materials to request">
              <TableHead>
                <TableRow className="whitespace-nowrap">
                  <TableHeaderCell className="w-14">
                    <span className="sr-only">Select</span>
                  </TableHeaderCell>
                  <TableHeaderCell className="min-w-64">Material</TableHeaderCell>
                  <TableHeaderCell>Category</TableHeaderCell>
                  <TableHeaderCell>In stock</TableHeaderCell>
                  <TableHeaderCell>Stock Alert</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.materialId} aria-selected={picked.includes(r.materialId)}>
                    <TableCell>
                      <Checkbox aria-label={`Select ${r.m.name}`} checked={picked.includes(r.materialId)} onChange={() => setPicked((p) => (p.includes(r.materialId) ? p.filter((x) => x !== r.materialId) : [...p, r.materialId]))} />
                    </TableCell>
                    <TableCell>
                      <MaterialCell name={r.m.name} spec={r.m.spec} />
                    </TableCell>
                    <TableCell>{r.m.category}</TableCell>
                    <TableCell className="whitespace-nowrap">{qty(r.inStock, r.m.uom)}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.low ? <Badge color="danger">&lt;{r.minStock} (Low)</Badge> : r.minStock ? `≥${r.minStock}` : '-'}</TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {lowOnly ? 'No material is below its minimum stock.' : 'This project has no materials yet. Add them in the Material List.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        ) : (
          <>
            <Table aria-label="Requested quantities">
              <TableHead>
                <TableRow className="whitespace-nowrap">
                  <TableHeaderCell className="min-w-64">Material</TableHeaderCell>
                  <TableHeaderCell>In stock</TableHeaderCell>
                  <TableHeaderCell>Requested quantity</TableHeaderCell>
                  <TableHeaderCell>
                    <span className="sr-only">Remove</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {picked.map((id) => {
                  const m = material(id);
                  const row = state.projectMaterials.find((r) => r.projectId === projectId && r.materialId === id);
                  const bad = tried && missing.includes(id);
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <MaterialCell name={m.name} spec={m.spec} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{qty(row?.inStock ?? 0, m.uom)}</TableCell>
                      <TableCell>
                        <Input
                          size="sm"
                          inputMode="decimal"
                          aria-label={`Requested quantity of ${m.name}`}
                          placeholder="Enter"
                          value={quantities[id] ?? ''}
                          onChange={(e) => setQuantities((q) => ({ ...q, [id]: e.target.value.replace(/[^\d.]/g, '') }))}
                          rightIcon={<span className="text-xs">{m.uom}</span>}
                          status={bad ? 'danger' : undefined}
                          aria-invalid={bad || undefined}
                          className="w-36"
                        />
                      </TableCell>
                      <TableCell>
                        <Button color="ghost" size="xs" iconOnly aria-label={`Remove ${m.name}`} onClick={() => setPicked((p) => p.filter((x) => x !== id))}>
                          <TrashBinIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {tried && missing.length > 0 && <HelperText status="danger">Enter a quantity for every material.</HelperText>}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="indent-expected" required>
                  Expected delivery
                </Label>
                <Datepicker id="indent-expected" value={expected} onChange={setExpected} min={today} />
              </div>
              <div>
                <Label htmlFor="indent-assignee">Assign to</Label>
                <Select id="indent-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  {TEAM.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="indent-remark">Remark</Label>
              <Textarea id="indent-remark" rows={3} placeholder="Enter here" value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-heading">Attachments</p>
              <FileDropzone multiple accept=".pdf,.doc,.docx,image/*" hint="PDF, DOC or JPG" onFiles={(f) => setFiles((all) => [...new Set([...all, ...f.map((x) => x.name)])])} />
              {files.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {files.map((f) => (
                    <li key={f}>
                      <Badge color="white" size="lg" onRemove={() => setFiles((all) => all.filter((x) => x !== f))} removeLabel={`Remove ${f}`}>
                        {f}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

