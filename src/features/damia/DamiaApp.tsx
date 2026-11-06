// Damia, an AI workspace (Figma "damia-case-study", bbyGbZ3b8P2uT84Pul9qu7, section 21:788): sources on the left,
// the conversation in the middle, Studio on the right. Each side panel has three states from the reference: Default,
// Closed (an icon rail) and Open (a source view, an output or the note editor), and the panels resize smoothly between
// them. Composed from AD Design Kit components only; see ../../.claude/skills/ad-design-kit-compose.
import { useCallback, useEffect, useRef, useState } from 'react';
import { BookIcon, CheckIcon, GridIcon, OpenDoorIcon, QuestionCircleIcon, WandMagicSparklesIcon } from '../../components/icons';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Dropdown, DropdownHeader, DropdownItem } from '../../components/ui/Dropdown';
import { Navbar } from '../../components/ui/Navbar';
import { Popover } from '../../components/ui/Popover';
import { Sidebar } from '../../components/ui/Sidebar';
import { Toast, ToastViewport } from '../../components/ui/Toast';
import logo from './assets/damia-logo.svg';
import { ConversationPanel } from './ConversationPanel';
import { CREATION_LABEL, initialConnectors, initialNotes, initialSources, noteFor, readyMessage, type Creation, type Message, type Note, type Source, type SourceKind } from './data';
import { useReducedMotion } from './motion';
import { RESIZE } from './shared';
import { SourcesPanel } from './SourcesPanel';
import { StudioPanel } from './StudioPanel';
import { WorkspaceContext, type PanelMode } from './workspace';

const ME = 'Arvind Pachahara';
const wide = () => window.matchMedia('(min-width: 1024px)').matches;

/** `embedded`: only the three panels, no app rail or top bar, for showing the workspace inside another page. */
export function DamiaApp({ embedded = false }: { embedded?: boolean } = {}) {
  const reduced = useReducedMotion();
  const [sources, setSources] = useState(initialSources);
  const [connectors, setConnectors] = useState(initialConnectors);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState(initialNotes);
  const [toasts, setToasts] = useState<{ id: number; text: string }[]>([]);
  const [sourcesMode, setSourcesMode] = useState<PanelMode>(() => (wide() ? 'default' : 'closed'));
  const [studioMode, setStudioMode] = useState<PanelMode>(() => (wide() ? 'default' : 'closed'));
  const [viewing, setViewing] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState<{ kind: Creation; progress: number } | null>(null);
  // Focus mode (the Conversations panel's own toggle) folds both side panels, and remembers how they were.
  const [beforeFocus, setBeforeFocus] = useState<[PanelMode, PanelMode] | null>(null);

  const notify = useCallback((text: string) => setToasts((t) => [...t, { id: Date.now() + Math.random(), text }]), []);
  const openSource = useCallback((id: string) => {
    setViewing(id);
    setSourcesMode('open');
  }, []);
  const openNote = useCallback((id: string) => {
    setEditing(id);
    setStudioMode('open');
  }, []);

  // New sources are read before they can be used: progress climbs, then the source is ticked and announced.
  const addSource = useCallback((title: string, kind: SourceKind, extra: Partial<Source> = {}) => {
    const id = `s-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const source: Source = { id, title, kind, pages: kind === 'pdf' ? 12 : 4, selected: false, progress: 0, summary: `${title} was added by you. Damia read it and found the key topics below.`, topics: ['New source'], body: [`${title}.`], ...extra };
    setSources((all) => [...all, source]);
  }, []);
  const reading = sources.some((s) => s.progress < 100);
  useEffect(() => {
    if (!reading) return;
    const t = window.setInterval(() => setSources((all) => all.map((s) => (s.progress < 100 ? { ...s, progress: Math.min(100, s.progress + 20), selected: s.progress + 20 >= 100 ? true : s.selected } : s))), 280);
    return () => window.clearInterval(t);
  }, [reading]);
  const wasReading = useRef(new Set<string>());
  useEffect(() => {
    for (const s of sources) {
      if (s.progress < 100) wasReading.current.add(s.id);
      else if (wasReading.current.delete(s.id)) notify(`${s.title} is ready`);
    }
  }, [sources, notify]);

  // Creating an output, from Studio or from a follow-up in the conversation: Studio shows the progress, then the
  // output lands in its list and Damia says so in the conversation, with a link to open it.
  const createOutput = useCallback(
    (kind: Creation) => {
      if (!sources.some((s) => s.selected && s.progress === 100)) {
        notify('Tick at least one source to create from it');
        return;
      }
      setCreating((c) => c ?? { kind, progress: 0 });
      setStudioMode('default');
      setEditing(null);
    },
    [sources, notify],
  );
  useEffect(() => {
    if (!creating) return;
    const done = creating.progress >= 100;
    const t = window.setTimeout(
      () => {
        if (!done) {
          setCreating((c) => c && { ...c, progress: Math.min(100, c.progress + (reduced ? 100 : 25)) });
          return;
        }
        const selected = sources.filter((s) => s.selected && s.progress === 100);
        const note: Note = { id: `n-${Date.now()}`, ...noteFor(creating.kind, selected) };
        setNotes((ns) => [note, ...ns]);
        setMessages((ms) => [...ms, { id: `m-${note.id}`, role: 'damia', text: readyMessage(note), noteId: note.id, basedOn: selected.length }]);
        notify(`${CREATION_LABEL[creating.kind]} is ready`);
        setCreating(null);
        // Show the result straight away; the conversation keeps a link back to it.
        setEditing(note.id);
        setStudioMode('open');
      },
      done ? 0 : 350,
    );
    return () => window.clearTimeout(t);
  }, [creating, reduced, sources, notify]);

  const toggleFocus = () => {
    if (beforeFocus) {
      setSourcesMode(beforeFocus[0]);
      setStudioMode(beforeFocus[1]);
      setBeforeFocus(null);
    } else {
      setBeforeFocus([sourcesMode, studioMode]);
      setSourcesMode('closed');
      setStudioMode('closed');
    }
  };

  const width = (mode: PanelMode, open: string, normal: string) => (mode === 'closed' ? 'w-16' : mode === 'open' ? open : normal);

  return (
    <WorkspaceContext.Provider value={{ sources, setSources, connectors, setConnectors, messages, setMessages, notes, setNotes, notify, openSource, addSource, creating, createOutput, openNote }}>
      <div className="flex h-dvh bg-neutral-primary">
        {!embedded && (
        <Sidebar
          collapsed
          label="Damia"
          className="shrink-0 border-e border-default"
          header={<img src={logo} alt="Damia" className="h-6 w-auto" />}
          sections={[
            [
              { label: 'AI Conversation', href: '#/', icon: <WandMagicSparklesIcon />, current: true },
              { label: 'Library', href: '#/library', icon: <BookIcon />, disabled: true },
              { label: 'Apps', href: '#/apps', icon: <GridIcon />, disabled: true },
            ],
          ]}
        />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {!embedded && (
          <Navbar
            fluid
            size="compact"
            logo={<h1 className="text-base font-semibold text-heading">AI Conversation</h1>}
            actions={
              <div className="flex items-center gap-2">
                <Popover
                  placement="bottom"
                  padding="rich"
                  title="How Damia works"
                  trigger={
                    <Button color="ghost" size="sm" iconOnly aria-label="Help">
                      <QuestionCircleIcon />
                    </Button>
                  }
                >
                  <ol className="list-decimal space-y-1 ps-4 text-sm text-body">
                    <li>Add or tick the sources Damia should read.</li>
                    <li>Ask a question, or start from a suggestion.</li>
                    <li>Turn the answers into notes, decks and proposals in Studio.</li>
                  </ol>
                </Popover>
                <Dropdown
                  align="end"
                  label="Account"
                  className="w-60"
                  header={<DropdownHeader name={ME} email="arvind@auxo.ai" avatar={<Avatar name={ME} size="sm" />} />}
                  trigger={
                    <Button color="ghost" size="sm" iconOnly aria-label="Account">
                      <Avatar name={ME} size="sm" />
                    </Button>
                  }
                >
                  <DropdownItem icon={<OpenDoorIcon />}>Log out</DropdownItem>
                </Dropdown>
              </div>
            }
          />
          )}

          {/* On a phone the conversation takes the screen; the side panels return from the sm breakpoint. */}
          <div className="flex min-h-0 flex-1 gap-2 p-2 sm:gap-4 sm:p-4">
            <div className={`hidden shrink-0 sm:flex ${RESIZE} ${width(sourcesMode, 'w-184 max-w-1/2', 'w-68')}`}>
              <SourcesPanel
                mode={sourcesMode}
                viewing={viewing}
                onMode={(m) => {
                  setSourcesMode(m);
                  if (m !== 'open') setViewing(null);
                }}
                onView={openSource}
              />
            </div>
            <div className="flex min-w-0 flex-1">
              <ConversationPanel focus={beforeFocus !== null} onToggleFocus={toggleFocus} />
            </div>
            <div className={`hidden shrink-0 sm:flex ${RESIZE} ${width(studioMode, 'w-150 max-w-1/2', 'w-88')}`}>
              <StudioPanel
                mode={studioMode}
                editing={editing}
                onMode={(m) => {
                  setStudioMode(m);
                  if (m !== 'open') setEditing(null);
                }}
                onEdit={openNote}
              />
            </div>
          </div>
        </div>
      </div>
      <ToastViewport>
        {toasts.map((t) => (
          <Toast key={t.id} icon={<CheckIcon />} duration={3500} onDismiss={() => setToasts((all) => all.filter((x) => x.id !== t.id))}>
            {t.text}
          </Toast>
        ))}
      </ToastViewport>
    </WorkspaceContext.Provider>
  );
}
