// "Add New Materials" drawer (Figma frames 27:9762 collapsed, 27:9783 expanded). AuxoKit Drawer at the design's
// 624px width, with the optional sections (Stock, Financial, Additional specification) expanding from brand links.
import { useId, useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { FileDropzone } from '../../components/ui/FileUpload';
import { HelperText, Input, Label } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { cn } from '../../lib/cn';
import { RemoveCircleIcon } from './icons';
import type { EditSection } from './MaterialList';
import { CATEGORY_OPTIONS, GST_OPTIONS, MATERIAL_CATALOG, UOM_OPTIONS, type Material, type MaterialDraft } from './types';

interface FormState {
  name: string;
  specifications: string[];
  uom: string;
  category: string;
  inStock: string;
  estimatedQty: string;
  minStock: string;
  unitPrice: string;
  gst: string;
  estimatedBudget: string;
  brand: string;
  length: string;
  breadth: string;
  height: string;
  diameter: string;
  weight: string;
  colour: string;
  photoName: string;
}

const empty = (): FormState => ({
  name: '',
  specifications: [''],
  uom: '',
  category: '',
  inStock: '',
  estimatedQty: '',
  minStock: '',
  unitPrice: '',
  gst: '',
  estimatedBudget: '',
  brand: '',
  length: '',
  breadth: '',
  height: '',
  diameter: '',
  weight: '',
  colour: '',
  photoName: '',
});

const str = (v: number | string | undefined) => (v === undefined ? '' : String(v));

function fromMaterial(m: Material): FormState {
  return {
    name: m.name,
    specifications: m.specifications.length ? m.specifications : [''],
    uom: m.uom,
    category: m.category ?? '',
    inStock: str(m.inStock),
    estimatedQty: str(m.estimatedQty),
    minStock: str(m.minStock),
    unitPrice: str(m.unitPrice),
    gst: m.gst ?? '',
    estimatedBudget: str(m.estimatedBudget),
    brand: m.brand ?? '',
    length: m.length ?? '',
    breadth: m.breadth ?? '',
    height: m.height ?? '',
    diameter: m.diameter ?? '',
    weight: m.weight ?? '',
    colour: m.colour ?? '',
    photoName: m.photoName ?? '',
  };
}

const numOrUndefined = (v: string) => (v.trim() === '' ? undefined : Number(v));
const strOrUndefined = (v: string) => (v.trim() === '' ? undefined : v.trim());

function toDraft(f: FormState): MaterialDraft {
  return {
    name: f.name.trim(),
    specifications: f.specifications.map((s) => s.trim()).filter(Boolean),
    uom: f.uom,
    category: strOrUndefined(f.category),
    inStock: numOrUndefined(f.inStock),
    estimatedQty: numOrUndefined(f.estimatedQty),
    minStock: numOrUndefined(f.minStock),
    unitPrice: numOrUndefined(f.unitPrice),
    gst: strOrUndefined(f.gst),
    estimatedBudget: numOrUndefined(f.estimatedBudget),
    brand: strOrUndefined(f.brand),
    length: strOrUndefined(f.length),
    breadth: strOrUndefined(f.breadth),
    height: strOrUndefined(f.height),
    diameter: strOrUndefined(f.diameter),
    weight: strOrUndefined(f.weight),
    colour: strOrUndefined(f.colour),
    photoName: strOrUndefined(f.photoName),
  };
}

/** Which optional sections a material already has values in, so editing reopens them. */
function sectionsFor(m: Material): EditSection[] {
  const out: EditSection[] = [];
  if (m.inStock !== undefined || m.estimatedQty !== undefined || m.minStock !== undefined) out.push('stock');
  if (m.unitPrice !== undefined || m.gst !== undefined || m.estimatedBudget !== undefined) out.push('financial');
  if (m.brand || m.length || m.breadth || m.height || m.diameter || m.weight || m.colour || m.photoName) out.push('additional');
  return out;
}

const SECTION_TITLES: Record<EditSection, { link: string; title: string }> = {
  additional: { link: 'Add Additional Specification Details', title: 'Additional Specification Details' },
  stock: { link: 'Add Stock Details', title: 'Stock Details' },
  financial: { link: 'Add Financial Details', title: 'Financial Details' },
};

/** Brand text action used for progressive disclosure ("Add Stock Details", "Add Specification"): a Ghost Button. */
function LinkButton({ children, onClick, className }: { children: ReactNode; onClick: () => void; className?: string }) {
  return (
    <Button color="ghost" size="sm" onClick={onClick} className={cn('-ms-3 self-start', className)}>
      {children}
    </Button>
  );
}

function Section({ section, onRemove, children }: { section: EditSection; onRemove: () => void; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-default pt-5" aria-label={SECTION_TITLES[section].title}>
      <div className="flex items-center gap-6">
        <h3 className="text-base font-medium text-heading">{SECTION_TITLES[section].title}</h3>
        <Button color="ghost" size="xs" onClick={onRemove} leftIcon={<RemoveCircleIcon />}>
          Remove
        </Button>
      </div>
      {children}
    </section>
  );
}

/** Number field: a currency prefix uses the Input's Figma "Add-on text" slot; the unit suffix sits in the trailing icon slot. */
function UnitInput({ id, value, onChange, suffix, prefix, placeholder = 'Enter' }: { id: string; value: string; onChange: (v: string) => void; suffix?: string; prefix?: string; placeholder?: string }) {
  const affix = (text: string) => (
    <span className="text-xs font-medium text-heading" aria-hidden>
      {text}
    </span>
  );
  return (
    <Input
      id={id}
      type="number"
      inputMode="decimal"
      min={0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      addonText={prefix}
      rightIcon={suffix ? affix(suffix) : undefined}
    />
  );
}

export interface AddMaterialDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Editing an existing material prefills the form. */
  material?: Material | null;
  /** Section to expand on open (e.g. the "Add" link in the In Stock column). */
  section?: EditSection;
  /** Remount with a new `key` on every open so the form starts from `material`/`section`. */
  onSubmit: (draft: MaterialDraft, options: { createAnother: boolean; id?: string }) => void;
}

export function AddMaterialDrawer({ open, onOpenChange, material, section, onSubmit }: AddMaterialDrawerProps) {
  const uid = useId();
  // The parent remounts this drawer (key) every time it opens, so initial state comes straight from props.
  const [form, setForm] = useState<FormState>(() => (material ? fromMaterial(material) : empty()));
  const [sections, setSections] = useState<Set<EditSection>>(() => {
    const next = new Set<EditSection>(material ? sectionsFor(material) : []);
    if (section) next.add(section);
    return next;
  });
  const [errors, setErrors] = useState<{ name?: string; uom?: string }>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setSpec = (i: number, value: string) => setForm((f) => ({ ...f, specifications: f.specifications.map((s, j) => (j === i ? value : s)) }));
  const openSection = (s: EditSection) => setSections((prev) => new Set(prev).add(s));
  const closeSection = (s: EditSection) =>
    setSections((prev) => {
      const next = new Set(prev);
      next.delete(s);
      return next;
    });

  const submit = (createAnother: boolean) => {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = 'Material name is required.';
    if (!form.uom) nextErrors.uom = 'Choose a unit of measurement.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit(toDraft(form), { createAnother, id: material?.id });
    if (createAnother) {
      setForm(empty());
      setSections(new Set());
    } else {
      onOpenChange(false);
    }
  };

  const unit = form.uom || 'UOM';
  const id = (name: string) => `${uid}-${name}`;
  const field = (name: string, label: string, children: ReactNode, required = false) => (
    <div className="min-w-0 flex-1">
      <Label htmlFor={id(name)} required={required}>
        {label}
      </Label>
      {children}
    </div>
  );
  const text = (name: keyof FormState & string, placeholder = 'Enter') => (
    <Input id={id(name)} value={form[name] as string} onChange={(e) => set(name, e.target.value)} placeholder={placeholder} />
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      placement="end"
      size="md"
      title={material ? 'Edit Material' : 'Add New Materials'}
      className="w-2xl max-w-full"
      footer={
        <div className="flex w-full justify-end gap-3">
          {!material && (
            <Button color="tertiary" size="lg" onClick={() => submit(true)}>
              Save &amp; Create New
            </Button>
          )}
          <Button size="lg" onClick={() => submit(false)} className="min-w-36">
            Done
          </Button>
        </div>
      }
    >
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <div>
          <Label htmlFor={id('name')} required>
            Material Name
          </Label>
          <Input
            id={id('name')}
            list={id('catalog')}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Type and Search"
            status={errors.name ? 'danger' : undefined}
            aria-describedby={errors.name ? id('name-error') : undefined}
            autoFocus
          />
          <datalist id={id('catalog')}>
            {MATERIAL_CATALOG.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          {errors.name && (
            <HelperText id={id('name-error')} status="danger">
              {errors.name}
            </HelperText>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {form.specifications.map((spec, i) => (
            <div key={i}>
              <Label htmlFor={id(`spec-${i}`)}>
                {i === 0 ? 'Material Specification' : `Specification ${i + 1}`}
              </Label>
              <Input id={id(`spec-${i}`)} value={spec} onChange={(e) => setSpec(i, e.target.value)} placeholder="Type and Search" />
            </div>
          ))}
          <LinkButton className="text-sm" onClick={() => setForm((f) => ({ ...f, specifications: [...f.specifications, ''] }))}>
            Add Specification
          </LinkButton>
        </div>

        <div className="flex gap-6">
          {field(
            'uom',
            'UOM',
            <>
              <Select id={id('uom')} value={form.uom} onChange={(e) => set('uom', e.target.value)} status={errors.uom ? 'danger' : undefined} aria-describedby={errors.uom ? id('uom-error') : undefined}>
                <option value="">Select</option>
                {UOM_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
              {errors.uom && (
                <HelperText id={id('uom-error')} status="danger">
                  {errors.uom}
                </HelperText>
              )}
            </>,
            true,
          )}
          {field(
            'category',
            'Category',
            <Select id={id('category')} value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>,
          )}
        </div>

        {sections.has('stock') ? (
          <Section section="stock" onRemove={() => closeSection('stock')}>
            <div className="flex gap-6">
              {field('inStock', 'In Stock Quantity', <UnitInput id={id('inStock')} value={form.inStock} onChange={(v) => set('inStock', v)} suffix={unit} />)}
              {field('estimatedQty', 'Estimated Quantity', <UnitInput id={id('estimatedQty')} value={form.estimatedQty} onChange={(v) => set('estimatedQty', v)} suffix={unit} />)}
              {field('minStock', 'Min. stock to maintain', <UnitInput id={id('minStock')} value={form.minStock} onChange={(v) => set('minStock', v)} suffix={unit} />)}
            </div>
          </Section>
        ) : null}

        {sections.has('financial') ? (
          <Section section="financial" onRemove={() => closeSection('financial')}>
            <div className="flex gap-6">
              {field('unitPrice', 'Unit Price', <UnitInput id={id('unitPrice')} value={form.unitPrice} onChange={(v) => set('unitPrice', v)} prefix="₹" suffix={`/ ${unit}`} />)}
              {field(
                'gst',
                'GST',
                <Select id={id('gst')} value={form.gst} onChange={(e) => set('gst', e.target.value)}>
                  <option value="">Select</option>
                  {GST_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>,
              )}
              {field('estimatedBudget', 'Estimated Budget', <UnitInput id={id('estimatedBudget')} value={form.estimatedBudget} onChange={(v) => set('estimatedBudget', v)} prefix="₹" />)}
            </div>
          </Section>
        ) : null}

        {sections.has('additional') ? (
          <Section section="additional" onRemove={() => closeSection('additional')}>
            <div className="flex flex-col gap-5">
              <h4 className="text-sm font-medium text-heading">Brand</h4>
              {field('brand', 'Brand Name', text('brand'))}
            </div>
            <div className="flex flex-col gap-5 border-t border-default pt-5">
              <h4 className="text-sm font-medium text-heading">Dimensions</h4>
              <div className="flex gap-5">
                {field('length', 'Length', text('length'))}
                {field('breadth', 'Breadth', text('breadth'))}
                {field('height', 'Height', text('height'))}
                {field('diameter', 'Diameter', text('diameter'))}
              </div>
            </div>
            <div className="flex flex-col gap-5 border-t border-default pt-5">
              <h4 className="text-sm font-medium text-heading">Weight &amp; Colour</h4>
              <div className="flex gap-5">
                <div className="w-32">{field('weight', 'Weight', text('weight'))}</div>
                <div className="w-32">{field('colour', 'Colour', text('colour'))}</div>
              </div>
            </div>
            <div className="border-t border-default pt-5">
              <FileDropzone accept="image/*" onFiles={(files) => set('photoName', files[0]?.name ?? '')} hint={form.photoName ? `Selected: ${form.photoName}` : 'Click or drag Photo to upload'} />
            </div>
          </Section>
        ) : null}

        <div className="flex flex-col gap-5">
          {(['additional', 'stock', 'financial'] as const).filter((s) => !sections.has(s)).map((s) => (
            <LinkButton key={s} onClick={() => openSection(s)}>
              {SECTION_TITLES[s].link}
            </LinkButton>
          ))}
        </div>
      </form>
    </Drawer>
  );
}
