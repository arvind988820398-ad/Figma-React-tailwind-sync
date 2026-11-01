// Reference "GRN": goods received notes, created against a PO (quantities prefilled with what is still pending)
// or directly from the material list. Saving a GRN adds the stock and moves the PO to (partially) delivered.
import { useMemo, useState } from 'react';
import { PlusIcon, SearchIcon } from '../../components/icons';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { HelperText, Input, Label } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { usePaged } from './hooks';
import { deliveredQty, fmtDateTime, inr, ME, qty, useStore, type Grn, type PoItem } from './model';
import { EmptyState, FilterMenu, MaterialCell, SummaryCard, TableFooter } from './shared';

export function Grns({ openId, onOpen, createForPo, onCreateDone }: { openId?: string; onOpen: (id?: string) => void; createForPo?: string | null; onCreateDone: () => void }) {
  const { state, project } = useStore();
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.grns
      .filter((g) => !q || g.id.toLowerCase().includes(q) || (g.poId ?? '').toLowerCase().includes(q) || g.vendor.toLowerCase().includes(q) || g.invoiceNo.toLowerCase().includes(q))
      .filter((g) => projects.length === 0 || projects.includes(project(g.projectId).name));
  }, [state.grns, query, projects, project]);
  const { visible, footer } = usePaged(rows);
  const open = state.grns.find((g) => g.id === openId);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      {state.grns.length === 0 ? (
        <EmptyState title="Start managing your GRNs.">
          <Button onClick={() => setCreating(true)}>Create GRN</Button>
        </EmptyState>
      ) : (
        <Table
          aria-label="Goods received notes"
          stickyHeader
          containerClassName="min-h-0 flex-1"
          footer={<TableFooter {...footer} />}
          toolbar={
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Input size="sm" type="search" aria-label="Search GRNs" placeholder="Search GRN, PO, vendor or invoice" leftIcon={<SearchIcon />} value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
                <FilterMenu label="Project" options={state.projects.map((p) => p.name)} selected={projects} onChange={setProjects} />
              </div>
              <Button size="sm" leftIcon={<PlusIcon />} onClick={() => setCreating(true)}>
                Create GRN
              </Button>
            </>
          }
        >
          <TableHead>
            <TableRow className="whitespace-nowrap">
              <TableHeaderCell>GRN ID</TableHeaderCell>
              <TableHeaderCell>PO ID</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Invoice No.</TableHeaderCell>
              <TableHeaderCell>Created by</TableHeaderCell>
              <TableHeaderCell>Received on</TableHeaderCell>
              <TableHeaderCell>Materials</TableHeaderCell>
              <TableHeaderCell>GRN Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  <a href={`#/grn/${g.id}`} className="font-medium text-fg-brand hover:underline focus-visible:shadow-focus-brand focus-visible:outline-none">
                    {g.id}
                  </a>
                </TableCell>
                <TableCell>{g.poId ? <a href={`#/po/${g.poId}`} className="text-fg-brand hover:underline">{g.poId}</a> : <Badge>Direct</Badge>}</TableCell>
                <TableCell className="whitespace-nowrap">{project(g.projectId).name}</TableCell>
                <TableCell className="whitespace-nowrap">{g.vendor}</TableCell>
                <TableCell>{g.invoiceNo || '-'}</TableCell>
                <TableCell className="whitespace-nowrap">{g.createdBy}</TableCell>
                <TableCell className="whitespace-nowrap">{fmtDateTime(g.createdOn)}</TableCell>
                <TableCell>{g.items.length}</TableCell>
                <TableCell className="whitespace-nowrap">{inr(g.items.reduce((s, i) => s + i.qty * i.unitPrice, 0))}</TableCell>
              </TableRow>
            ))}
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  No GRNs match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {open && <GrnDrawer grn={open} onClose={() => onOpen(undefined)} />}
      {(creating || createForPo) && (
        <CreateGrnDrawer
          poId={createForPo ?? undefined}
          onClose={() => {
            setCreating(false);
            onCreateDone();
          }}
        />
      )}
    </div>
  );
}

function GrnDrawer({ grn, onClose }: { grn: Grn; onClose: () => void }) {
  const { material, project } = useStore();
  const total = grn.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  return (
    <Drawer open onOpenChange={(o) => !o && onClose()} placement="end" className="w-2xl" title={grn.id}>
      <div className="flex flex-col gap-6">
        <SummaryCard
          columns={3}
          items={[
            ['Project Name', project(grn.projectId).name],
            ['Vendor', grn.vendor],
            ['PO', grn.poId ?? 'Direct GRN'],
            ['Invoice No.', grn.invoiceNo || '-'],
            ['Received on', fmtDateTime(grn.createdOn)],
            ['Total GRN Amount', inr(total)],
          ]}
        />
        <Table aria-label={`Materials in ${grn.id}`}>
          <TableHead>
            <TableRow className="whitespace-nowrap">
              <TableHeaderCell className="min-w-64">Material</TableHeaderCell>
              <TableHeaderCell>Received</TableHeaderCell>
              <TableHeaderCell>Unit price</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grn.items.map((i) => {
              const m = material(i.materialId);
              return (
                <TableRow key={i.materialId}>
                  <TableCell>
                    <MaterialCell name={m.name} spec={m.spec} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{qty(i.qty, m.uom)}</TableCell>
                  <TableCell className="whitespace-nowrap">{inr(i.unitPrice)}</TableCell>
                  <TableCell className="whitespace-nowrap">{inr(i.qty * i.unitPrice)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Drawer>
  );
}

/** Create GRN: "On a PO" lists the PO's lines with the pending quantity prefilled; "Direct" picks project materials. */
function CreateGrnDrawer({ poId, onClose }: { poId?: string; onClose: () => void }) {
  const { state, dispatch, material, notify } = useStore();
  const openPos = state.pos.filter((p) => p.status === 'Approved' || p.status === 'Partially Delivered');
  const [mode, setMode] = useState<'po' | 'direct'>(poId || openPos.length ? 'po' : 'direct');
  const [selectedPo, setSelectedPo] = useState(poId ?? openPos[0]?.id ?? '');
  const po = state.pos.find((p) => p.id === selectedPo);
  const pendingFor = (id: string) => (po ? po.items.map((i) => ({ ...i, qty: Math.max(0, i.qty - deliveredQty(state, id, i.materialId)) })) : []);
  const [lines, setLines] = useState<PoItem[]>(() => pendingFor(selectedPo));
  const [projectId, setProjectId] = useState(state.projects[0].id);
  const [vendor, setVendor] = useState(state.vendors[0]);
  const [invoice, setInvoice] = useState('');
  const [tried, setTried] = useState(false);

  const pickPo = (id: string) => {
    setSelectedPo(id);
    const p = state.pos.find((x) => x.id === id);
    setLines(p ? p.items.map((i) => ({ ...i, qty: Math.max(0, i.qty - deliveredQty(state, id, i.materialId)) })) : []);
  };
  const switchMode = (m: string) => {
    setMode(m as 'po' | 'direct');
    setLines(m === 'po' ? pendingFor(selectedPo) : []);
  };
  const directOptions = state.projectMaterials.filter((r) => r.projectId === projectId && !lines.some((l) => l.materialId === r.materialId));
  const received = lines.filter((l) => l.qty > 0);
  const error = received.length === 0 ? 'Enter the received quantity of at least one material' : mode === 'po' && !po ? 'Choose a purchase order' : '';
  const setLine = (i: number, patch: Partial<PoItem>) => setLines((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const submit = () => {
    setTried(true);
    if (error) return;
    dispatch({
      type: 'addGrn',
      grn: {
        projectId: mode === 'po' ? po!.projectId : projectId,
        poId: mode === 'po' ? po!.id : undefined,
        vendor: mode === 'po' ? po!.vendor : vendor,
        invoiceNo: invoice.trim(),
        createdBy: ME,
        createdOn: new Date(),
        items: received,
      },
    });
    notify('GRN created and stock updated');
    onClose();
  };

  return (
    <Drawer
      open
      onOpenChange={(o) => !o && onClose()}
      placement="end"
      className="w-3xl"
      title="Create GRN"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button color="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>Create GRN</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <Tabs
          variant="segmented"
          label="GRN type"
          value={mode}
          onValueChange={switchMode}
          items={[
            { value: 'po', label: 'On a purchase order', disabled: openPos.length === 0 && !poId },
            { value: 'direct', label: 'Direct (without PO)' },
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {mode === 'po' ? (
            <div>
              <Label htmlFor="grn-po">Purchase order</Label>
              <Select id="grn-po" value={selectedPo} onChange={(e) => pickPo(e.target.value)}>
                {openPos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} · {p.vendor}
                  </option>
                ))}
              </Select>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="grn-project">Project</Label>
                <Select
                  id="grn-project"
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
              <div>
                <Label htmlFor="grn-vendor">Vendor</Label>
                <Select id="grn-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)}>
                  {state.vendors.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="grn-invoice">Invoice No.</Label>
            <Input id="grn-invoice" placeholder="Enter" value={invoice} onChange={(e) => setInvoice(e.target.value)} />
          </div>
        </div>

        {mode === 'direct' && directOptions.length > 0 && (
          <Select
            size="sm"
            aria-label="Add material"
            value=""
            onChange={(e) => {
              const m = material(e.target.value);
              setLines((all) => [...all, { materialId: m.id, qty: 0, unitPrice: m.unitPrice }]);
            }}
            className="w-60"
          >
            <option value="">+ Add material</option>
            {directOptions.map((r) => (
              <option key={r.materialId} value={r.materialId}>
                {material(r.materialId).name}
              </option>
            ))}
          </Select>
        )}

        <Table aria-label="Received materials">
          <TableHead>
            <TableRow className="whitespace-nowrap">
              <TableHeaderCell className="min-w-64">Material</TableHeaderCell>
              {mode === 'po' && <TableHeaderCell>Pending</TableHeaderCell>}
              <TableHeaderCell>Received quantity</TableHeaderCell>
              <TableHeaderCell>Unit price</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((l, i) => {
              const m = material(l.materialId);
              const pending = po ? Math.max(0, (po.items.find((x) => x.materialId === l.materialId)?.qty ?? 0) - deliveredQty(state, po.id, l.materialId)) : 0;
              return (
                <TableRow key={l.materialId}>
                  <TableCell>
                    <MaterialCell name={m.name} spec={m.spec} />
                  </TableCell>
                  {mode === 'po' && <TableCell className="whitespace-nowrap">{qty(pending, m.uom)}</TableCell>}
                  <TableCell>
                    <Input size="sm" inputMode="decimal" aria-label={`Received quantity of ${m.name}`} placeholder="Enter" value={l.qty ? String(l.qty) : ''} onChange={(e) => setLine(i, { qty: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} rightIcon={<span className="text-xs">{m.uom}</span>} className="w-32" />
                  </TableCell>
                  <TableCell>
                    <Input size="sm" inputMode="decimal" aria-label={`Unit price of ${m.name}`} value={String(l.unitPrice)} onChange={(e) => setLine(i, { unitPrice: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} addonText="₹" className="w-28" disabled={mode === 'po'} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{inr(l.qty * l.unitPrice)}</TableCell>
                </TableRow>
              );
            })}
            {lines.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {mode === 'po' ? 'No open purchase order to receive against.' : 'Add the materials that arrived.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {tried && error && <HelperText status="danger">{error}</HelperText>}
      </div>
    </Drawer>
  );
}
