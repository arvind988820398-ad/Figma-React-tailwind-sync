// Indents: material requests raised by site supervisors, reviewed by the project team on the Indent tab.
import type { Scope } from './types';

export const INDENT_STATUSES = ['Pending', 'Approved', 'Partially approved', 'Rejected', 'Ordered'] as const;
export type IndentStatus = (typeof INDENT_STATUSES)[number];
export const INDENT_PRIORITIES = ['Normal', 'Urgent'] as const;
export type IndentPriority = (typeof INDENT_PRIORITIES)[number];

export interface IndentLine {
  material: string;
  specification?: string;
  uom: string;
  requestedQty: number;
  /** Set when the indent is approved; may be lower than requested (partial approval). */
  approvedQty?: number;
}

export interface IndentEvent {
  at: string;
  title: string;
  by: string;
  description?: string;
}

export interface Indent {
  id: string;
  number: string;
  site: string;
  requestedBy: { name: string; role: string };
  requestedOn: string;
  requiredBy: string;
  priority: IndentPriority;
  status: IndentStatus;
  purpose: string;
  lines: IndentLine[];
  history: IndentEvent[];
  scope: Scope;
}

const day = (offset: number) => new Date(Date.now() - offset * 864e5).toISOString();

const supervisors = {
  ramesh: { name: 'Ramesh Kumar', role: 'Site supervisor · Block A' },
  priya: { name: 'Priya Nair', role: 'Site supervisor · Block B' },
  anil: { name: 'Anil Shah', role: 'Site supervisor · Services' },
  meera: { name: 'Meera Joshi', role: 'Site supervisor · Finishing' },
};

export const SAMPLE_INDENTS: Omit<Indent, 'id'>[] = [
  {
    number: 'IND-0024',
    site: 'Tower 2 · Level 7',
    requestedBy: supervisors.ramesh,
    requestedOn: day(0),
    requiredBy: day(-3),
    priority: 'Urgent',
    status: 'Pending',
    purpose: 'Slab casting for level 7, pour scheduled Thursday.',
    lines: [
      { material: 'Cement OPC 53', specification: '50 kg bag, Grade 53', uom: 'Bags', requestedQty: 180 },
      { material: 'Steel Rebar 12mm', specification: 'Fe 500D', uom: 'Ton', requestedQty: 4 },
      { material: 'River Sand', uom: 'Cu. m', requestedQty: 12 },
    ],
    history: [{ at: day(0), title: 'Indent raised', by: 'Ramesh Kumar', description: 'Submitted from the site app.' }],
    scope: 'project',
  },
  {
    number: 'IND-0023',
    site: 'Tower 2 · Level 6',
    requestedBy: supervisors.anil,
    requestedOn: day(1),
    requiredBy: day(-5),
    priority: 'Normal',
    status: 'Pending',
    purpose: 'Electrical first fix, conduits and wiring for flats 601–608.',
    lines: [
      { material: 'Copper Wire 2.5 sq mm', specification: 'FR, 90 m coil', uom: 'Nos', requestedQty: 24 },
      { material: 'PVC Pipe 1"', specification: 'Schedule 40', uom: 'Metre', requestedQty: 300 },
      { material: 'MCB 32A', uom: 'Nos', requestedQty: 16 },
    ],
    history: [{ at: day(1), title: 'Indent raised', by: 'Anil Shah' }],
    scope: 'project',
  },
  {
    number: 'IND-0022',
    site: 'Tower 1 · Level 12',
    requestedBy: supervisors.meera,
    requestedOn: day(2),
    requiredBy: day(-7),
    priority: 'Normal',
    status: 'Partially approved',
    purpose: 'Interior painting, final coat for level 12.',
    lines: [
      { material: 'Emulsion Paint', specification: 'Interior, 20 L', uom: 'Litre', requestedQty: 120, approvedQty: 80 },
      { material: 'Plate', specification: 'Specification', uom: 'Bags', requestedQty: 10, approvedQty: 10 },
    ],
    history: [
      { at: day(2), title: 'Indent raised', by: 'Meera Joshi' },
      { at: day(1), title: 'Partially approved', by: 'Saurabh', description: 'Paint reduced to 80 L; 40 L available in store.' },
    ],
    scope: 'project',
  },
  {
    number: 'IND-0021',
    site: 'Tower 1 · Basement',
    requestedBy: supervisors.priya,
    requestedOn: day(4),
    requiredBy: day(-2),
    priority: 'Urgent',
    status: 'Approved',
    purpose: 'Waterproofing of basement raft, contractor mobilised.',
    lines: [
      { material: 'Cement OPC 53', specification: '50 kg bag, Grade 53', uom: 'Bags', requestedQty: 60, approvedQty: 60 },
      { material: 'Safety Helmet', specification: 'ISI marked', uom: 'Nos', requestedQty: 10, approvedQty: 10 },
    ],
    history: [
      { at: day(4), title: 'Indent raised', by: 'Priya Nair' },
      { at: day(3), title: 'Approved', by: 'Saurabh' },
    ],
    scope: 'project',
  },
  {
    number: 'IND-0020',
    site: 'Tower 2 · Level 5',
    requestedBy: supervisors.ramesh,
    requestedOn: day(6),
    requiredBy: day(1),
    priority: 'Normal',
    status: 'Ordered',
    purpose: 'Column reinforcement, level 5.',
    lines: [{ material: 'Steel Rebar 12mm', specification: 'Fe 500D', uom: 'Ton', requestedQty: 6, approvedQty: 6 }],
    history: [
      { at: day(6), title: 'Indent raised', by: 'Ramesh Kumar' },
      { at: day(5), title: 'Approved', by: 'Saurabh' },
      { at: day(4), title: 'Purchase order PO-0112 created', by: 'Procurement' },
    ],
    scope: 'project',
  },
  {
    number: 'IND-0019',
    site: 'Tower 1 · Level 9',
    requestedBy: supervisors.meera,
    requestedOn: day(8),
    requiredBy: day(2),
    priority: 'Normal',
    status: 'Rejected',
    purpose: 'Additional tiles for balcony rework.',
    lines: [{ material: 'Vitrified Tiles 600x600', specification: 'Glossy, ivory', uom: 'Box', requestedQty: 40 }],
    history: [
      { at: day(8), title: 'Indent raised', by: 'Meera Joshi' },
      { at: day(7), title: 'Rejected', by: 'Saurabh', description: 'Rework quantity not approved by the client yet; raise again after sign-off.' },
    ],
    scope: 'project',
  },
  {
    number: 'IND-0018',
    site: 'Central store',
    requestedBy: supervisors.anil,
    requestedOn: day(10),
    requiredBy: day(3),
    priority: 'Normal',
    status: 'Pending',
    purpose: 'Safety stock for the central store ahead of the monsoon.',
    lines: [
      { material: 'Safety Helmet', specification: 'ISI marked', uom: 'Nos', requestedQty: 30 },
      { material: 'Plywood 18mm', uom: 'Nos', requestedQty: 25 },
    ],
    history: [{ at: day(10), title: 'Indent raised', by: 'Anil Shah' }],
    scope: 'directory',
  },
];

export const statusBadge: Record<IndentStatus, 'gray' | 'white' | 'brand' | 'success' | 'warning' | 'danger'> = {
  Pending: 'warning',
  Approved: 'success',
  'Partially approved': 'brand',
  Rejected: 'danger',
  Ordered: 'gray',
};

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
