// Reference "Purchase Orders": the PO table (a PO expands to its GRNs), the PO drawer with amounts, delivery
// progress and approval, and "Create Purchase Order" (from an approved indent or from scratch) with live totals.
import { Fragment, useMemo, useState } from 'react';
import { AngleDownIcon, AngleRightIcon, DownloadIcon, FileCsvIcon, PlusIcon, SearchIcon, TrashBinIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Datepicker } from '../../components/ui/Datepicker';
import { Drawer } from '../../components/ui/Drawer';
import { HelperText, Input, Label } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Progress } from '../../components/ui/Progress';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { usePaged } from './hooks';
import { delayDays, deliveredQty, deliveredValue, fmtDate, fmtDateTime, inr, ME, poTotals, qty, useStore, type PoItem, type PoStatus, type PurchaseOrder } from './model';
import { EmptyState, FilterMenu, MaterialCell, SortButton, StatusBadge, SummaryCard, TableFooter } from './shared';

const STATUSES: PoStatus[] = ['Approval Pending', 'Approved', 'Rejected', 'Partially Delivered', 'Delivered', 'Delivery Closed'];

export function PurchaseOrders({ openId, onOpen, createFromIndent, onCreateDone, onCreateGrn }: {
  openId?: string;
  onOpen: (id?: string) => void;
  /** Indent id to start "Create PO" from, or "new" for a blank PO. */
  createFromIndent?: string | null;
  onCreateDone: () => void;
  onCreateGrn: (poId: string) => void;
}) {
  const { state, project } = useStore();
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [newestFirst, setNewestFirst] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['PO000125']));
  const [creating, setCreating] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.pos
      .filter((p) => !q || p.id.toLowerCase().includes(q) || (p.indentId ?? '').toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q))
      .filter((p) => statuses.length === 0 || statuses.includes(p.status))
      .filter((p) => vendors.length === 0 || vendors.includes(p.vendor))
      .filter((p) => projects.length === 0 || projects.includes(project(p.projectId).name))
      .sort((a, b) => (b.createdOn.getTime() - a.createdOn.getTime()) * (newestFirst ? 1 : -1));
  }, [state.pos, query, statuses, vendors, projects, newestFirst, project]);
  const { visible, footer } = usePaged(rows);
  const open = state.pos.find((p) => p.id === openId);
  const toggle = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      {state.pos.length === 0 ? (
        <EmptyState title="Start managing your purchase orders.">
          <Button onClick={() => setCreating(true)}>Create PO</Button>
        </EmptyState>
      ) : (
        <Table
          aria-label="Purchase orders"
          stickyHeader
          containerClassName="min-h-0 flex-1"
          footer={<TableFooter {...footer} />}
          toolbar={
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Input size="sm" type="search" aria-label="Search purchase orders" placeholder="Search PO, indent or vendor" leftIcon={<SearchIcon />} value={query} onChange={(e) => setQuery(e.target.value)} className="w-60" />
                <FilterMenu label="Project" options={state.projects.map((p) => p.name)} selected={projects} onChange={setProjects} />
                <FilterMenu label="Vendor" options={state.vendors} selected={vendors} onChange={setVendors} />
                <FilterMenu label="PO Status" options={STATUSES} selected={statuses} onChange={setStatuses} />
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" leftIcon={<PlusIcon />} onClick={() => setCreating(true)}>
                  Create PO
                </Button>
                <Button color="tertiary" size="sm" leftIcon={<FileCsvIcon />} onClick={() => window.print()}>
                  Export
                </Button>
              </div>
            </>
          }
        >
          <TableHead>
            <TableRow className="whitespace-nowrap">
              <TableHeaderCell>IDs</TableHeaderCell>
              <TableHeaderCell>Indent ID</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Created by</TableHeaderCell>
              <TableHeaderCell aria-sort={newestFirst ? 'descending' : 'ascending'}>
                <SortButton label="Created on" onClick={() => setNewestFirst((n) => !n)} />
              </TableHeaderCell>
              <TableHeaderCell>Expected delivery</TableHeaderCell>
              <TableHeaderCell>Delayed by</TableHeaderCell>
              <TableHeaderCell>PO Value</TableHeaderCell>
              <TableHeaderCell>Delivered Value</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((p) => {
              const grns = state.grns.filter((g) => g.poId === p.id);
              const isOpen = expanded.has(p.id);
              const lastGrn = grns[0]?.createdOn;
              const done = p.status === 'Delivered' || p.status === 'Delivery Closed' || p.status === 'Rejected';
              const delay = done ? (lastGrn ? delayDays(p.expectedDelivery, lastGrn) : 0) : delayDays(p.expectedDelivery);
              return (
                <Fragment key={p.id}>
                  <TableRow>
                    <TableCell className="whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        {grns.length > 0 ? (
                          <Button color="ghost" size="xs" iconOnly aria-expanded={isOpen} aria-label={`${isOpen ? 'Hide' : 'Show'} GRNs of ${p.id}`} onClick={() => toggle(p.id)}>
                            {isOpen ? <AngleDownIcon /> : <AngleRightIcon />}
                          </Button>
                        ) : (
                          <span className="w-8" aria-hidden="true" />
                        )}
                        <a href={`#/po/${p.id}`} className="font-medium text-fg-brand hover:underline focus-visible:shadow-focus-brand focus-visible:outline-none">
                          {p.id}
                        </a>
                      </span>
                    </TableCell>
                    <TableCell>{p.indentId ? <a href={`#/indent/${p.indentId}`} className="text-fg-brand hover:underline">{p.indentId}</a> : '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{project(p.projectId).name}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.vendor}</TableCell>
                    <TableCell className="whitespace-nowrap">{p.createdBy}</TableCell>
                    <TableCell className="whitespace-nowrap">{fmtDateTime(p.createdOn)}</TableCell>
                    <TableCell className="whitespace-nowrap">{fmtDate(p.expectedDelivery)}</TableCell>
                    <TableCell className="whitespace-nowrap">{delay ? `${delay} ${delay === 1 ? 'Day' : 'Days'}` : '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">{inr(poTotals(p).total)}</TableCell>
                    <TableCell className="whitespace-nowrap">{inr(deliveredValue(state, p.id))}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                  </TableRow>
                  {isOpen &&
                    grns.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="whitespace-nowrap">
                          <a href={`#/grn/${g.id}`} className="ms-9 font-medium text-fg-brand hover:underline">
                            {g.id}
                          </a>
                        </TableCell>
                        <TableCell>{p.indentId ?? '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{project(g.projectId).name}</TableCell>
                        <TableCell className="whitespace-nowrap">{g.vendor}</TableCell>
                        <TableCell>{g.createdBy}</TableCell>
                        <TableCell className="whitespace-nowrap">{fmtDateTime(g.createdOn)}</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell className="whitespace-nowrap">{inr(g.items.reduce((s, i) => s + i.qty * i.unitPrice, 0))}</TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    ))}
                </Fragment>
              );
            })}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  No purchase orders match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {open && <PoDrawer key={open.id} po={open} onClose={() => onOpen(undefined)} onCreateGrn={onCreateGrn} />}
      {(creating || createFromIndent) && (
        <CreatePoDrawer
          indentId={createFromIndent && createFromIndent !== 'new' ? createFromIndent : undefined}
          onClose={() => {
            setCreating(false);
            onCreateDone();
          }}
        />
      )}
    </div>
  );
}

function PoDrawer({ po, onClose, onCreateGrn }: { po: PurchaseOrder; onClose: () => void; onCreateGrn: (poId: string) => void }) {
  const { state, dispatch, material, project, notify } = useStore();
  const [confirm, setConfirm] = useState<'Approved' | 'Rejected' | 'Delivery Closed' | null>(null);
  const t = poTotals(po);
  const delivered = deliveredValue(state, po.id);
  const canGrn = po.status === 'Approved' || po.status === 'Partially Delivered';

  return (
    <>
      <Drawer
        open
        onOpenChange={(o) => !o && onClose()}
        placement="end"
        className="w-3xl"
        title={
          <span className="flex items-center gap-3">
            {po.id} <StatusBadge status={po.status} />
          </span>
        }
        footer={
          <div className="flex w-full flex-wrap justify-end gap-3">
            {po.status === 'Approval Pending' && (
              <>
                <Button color="danger" outline onClick={() => setConfirm('Rejected')}>
                  Reject
                </Button>
                <Button color="success" onClick={() => setConfirm('Approved')}>
                  Approve
                </Button>
              </>
            )}
            {po.status === 'Partially Delivered' && (
              <Button color="tertiary" onClick={() => setConfirm('Delivery Closed')}>
                Close delivery
              </Button>
            )}
            {canGrn && <Button onClick={() => onCreateGrn(po.id)}>Create GRN</Button>}
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="flex justify-end">
            <Button color="ghost" size="sm" leftIcon={<DownloadIcon />} onClick={() => window.print()}>
              PDF
            </Button>
          </div>
          <SummaryCard
            columns={4}
            items={[
              ['Project Name', project(po.projectId).name],
              ['Vendor', po.vendor],
              ['Created On', fmtDateTime(po.createdOn)],
              ['Expected Delivery', fmtDate(po.expectedDelivery)],
              ['Total PO Amount', inr(t.total)],
              ['Advance Paid', inr(po.advance)],
              ['Total GRN Amount', inr(delivered)],
              ['Indent', po.indentId ?? '-'],
            ]}
          />

          <Table aria-label={`Materials in ${po.id}`}>
            <TableHead>
              <TableRow className="whitespace-nowrap">
                <TableHeaderCell className="min-w-64">Material</TableHeaderCell>
                <TableHeaderCell>Ordered</TableHeaderCell>
                <TableHeaderCell>Unit price</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Delivered</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {po.items.map((i) => {
                const m = material(i.materialId);
                const got = deliveredQty(state, po.id, i.materialId);
                return (
                  <TableRow key={i.materialId}>
                    <TableCell>
                      <MaterialCell name={m.name} spec={m.spec} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{qty(i.qty, m.uom)}</TableCell>
                    <TableCell className="whitespace-nowrap">{inr(i.unitPrice)}</TableCell>
                    <TableCell className="whitespace-nowrap">{inr(i.qty * i.unitPrice)}</TableCell>
                    <TableCell className="min-w-40">
                      <Progress value={Math.min(100, Math.round((got / i.qty) * 100))} size="base" label={`${qty(got, m.uom)} delivered`} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Totals subtotal={t.subtotal} discount={po.discount} gstRate={po.gstRate} gst={t.gst} total={t.total} advance={po.advance} />

          {po.terms && (
            <section className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-heading">Terms & Conditions</h3>
              <p className="text-sm text-body">{po.terms}</p>
            </section>
          )}
        </div>

      </Drawer>
        <Modal
          open={confirm !== null}
          onOpenChange={(o) => !o && setConfirm(null)}
          title={confirm === 'Rejected' ? 'Rejection Confirmation' : confirm === 'Approved' ? 'Approval Confirmation' : 'Close Delivery'}
          size="sm"
          footer={
            <>
              <Button color="tertiary" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                color={confirm === 'Rejected' ? 'danger' : 'brand'}
                onClick={() => {
                  dispatch({ type: 'setPoStatus', id: po.id, status: confirm! });
                  notify(`${po.id} ${confirm === 'Approved' ? 'approved' : confirm === 'Rejected' ? 'rejected' : 'closed'}`);
                  setConfirm(null);
                }}
              >
                {confirm === 'Rejected' ? 'Reject' : confirm === 'Approved' ? 'Approve' : 'Close delivery'}
              </Button>
            </>
          }
        >
          <p className="text-sm text-body">
            {confirm === 'Delivery Closed'
              ? 'No more deliveries will be received against '
              : `Are you sure you want to ${confirm === 'Rejected' ? 'reject' : 'approve'} purchase order `}
            <b className="text-heading">{po.id}</b>?
          </p>
        </Modal>
    </>
  );
}

function Totals({ subtotal, discount, gstRate, gst, total, advance }: { subtotal: number; discount: number; gstRate: number; gst: number; total: number; advance: number }) {
  const rows: [string, string][] = [
    ['Subtotal', inr(subtotal)],
    ['Discount', discount ? `(−) ${inr(discount)}` : inr(0)],
    [`GST (${gstRate}%)`, inr(gst)],
    ['Total (incl. taxes, rounded)', inr(total)],
    ['Advance paid', inr(advance)],
  ];
  return (
    <Card role="group" aria-label="Financial details" className="ms-auto w-full max-w-sm">
      <dl className="flex flex-col gap-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-body">{k}</dt>
            <dd className="text-heading">{v}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-default pt-2 font-semibold text-heading">
          <dt>Balance</dt>
          <dd>{inr(total - advance)}</dd>
        </div>
      </dl>
    </Card>
  );
}

/** "Create Purchase Order": vendor, materials with quantity and price, discount, GST, advance, delivery and terms. */
function CreatePoDrawer({ indentId, onClose }: { indentId?: string; onClose: () => void }) {
  const { state, dispatch, material, notify } = useStore();
  const indent = state.indents.find((i) => i.id === indentId);
  const [projectId, setProjectId] = useState(indent?.projectId ?? state.projects[0].id);
  const [vendor, setVendor] = useState('');
  const [newVendor, setNewVendor] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [items, setItems] = useState<PoItem[]>(
    indent
      ? indent.items.filter((x) => x.decision === 'approved').map((x) => ({ materialId: x.materialId, qty: x.approved, unitPrice: material(x.materialId).unitPrice }))
      : [],
  );
  const [discount, setDiscount] = useState('');
  const [gstRate, setGstRate] = useState(String(indent ? material(indent.items[0].materialId).gstRate : 18));
  const [advance, setAdvance] = useState('');
  const [expected, setExpected] = useState<Date | null>(indent?.expectedDelivery ?? null);
  const [terms, setTerms] = useState('Payment within 30 days of delivery. Prices include loading.');
  const [tried, setTried] = useState(false);
  const [today] = useState(() => new Date());

  const projectMaterials = state.projectMaterials.filter((r) => r.projectId === projectId && !items.some((i) => i.materialId === r.materialId));
  const t = poTotals({ items, gstRate: Number(gstRate), discount: Number(discount) || 0, advance: Number(advance) || 0 });
  const errors = {
    vendor: !vendor ? 'Choose a vendor' : '',
    items: items.length === 0 ? 'Add at least one material' : items.some((i) => !(i.qty > 0) || !(i.unitPrice > 0)) ? 'Every material needs a quantity and a unit price' : '',
    expected: !expected ? 'Choose the expected delivery date' : '',
  };
  const setItem = (i: number, patch: Partial<PoItem>) => setItems((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const numeric = (v: string) => Number(v.replace(/[^\d.]/g, '')) || 0;

  const submit = () => {
    setTried(true);
    if (errors.vendor || errors.items || errors.expected) return;
    dispatch({
      type: 'addPo',
      po: { projectId, indentId, vendor, createdBy: ME, createdOn: new Date(), expectedDelivery: expected!, items, gstRate: Number(gstRate), discount: Number(discount) || 0, advance: Number(advance) || 0, terms: terms.trim() },
    });
    notify('Purchase order created and sent for approval');
    onClose();
  };

  return (
    <>
      <Drawer
        open
        onOpenChange={(o) => !o && onClose()}
        placement="end"
        className="w-3xl"
        title={indent ? `Create Purchase Order · from ${indent.id}` : 'Create Purchase Order'}
        footer={
          <div className="flex w-full justify-end gap-3">
            <Button color="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit}>Create PO</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="po-project">Project</Label>
              <Select
                id="po-project"
                value={projectId}
                disabled={!!indent}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setItems([]);
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
              <Label htmlFor="po-expected" required>
                Expected delivery
              </Label>
              <Datepicker id="po-expected" value={expected} onChange={setExpected} min={today} aria-describedby={tried && errors.expected ? 'po-expected-error' : undefined} />
              {tried && errors.expected && (
                <HelperText id="po-expected-error" status="danger">
                  {errors.expected}
                </HelperText>
              )}
            </div>
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-heading">Vendor Details</h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-64 flex-1">
                <Label htmlFor="po-vendor" required>
                  Vendor
                </Label>
                <Select id="po-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} status={tried && errors.vendor ? 'danger' : undefined} aria-describedby={tried && errors.vendor ? 'po-vendor-error' : undefined}>
                  <option value="">Select vendor</option>
                  {state.vendors.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </div>
              <Button color="ghost" size="sm" leftIcon={<PlusIcon />} onClick={() => setNewVendor(true)}>
                Add vendor
              </Button>
            </div>
            {tried && errors.vendor && (
              <HelperText id="po-vendor-error" status="danger">
                {errors.vendor}
              </HelperText>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-heading">Material Details</h3>
              {projectMaterials.length > 0 && (
                <Select
                  size="sm"
                  aria-label="Add material"
                  value=""
                  onChange={(e) => {
                    const m = material(e.target.value);
                    setItems((all) => [...all, { materialId: m.id, qty: 0, unitPrice: m.unitPrice }]);
                  }}
                  className="w-60"
                >
                  <option value="">+ Add material</option>
                  {projectMaterials.map((r) => (
                    <option key={r.materialId} value={r.materialId}>
                      {material(r.materialId).name}
                    </option>
                  ))}
                </Select>
              )}
            </div>
            <Table aria-label="Materials on this purchase order">
              <TableHead>
                <TableRow className="whitespace-nowrap">
                  <TableHeaderCell className="min-w-64">Material</TableHeaderCell>
                  <TableHeaderCell>Quantity</TableHeaderCell>
                  <TableHeaderCell>Unit price</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>
                    <span className="sr-only">Remove</span>
                  </TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it, i) => {
                  const m = material(it.materialId);
                  const row = state.projectMaterials.find((r) => r.projectId === projectId && r.materialId === it.materialId);
                  return (
                    <TableRow key={it.materialId}>
                      <TableCell>
                        <MaterialCell name={m.name} spec={m.spec}>
                          <span className="text-xs text-body">In stock: {qty(row?.inStock ?? 0, m.uom)}</span>
                        </MaterialCell>
                      </TableCell>
                      <TableCell>
                        <Input size="sm" inputMode="decimal" aria-label={`Quantity of ${m.name}`} value={it.qty ? String(it.qty) : ''} placeholder="Enter" onChange={(e) => setItem(i, { qty: numeric(e.target.value) })} rightIcon={<span className="text-xs">{m.uom}</span>} className="w-32" />
                      </TableCell>
                      <TableCell>
                        <Input size="sm" inputMode="decimal" aria-label={`Unit price of ${m.name}`} value={it.unitPrice ? String(it.unitPrice) : ''} placeholder="Enter" onChange={(e) => setItem(i, { unitPrice: numeric(e.target.value) })} addonText="₹" className="w-32" />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{inr(it.qty * it.unitPrice)}</TableCell>
                      <TableCell>
                        <Button color="ghost" size="xs" iconOnly aria-label={`Remove ${m.name}`} onClick={() => setItems((all) => all.filter((_, j) => j !== i))}>
                          <TrashBinIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Add materials from this project's list.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {tried && errors.items && <HelperText status="danger">{errors.items}</HelperText>}
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-heading">Financial details</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="po-discount">Additional discount</Label>
                <Input id="po-discount" inputMode="decimal" placeholder="Enter" addonText="₹" value={discount} onChange={(e) => setDiscount(e.target.value.replace(/[^\d.]/g, ''))} />
              </div>
              <div>
                <Label htmlFor="po-gst">GST</Label>
                <Select id="po-gst" value={gstRate} onChange={(e) => setGstRate(e.target.value)}>
                  {[0, 5, 12, 18, 28].map((g) => (
                    <option key={g} value={g}>
                      IGST {g}%
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="po-advance">Advance amount (if any paid)</Label>
                <Input id="po-advance" inputMode="decimal" placeholder="Enter" addonText="₹" value={advance} onChange={(e) => setAdvance(e.target.value.replace(/[^\d.]/g, ''))} />
              </div>
            </div>
            <Totals subtotal={t.subtotal} discount={Number(discount) || 0} gstRate={Number(gstRate)} gst={t.gst} total={t.total} advance={Number(advance) || 0} />
          </section>

          <div>
            <Label htmlFor="po-terms">Terms & Conditions</Label>
            <Textarea id="po-terms" rows={3} value={terms} onChange={(e) => setTerms(e.target.value)} />
          </div>
        </div>

      </Drawer>
        <Modal
          open={newVendor}
          onOpenChange={setNewVendor}
          title="Add vendor"
          size="sm"
          footer={
            <Button
              disabled={!vendorName.trim()}
              onClick={() => {
                dispatch({ type: 'addVendor', name: vendorName.trim() });
                setVendor(vendorName.trim());
                setVendorName('');
                setNewVendor(false);
              }}
            >
              Add vendor
            </Button>
          }
        >
          <Label htmlFor="vendor-name" required>
            Vendor name
          </Label>
          <Input id="vendor-name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
        </Modal>
    </>
  );
}
