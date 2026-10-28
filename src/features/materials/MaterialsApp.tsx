// Material management app (Figma "Material - powerplay", section 3073:26924): Material List with empty state,
// the materials table and the "Add New Materials" drawer, plus the Indent module (requests from site supervisors),
// composed from AuxoKit components.
import { useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { FileDropzone } from '../../components/ui/FileUpload';
import { Modal } from '../../components/ui/Modal';
import { Toast, ToastViewport } from '../../components/ui/Toast';
import { AddMaterialDrawer } from './AddMaterialDrawer';
import { AppShell } from './AppShell';
import { IndentDrawer } from './IndentDrawer';
import { IndentList } from './IndentList';
import { INDENTS_STORAGE_KEY, useIndents, useMaterials, type UseMaterialsOptions } from './store';
import type { Indent } from './indents';
import { MaterialList, type EditSection } from './MaterialList';
import type { Material, Module, Scope } from './types';

interface ToastItem {
  id: number;
  title: string;
  body?: string;
  color?: 'neutral' | 'warning' | 'danger';
}

export interface MaterialsAppProps extends UseMaterialsOptions {
  initialScope?: Scope;
  initialModule?: Module;
}

export function MaterialsApp({ storageKey, seed, initialScope = 'project', initialModule = 'Material List' }: MaterialsAppProps) {
  const store = useMaterials({ storageKey, seed });
  const indentStore = useIndents({ storageKey: storageKey === null ? null : INDENTS_STORAGE_KEY });
  const [module, setModule] = useState<Module>(initialModule);
  const [indentDrawer, setIndentDrawer] = useState<{ open: boolean; session: number; indent: Indent | null }>({ open: false, session: 0, indent: null });
  const [scope, setScope] = useState<Scope>(initialScope);
  const [projectQuery, setProjectQuery] = useState('');
  // `session` changes on every open and keys the drawer, so its form state resets from the new material/section.
  const [drawer, setDrawer] = useState<{ open: boolean; session: number; material?: Material | null; section?: EditSection }>({ open: false, session: 0 });
  const openDrawer = (material: Material | null, section?: EditSection) => setDrawer((d) => ({ open: true, session: d.session + 1, material, section }));
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [upload, setUpload] = useState<{ open: boolean; file?: File }>({ open: false });

  const notify = (title: string, body?: string, color?: ToastItem['color']) => setToasts((t) => [...t, { id: Date.now() + Math.random(), title, body, color }]);
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const indents = indentStore.indents.filter((i) => scope === 'directory' || i.scope === 'project');
  const pendingIndents = indentStore.indents.filter((i) => i.status === 'Pending').length;

  // Material List figures that come from indents: Pending Request (not yet reviewed) and Approved Req. Qty (not yet ordered).
  const requested = useMemo(() => {
    const pending = new Map<string, number>();
    const approved = new Map<string, number>();
    for (const i of indentStore.indents) {
      for (const l of i.lines) {
        if (i.status === 'Pending') pending.set(l.material, (pending.get(l.material) ?? 0) + l.requestedQty);
        if (i.status === 'Approved' || i.status === 'Partially approved') approved.set(l.material, (approved.get(l.material) ?? 0) + (l.approvedQty ?? 0));
      }
    }
    return { pending, approved };
  }, [indentStore.indents]);

  const visible = store.materials
    .filter((m) => scope === 'directory' || m.scope === 'project')
    .map((m) => ({
      ...m,
      pendingRequest: requested.pending.get(m.name) ?? m.pendingRequest,
      approvedReqQty: requested.approved.get(m.name) ?? m.approvedReqQty,
    }));

  return (
    <AppShell
      module={module}
      onModuleChange={setModule}
      pendingIndents={pendingIndents}
      scope={scope}
      onScopeChange={setScope}
      projectQuery={projectQuery}
      onProjectQueryChange={setProjectQuery}
      onLoadSamples={() => {
        store.loadSamples();
        notify('Sample materials loaded');
      }}
      onClearAll={() => {
        store.clear();
        notify('All materials removed');
      }}
    >
      {module === 'Material List' ? (
        <MaterialList
          materials={visible}
          onAdd={() => openDrawer(null)}
          onEdit={(material, section) => openDrawer(material, section)}
          onDelete={(ids) => {
            store.remove(ids);
            notify(`${ids.length} material${ids.length === 1 ? '' : 's'} deleted`);
          }}
          onUpload={() => setUpload({ open: true })}
        />
      ) : module === 'Indent' ? (
        <IndentList indents={indents} onOpen={(indent) => setIndentDrawer((d) => ({ open: true, session: d.session + 1, indent }))} onExport={() => notify('Export started', 'Indents will download as CSV once the backend is connected.')} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center">
          <p className="text-lg font-medium text-heading">{module}</p>
          <p className="max-w-md text-sm text-body">This module is not part of the current design. The Material List is fully wired; the other tabs are placeholders.</p>
        </div>
      )}

      <Modal
        open={upload.open}
        onOpenChange={(open) => setUpload({ open })}
        title="Upload materials from Excel"
        footer={
          <>
            <Button color="tertiary" onClick={() => setUpload({ open: false })}>
              Cancel
            </Button>
            <Button
              disabled={!upload.file}
              onClick={() => {
                notify(`Received ${upload.file?.name}`, 'Excel import needs a backend; nothing was imported in this demo.', 'warning');
                setUpload({ open: false });
              }}
            >
              Import
            </Button>
          </>
        }
      >
        <FileDropzone accept=".xlsx,.xls,.csv" onFiles={(files) => setUpload({ open: true, file: files[0] })} hint={upload.file ? `Selected: ${upload.file.name}` : 'XLSX or CSV using the material template'} />
      </Modal>

      <AddMaterialDrawer
        key={`material-${drawer.session}`}
        open={drawer.open}
        onOpenChange={(open) => setDrawer((d) => ({ ...d, open }))}
        material={drawer.material}
        section={drawer.section}
        onSubmit={(draft, { createAnother, id }) => {
          if (id) {
            store.update(id, draft);
            notify(`${draft.name} updated`);
          } else {
            store.add(draft, scope);
            notify(`${draft.name} added`, createAnother ? 'Add the next material.' : undefined);
          }
        }}
      />

      <IndentDrawer
        key={`indent-${indentDrawer.session}`}
        open={indentDrawer.open}
        onOpenChange={(open) => setIndentDrawer((d) => ({ ...d, open }))}
        indent={indentDrawer.indent}
        onApprove={(id, decision) => {
          indentStore.approve(id, decision);
          const partial = decision.approvedQty.some((q, n) => q < (indentDrawer.indent?.lines[n]?.requestedQty ?? q));
          notify(`${indentDrawer.indent?.number} ${partial ? 'partially approved' : 'approved'}`, 'The supervisor has been notified.');
        }}
        onReject={(id, note) => {
          indentStore.reject(id, note);
          notify(`${indentDrawer.indent?.number} rejected`, note ? 'Your note was sent to the supervisor.' : undefined, 'warning');
        }}
      />

      <ToastViewport>
        {toasts.map((t) => (
          <Toast key={t.id} color={t.color} title={t.title} onDismiss={() => dismiss(t.id)} duration={4000}>
            {t.body}
          </Toast>
        ))}
      </ToastViewport>
    </AppShell>
  );
}

export default MaterialsApp;
