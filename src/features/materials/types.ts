// Material management domain types and reference data (Figma "Material - powerplay", section 3073:26924).

export const UOM_OPTIONS = ['Bags', 'Kg', 'Ton', 'Nos', 'Litre', 'Metre', 'Sq. ft', 'Cu. m', 'Box'] as const;
export const CATEGORY_OPTIONS = ['Electrical', 'Civil', 'Plumbing', 'Finishing', 'Mechanical', 'Safety', 'Consumables'] as const;
export const GST_OPTIONS = ['0%', '5%', '12%', '18%', '28%'] as const;

/** Suggestions for the "Type and Search" material name field. */
export const MATERIAL_CATALOG = [
  'Plate',
  'Cement OPC 53',
  'Steel Rebar 12mm',
  'River Sand',
  'Red Bricks',
  'Emulsion Paint',
  'PVC Pipe 1"',
  'Copper Wire 2.5 sq mm',
  'MCB 32A',
  'Vitrified Tiles 600x600',
  'Plywood 18mm',
  'Safety Helmet',
];

export type Scope = 'directory' | 'project';

export const MODULES = ['Material List', 'Indent', 'Purchase Orders', 'GRN', 'Site Transfers', 'Material Issue', 'Expenses', 'Material Vendor Payable'] as const;
export type Module = (typeof MODULES)[number];

export interface Material {
  id: string;
  name: string;
  specifications: string[];
  uom: string;
  category?: string;
  /** Stock details */
  inStock?: number;
  estimatedQty?: number;
  minStock?: number;
  /** Financial details */
  unitPrice?: number;
  gst?: string;
  estimatedBudget?: number;
  /** Additional specification details */
  brand?: string;
  length?: string;
  breadth?: string;
  height?: string;
  diameter?: string;
  weight?: string;
  colour?: string;
  photoName?: string;
  /** Read-only figures that come from indents, purchase orders and GRNs. */
  pendingRequest?: number;
  approvedReqQty?: number;
  ordered?: number;
  totalAdded?: number;
  totalUsed?: number;
  /** Which list the material belongs to: the org-wide directory or the current project. */
  scope: Scope;
  createdAt: string;
}

export type MaterialDraft = Omit<Material, 'id' | 'createdAt' | 'scope'>;

export const SAMPLE_MATERIALS: Omit<Material, 'id' | 'createdAt'>[] = [
  { name: 'Plate', specifications: ['Specification'], category: 'Electrical', uom: 'Bags', scope: 'project' },
  { name: 'Cement OPC 53', specifications: ['50 kg bag', 'Grade 53'], category: 'Civil', uom: 'Bags', inStock: 320, minStock: 100, estimatedQty: 1200, unitPrice: 410, gst: '28%', estimatedBudget: 492000, pendingRequest: 200, approvedReqQty: 150, ordered: 400, totalAdded: 720, totalUsed: 400, scope: 'project' },
  { name: 'Steel Rebar 12mm', specifications: ['Fe 500D'], category: 'Civil', uom: 'Ton', inStock: 8, minStock: 5, estimatedQty: 40, unitPrice: 62000, gst: '18%', pendingRequest: 6, ordered: 12, totalAdded: 20, totalUsed: 12, scope: 'project' },
  { name: 'Copper Wire 2.5 sq mm', specifications: ['FR, 90 m coil'], category: 'Electrical', uom: 'Nos', inStock: 14, minStock: 20, unitPrice: 2150, gst: '18%', pendingRequest: 10, scope: 'project' },
  { name: 'PVC Pipe 1"', specifications: ['Schedule 40'], category: 'Plumbing', uom: 'Metre', inStock: 240, minStock: 60, estimatedQty: 600, totalAdded: 300, totalUsed: 60, scope: 'project' },
  { name: 'Emulsion Paint', specifications: ['Interior, 20 L'], category: 'Finishing', uom: 'Litre', inStock: 0, minStock: 40, estimatedBudget: 36000, scope: 'project' },
  { name: 'Safety Helmet', specifications: ['ISI marked'], category: 'Safety', uom: 'Nos', inStock: 55, minStock: 25, totalAdded: 60, totalUsed: 5, scope: 'directory' },
  { name: 'Vitrified Tiles 600x600', specifications: ['Glossy, ivory'], category: 'Finishing', uom: 'Box', estimatedQty: 180, scope: 'directory' },
];
