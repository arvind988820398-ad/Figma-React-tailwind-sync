// Sources panel (Figma "Sources panel – states", 10:610). Default: Add and Discover, the sources with their type icon
// and a tick for "use this source", the connectors. Closed: an icon rail. Open: one source with its Source Guide.
import { useState } from 'react';
import {
  AngleRightIcon,
  CheckIcon,
  CloseSidebarIcon,
  CompressIcon,
  FileCirclePlusIcon,
  FilterIcon,
  ColapseSidebarIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
} from '../../components/icons';
import { Accordion } from '../../components/ui/Accordion';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Checkbox } from '../../components/ui/Checkbox';
import { Dropdown, DropdownRadioItem } from '../../components/ui/Dropdown';
import { FileDropzone } from '../../components/ui/FileUpload';
import { IconShape } from '../../components/ui/IconShape';
import { Input } from '../../components/ui/Input';
import { List, ListItem } from '../../components/ui/List';
import { Modal } from '../../components/ui/Modal';
import { Progress } from '../../components/ui/Progress';
import { Spinner } from '../../components/ui/Spinner';
import { Toggle } from '../../components/ui/Toggle';
import drive from './assets/google-drive.svg';
import outlook from './assets/outlook.svg';
import slack from './assets/slack.svg';
import teams from './assets/teams.svg';
import { DISCOVER_RESULTS, kindLabel, SUGGESTED_DOCS, type Source, type SourceKind } from './data';
import { ENTER, IconAction, LIFT, PanelHeader, POP, SourceIcon } from './shared';
import { useWorkspace, type PanelMode } from './workspace';

/** The connectors' own marks, shown as images: brand logos are content, like the Damia logo, not kit icons. */
const CONNECTOR_LOGOS: Record<string, string> = { outlook, teams, drive, slack };
const connectorIcon = (id: string) => <img src={CONNECTOR_LOGOS[id]} alt="" className="size-5 shrink-0" />;

export function SourcesPanel({ mode, viewing, onMode, onView }: { mode: PanelMode; viewing: string | null; onMode: (m: PanelMode) => void; onView: (id: string) => void }) {
  const { sources } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const source = viewing ? sources.find((s) => s.id === viewing) : undefined;

  return (
    <Card padding="none" className="flex min-h-0 w-full flex-col overflow-hidden">
      {/* One child, so the Card's gap does not space the header, body and footer apart. */}
      <div className="flex min-h-0 flex-1 flex-col">
      {mode === 'closed' ? (
        <ClosedRail onMode={onMode} onView={onView} onAdd={() => setAdding(true)} />
      ) : mode === 'open' && source ? (
        <SourceView source={source} onBack={() => onMode('default')} />
      ) : (
        <SourceList onMode={onMode} onView={onView} onAdd={() => setAdding(true)} onDiscover={() => setDiscovering(true)} />
      )}
      <AddSources open={adding} onClose={() => setAdding(false)} />
      <Discover open={discovering} onClose={() => setDiscovering(false)} />
      </div>
    </Card>
  );
}

// ---- Default --------------------------------------------------------------------------------------------------------

function SourceList({ onMode, onView, onAdd, onDiscover }: { onMode: (m: PanelMode) => void; onView: (id: string) => void; onAdd: () => void; onDiscover: () => void }) {
  const { sources, setSources, addSource } = useWorkspace();
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<SourceKind | 'all'>('all');
  const shown = sources.filter((s) => (kind === 'all' || s.kind === kind) && s.title.toLowerCase().includes(query.trim().toLowerCase()));
  const ready = sources.filter((s) => s.progress === 100);
  const selected = ready.filter((s) => s.selected).length;
  const all = ready.length > 0 && selected === ready.length;

  return (
    <>
      <PanelHeader title="Sources">
        <IconAction label={searching ? 'Close search' : 'Search sources'} pressed={searching} onClick={() => (setSearching((v) => !v), setQuery(''))}>
          <SearchIcon />
        </IconAction>
        <Dropdown label="Filter sources" align="end" className="w-48" trigger={<Button color="ghost" size="xs" iconOnly aria-label="Filter sources"><FilterIcon /></Button>}>
          {(['all', 'doc', 'slides', 'pdf'] as const).map((k) => (
            <DropdownRadioItem key={k} checked={kind === k} onSelect={() => setKind(k)}>
              {k === 'all' ? 'All sources' : `${kindLabel(k)}s`}
            </DropdownRadioItem>
          ))}
        </Dropdown>
        <IconAction label="Collapse sources" onClick={() => onMode('closed')}>
          <CloseSidebarIcon />
        </IconAction>
      </PanelHeader>

      <div className="flex flex-col gap-3 px-4 pt-4">
        <div className="grid grid-cols-2 gap-2">
          <span className={LIFT}>
            <Button color="tertiary" leftIcon={<PlusIcon />} onClick={onAdd} className="w-full">
              Add
            </Button>
          </span>
          <span className={LIFT}>
            <Button color="tertiary" leftIcon={<SearchIcon />} onClick={onDiscover} className="w-full">
              Discover
            </Button>
          </span>
        </div>
        {searching && (
          <div className={ENTER}>
            <Input size="sm" type="search" autoFocus aria-label="Search sources" placeholder="Search sources" leftIcon={<SearchIcon />} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3">
        {sources.length === 0 ? (
          <div className="flex flex-col gap-4">
            <div className={`flex flex-col items-center gap-3 py-4 text-center ${POP}`}>
              <IconShape size="lg" color="brand" shape="circle">
                <FileCirclePlusIcon />
              </IconShape>
              <p className="text-sm text-body">Click Add to connect your data sources and tools for transactional data.</p>
            </div>
            <div className="flex flex-col items-start gap-1">
              <h3 className="text-sm font-medium text-heading">Suggested Documents</h3>
              {SUGGESTED_DOCS.map((d) => (
                <Button key={d} color="ghost" size="xs" leftIcon={<PlusIcon />} onClick={() => addSource(d, 'doc')}>
                  {d}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 pb-2">
              <Checkbox label="Select all sources" checked={all} disabled={ready.length === 0} onChange={() => setSources((ss) => ss.map((s) => (s.progress === 100 ? { ...s, selected: !all } : s)))} />
              <span className="text-xs text-body" aria-live="polite">{`${selected} of ${ready.length}`}</span>
            </div>
            <ul className="flex flex-col gap-1" aria-label="Sources">
              {shown.length === 0 && <li className="py-2 text-sm text-body">No source matches.</li>}
              {shown.map((s) => (
                <SourceRow key={s.id} source={s} onView={() => onView(s.id)} onToggle={() => setSources((ss) => ss.map((x) => (x.id === s.id ? { ...x, selected: !x.selected } : x)))} />
              ))}
            </ul>
          </>
        )}
      </div>

      <Connectors />
    </>
  );
}

function SourceRow({ source: s, onView, onToggle }: { source: Source; onView: () => void; onToggle: () => void }) {
  const reading = s.progress < 100;
  return (
    <li className={`${ENTER} flex flex-col gap-1.5 py-1.5 transition-opacity ${s.selected || reading ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-3">
        <SourceIcon kind={s.kind} />
        <a
          href={`#/source/${s.id}`}
          onClick={(e) => (e.preventDefault(), !reading && onView())}
          className="min-w-0 flex-1 truncate text-sm text-heading hover:text-fg-brand"
          title={s.title}
          aria-disabled={reading || undefined}
        >
          {s.title}
        </a>
        {reading ? <Spinner size="xs" label={`Reading ${s.title}`} /> : <Checkbox aria-label={`Use ${s.title}`} checked={s.selected} onChange={onToggle} />}
      </div>
      {reading && <Progress value={s.progress} size="base" showValue={false} aria-label={`Reading ${s.title}`} />}
    </li>
  );
}

function Connectors() {
  const { connectors, setConnectors, notify } = useWorkspace();
  const [all, setAll] = useState(false);
  const linked = connectors.filter((c) => c.linked);
  return (
    <div className="flex flex-col gap-2 border-t border-default px-4 py-4">
      <h3 className="text-sm font-medium text-heading">Connectors</h3>
      <p className="text-xs text-body">Damia uses connectors to browse websites, manage tasks, and more.</p>
      <List>
        {linked.map((c) => (
          <ListItem key={c.id} icon={connectorIcon(c.id)}>
            {c.name}
          </ListItem>
        ))}
      </List>
      <Button color="ghost" size="sm" rightIcon={<AngleRightIcon />} onClick={() => setAll(true)} className="justify-between">
        See all connectors
      </Button>
      <Modal open={all} onOpenChange={setAll} title="Connectors" description="Linked connectors let Damia read mail, chats and files.">
        <div className="flex flex-col gap-4">
          {connectors.map((c) => (
            <Toggle
              key={c.id}
              checked={c.linked}
              description={c.description}
              onCheckedChange={(on) => {
                setConnectors((cs) => cs.map((x) => (x.id === c.id ? { ...x, linked: on } : x)));
                notify(`${c.name} ${on ? 'connected' : 'disconnected'}`);
              }}
            >
              <span className="inline-flex items-center gap-2">
                {connectorIcon(c.id)}
                {c.name}
              </span>
            </Toggle>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ---- Closed -----------------------------------------------------------------------------------------------------------

function ClosedRail({ onMode, onView, onAdd }: { onMode: (m: PanelMode) => void; onView: (id: string) => void; onAdd: () => void }) {
  const { sources, connectors } = useWorkspace();
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-3 py-3">
      <IconAction label="Expand sources" placement="right" onClick={() => onMode('default')}>
        <ColapseSidebarIcon />
      </IconAction>
      <IconAction label="Add source" placement="right" onClick={onAdd}>
        <PlusIcon />
      </IconAction>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto border-t border-default pt-3">
        {sources.map((s) => (
          <span key={s.id} className={ENTER}>
            <IconAction label={s.progress < 100 ? `Reading ${s.title}` : s.title} placement="right" disabled={s.progress < 100} onClick={() => onView(s.id)}>
              <SourceIcon kind={s.kind} />
            </IconAction>
          </span>
        ))}
      </div>
      <div className="flex flex-col items-center gap-1 border-t border-default pt-3">
        {connectors
          .filter((c) => c.linked)
          .map((c) => (
            <IconAction key={c.id} label={c.name} placement="right">
              {connectorIcon(c.id)}
            </IconAction>
          ))}
      </div>
    </div>
  );
}

// ---- Open: one source --------------------------------------------------------------------------------------------------

function SourceView({ source: s, onBack }: { source: Source; onBack: () => void }) {
  const { notify } = useWorkspace();
  const [syncing, setSyncing] = useState(false);
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${ENTER}`}>
      <div className="flex min-h-14 items-center justify-between gap-2 border-b border-default px-4 py-3">
        <Breadcrumb items={[{ label: 'Sources', href: '#/sources' }, { label: 'View' }]} onClick={(e) => ((e.target as HTMLElement).closest('a') ? (e.preventDefault(), onBack()) : undefined)} />
        <IconAction label="Back to sources" onClick={onBack}>
          <CompressIcon />
        </IconAction>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold text-heading">{s.title}</h3>
          <p className="text-sm text-body">{`${kindLabel(s.kind)} • ${s.pages} pages`}</p>
        </div>
        {/* The reference tints the Source Guide band; the Accordion holds the same content without the tint. */}
        {/* ad-design-kit-gap: tinted-summary */}
        <Accordion
          defaultValue={['guide']}
          items={[
            {
              value: 'guide',
              title: 'Source Guide',
              content: (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-heading">Summary</h4>
                    <p className="text-sm text-body">{s.summary}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-heading">Key Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {s.topics.map((t) => (
                        <Badge key={t} color="white" size="lg">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
        />
        <div className="flex flex-col gap-3 text-sm text-heading">
          {s.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
      <div className="border-t border-default px-5 py-3">
        <Button
          color="tertiary"
          leftIcon={syncing ? <Spinner size="xs" label="Syncing" /> : <RefreshIcon />}
          disabled={syncing}
          onClick={() => {
            setSyncing(true);
            window.setTimeout(() => {
              setSyncing(false);
              notify(`${s.title} is up to date`);
            }, 1200);
          }}
        >
          {syncing ? 'Syncing…' : 'Sync with docs'}
        </Button>
      </div>
    </div>
  );
}

// ---- Add and Discover -----------------------------------------------------------------------------------------------------

function AddSources({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSource } = useWorkspace();
  const kindOf = (name: string): SourceKind => (/\.pdf$/i.test(name) ? 'pdf' : /\.(ppt|pptx|key)$/i.test(name) ? 'slides' : 'doc');
  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()} title="Add sources" description="Damia reads each source, then you can use it in the conversation.">
      <div className="flex flex-col gap-5">
        <FileDropzone
          multiple
          hint="PDF, Word, slides or text"
          onFiles={(files) => {
            for (const f of files) addSource(f.name.replace(/\.[^.]+$/, ''), kindOf(f.name));
            onClose();
          }}
        />
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-heading">Suggested Documents</h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_DOCS.map((d) => (
              <span key={d} className={LIFT}>
                <Button
                  color="tertiary"
                  size="sm"
                  leftIcon={<PlusIcon />}
                  onClick={() => {
                    addSource(d, 'doc');
                    onClose();
                  }}
                >
                  {d}
                </Button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Discover({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSource } = useWorkspace();
  const [query, setQuery] = useState('');
  const [added, setAdded] = useState<string[]>([]);
  const results = DISCOVER_RESULTS.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Modal open={open} onOpenChange={(o) => !o && onClose()} title="Discover sources" description="Find articles, slides and papers on the web and add them in one click.">
      <div className="flex flex-col gap-4">
        <Input type="search" aria-label="Search the web" placeholder="Search a topic" leftIcon={<SearchIcon />} value={query} onChange={(e) => setQuery(e.target.value)} />
        <List variant="divider">
          {results.length === 0 && <ListItem>No results. Try another topic.</ListItem>}
          {results.map((r) => {
            const done = added.includes(r.title);
            return (
              <ListItem
                key={r.title}
                icon={<SourceIcon kind={r.kind} />}
                description={r.meta}
                trailing={
                  <Button
                    color={done ? 'ghost' : 'tertiary'}
                    size="xs"
                    leftIcon={done ? <CheckIcon /> : <PlusIcon />}
                    disabled={done}
                    onClick={() => {
                      addSource(r.title, r.kind);
                      setAdded((a) => [...a, r.title]);
                    }}
                  >
                    {done ? 'Added' : 'Add'}
                  </Button>
                }
              >
                {r.title}
              </ListItem>
            );
          })}
        </List>
      </div>
    </Modal>
  );
}
