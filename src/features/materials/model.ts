// Data for the material management app: one in-memory store shared by every tab, so actions flow through —
// an approved indent becomes a PO, a GRN on that PO adds stock, an issue or a site transfer takes it away.
import { createContext, useContext } from 'react';

export const ORG = 'Saurabh’s Demo Org';
export const ME = 'Rajan Singh';

export const UOMS = ['Bags', 'Kg', 'Nos', 'Cu.m', 'Sq.ft', 'Litres', 'Coils', 'Tonnes'];
export const CATEGORIES = ['Civil', 'Steel', 'Electrical', 'Plumbing', 'Finishing', 'Hardware'];

export interface Project { id: string; name: string }

/** A catalogue entry in the Material Directory. */
export interface Material {
  id: string;
  name: string;
  spec: string;
  category: string;
  uom: string;
  unitPrice: number;
  gstRate: number;
  brand?: string;
}

/** A material on a project's list, with its stock figures. */
export interface ProjectMaterial {
  projectId: string;
  materialId: string;
  inStock: number;
  minStock: number;
  estimatedQty: number;
  estimatedBudget: number;
  totalAdded: number;
  totalUsed: number;
}

export type IndentStatus = 'Approval Pending' | 'Approved' | 'Partially Approved' | 'Rejected' | 'Partially PO Converted' | 'Converted to PO';
export interface IndentItem { materialId: string; requested: number; approved: number; decision?: 'approved' | 'rejected' }
export interface Indent {
  id: string;
  projectId: string;
  createdBy: string;
  createdOn: Date;
  expectedDelivery: Date;
  receivedOn?: Date;
  assignedTo: string;
  status: IndentStatus;
  items: IndentItem[];
  remark: string;
  attachments: string[];
  approvers: { name: string; status: 'Waiting for Approval' | 'Approved' | 'Rejected' }[];
  deleted?: boolean;
}

export type PoStatus = 'Approval Pending' | 'Approved' | 'Rejected' | 'Partially Delivered' | 'Delivered' | 'Delivery Closed';
export interface PoItem { materialId: string; qty: number; unitPrice: number }
export interface PurchaseOrder {
  id: string;
  projectId: string;
  indentId?: string;
  vendor: string;
  createdBy: string;
  createdOn: Date;
  expectedDelivery: Date;
  status: PoStatus;
  items: PoItem[];
  gstRate: number;
  discount: number;
  advance: number;
  terms: string;
}

export interface Grn {
  id: string;
  projectId: string;
  poId?: string;
  vendor: string;
  invoiceNo: string;
  createdBy: string;
  createdOn: Date;
  items: PoItem[];
}

export type TransferStatus = 'Approval Pending' | 'Approved' | 'Rejected';
export interface SiteTransfer {
  id: string;
  fromProjectId: string;
  toProjectId: string;
  createdBy: string;
  createdOn: Date;
  status: TransferStatus;
  items: { materialId: string; qty: number }[];
  remark: string;
}

export interface MaterialIssue {
  id: string;
  projectId: string;
  issuedTo: 'Task' | 'Subcontractor';
  issuedToName: string;
  createdBy: string;
  createdOn: Date;
  items: { materialId: string; qty: number }[];
}

export interface Expense { id: string; projectId: string; title: string; category: string; paidTo: string; amount: number; date: Date }

export interface State {
  projects: Project[];
  godowns: { name: string; address: string; state: string }[];
  materials: Material[];
  projectMaterials: ProjectMaterial[];
  indents: Indent[];
  pos: PurchaseOrder[];
  grns: Grn[];
  transfers: SiteTransfer[];
  issues: MaterialIssue[];
  expenses: Expense[];
  vendors: string[];
}

// ——— Seed data (the reference's sample content) ———

const day = (offset: number, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const projects: Project[] = [
  { id: 'p1', name: 'Green Valley Towers' },
  { id: 'p2', name: 'Lakeside Villas' },
  { id: 'p3', name: 'Metro Office Park' },
];

const materials: Material[] = [
  { id: 'm1', name: 'Plate', spec: 'Length 10 mm · Height 10 mm · Weight 100 kg', category: 'Steel', uom: 'Bags', unitPrice: 130, gstRate: 18 },
  { id: 'm2', name: 'Cement OPC 53', spec: 'Grade 53 · 50 kg bag', category: 'Civil', uom: 'Bags', unitPrice: 420, gstRate: 28, brand: 'UltraTech' },
  { id: 'm3', name: 'Sand', spec: 'River sand · Zone II', category: 'Civil', uom: 'Cu.m', unitPrice: 1800, gstRate: 5 },
  { id: 'm4', name: 'TMT Bar 12 mm', spec: 'Fe 550D · 12 m length', category: 'Steel', uom: 'Kg', unitPrice: 68, gstRate: 18, brand: 'Tata Tiscon' },
  { id: 'm5', name: 'Copper Wire 2.5 sq mm', spec: 'FR PVC · 90 m coil', category: 'Electrical', uom: 'Coils', unitPrice: 2350, gstRate: 18, brand: 'Havells' },
  { id: 'm6', name: 'PVC Conduit 25 mm', spec: 'Medium duty · 3 m', category: 'Electrical', uom: 'Nos', unitPrice: 95, gstRate: 18 },
  { id: 'm7', name: 'Red Brick', spec: '230 × 110 × 75 mm', category: 'Civil', uom: 'Nos', unitPrice: 9, gstRate: 5 },
  { id: 'm8', name: 'CPVC Pipe 1 inch', spec: 'SDR 11 · 3 m', category: 'Plumbing', uom: 'Nos', unitPrice: 410, gstRate: 18, brand: 'Astral' },
];

const pm = (projectId: string, materialId: string, inStock: number, minStock: number, estimatedQty: number, totalAdded: number, totalUsed: number): ProjectMaterial => {
  const m = materials.find((x) => x.id === materialId)!;
  return { projectId, materialId, inStock, minStock, estimatedQty, estimatedBudget: estimatedQty * m.unitPrice, totalAdded, totalUsed };
};

const projectMaterials: ProjectMaterial[] = [
  pm('p1', 'm1', 100, 150, 1200, 400, 300),
  pm('p1', 'm2', 640, 200, 5000, 1800, 1160),
  pm('p1', 'm3', 35, 50, 400, 120, 85),
  pm('p1', 'm4', 8200, 2000, 60000, 21000, 12800),
  pm('p1', 'm5', 42, 20, 300, 90, 48),
  pm('p1', 'm6', 15, 100, 1500, 300, 285),
  pm('p2', 'm2', 220, 100, 2400, 600, 380),
  pm('p2', 'm7', 18000, 5000, 90000, 30000, 12000),
  pm('p2', 'm8', 64, 40, 500, 120, 56),
  pm('p3', 'm4', 1200, 1500, 30000, 4000, 2800),
];

const approvers = (status: 'Waiting for Approval' | 'Approved' | 'Rejected') => [
  { name: 'Manish Sharma', status },
  { name: 'Priya Nair', status },
];

const indents: Indent[] = [
  { id: 'MT000124', projectId: 'p1', createdBy: 'Rajan Singh', createdOn: day(-2, 18), expectedDelivery: day(5), assignedTo: 'Sathish', status: 'Approval Pending', items: [{ materialId: 'm1', requested: 100, approved: 100 }, { materialId: 'm3', requested: 200, approved: 200 }], remark: 'Needed for the tower B slab casting next week.', attachments: ['BOQ-tower-B.pdf', 'Drawing-slab.pdf'], approvers: approvers('Waiting for Approval') },
  { id: 'MT000123', projectId: 'p1', createdBy: 'Sathish', createdOn: day(-6), expectedDelivery: day(-1), receivedOn: day(-1), assignedTo: 'Arvind', status: 'Converted to PO', items: [{ materialId: 'm2', requested: 300, approved: 300, decision: 'approved' }], remark: '', attachments: [], approvers: approvers('Approved') },
  { id: 'MT000122', projectId: 'p1', createdBy: 'Sathish', createdOn: day(-8), expectedDelivery: day(2), assignedTo: 'Sathish', status: 'Partially PO Converted', items: [{ materialId: 'm4', requested: 5000, approved: 5000, decision: 'approved' }, { materialId: 'm5', requested: 40, approved: 40, decision: 'approved' }], remark: '', attachments: [], approvers: approvers('Approved') },
  { id: 'MT000121', projectId: 'p2', createdBy: 'Sathish', createdOn: day(-9), expectedDelivery: day(3), assignedTo: 'Sathish', status: 'Approved', items: [{ materialId: 'm7', requested: 10000, approved: 8000, decision: 'approved' }], remark: 'Approved 8,000 for the first floor.', attachments: [], approvers: approvers('Approved') },
  { id: 'MT000120', projectId: 'p3', createdBy: 'Sathish', createdOn: day(-12), expectedDelivery: day(-4), assignedTo: 'Sathish', status: 'Rejected', items: [{ materialId: 'm4', requested: 9000, approved: 0, decision: 'rejected' }], remark: 'Duplicate of MT000118.', attachments: [], approvers: approvers('Rejected') },
  { id: 'MT000119', projectId: 'p2', createdBy: 'Rajan Singh', createdOn: day(-1, 10), expectedDelivery: day(7), assignedTo: 'Sathish', status: 'Approval Pending', items: [{ materialId: 'm8', requested: 60, approved: 60 }, { materialId: 'm2', requested: 150, approved: 150 }], remark: '', attachments: [], approvers: approvers('Waiting for Approval') },
];

const pos: PurchaseOrder[] = [
  { id: 'PO000126', projectId: 'p1', indentId: 'MT000123', vendor: 'Shree Cement Traders', createdBy: 'Sathish', createdOn: day(-5), expectedDelivery: day(-2), status: 'Delivered', items: [{ materialId: 'm2', qty: 300, unitPrice: 410 }], gstRate: 28, discount: 0, advance: 50000, terms: 'Payment within 30 days of delivery.' },
  { id: 'PO000125', projectId: 'p1', indentId: 'MT000122', vendor: 'Amit Steel Corporation', createdBy: 'Sathish', createdOn: day(-7), expectedDelivery: day(1), status: 'Partially Delivered', items: [{ materialId: 'm4', qty: 5000, unitPrice: 66 }], gstRate: 18, discount: 5000, advance: 100000, terms: '' },
  { id: 'PO000124', projectId: 'p2', vendor: 'Astral Pipes Depot', createdBy: 'Rajan Singh', createdOn: day(-3), expectedDelivery: day(4), status: 'Approval Pending', items: [{ materialId: 'm8', qty: 40, unitPrice: 400 }], gstRate: 18, discount: 0, advance: 0, terms: '' },
  { id: 'PO000123', projectId: 'p3', vendor: 'Amit Steel Corporation', createdBy: 'Sathish', createdOn: day(-10), expectedDelivery: day(-3), status: 'Rejected', items: [{ materialId: 'm4', qty: 2000, unitPrice: 72 }], gstRate: 18, discount: 0, advance: 0, terms: '' },
  { id: 'PO000122', projectId: 'p1', vendor: 'Havells Electricals', createdBy: 'Sathish', createdOn: day(-14), expectedDelivery: day(-9), status: 'Delivery Closed', items: [{ materialId: 'm5', qty: 50, unitPrice: 2300 }], gstRate: 18, discount: 0, advance: 20000, terms: '' },
];

const grns: Grn[] = [
  { id: 'GRN0001224', projectId: 'p1', poId: 'PO000126', vendor: 'Shree Cement Traders', invoiceNo: 'INV-88213', createdBy: 'Sathish', createdOn: day(-2), items: [{ materialId: 'm2', qty: 300, unitPrice: 410 }] },
  { id: 'GRN0001223', projectId: 'p1', poId: 'PO000125', vendor: 'Amit Steel Corporation', invoiceNo: 'INV-1120', createdBy: 'Sathish', createdOn: day(-3), items: [{ materialId: 'm4', qty: 2500, unitPrice: 66 }] },
  { id: 'GRN0001222', projectId: 'p1', poId: 'PO000122', vendor: 'Havells Electricals', invoiceNo: 'HV-5521', createdBy: 'Sathish', createdOn: day(-9), items: [{ materialId: 'm5', qty: 46, unitPrice: 2300 }] },
];

const transfers: SiteTransfer[] = [
  { id: 'ST000123', fromProjectId: 'p1', toProjectId: 'p2', createdBy: 'Sathish', createdOn: day(-1), status: 'Approval Pending', items: [{ materialId: 'm2', qty: 100 }], remark: 'Lakeside is short for the plinth work.' },
  { id: 'ST000122', fromProjectId: 'p2', toProjectId: 'p3', createdBy: 'Rajan Singh', createdOn: day(-6), status: 'Approved', items: [{ materialId: 'm7', qty: 2000 }], remark: '' },
];

const issues: MaterialIssue[] = [
  { id: 'MTI000012', projectId: 'p1', issuedTo: 'Task', issuedToName: 'Floor 2 · Flat 201 · Electrical work', createdBy: 'Sathish', createdOn: day(-1), items: [{ materialId: 'm5', qty: 6 }, { materialId: 'm6', qty: 40 }] },
  { id: 'MTI000011', projectId: 'p2', issuedTo: 'Subcontractor', issuedToName: 'Kumar Masonry Works', createdBy: 'Rajan Singh', createdOn: day(-4), items: [{ materialId: 'm7', qty: 4000 }] },
];

const expenses: Expense[] = [
  { id: 'EX000031', projectId: 'p1', title: 'Crane hire · 2 days', category: 'Equipment', paidTo: 'Sai Cranes', amount: 36000, date: day(-3) },
  { id: 'EX000030', projectId: 'p2', title: 'Transport of bricks', category: 'Transport', paidTo: 'Ravi Logistics', amount: 8500, date: day(-5) },
];

export const initialState: State = {
  projects,
  godowns: [{ name: 'Central Godown', address: 'Plot 14, Industrial Area, Pune', state: 'Maharashtra' }],
  materials,
  projectMaterials,
  indents,
  pos,
  grns,
  transfers,
  issues,
  expenses,
  vendors: ['Amit Steel Corporation', 'Shree Cement Traders', 'Havells Electricals', 'Astral Pipes Depot', 'Ravi Building Supplies'],
};

// ——— Helpers ———

export const inr = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fmtDate = (d?: Date) => (d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
export const fmtDateTime = (d: Date) => `${fmtDate(d)} · ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
export const qty = (n: number, uom: string) => `${n.toLocaleString('en-IN')} ${uom}`;

/** Whole days an item is late: received (or today) minus expected delivery; 0 when on time. */
export function delayDays(expected: Date, received?: Date) {
  const end = received ?? new Date();
  return Math.max(0, Math.floor((end.getTime() - expected.getTime()) / 86_400_000));
}

export function poTotals(po: Pick<PurchaseOrder, 'items' | 'gstRate' | 'discount' | 'advance'>) {
  const subtotal = po.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const taxable = Math.max(0, subtotal - po.discount);
  const gst = (taxable * po.gstRate) / 100;
  const total = Math.round(taxable + gst);
  return { subtotal, taxable, gst, total, balance: total - po.advance };
}

const grnValue = (g: Grn) => g.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);

export function deliveredValue(state: State, poId: string) {
  return state.grns.filter((g) => g.poId === poId).reduce((s, g) => s + grnValue(g), 0);
}

export function deliveredQty(state: State, poId: string, materialId: string) {
  return state.grns.filter((g) => g.poId === poId).reduce((s, g) => s + g.items.filter((i) => i.materialId === materialId).reduce((a, i) => a + i.qty, 0), 0);
}

/** Requested by approved indents but not yet on a PO. */
export function pendingRequest(state: State, projectId: string, materialId: string) {
  return state.indents
    .filter((i) => !i.deleted && i.projectId === projectId && i.status === 'Approval Pending')
    .reduce((s, i) => s + i.items.filter((x) => x.materialId === materialId).reduce((a, x) => a + x.requested, 0), 0);
}

export function approvedNotOrdered(state: State, projectId: string, materialId: string) {
  return state.indents
    .filter((i) => !i.deleted && i.projectId === projectId && (i.status === 'Approved' || i.status === 'Partially Approved'))
    .reduce((s, i) => s + i.items.filter((x) => x.materialId === materialId && x.decision === 'approved').reduce((a, x) => a + x.approved, 0), 0);
}

export function orderedQty(state: State, projectId: string, materialId: string) {
  return state.pos
    .filter((p) => p.projectId === projectId && p.status !== 'Rejected' && p.status !== 'Delivered' && p.status !== 'Delivery Closed')
    .reduce((s, p) => s + p.items.filter((i) => i.materialId === materialId).reduce((a, i) => a + Math.max(0, i.qty - deliveredQty(state, p.id, materialId)), 0), 0);
}

const nextId = (prefix: string, ids: string[], width: number) => {
  const max = ids.reduce((m, id) => Math.max(m, Number(id.replace(/\D/g, '')) || 0), 0);
  return prefix + String(max + 1).padStart(width, '0');
};

// ——— Reducer ———

export type Action =
  | { type: 'addProject'; id: string; name: string }
  | { type: 'addGodown'; godown: State['godowns'][number] }
  | { type: 'addMaterial'; projectId: string | null; material: Omit<Material, 'id'>; stock: Omit<ProjectMaterial, 'projectId' | 'materialId' | 'totalAdded' | 'totalUsed'> }
  | { type: 'addIndent'; indent: Omit<Indent, 'id' | 'status' | 'approvers'> }
  | { type: 'decideIndent'; id: string; items: IndentItem[]; remark?: string }
  | { type: 'deleteIndent'; id: string }
  | { type: 'addPo'; po: Omit<PurchaseOrder, 'id' | 'status'> }
  | { type: 'setPoStatus'; id: string; status: PoStatus }
  | { type: 'addGrn'; grn: Omit<Grn, 'id'> }
  | { type: 'addTransfer'; transfer: Omit<SiteTransfer, 'id' | 'status'> }
  | { type: 'decideTransfer'; id: string; status: 'Approved' | 'Rejected' }
  | { type: 'addIssue'; issue: Omit<MaterialIssue, 'id'> }
  | { type: 'addExpense'; expense: Omit<Expense, 'id'> }
  | { type: 'addVendor'; name: string };

/** Changes stock for one material on one project, adding the project row when it is missing. */
function moveStock(list: ProjectMaterial[], projectId: string, materialId: string, delta: number, kind: 'added' | 'used' | 'none'): ProjectMaterial[] {
  const exists = list.some((r) => r.projectId === projectId && r.materialId === materialId);
  const base = exists ? list : [...list, { projectId, materialId, inStock: 0, minStock: 0, estimatedQty: 0, estimatedBudget: 0, totalAdded: 0, totalUsed: 0 }];
  return base.map((r) =>
    r.projectId === projectId && r.materialId === materialId
      ? {
          ...r,
          inStock: Math.max(0, r.inStock + delta),
          totalAdded: kind === 'added' ? r.totalAdded + Math.abs(delta) : r.totalAdded,
          totalUsed: kind === 'used' ? r.totalUsed + Math.abs(delta) : r.totalUsed,
        }
      : r,
  );
}

export function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'addProject':
      return { ...state, projects: [...state.projects, { id: a.id, name: a.name }] };
    case 'addGodown':
      return { ...state, godowns: [...state.godowns, a.godown] };
    case 'addMaterial': {
      const existing = state.materials.find((m) => m.name.toLowerCase() === a.material.name.toLowerCase() && m.spec === a.material.spec);
      const id = existing?.id ?? `m${Date.now()}`;
      const materials = existing ? state.materials : [...state.materials, { ...a.material, id }];
      if (!a.projectId || state.projectMaterials.some((r) => r.projectId === a.projectId && r.materialId === id)) return { ...state, materials };
      return { ...state, materials, projectMaterials: [...state.projectMaterials, { projectId: a.projectId, materialId: id, ...a.stock, totalAdded: a.stock.inStock, totalUsed: 0 }] };
    }
    case 'addIndent': {
      const id = nextId('MT', state.indents.map((i) => i.id), 6);
      return { ...state, indents: [{ ...a.indent, id, status: 'Approval Pending', approvers: approvers('Waiting for Approval') }, ...state.indents] };
    }
    case 'decideIndent':
      return {
        ...state,
        indents: state.indents.map((i) => {
          if (i.id !== a.id) return i;
          const approved = a.items.filter((x) => x.decision === 'approved').length;
          const rejected = a.items.filter((x) => x.decision === 'rejected').length;
          const status: IndentStatus = approved === 0 && rejected === a.items.length ? 'Rejected' : rejected > 0 || a.items.some((x) => x.approved < x.requested) ? 'Partially Approved' : 'Approved';
          const done = approved + rejected === a.items.length;
          return {
            ...i,
            items: a.items,
            status: done ? status : 'Approval Pending',
            remark: a.remark ? [i.remark, a.remark].filter(Boolean).join('\n') : i.remark,
            approvers: done ? i.approvers.map((p) => ({ ...p, status: status === 'Rejected' ? 'Rejected' : 'Approved' })) : i.approvers,
          };
        }),
      };
    case 'deleteIndent':
      return { ...state, indents: state.indents.map((i) => (i.id === a.id ? { ...i, deleted: true } : i)) };
    case 'addPo': {
      const id = nextId('PO', state.pos.map((p) => p.id), 6);
      const indents = a.po.indentId
        ? state.indents.map((i) => {
            if (i.id !== a.po.indentId) return i;
            const all = i.items.filter((x) => x.decision === 'approved').every((x) => a.po.items.some((p) => p.materialId === x.materialId && p.qty >= x.approved));
            return { ...i, status: (all ? 'Converted to PO' : 'Partially PO Converted') as IndentStatus };
          })
        : state.indents;
      return { ...state, indents, pos: [{ ...a.po, id, status: 'Approval Pending' }, ...state.pos] };
    }
    case 'setPoStatus':
      return { ...state, pos: state.pos.map((p) => (p.id === a.id ? { ...p, status: a.status } : p)) };
    case 'addGrn': {
      const id = nextId('GRN', state.grns.map((g) => g.id), 7);
      let projectMaterials = state.projectMaterials;
      for (const it of a.grn.items) projectMaterials = moveStock(projectMaterials, a.grn.projectId, it.materialId, it.qty, 'added');
      const next = { ...state, projectMaterials, grns: [{ ...a.grn, id }, ...state.grns] };
      if (!a.grn.poId) return next;
      // The PO is delivered once every line has arrived in full.
      const po = state.pos.find((p) => p.id === a.grn.poId)!;
      const full = po.items.every((i) => deliveredQty(next, po.id, i.materialId) >= i.qty);
      return { ...next, pos: next.pos.map((p) => (p.id === po.id ? { ...p, status: full ? 'Delivered' : 'Partially Delivered' } : p)) };
    }
    case 'addTransfer': {
      const id = nextId('ST', state.transfers.map((t) => t.id), 6);
      return { ...state, transfers: [{ ...a.transfer, id, status: 'Approval Pending' }, ...state.transfers] };
    }
    case 'decideTransfer': {
      const t = state.transfers.find((x) => x.id === a.id)!;
      let projectMaterials = state.projectMaterials;
      if (a.status === 'Approved') {
        for (const it of t.items) {
          projectMaterials = moveStock(projectMaterials, t.fromProjectId, it.materialId, -it.qty, 'none');
          projectMaterials = moveStock(projectMaterials, t.toProjectId, it.materialId, it.qty, 'added');
        }
      }
      return { ...state, projectMaterials, transfers: state.transfers.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)) };
    }
    case 'addIssue': {
      const id = nextId('MTI', state.issues.map((i) => i.id), 6);
      let projectMaterials = state.projectMaterials;
      for (const it of a.issue.items) projectMaterials = moveStock(projectMaterials, a.issue.projectId, it.materialId, -it.qty, 'used');
      return { ...state, projectMaterials, issues: [{ ...a.issue, id }, ...state.issues] };
    }
    case 'addExpense': {
      const id = nextId('EX', state.expenses.map((e) => e.id), 6);
      return { ...state, expenses: [{ ...a.expense, id }, ...state.expenses] };
    }
    case 'addVendor':
      return state.vendors.includes(a.name) ? state : { ...state, vendors: [...state.vendors, a.name] };
  }
}

// ——— Context (the provider is in StoreProvider.tsx) ———

export interface Store {
  state: State;
  dispatch: (a: Action) => void;
  material: (id: string) => Material;
  project: (id: string) => Project;
  /** Shows a confirmation toast. */
  notify: (message: string) => void;
}

export const StoreContext = createContext<Store | null>(null);

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore needs <StoreProvider>');
  return s;
}
