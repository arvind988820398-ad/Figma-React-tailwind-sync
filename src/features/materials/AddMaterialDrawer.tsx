// Reference "Add New Materials": a right drawer with the material, its stock and money, extra specification and a photo.
// Each optional section can be removed and added back. In the Material Directory the stock section is hidden.
import { useState, type FormEvent, type ReactNode } from 'react';
import { CloseCircleIcon, PlusIcon } from '../../components/icons';
import { Autocomplete } from '../../components/ui/Autocomplete';
import { Button } from '../../components/ui/Button';
import { Drawer } from '../../components/ui/Drawer';
import { FileDropzone } from '../../components/ui/FileUpload';
import { HelperText, Input, Label } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { CATEGORIES, UOMS, useStore } from './model';

const GST = [0, 5, 12, 18, 28];

const empty = { name: '', spec: '', uom: '', category: '', inStock: '', estimatedQty: '', minStock: '', unitPrice: '', gstRate: '18', estimatedBudget: '', brand: '', length: '', breadth: '', height: '', diameter: '', weight: '', colour: '' };
type Form = typeof empty;

function Section({ title, onRemove, children }: { title: string; onRemove: () => void; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-default pt-5">
      <div className="flex items-center gap-3">
        <legend className="text-base font-semibold text-heading">{title}</legend>
        <Button type="button" color="ghost" size="xs" leftIcon={<CloseCircleIcon />} onClick={onRemove}>
          Remove
        </Button>
      </div>
      {children}
    </fieldset>
  );
}

function Field({ id, label, required, children, error }: { id: string; label: string; required?: boolean; children: ReactNode; error?: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      {error && (
        <HelperText id={`${id}-error`} status="danger">
          {error}
        </HelperText>
      )}
    </div>
  );
}

export function AddMaterialDrawer({ open, onOpenChange, projectId }: { open: boolean; onOpenChange: (o: boolean) => void; projectId: string | null }) {
  const { state, dispatch } = useStore();
  const [f, setF] = useState<Form>(empty);
  const [sections, setSections] = useState({ stock: true, money: true, extra: true });
  const [photo, setPhoto] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const [newName, setNewName] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  // Bumped on reset so the Autocomplete forgets its typed text.
  const [formKey, setFormKey] = useState(0);
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const num = (v: string) => Number(v) || 0;
  const uom = f.uom || 'UOM';

  const errors = {
    name: !f.name.trim() ? 'Enter the material name' : '',
    uom: !f.uom ? 'Choose a unit of measure' : '',
  };
  const valid = !errors.name && !errors.uom;

  // Picking a material from the directory fills in what we know about it; "Add a new material" switches to free text.
  const pick = (id: string | null) => {
    setPickedId(id);
    const m = state.materials.find((x) => x.id === id);
    setF((x) => (m ? { ...x, name: m.name, spec: m.spec, uom: m.uom, category: m.category, unitPrice: String(m.unitPrice), gstRate: String(m.gstRate), brand: m.brand ?? '' } : { ...x, name: '' }));
  };
  const switchToNew = () => {
    setPickedId(null);
    setNewName(true);
    setF((x) => ({ ...x, name: '' }));
    requestAnimationFrame(() => document.getElementById('mat-name')?.focus());
  };

  const reset = () => {
    setF(empty);
    setPhoto(null);
    setTried(false);
    setNewName(false);
    setPickedId(null);
    setFormKey((k) => k + 1);
    setSections({ stock: true, money: true, extra: true });
  };

  const save = (close: boolean) => (e?: FormEvent) => {
    e?.preventDefault();
    setTried(true);
    if (!valid) {
      // The errors sit at the top of a long form: take the user there.
      document.getElementById(errors.name ? 'mat-name' : 'mat-uom')?.focus();
      return;
    }
    const dims = [['Length', f.length], ['Breadth', f.breadth], ['Height', f.height], ['Diameter', f.diameter], ['Weight', f.weight], ['Colour', f.colour]]
      .filter(([, v]) => v)
      .map(([k, v]) => `${k} ${v}`);
    dispatch({
      type: 'addMaterial',
      projectId,
      material: {
        name: f.name.trim(),
        spec: [f.spec.trim(), ...dims].filter(Boolean).join(' · '),
        category: f.category || 'Civil',
        uom: f.uom,
        unitPrice: num(f.unitPrice),
        gstRate: num(f.gstRate),
        brand: f.brand.trim() || undefined,
      },
      stock: {
        inStock: num(f.inStock),
        minStock: num(f.minStock),
        estimatedQty: num(f.estimatedQty),
        estimatedBudget: num(f.estimatedBudget) || num(f.estimatedQty) * num(f.unitPrice),
      },
    });
    reset();
    if (close) onOpenChange(false);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      title="Add New Materials"
      placement="end"
      className="w-2xl"
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button color="tertiary" onClick={() => save(false)()}>
            Save & Create New
          </Button>
          <Button type="submit" form="add-material">
            Done
          </Button>
        </div>
      }
    >
      <form id="add-material" onSubmit={save(true)} noValidate className="flex flex-col gap-5">
        <Field id="mat-name" label="Material Name" required error={tried ? errors.name : undefined}>
          {newName ? (
            <>
              <Input
                id="mat-name"
                placeholder="Name of the new material"
                value={f.name}
                onChange={set('name')}
                status={tried && errors.name ? 'danger' : undefined}
                aria-describedby={tried && errors.name ? 'mat-name-error' : undefined}
              />
              <Button type="button" color="ghost" size="xs" onClick={() => setNewName(false)} className="mt-2 self-start">
                Pick from the Material Directory
              </Button>
            </>
          ) : (
            <Autocomplete
              key={formKey}
              id="mat-name"
              placeholder="Type and search the directory"
              options={state.materials.map((m) => ({ value: m.id, label: m.name, description: m.spec, group: m.category }))}
              value={pickedId}
              onChange={pick}
              emptyText="Not in the directory yet"
              aria-describedby={tried && errors.name ? 'mat-name-error' : undefined}
              footer={
                <Button type="button" color="ghost" size="xs" leftIcon={<PlusIcon />} onClick={switchToNew}>
                  Add a new material
                </Button>
              }
            />
          )}
        </Field>
        <Field id="mat-spec" label="Material Specification">
          <Input id="mat-spec" placeholder="e.g. Grade 53 · 50 kg bag" value={f.spec} onChange={set('spec')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="mat-uom" label="UOM" required error={tried ? errors.uom : undefined}>
            <Select id="mat-uom" value={f.uom} onChange={set('uom')} status={tried && errors.uom ? 'danger' : undefined} aria-describedby={tried && errors.uom ? 'mat-uom-error' : undefined}>
              <option value="">Select</option>
              {UOMS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field id="mat-category" label="Category">
            <Select id="mat-category" value={f.category} onChange={set('category')}>
              <option value="">Select</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        {projectId && sections.stock && (
          <Section title="Stock Details" onRemove={() => setSections((s) => ({ ...s, stock: false }))}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="mat-stock" label="In Stock Quantity">
                <Input id="mat-stock" inputMode="decimal" placeholder="Enter" value={f.inStock} onChange={set('inStock')} rightIcon={<span className="text-xs">{uom}</span>} />
              </Field>
              <Field id="mat-est" label="Estimated Quantity">
                <Input id="mat-est" inputMode="decimal" placeholder="Enter" value={f.estimatedQty} onChange={set('estimatedQty')} rightIcon={<span className="text-xs">{uom}</span>} />
              </Field>
              <Field id="mat-min" label="Min. stock to maintain">
                <Input id="mat-min" inputMode="decimal" placeholder="Enter" value={f.minStock} onChange={set('minStock')} rightIcon={<span className="text-xs">{uom}</span>} />
              </Field>
            </div>
          </Section>
        )}

        {sections.money && (
          <Section title="Financial Details" onRemove={() => setSections((s) => ({ ...s, money: false }))}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="mat-price" label="Unit Price">
                <Input id="mat-price" inputMode="decimal" placeholder="Enter" value={f.unitPrice} onChange={set('unitPrice')} addonText="₹" rightIcon={<span className="text-xs">/{uom}</span>} />
              </Field>
              <Field id="mat-gst" label="GST">
                <Select id="mat-gst" value={f.gstRate} onChange={set('gstRate')}>
                  {GST.map((g) => (
                    <option key={g} value={g}>
                      {g}%
                    </option>
                  ))}
                </Select>
              </Field>
              {projectId && (
                <Field id="mat-budget" label="Estimated Budget">
                  <Input id="mat-budget" inputMode="decimal" placeholder={f.estimatedQty && f.unitPrice ? String(num(f.estimatedQty) * num(f.unitPrice)) : 'Enter'} value={f.estimatedBudget} onChange={set('estimatedBudget')} addonText="₹" />
                </Field>
              )}
            </div>
          </Section>
        )}

        {sections.extra && (
          <Section title="Additional Specification Details" onRemove={() => setSections((s) => ({ ...s, extra: false }))}>
            <Field id="mat-brand" label="Brand Name">
              <Input id="mat-brand" placeholder="Enter" value={f.brand} onChange={set('brand')} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-4">
              {(['length', 'breadth', 'height', 'diameter'] as const).map((k) => (
                <Field key={k} id={`mat-${k}`} label={k[0].toUpperCase() + k.slice(1)}>
                  <Input id={`mat-${k}`} placeholder="Enter" value={f[k]} onChange={set(k)} />
                </Field>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field id="mat-weight" label="Weight">
                <Input id="mat-weight" placeholder="Enter" value={f.weight} onChange={set('weight')} />
              </Field>
              <Field id="mat-colour" label="Colour">
                <Input id="mat-colour" placeholder="Enter" value={f.colour} onChange={set('colour')} />
              </Field>
            </div>
          </Section>
        )}

        {(!sections.stock || !sections.money || !sections.extra) && (
          <div className="flex flex-wrap gap-2">
            {projectId && !sections.stock && (
              <Button type="button" color="ghost" size="xs" leftIcon={<PlusIcon />} onClick={() => setSections((s) => ({ ...s, stock: true }))}>
                Add Stock Details
              </Button>
            )}
            {!sections.money && (
              <Button type="button" color="ghost" size="xs" leftIcon={<PlusIcon />} onClick={() => setSections((s) => ({ ...s, money: true }))}>
                Add Financial Details
              </Button>
            )}
            {!sections.extra && (
              <Button type="button" color="ghost" size="xs" leftIcon={<PlusIcon />} onClick={() => setSections((s) => ({ ...s, extra: true }))}>
                Add Additional Specification Details
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-default pt-5">
          <FileDropzone accept="image/*" hint={photo ? `Selected: ${photo}` : 'Click or drag a photo to upload (PNG or JPG)'} onFiles={(files) => setPhoto(files[0]?.name ?? null)} />
        </div>
      </form>
    </Drawer>
  );
}
