// Chat screen composed only from AD Design Kit components (sketch: top bar, history sidebar, conversation, composer).
// Navbar (compact, fluid) · Sidebar (header: New chat + History/Clear; items = past chats) · ChatBubble + Avatar ·
// composer = Figma Textarea "Buttons inside" (auto-growing field + toolbar: attach, Brand send) · Modal + FileDropzone · Modal + Toggle.
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ChatIcon, CogIcon, KebabIcon, PencilIcon, PlusIcon, SendIcon, TrashIcon } from '../../components/icons';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ChatBubble, ChatFile } from '../../components/ui/ChatBubble';
import { Dropdown, DropdownItem } from '../../components/ui/Dropdown';
import { FileDropzone } from '../../components/ui/FileUpload';
import { IconShape } from '../../components/ui/IconShape';
import { Input, Label } from '../../components/ui/Input';
import { Kbd } from '../../components/ui/Kbd';
import { Modal } from '../../components/ui/Modal';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/ui/Sidebar';
import { Spinner } from '../../components/ui/Spinner';
import { Textarea, TextareaToolButton } from '../../components/ui/Textarea';
import { Toggle } from '../../components/ui/Toggle';

type Message = { id: number; from: 'user' | 'assistant'; time: string; text?: string; files?: { name: string; size: number }[] };
type Chat = { id: number; title: string; updatedAt: number; messages: Message[] };

const ASSISTANT = 'AD Assistant';
const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
let nextId = 1000;
const uid = () => ++nextId;

const seedTitles = [
  'Design tokens in Tailwind',
  'Dark mode for the dashboard',
  'Button variants in Figma',
  'Accessible colour contrast',
  'Storybook interaction tests',
  'Navbar for an app shell',
  'Form validation messages',
  'Table with a sticky header',
  'Release notes draft',
  'Onboarding empty states',
];

function seedChats(): Chat[] {
  return seedTitles.map((title, i) => ({
    id: i + 1,
    title,
    updatedAt: Date.now() - [2, 45, 180, 1500, 2900, 5800, 10100, 20200, 30300, 43300][i] * 60_000,
    messages:
      i === 0
        ? [
            { id: uid(), from: 'assistant', time: '09:12', text: 'Hi! I can help with the AD Design Kit. What are you working on?' },
            { id: uid(), from: 'user', time: '09:13', text: 'How do I use a brand colour in Tailwind without a hex value?' },
            { id: uid(), from: 'assistant', time: '09:13', text: 'Use the semantic class: bg-brand for fills, text-fg-brand for text and border-brand for strokes. They follow the theme and dark mode.' },
            { id: uid(), from: 'user', time: '09:14', text: 'Great, and the hover state?' },
          ]
        : [
            { id: uid(), from: 'user', time: '08:30', text: `Question about ${title.toLowerCase()}.` },
            { id: uid(), from: 'assistant', time: '08:31', text: 'Here is what the design system recommends.' },
          ],
  }));
}

const suggestions = ['How do I add dark mode?', 'Which component fits a filter panel?', 'Explain the spacing scale', 'When should I use a Drawer?'];

/** "Just now", "5m ago", "3h ago", "Yesterday", weekday within a week, else "28 Oct". */
function relativeTime(t: number, nowMs: number) {
  const min = Math.floor((nowMs - t) / 60_000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  if (min < 24 * 60) return `${Math.floor(min / 60)}h ago`;
  if (min < 48 * 60) return 'Yesterday';
  if (min < 7 * 24 * 60) return new Date(t).toLocaleDateString([], { weekday: 'long' });
  return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

const reply = (text: string) =>
  `Thanks! For "${text.length > 60 ? text.slice(0, 57) + '…' : text}", start from the matching AD Design Kit component and its documented variants; the docs page in Storybook lists when to use it and when not to.`;

const formatSize = (bytes: number) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export function ChatApp() {
  const [chats, setChats] = useState<Chat[]>(seedChats);
  const [activeId, setActiveId] = useState(1);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [renaming, setRenaming] = useState<Chat | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<Chat | null>(null);
  // Re-render every 30 s so relative timestamps stay current.
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const logRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = chats.find((c) => c.id === activeId) ?? { id: activeId, title: 'New chat', updatedAt: clock, messages: [] };
  // Most recent first.
  const history = useMemo(
    () => (saveHistory ? chats.filter((c) => c.messages.length > 0).sort((a, b) => b.updatedAt - a.updatedAt) : []),
    [chats, saveHistory],
  );

  // Sidebar items are links (#chat-<id>); the hash selects the chat, so back/forward works too.
  useEffect(() => {
    const fromHash = () => {
      const m = /^#chat-(\d+)$/.exec(window.location.hash);
      if (m) setActiveId(Number(m[1]));
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [active.messages.length, typing, activeId]);

  const updateActive = (fn: (c: Chat) => Chat) =>
    setChats((all) => (all.some((c) => c.id === active.id) ? all.map((c) => (c.id === active.id ? fn(c) : c)) : [...all, fn(active)]));

  const send = (msg: Omit<Message, 'id' | 'time' | 'from'>, prompt: string) => {
    updateActive((c) => ({
      ...c,
      title: c.messages.length === 0 ? prompt.slice(0, 40) || 'New chat' : c.title,
      updatedAt: Date.now(),
      messages: [...c.messages, { id: uid(), from: 'user', time: now(), ...msg }],
    }));
    setTyping(true);
    const chatId = active.id;
    window.setTimeout(() => {
      setChats((all) => all.map((c) => (c.id === chatId ? { ...c, updatedAt: Date.now(), messages: [...c.messages, { id: uid(), from: 'assistant', time: now(), text: reply(prompt) }] } : c)));
      setTyping(false);
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || typing) return;
    send({ text }, text);
    setDraft('');
  };

  const newChat = () => {
    const id = uid();
    setChats((all) => [...all.filter((c) => c.messages.length > 0), { id, title: 'New chat', updatedAt: Date.now(), messages: [] }]);
    setActiveId(id);
    window.history.replaceState(null, '', `#chat-${id}`);
  };

  const clearHistory = () => {
    const id = uid();
    setChats([{ id, title: 'New chat', updatedAt: Date.now(), messages: [] }]);
    setActiveId(id);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const openRename = (c: Chat) => {
    setRenameValue(c.title);
    setRenaming(c);
  };
  const saveRename = () => {
    const title = renameValue.trim();
    if (!renaming || !title) return;
    setChats((all) => all.map((c) => (c.id === renaming.id ? { ...c, title } : c)));
    setRenaming(null);
  };
  const confirmDelete = () => {
    if (!deleting) return;
    const rest = chats.filter((c) => c.id !== deleting.id);
    setChats(rest);
    if (deleting.id === active.id) {
      // Open the next most recent chat, or start a new one.
      const next = rest.filter((c) => c.messages.length > 0).sort((a, b) => b.updatedAt - a.updatedAt)[0];
      if (next) {
        setActiveId(next.id);
        window.history.replaceState(null, '', `#chat-${next.id}`);
      } else newChat();
    }
    setDeleting(null);
  };

  const canSend = draft.trim() !== '' && !typing;

  return (
    <div className="flex h-screen flex-col bg-neutral-primary font-sans">
      <Navbar
        size="compact"
        fluid
        logo={
          // Figma Logo, Size=sm: 30px mark (brand art from public/logo-mark.svg), gap 12, wordmark text-2xl semibold.
          <a href="/" className="flex items-center gap-3">
            <img src="/logo-mark.svg" alt="" className="size-7.5" />{/* ad-design-kit-lint-ignore: Figma Logo sm mark is 30px brand art */}
            <span className="text-2xl font-semibold leading-6 text-heading">AD Design Kit</span>
          </a>
        }
        actions={
          <Button color="ghost" size="sm" leftIcon={<CogIcon />} onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
        }
      />

      <div className="flex min-h-0 flex-1">
        <aside
          className="min-h-0 shrink-0 overflow-y-auto border-e border-default"
          // Switch chats on the click itself (hashchange fires a tick later); the hash listener still handles back/forward.
          onClickCapture={(e) => {
            const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#chat-"]');
            if (link) setActiveId(Number(link.getAttribute('href')!.slice(6)));
          }}
        >
          <Sidebar
            label="Chats"
            header={
              <div className="flex flex-col gap-4">
                <Button leftIcon={<PlusIcon />} onClick={newChat} className="w-full">
                  New chat
                </Button>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-heading">History</h2>
                  <Button color="ghost" size="xs" onClick={clearHistory} disabled={history.length === 0}>
                    Clear
                  </Button>
                </div>
              </div>
            }
            sections={history.length ? [history.map((c) => ({
                    label: c.title,
                    href: `#chat-${c.id}`,
                    icon: <ChatIcon />,
                    current: c.id === active.id,
                    meta: <time dateTime={new Date(c.updatedAt).toISOString()}>{relativeTime(c.updatedAt, clock)}</time>,
                    actions: (
                      <Dropdown
                        align="end"
                        label={`Options for ${c.title}`}
                        trigger={
                          <Button color="ghost" size="xs" iconOnly aria-label={`Options for ${c.title}`}>
                            <KebabIcon />
                          </Button>
                        }
                      >
                        <DropdownItem icon={<PencilIcon />} onSelect={() => openRename(c)}>
                          Rename
                        </DropdownItem>
                        <DropdownItem color="danger" icon={<TrashIcon />} onSelect={() => setDeleting(c)}>
                          Delete
                        </DropdownItem>
                      </Dropdown>
                    ),
                  }))] : []}
            footer={history.length === 0 ? <p className="text-sm text-body">{saveHistory ? 'No chats yet.' : 'History is off in Settings.'}</p> : undefined}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <h1 className="sr-only">{active.title}</h1>
          <div ref={logRef} role="log" aria-label="Conversation" aria-live="polite" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto focus-visible:outline-none">
            <div className="mx-auto flex max-w-242 flex-col gap-6 px-4 py-8">
              {active.messages.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <IconShape size="lg" color="brand">
                    <ChatIcon />
                  </IconShape>
                  <h2 className="text-2xl font-bold text-heading">How can I help?</h2>
                  <p className="text-base text-body">Ask about components, tokens or patterns in the AD Design Kit.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {suggestions.map((q) => (
                      <Button
                        key={q}
                        color="tertiary"
                        size="sm"
                        onClick={() => {
                          setDraft(q);
                          inputRef.current?.focus();
                        }}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {active.messages.map((m) => {
                const sent = m.from === 'user';
                return (
                  <ChatBubble
                    key={m.id}
                    width="fluid"
                    direction={sent ? 'sent' : 'received'}
                    name={sent ? 'You' : ASSISTANT}
                    time={m.time}
                    avatar={<Avatar name={sent ? 'You' : ASSISTANT} size="base" />}
                  >
                    {m.text && <p className="text-sm text-heading">{m.text}</p>}
                    {m.files?.map((f) => <ChatFile key={f.name} name={f.name} meta={formatSize(f.size)} />)}
                  </ChatBubble>
                );
              })}
              {typing && (
                <ChatBubble width="fluid" direction="received" name={ASSISTANT} avatar={<Avatar name={ASSISTANT} size="base" />}>
                  <span className="flex items-center gap-2 text-sm text-body">
                    <Spinner size="xs" /> Typing…
                  </span>
                </ChatBubble>
              )}
            </div>
          </div>

          <form ref={formRef} onSubmit={onSubmit} className="mx-auto w-full max-w-242 px-4 pb-6">
            {/* Figma Textarea "Buttons inside": one card, the field grows to 6 lines, toolbar with attach + Brand send */}
            <Textarea
              ref={inputRef}
              aria-label="Message"
              placeholder="Ask anything about the AD Design Kit…"
              rows={Math.min(6, Math.max(2, draft.split('\n').length))}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter sends, Shift+Enter adds a line; never send mid-composition (IME).
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
              footer={
                <>
                  <TextareaToolButton label="Attach files" onClick={() => setAttachOpen(true)}>
                    <PlusIcon />
                  </TextareaToolButton>
                  <Button type="submit" size="sm" iconOnly aria-label="Send message" disabled={!canSend}>
                    <SendIcon />
                  </Button>
                </>
              }
            />
            <p className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-body">
              <Kbd>Enter</Kbd> to send · <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for a new line
            </p>
          </form>
        </main>
      </div>

      <Modal
        open={renaming !== null}
        onOpenChange={(o) => !o && setRenaming(null)}
        title="Rename chat"
        size="sm"
        footer={
          <>
            <Button color="tertiary" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button type="submit" form="rename-chat" disabled={!renameValue.trim()}>
              Save
            </Button>
          </>
        }
      >
        <form
          id="rename-chat"
          onSubmit={(e) => {
            e.preventDefault();
            saveRename();
          }}
        >
          <Label htmlFor="rename-chat-title">Chat name</Label>
          <Input id="rename-chat-title" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} maxLength={80} autoFocus />
        </form>
      </Modal>

      <Modal
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete chat?"
        size="sm"
        dismissible={false}
        footer={
          <>
            <Button color="tertiary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button color="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-base text-body">
          “{deleting?.title}” and its messages will be deleted. This can’t be undone.
        </p>
      </Modal>

      <Modal
        open={attachOpen}
        onOpenChange={setAttachOpen}
        title="Attach files"
        footer={
          <Button color="tertiary" onClick={() => setAttachOpen(false)}>
            Cancel
          </Button>
        }
      >
        <FileDropzone
          multiple
          onFiles={(files) => {
            if (files.length) send({ files: files.map((f) => ({ name: f.name, size: f.size })) }, files.map((f) => f.name).join(', '));
            setAttachOpen(false);
          }}
        />
      </Modal>

      <Modal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Settings"
        footer={<Button onClick={() => setSettingsOpen(false)}>Done</Button>}
      >
        <Toggle checked={saveHistory} onCheckedChange={setSaveHistory} description="Show your past chats in the sidebar.">
          Save chat history
        </Toggle>
      </Modal>
    </div>
  );
}
