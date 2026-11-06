// Studio panel (Figma "Studio panel – states", 12:1044). Default: four creation entry points (Overview, Process Map,
// Slide Deck, Proposal), then the notes and outputs created so far, and Add Notes. Closed: an icon rail. Open: an
// output shown as the real thing (an overview, a process map, a slide deck, a proposal) or the note editor
// ("Studio / Write") with Convert to source.
import { useState, type ReactNode } from 'react';
import {
  ChartMixedIcon,
  CheckCircleIcon,
  ClipboardCheckIcon,
  ClipboardIcon,
  CloseSidebarIcon,
  ColapseSidebarIcon,
  CompressIcon,
  CreditCardIcon,
  DownloadIcon,
  EyeIcon,
  FileImportIcon,
  FileLinesIcon,
  FlagIcon,
  LightbulbIcon,
  PenIcon,
  PlusIcon,
  RocketIcon,
  SchoolFlagIcon,
  ShareNodesIcon,
  TrashBinIcon,
  WandMagicSparklesIcon,
} from '../../components/icons';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { Card, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { List, ListItem } from '../../components/ui/List';
import { Progress } from '../../components/ui/Progress';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Spinner } from '../../components/ui/Spinner';
import { Stepper } from '../../components/ui/Stepper';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table';
import { CREATION_LABEL, excerpt, today, type Artifact, type Creation, type Note, type NoteKind } from './data';
import { ENTER, IconAction, LIFT, PanelHeader, POP, SourceIcon } from './shared';
import { useWorkspace, type PanelMode } from './workspace';

const CREATIONS: { kind: Creation; label: string; icon: ReactNode }[] = [
  { kind: 'overview', label: 'Overview', icon: <EyeIcon /> },
  { kind: 'process', label: 'Process Map', icon: <ShareNodesIcon /> },
  { kind: 'slides', label: 'Slide Deck', icon: <CreditCardIcon /> },
  { kind: 'proposal', label: 'Proposal', icon: <FileLinesIcon /> },
];
const creationIcon = (kind: NoteKind) => CREATIONS.find((x) => x.kind === kind)?.icon;
const noteIcon = (kind: NoteKind) => {
  const icon = creationIcon(kind);
  return (
    <span className={`inline-flex shrink-0 [&_svg]:size-4 ${icon ? 'text-fg-brand' : 'text-fg-warning'}`} aria-hidden>
      {icon ?? <ClipboardIcon />}
    </span>
  );
};

export function StudioPanel({ mode, editing, onMode, onEdit }: { mode: PanelMode; editing: string | null; onMode: (m: PanelMode) => void; onEdit: (id: string) => void }) {
  const { notes, setNotes } = useWorkspace();
  const note = editing ? notes.find((n) => n.id === editing) : undefined;

  const addNote = () => {
    const id = `n-${Date.now()}`;
    setNotes((ns) => [{ id, kind: 'note', title: 'Untitled note', body: '' }, ...ns]);
    onEdit(id);
  };

  return (
    <Card padding="none" className="flex min-h-0 w-full flex-col overflow-hidden">
      {/* One child, so the Card's gap does not space the header, body and footer apart. */}
      <div className="flex min-h-0 flex-1 flex-col">
      {mode === 'closed' ? (
        <ClosedRail onMode={onMode} onEdit={onEdit} onAdd={addNote} />
      ) : mode === 'open' && note ? (
        <OpenNote key={note.id} note={note} onBack={() => onMode('default')} />
      ) : (
        <StudioHome onMode={onMode} onEdit={onEdit} onAdd={addNote} />
      )}
      </div>
    </Card>
  );
}

// ---- Default --------------------------------------------------------------------------------------------------------

function StudioHome({ onMode, onEdit, onAdd }: { onMode: (m: PanelMode) => void; onEdit: (id: string) => void; onAdd: () => void }) {
  const { notes, sources, creating, createOutput } = useWorkspace();
  const selected = sources.filter((s) => s.selected && s.progress === 100);

  return (
    <>
      <PanelHeader title="Studio">
        <IconAction label="Collapse studio" onClick={() => onMode('closed')}>
          <CloseSidebarIcon />
        </IconAction>
      </PanelHeader>
      <div className="flex flex-col gap-3 border-b border-default p-4">
        {/* The reference draws these as tinted tiles; AD Design Kit has no tile button, Secondary Buttons stand in. */}
        {/* ad-design-kit-gap: action-tile */}
        <div className="grid grid-cols-2 gap-3">
          {CREATIONS.map((c) => (
            <span key={c.kind} className={LIFT}>
              <Button
                color="secondary"
                size="base"
                leftIcon={creating?.kind === c.kind ? <Spinner size="xs" label={`Creating ${c.label}`} /> : c.icon}
                disabled={creating !== null || selected.length === 0}
                onClick={() => createOutput(c.kind)}
                className="w-full justify-start"
              >
                {c.label}
              </Button>
            </span>
          ))}
        </div>
        {selected.length === 0 && <p className="text-xs text-body">Tick at least one source to create from it.</p>}
        {creating && (
          <div className={ENTER}>
            <Progress value={creating.progress} label={`Creating ${CREATION_LABEL[creating.kind].toLowerCase()} from ${selected.length} sources…`} />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3">
        {notes.length === 0 ? (
          <div className={`m-auto flex max-w-64 flex-col items-center gap-3 text-center ${POP}`}>
            <span className="inline-flex text-heading [&_svg]:size-8" aria-hidden>
              <WandMagicSparklesIcon />
            </span>
            <p className="text-base font-medium text-heading">Outputs created during the task land here.</p>
            <p className="text-sm text-body">After adding sources, create an overview, a process map, a slide deck or a proposal.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1" aria-label="Notes and outputs">
            {notes.map((n) => (
              <li key={n.id} className={ENTER}>
                <a href={`#/note/${n.id}`} onClick={(e) => (e.preventDefault(), onEdit(n.id))} className="group flex gap-3 py-2">
                  {noteIcon(n.kind)}
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium text-heading group-hover:text-fg-brand">{n.title}</span>
                    <span className="line-clamp-2 text-sm text-body">{n.artifact ? artifactExcerpt(n.artifact) : excerpt(n.body) || 'Empty note'}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-center border-t border-default p-3">
        <span className={LIFT}>
          <Button color="tertiary" leftIcon={<FileLinesIcon />} onClick={onAdd}>
            Add Notes
          </Button>
        </span>
      </div>
    </>
  );
}

/** One line about an output, for the Studio list. */
function artifactExcerpt(a: Artifact): string {
  switch (a.kind) {
    case 'overview':
      return `${a.topics.length} key topics, ${a.highlights.length} sources, ${a.nextSteps.length} next steps`;
    case 'process':
      return `${a.steps.length} steps · ${a.goal}`;
    case 'slides':
      return `${a.slides.length} slides · ${a.slides.slice(1, 4).map((s) => s.title).join(', ')}`;
    case 'proposal':
      return `${a.sections.length} sections · budget ${a.total}`;
  }
}

// ---- Closed -----------------------------------------------------------------------------------------------------------

function ClosedRail({ onMode, onEdit, onAdd }: { onMode: (m: PanelMode) => void; onEdit: (id: string) => void; onAdd: () => void }) {
  const { notes, createOutput } = useWorkspace();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-3 py-3">
      <IconAction label="Expand studio" placement="left" onClick={() => onMode('default')}>
        <ColapseSidebarIcon />
      </IconAction>
      <IconAction label="Add note" placement="left" onClick={onAdd}>
        <PlusIcon />
      </IconAction>
      <div className="flex flex-col items-center gap-1 border-t border-default pt-3">
        {CREATIONS.map((c) => (
          <IconAction key={c.kind} label={`Create ${c.label}`} placement="left" onClick={() => createOutput(c.kind)}>
            {c.icon}
          </IconAction>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto border-t border-default pt-3">
        {notes.map((n) => (
          <span key={n.id} className={ENTER}>
            <IconAction label={n.title} placement="left" onClick={() => onEdit(n.id)}>
              {noteIcon(n.kind)}
            </IconAction>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- Open: an output, or the editor ------------------------------------------------------------------------------------

/** An output opens as the artifact it is; "Edit as note" switches to the editor. A plain note opens in the editor. */
function OpenNote({ note, onBack }: { note: Note; onBack: () => void }) {
  const [asNote, setAsNote] = useState(!note.artifact);
  return asNote || !note.artifact ? <Editor note={note} onBack={onBack} /> : <ArtifactView note={note} onBack={onBack} onEditAsNote={() => setAsNote(true)} />;
}

function OpenHeader({ crumb, onBack, children }: { crumb: string; onBack: () => void; children?: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-2 border-b border-default px-4 py-3">
      <Breadcrumb items={[{ label: 'Studio', href: '#/studio' }, { label: crumb }]} onClick={(e) => ((e.target as HTMLElement).closest('a') ? (e.preventDefault(), onBack()) : undefined)} />
      <div className="flex items-center gap-1">
        {children}
        <IconAction label="Back to studio" onClick={onBack}>
          <CompressIcon />
        </IconAction>
      </div>
    </div>
  );
}

function ArtifactView({ note, onBack, onEditAsNote }: { note: Note; onBack: () => void; onEditAsNote: () => void }) {
  const { setNotes, addSource, notify } = useWorkspace();
  const a = note.artifact!;
  const label = CREATION_LABEL[a.kind];
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${ENTER}`}>
      <OpenHeader crumb={label} onBack={onBack}>
        <IconAction label="Edit as note" onClick={onEditAsNote}>
          <PenIcon />
        </IconAction>
        <IconAction label="Export as PDF" onClick={() => notify(`${note.title} exported as PDF`)}>
          <DownloadIcon />
        </IconAction>
        <IconAction
          label={`Delete ${label.toLowerCase()}`}
          onClick={() => {
            setNotes((ns) => ns.filter((n) => n.id !== note.id));
            notify(`${note.title} deleted`);
            onBack();
          }}
        >
          <TrashBinIcon />
        </IconAction>
      </OpenHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5">
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold text-heading">{note.title}</h3>
          <div className="flex flex-wrap gap-2">
            <Badge color="brand" leading={creationIcon(a.kind)}>
              {label}
            </Badge>
            {note.basedOn ? <Badge color="white">{`Built from ${note.basedOn} source${note.basedOn === 1 ? '' : 's'}`}</Badge> : null}
            <Badge color="white">{today()}</Badge>
          </div>
        </div>
        {a.kind === 'overview' && <OverviewView a={a} />}
        {a.kind === 'process' && <ProcessView a={a} />}
        {a.kind === 'slides' && <SlidesView a={a} />}
        {a.kind === 'proposal' && <ProposalView a={a} />}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-default px-5 py-3">
        <Button
          color="tertiary"
          leftIcon={<FileImportIcon />}
          onClick={() => {
            addSource(note.title, 'doc', { summary: excerpt(note.body).slice(0, 220), body: [excerpt(note.body)] });
            notify(`${note.title} added to sources`);
          }}
        >
          Convert to source
        </Button>
        <Button color="ghost" leftIcon={<PenIcon />} onClick={onEditAsNote}>
          Edit as note
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold text-heading">{title}</h4>
      {children}
    </div>
  );
}

function OverviewView({ a }: { a: Extract<Artifact, { kind: 'overview' }> }) {
  const { sources } = useWorkspace();
  const kindOf = (id: string) => sources.find((s) => s.id === id)?.kind ?? 'doc';
  return (
    <>
      <p className="text-sm text-body">{a.summary}</p>
      <Section title="Key topics">
        <div className="flex flex-wrap gap-2">
          {a.topics.map((t) => (
            <Badge key={t} color="gray" size="lg">
              {t}
            </Badge>
          ))}
        </div>
      </Section>
      <Section title="From your sources">
        <List variant="divider">
          {a.highlights.map((h) => (
            <ListItem key={h.sourceId} icon={<SourceIcon kind={kindOf(h.sourceId)} />} description={h.point}>
              {h.title}
            </ListItem>
          ))}
        </List>
      </Section>
      <Section title="Next steps">
        <List>
          {a.nextSteps.map((s) => (
            <ListItem key={s} icon={<CheckCircleIcon />}>
              {s}
            </ListItem>
          ))}
        </List>
      </Section>
    </>
  );
}

const STEP_ICONS = [<FlagIcon key="1" />, <LightbulbIcon key="2" />, <ChartMixedIcon key="3" />, <RocketIcon key="4" />, <ClipboardCheckIcon key="5" />, <SchoolFlagIcon key="6" />];

function ProcessView({ a }: { a: Extract<Artifact, { kind: 'process' }> }) {
  return (
    <>
      <p className="text-sm text-body">{a.goal}</p>
      <Stepper
        variant="vertical"
        current={a.steps.length}
        steps={a.steps.map((s, i) => ({ title: s.title, description: `${s.description} Owner: ${s.owner}.`, icon: STEP_ICONS[i % STEP_ICONS.length] }))}
      />
    </>
  );
}

function SlidesView({ a }: { a: Extract<Artifact, { kind: 'slides' }> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {a.slides.map((s, i) => (
        <Card key={s.title} padding="base">
          <span className="text-xs text-body">{i === 0 ? 'Title slide' : `Slide ${i + 1}`} of {a.slides.length}</span>
          <CardTitle>{s.title}</CardTitle>
          <ul className="list-disc ps-5 text-sm text-body">
            {s.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function ProposalView({ a }: { a: Extract<Artifact, { kind: 'proposal' }> }) {
  return (
    <>
      <p className="text-sm text-body">Prepared for the {a.preparedFor} · {today()}</p>
      {a.sections.map((s) => (
        <div key={s.title} className="flex flex-col gap-1">
          <h4 className="text-base font-semibold text-heading">{s.title}</h4>
          <p className="text-sm text-body">{s.text}</p>
        </div>
      ))}
      <Table caption={{ title: 'Budget', description: `Total ${a.total}` }}>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Item</TableHeaderCell>
            <TableHeaderCell>Qty</TableHeaderCell>
            <TableHeaderCell>Cost</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {a.costs.map((c) => (
            <TableRow key={c.item}>
              <TableCell>{c.item}</TableCell>
              <TableCell>{c.qty}</TableCell>
              <TableCell>{c.cost}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function Editor({ note, onBack }: { note: Note; onBack: () => void }) {
  const { setNotes, addSource, notify } = useWorkspace();
  const update = (patch: Partial<Note>) => setNotes((ns) => ns.map((n) => (n.id === note.id ? { ...n, ...patch } : n)));
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${ENTER}`}>
      <OpenHeader crumb="Write" onBack={onBack}>
        <IconAction
          label="Delete note"
          onClick={() => {
            setNotes((ns) => ns.filter((n) => n.id !== note.id));
            notify(`${note.title} deleted`);
            onBack();
          }}
        >
          <TrashBinIcon />
        </IconAction>
      </OpenHeader>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
        <Input aria-label="Note title" value={note.title} onChange={(e) => update({ title: e.target.value })} />
        <RichTextEditor label={note.title || 'Note'} defaultValue={note.body} placeholder="Write your note…" minRows={8} onChange={(html) => update({ body: html })} />
      </div>
      <div className="border-t border-default px-5 py-3">
        <Button
          color="tertiary"
          leftIcon={<FileImportIcon />}
          disabled={!excerpt(note.body)}
          onClick={() => {
            addSource(note.title || 'Untitled note', 'doc', { summary: excerpt(note.body).slice(0, 220), body: [excerpt(note.body)] });
            notify(`${note.title} added to sources`);
          }}
        >
          Convert to source
        </Button>
      </div>
    </div>
  );
}
