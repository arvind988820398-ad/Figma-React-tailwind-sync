// Reference "Material List": a Projects panel (search, Material Directory, projects) beside the selected list.
// A project shows its stock table (filters, columns menu, selection → Create Indent); the directory shows the catalogue.
import { useMemo, useState, type FormEvent } from 'react';
import { AngleDownIcon, BuildingIcon, DotsVerticalIcon, FileCsvIcon, FolderPlusIcon, LayersIcon, PlusIcon, SearchIcon, StoreIcon, UploadIcon } from '../../components/icons';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Dropdown, DropdownCheckboxItem, DropdownItem } from '../../components/ui/Dropdown';
import { FileDropzone } from '../../components/ui/FileUpload';
import { Input, Label } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Sidebar, type SidebarItem } from '../../components/ui/Sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { AddMaterialDrawer } from './AddMaterialDrawer';
import { usePaged, useSelection } from './hooks';
import { approvedNotOrdered, CATEGORIES, inr, orderedQty, pendingRequest, qty, useStore } from './model';
import { EmptyState, FilterMenu, InfoHeader, MaterialCell, SortButton, TableFooter } from './shared';

const OPTIONAL = ['Min. Stock Alert', 'Pending Request', 'Approved Req. Qty.', 'Ordered', 'Total Added', 'Total Used', 'Estimated Qty', 'Estimated Budget'] as const;
type Optional = (typeof OPTIONAL)[number];

export function MaterialList({ projectId, onOpenProject, onCreateIndent }: { projectId: string; onOpenProject: (id: string) => void; onCreateIndent: (projectId: string, materialIds: string[]) => void }) {
  const { state, dispatch } = useStore();
  const [panelQuery, setPanelQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [godownOpen, setGodownOpen] = useState(false);
  const directory = projectId === 'directory';

  const projectItems: SidebarItem[] = state.projects
    .filter((p) => p.name.toLowerCase().includes(panelQuery.trim().toLowerCase()))
    .map((p) => ({ label: p.name, href: `#/materials/${p.id}`, icon: <BuildingIcon />, current: p.id === projectId }));

  return (
    <div className="flex min-h-0 flex-1">
      <Sidebar
        label="Projects"
        headerDivider={false}
        className="shrink-0 overflow-y-auto border-e border-default"
        header={
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-heading">Projects</h2>
              <Dropdown
                align="end"
                label="Project actions"
                trigger={
                  <Button color="ghost" size="sm" iconOnly aria-label="Project actions">
                    <DotsVerticalIcon />
                  </Button>
                }
              >
                <DropdownItem icon={<FolderPlusIcon />} onSelect={() => setProjectOpen(true)}>
                  Add project
                </DropdownItem>
                <DropdownItem icon={<StoreIcon />} onSelect={() => setGodownOpen(true)}>
                  Add godown / warehouse
                </DropdownItem>
              </Dropdown>
            </div>
            <Input size="sm" type="search" aria-label="Search projects" placeholder="Search" leftIcon={<SearchIcon />} value={panelQuery} onChange={(e) => setPanelQuery(e.target.value)} />
          </div>
        }
        sections={[[{ label: 'Material Directory', href: '#/materials/directory', icon: <LayersIcon />, current: directory }], projectItems]}
      />

      <div className="flex min-w-0 flex-1 flex-col p-4">
        {directory ? (
          <Directory onAdd={() => setAddOpen(true)} />
        ) : (
          <ProjectMaterials key={projectId} projectId={projectId} onAdd={() => setAddOpen(true)} onUpload={() => setUploadOpen(true)} onCreateIndent={onCreateIndent} />
        )}
      </div>

      <AddMaterialDrawer open={addOpen} onOpenChange={setAddOpen} projectId={directory ? null : projectId} />
      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
      <NameModal
        open={projectOpen}
        onOpenChange={setProjectOpen}
        title="Add Project"
        label="Project name"
        onSave={(name) => {
          const id = `p${Date.now()}`;
          dispatch({ type: 'addProject', id, name });
          onOpenProject(id);
        }}
      />
      <GodownModal open={godownOpen} onOpenChange={setGodownOpen} />
    </div>
  );
}

function ProjectMaterials({ projectId, onAdd, onUpload, onCreateIndent }: { projectId: string; onAdd: () => void; onUpload: () => void; onCreateIndent: (projectId: string, materialIds: string[]) => void }) {
  const { state, material } = useStore();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [sortAsc, setSortAsc] = useState<boolean | null>(null);
  const [hidden, setHidden] = useState<Set<Optional>>(new Set(['Total Added', 'Total Used']));
  const show = (c: Optional) => !hidden.has(c);

  const rows = useMemo(() => {
    let list = state.projectMaterials
      .filter((r) => r.projectId === projectId)
      .map((r) => ({ ...r, m: material(r.materialId), low: r.minStock > 0 && r.inStock < r.minStock }));
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => `${r.m.name} ${r.m.spec}`.toLowerCase().includes(q));
    if (categories.length) list = list.filter((r) => categories.includes(r.m.category));
    if (alerts.length) list = list.filter((r) => (r.low ? alerts.includes('Low stock') : alerts.includes('In stock')));
    if (sortAsc !== null) list = [...list].sort((a, b) => a.m.name.localeCompare(b.m.name) * (sortAsc ? 1 : -1));
    return list;
  }, [state.projectMaterials, projectId, material, query, categories, alerts, sortAsc]);

  const total = state.projectMaterials.filter((r) => r.projectId === projectId).length;
  const { visible, footer } = usePaged(rows);
  const sel = useSelection(visible.map((r) => r.materialId));

  if (total === 0) {
    return (
      <EmptyState title="Add materials to manage your inventory.">
        <Button color="tertiary" leftIcon={<PlusIcon />} onClick={onAdd}>
          Add Material
        </Button>
        <Button leftIcon={<FileCsvIcon />} onClick={onUpload}>
          Upload Material
        </Button>
      </EmptyState>
    );
  }

  return (
    <Table
      aria-label="Project materials"
      stickyHeader
      containerClassName="min-h-0 flex-1"
      toolbar={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Input size="sm" type="search" aria-label="Search materials" placeholder="Search" leftIcon={<SearchIcon />} value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
            <FilterMenu label="Category" options={CATEGORIES} selected={categories} onChange={setCategories} />
            <FilterMenu label="Stock Alert" options={['Low stock', 'In stock']} selected={alerts} onChange={setAlerts} />
            <Dropdown
              label="Columns"
              className="w-60"
              trigger={
                <Button color="ghost" size="sm" rightIcon={<AngleDownIcon />}>
                  Columns
                </Button>
              }
            >
              {OPTIONAL.map((c) => (
                <DropdownCheckboxItem
                  key={c}
                  checked={show(c)}
                  onCheckedChange={(on) =>
                    setHidden((h) => {
                      const n = new Set(h);
                      if (on) n.delete(c);
                      else n.add(c);
                      return n;
                    })
                  }
                >
                  {c}
                </DropdownCheckboxItem>
              ))}
            </Dropdown>
          </div>
          <div className="flex items-center gap-3">
            {sel.selected.size > 0 && (
              <Button size="sm" onClick={() => onCreateIndent(projectId, [...sel.selected])}>
                Create Indent ({sel.selected.size})
              </Button>
            )}
            <Button color="tertiary" size="sm" leftIcon={<PlusIcon />} onClick={onAdd}>
              Add Material
            </Button>
            <Dropdown
              align="end"
              label="Import and export"
              trigger={
                <Button color="secondary" size="sm" iconOnly aria-label="Import and export">
                  <FileCsvIcon />
                </Button>
              }
            >
              <DropdownItem icon={<UploadIcon />} onSelect={onUpload}>
                Upload materials
              </DropdownItem>
              <DropdownItem icon={<FileCsvIcon />} onSelect={() => exportCsv(rows.map((r) => [r.m.name, r.m.category, r.m.uom, r.inStock, r.minStock, r.estimatedQty]), ['Material', 'Category', 'UOM', 'In stock', 'Min stock', 'Estimated qty'], 'materials.csv')}>
                Export to Excel (CSV)
              </DropdownItem>
            </Dropdown>
          </div>
        </>
      }
      footer={<TableFooter selected={sel.selected.size} {...footer} />}
    >
      <TableHead>
        <TableRow className="whitespace-nowrap">
          <TableHeaderCell className="w-14">
            <Checkbox aria-label="Select all materials on this page" checked={sel.all} onChange={sel.toggleAll} />
          </TableHeaderCell>
          <TableHeaderCell className="min-w-64" aria-sort={sortAsc === null ? 'none' : sortAsc ? 'ascending' : 'descending'}>
            <SortButton label="Material Name" onClick={() => setSortAsc((s) => !s)} />
          </TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>UOM</TableHeaderCell>
          <TableHeaderCell>In Stock</TableHeaderCell>
          {show('Min. Stock Alert') && <TableHeaderCell>Min. Stock Alert</TableHeaderCell>}
          {show('Pending Request') && <TableHeaderCell>Pending Request</TableHeaderCell>}
          {show('Approved Req. Qty.') && (
            <TableHeaderCell>
              <InfoHeader label="Approved Req. Qty." hint="Total requested quantity from all indents which have not been ordered." />
            </TableHeaderCell>
          )}
          {show('Ordered') && <TableHeaderCell>Ordered</TableHeaderCell>}
          {show('Total Added') && <TableHeaderCell>Total Added</TableHeaderCell>}
          {show('Total Used') && <TableHeaderCell>Total Used</TableHeaderCell>}
          {show('Estimated Qty') && <TableHeaderCell>Estimated Qty</TableHeaderCell>}
          {show('Estimated Budget') && <TableHeaderCell>Estimated Budget</TableHeaderCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {visible.map((r) => {
          const pending = pendingRequest(state, projectId, r.materialId);
          const approved = approvedNotOrdered(state, projectId, r.materialId);
          const ordered = orderedQty(state, projectId, r.materialId);
          return (
            <TableRow key={r.materialId} aria-selected={sel.selected.has(r.materialId)}>
              <TableCell>
                <Checkbox aria-label={`Select ${r.m.name}`} checked={sel.selected.has(r.materialId)} onChange={() => sel.toggle(r.materialId)} />
              </TableCell>
              <TableCell>
                <MaterialCell name={r.m.name} spec={r.m.spec} />
              </TableCell>
              <TableCell>{r.m.category}</TableCell>
              <TableCell>{r.m.uom}</TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  {r.inStock.toLocaleString('en-IN')}
                  {r.low && <Badge color="danger">Low</Badge>}
                </span>
              </TableCell>
              {show('Min. Stock Alert') && <TableCell>{r.minStock ? r.minStock.toLocaleString('en-IN') : '-'}</TableCell>}
              {show('Pending Request') && <TableCell>{pending ? pending.toLocaleString('en-IN') : '-'}</TableCell>}
              {show('Approved Req. Qty.') && <TableCell>{approved ? approved.toLocaleString('en-IN') : '-'}</TableCell>}
              {show('Ordered') && <TableCell>{ordered ? ordered.toLocaleString('en-IN') : '-'}</TableCell>}
              {show('Total Added') && <TableCell>{r.totalAdded.toLocaleString('en-IN')}</TableCell>}
              {show('Total Used') && <TableCell>{r.totalUsed.toLocaleString('en-IN')}</TableCell>}
              {show('Estimated Qty') && <TableCell>{r.estimatedQty ? qty(r.estimatedQty, r.m.uom) : '-'}</TableCell>}
              {show('Estimated Budget') && <TableCell className="whitespace-nowrap">{r.estimatedBudget ? inr(r.estimatedBudget) : '-'}</TableCell>}
            </TableRow>
          );
        })}
        {visible.length === 0 && (
          <TableRow>
            <TableCell colSpan={14} className="text-center">
              No materials match these filters.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function Directory({ onAdd }: { onAdd: () => void }) {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const rows = state.materials.filter(
    (m) => `${m.name} ${m.spec} ${m.brand ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()) && (categories.length === 0 || categories.includes(m.category)),
  );
  const { visible, footer } = usePaged(rows);
  return (
    <Table
      aria-label="Material Directory"
      stickyHeader
      containerClassName="min-h-0 flex-1"
      toolbar={
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Input size="sm" type="search" aria-label="Search the directory" placeholder="Search" leftIcon={<SearchIcon />} value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
            <FilterMenu label="Category" options={CATEGORIES} selected={categories} onChange={setCategories} />
          </div>
          <Button color="tertiary" size="sm" leftIcon={<PlusIcon />} onClick={onAdd}>
            Add Material
          </Button>
        </>
      }
      footer={<TableFooter {...footer} />}
    >
      <TableHead>
        <TableRow className="whitespace-nowrap">
          <TableHeaderCell className="min-w-64">Material Name</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>UOM</TableHeaderCell>
          <TableHeaderCell>Unit Price</TableHeaderCell>
          <TableHeaderCell>GST</TableHeaderCell>
          <TableHeaderCell>Brand</TableHeaderCell>
          <TableHeaderCell>Used in</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {visible.map((m) => {
          const used = state.projectMaterials.filter((r) => r.materialId === m.id).length;
          return (
            <TableRow key={m.id}>
              <TableCell>
                <MaterialCell name={m.name} spec={m.spec} />
              </TableCell>
              <TableCell>{m.category}</TableCell>
              <TableCell>{m.uom}</TableCell>
              <TableCell className="whitespace-nowrap">{m.unitPrice ? `${inr(m.unitPrice)} / ${m.uom}` : '-'}</TableCell>
              <TableCell>{m.gstRate}%</TableCell>
              <TableCell>{m.brand ?? '-'}</TableCell>
              <TableCell>{used ? `${used} project${used > 1 ? 's' : ''}` : '-'}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/** Downloads rows as a CSV file Excel opens. */
function exportCsv(rows: (string | number)[][], header: string[], name: string) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

function UploadModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [file, setFile] = useState<string | null>(null);
  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setFile(null);
      }}
      title="Upload Material"
      description="Upload an Excel or CSV sheet with one material per row: name, specification, category, UOM, in-stock and estimated quantity."
      footer={
        <>
          <Button color="tertiary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!file} onClick={() => onOpenChange(false)}>
            Upload
          </Button>
        </>
      }
    >
      <FileDropzone accept=".csv,.xlsx,.xls" hint={file ? `Selected: ${file}` : 'XLSX or CSV, up to 5 MB'} onFiles={(f) => setFile(f[0]?.name ?? null)} />
    </Modal>
  );
}

function NameModal({ open, onOpenChange, title, label, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; label: string; onSave: (name: string) => void }) {
  const [name, setName] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
    onOpenChange(false);
  };
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      footer={
        <Button type="submit" form="name-modal" disabled={!name.trim()}>
          Create
        </Button>
      }
    >
      <form id="name-modal" onSubmit={submit}>
        <Label htmlFor="name-modal-input" required>
          {label}
        </Label>
        <Input id="name-modal-input" value={name} onChange={(e) => setName(e.target.value)} />
      </form>
    </Modal>
  );
}

/** Reference "Add Godown/Warehouse": name, delivery address and state. */
function GodownModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { dispatch } = useStore();
  const [g, setG] = useState({ name: '', address: '', state: '' });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!g.name.trim()) return;
    dispatch({ type: 'addGodown', godown: g });
    setG({ name: '', address: '', state: '' });
    onOpenChange(false);
  };
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Godown/Warehouse"
      footer={
        <Button type="submit" form="godown" disabled={!g.name.trim()}>
          Create
        </Button>
      }
    >
      <form id="godown" onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="godown-name" required>
            Godown/warehouse name
          </Label>
          <Input id="godown-name" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="godown-address">Delivery Address</Label>
          <Textarea id="godown-address" rows={3} placeholder="Enter here" value={g.address} onChange={(e) => setG({ ...g, address: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="godown-state">State</Label>
          <Input id="godown-state" value={g.state} onChange={(e) => setG({ ...g, state: e.target.value })} />
        </div>
      </form>
    </Modal>
  );
}
