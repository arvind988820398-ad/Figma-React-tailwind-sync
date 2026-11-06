// Conversations panel (Figma "Chat panel", 13:1557, and the conversation in "Damia 165"). Empty: the Damia orb, "Ask
// Damia about anything", easy entry points and suggested questions (they tackle the blank page). With messages: your
// questions as sent bubbles, Damia's answers streamed word by word after a short "thinking" skeleton, each with the
// sources it cites, re-generate with another agent, copy and feedback, and follow-ups that create an output in
// Studio; when an output is ready Damia says so here, with a link to open it.
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  AdjustmentsHorizontalIcon,
  ChartMixedIcon,
  CheckIcon,
  CompressIcon,
  DatabaseIcon,
  ExpandIcon,
  FileCopyIcon,
  FileIcon,
  FolderOpenIcon,
  InfoCircleIcon,
  PaperPlaneIcon,
  PlusIcon,
  RefreshIcon,
  RocketIcon,
  TableColumnIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  WandMagicSparklesIcon,
} from '../../components/icons';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { Dropdown, DropdownHeader, DropdownItem, DropdownRadioItem, DropdownSeparator } from '../../components/ui/Dropdown';
import { Skeleton } from '../../components/ui/Skeleton';
import { Textarea, TextareaToolButton } from '../../components/ui/Textarea';
import { Tooltip } from '../../components/ui/Tooltip';
import orb from './assets/orb.png';
import { AGENTS, answerFor, ENTRY_POINTS, SUGGESTED_QUESTIONS, type Message } from './data';
import { useReducedMotion } from './motion';
import { ENTER, IconAction, LIFT, PanelHeader, POP, SourceIcon } from './shared';
import { useWorkspace } from './workspace';

const ENTRY_ICONS = [<FolderOpenIcon key="a" />, <TableColumnIcon key="b" />, <ChartMixedIcon key="c" />, <DatabaseIcon key="d" />, <FileIcon key="e" />, <RocketIcon key="f" />];
const ME = 'Arvind Pachahara';

/** Split text into words and the spaces between them, so a partial answer keeps its line breaks. */
const tokens = (text: string) => text.split(/(\s+)/);

function Orb({ size }: { size: 'sm' | 'lg' }) {
  return <img src={orb} alt="" aria-hidden className={size === 'lg' ? 'size-14 rounded-full' : 'size-8 shrink-0 rounded-full'} />;
}

/** Damia's text: blank-line paragraphs and "- " bullets. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n/).map((block, i) =>
        block.startsWith('- ') ? (
          <ul key={i} className="list-disc space-y-1 ps-5">
            {block.split('\n').map((li) => (
              <li key={li}>{li.replace(/^- /, '')}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{block}</p>
        ),
      )}
    </>
  );
}

export function ConversationPanel({ focus, onToggleFocus }: { focus: boolean; onToggleFocus: () => void }) {
  const { messages, setMessages, sources, notify, openSource, creating, createOutput, openNote } = useWorkspace();
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState('');
  const [style, setStyle] = useState<'Concise' | 'Detailed'>('Concise');
  const [thinking, setThinking] = useState<string | null>(null);
  const [stream, setStream] = useState<{ id: string; count: number } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>({});
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const seq = useRef(0);
  const total = (id: string) => tokens(messages.find((m) => m.id === id)?.text ?? '').length;
  // The answer still being written, if any; a finished stream simply has count >= its length.
  const streamingId = stream && stream.count < total(stream.id) ? stream.id : null;
  const busy = thinking !== null || streamingId !== null;
  const selected = sources.filter((s) => s.selected && s.progress === 100);

  // Thinking → streaming: a short skeleton, then the answer appears word by word (all at once with reduced motion).
  useEffect(() => {
    if (!thinking) return;
    const t = window.setTimeout(() => {
      setThinking(null);
      setStream({ id: thinking, count: reduced ? Number.MAX_SAFE_INTEGER : 0 });
    }, reduced ? 150 : 900);
    return () => window.clearTimeout(t);
  }, [thinking, reduced]);
  useEffect(() => {
    if (!streamingId || !stream) return;
    const t = window.setTimeout(() => setStream({ id: stream.id, count: stream.count + 2 }), 28);
    return () => window.clearTimeout(t);
  }, [stream, streamingId]);
  // Keep the newest words in view.
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [messages.length, thinking, stream?.count, reduced]);

  const ask = (prompt: string) => {
    const text = prompt.trim();
    if (!text || busy) return;
    seq.current += 1;
    const id = `m-${seq.current}`;
    const answer = answerFor(text, selected);
    const detailed = style === 'Detailed' && selected.length ? `\n\nI looked at: ${selected.slice(0, 3).map((s) => s.title).join(', ')}${selected.length > 3 ? ` and ${selected.length - 3} more` : ''}.` : '';
    setMessages((ms) => [...ms, { id: `${id}-q`, role: 'user', text }, { id, role: 'damia', ...answer, text: answer.text + detailed, basedOn: selected.length }]);
    setThinking(id);
    setDraft('');
  };
  const regenerate = (m: Message, agent: string) => {
    if (busy) return;
    const question = messages[messages.findIndex((x) => x.id === m.id) - 1]?.text ?? '';
    const answer = answerFor(question, selected);
    setMessages((ms) => ms.map((x) => (x.id === m.id ? { ...x, ...answer, agent, basedOn: selected.length } : x)));
    setThinking(m.id);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(draft);
    }
  };
  const start = (prompt: string) => {
    if (prompt === 'Create a file' || prompt === 'New Process' || prompt === 'New Opportunity') {
      setDraft(`${prompt}: `);
      input.current?.focus();
    } else ask(prompt);
  };

  return (
    <Card padding="none" className="flex min-h-0 w-full flex-col overflow-hidden">
      {/* One child, so the Card's gap does not space the header, body and footer apart. */}
      <div className="flex min-h-0 flex-1 flex-col">
      <PanelHeader title="Conversations">
        {messages.length > 0 && (
          <IconAction label="New conversation" disabled={busy} onClick={() => setMessages([])}>
            <PlusIcon />
          </IconAction>
        )}
        <IconAction label={focus ? 'Show side panels' : 'Focus on the conversation'} pressed={focus} onClick={onToggleFocus}>
          {focus ? <CompressIcon /> : <ExpandIcon />}
        </IconAction>
      </PanelHeader>

      <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6">
        {messages.length === 0 ? (
          <div className="m-auto flex w-full max-w-3xl flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className={`inline-flex ${POP} motion-safe:hover:rotate-12 motion-safe:hover:scale-110`}>
                <Orb size="lg" />
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-heading">
                Ask <span className="text-fg-brand">Damia</span> about anything
              </h2>
              <p className="text-sm text-body">{selected.length ? `Answers come from your ${selected.length} selected sources.` : 'Add or tick a source to ground the answers.'}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3" aria-label="Start with">
              {ENTRY_POINTS.map((e, i) => (
                <span key={e} className={`${LIFT} ${ENTER}`}>
                  <Button color="tertiary" size="sm" leftIcon={ENTRY_ICONS[i]} onClick={() => start(e)}>
                    {e}
                  </Button>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <ol className="mx-auto flex w-full max-w-3xl flex-col gap-6" aria-label="Conversation" aria-live="polite">
            {messages.map((m) => {
              const streaming = streamingId === m.id;
              const shown = streaming && stream ? tokens(m.text).slice(0, stream.count).join('') : m.text;
              const cited = (m.sourceIds ?? (m.sourceId ? [m.sourceId] : [])).map((id) => sources.find((s) => s.id === id)).filter((s) => s !== undefined).slice(0, 3);
              const settled = thinking !== m.id && !streaming;
              return (
                <li key={m.id} className={ENTER}>
                  {m.role === 'user' ? (
                    <ChatBubble direction="sent" width="fluid" name="You" avatar={<Avatar name={ME} size="sm" />}>
                      {m.text}
                    </ChatBubble>
                  ) : (
                    <ChatBubble
                      clean
                      width="fluid"
                      name={m.agent ? `Damia · ${m.agent}` : 'Damia'}
                      avatar={<Orb size="sm" />}
                      status={
                        thinking !== m.id &&
                        !streaming && (
                          <span className={`flex flex-wrap items-center gap-1 ${ENTER}`}>
                            <IconAction label={m.basedOn ? `Based on ${m.basedOn} source${m.basedOn > 1 ? 's' : ''}` : 'Not based on a source'} placement="top">
                              <InfoCircleIcon />
                            </IconAction>
                            <Dropdown
                              label="Re-generate with"
                              className="w-64"
                              header={<DropdownHeader name="Re-generate with" />}
                              trigger={
                                <Button color="ghost" size="xs" iconOnly aria-label="Re-generate">
                                  <RefreshIcon />
                                </Button>
                              }
                            >
                              {AGENTS.map((a) => (
                                <DropdownItem key={a.name} description={a.model} trailing={m.agent === a.name ? <CheckIcon /> : undefined} onSelect={() => regenerate(m, a.name)}>
                                  {a.name}
                                </DropdownItem>
                              ))}
                              <DropdownSeparator />
                              <DropdownItem icon={<RefreshIcon />} onSelect={() => regenerate(m, m.agent ?? AGENTS[0].name)}>
                                Try again
                              </DropdownItem>
                            </Dropdown>
                            <IconAction
                              label={copied === m.id ? 'Copied' : 'Copy'}
                              placement="top"
                              onClick={() => {
                                // Show "Copied" only when the browser allowed it.
                                Promise.resolve(navigator.clipboard?.writeText(m.text)).then(
                                  () => {
                                    setCopied(m.id);
                                    window.setTimeout(() => setCopied((c) => (c === m.id ? null : c)), 1500);
                                  },
                                  () => notify('Copying is blocked in this browser'),
                                );
                              }}
                            >
                              {copied === m.id ? <CheckIcon /> : <FileCopyIcon />}
                            </IconAction>
                            <IconAction
                              label="Good answer"
                              placement="top"
                              pressed={feedback[m.id] === 'up'}
                              onClick={() => {
                                setFeedback((f) => ({ ...f, [m.id]: 'up' }));
                                notify('Thanks for the feedback');
                              }}
                            >
                              <ThumbsUpIcon />
                            </IconAction>
                            <IconAction
                              label="Bad answer"
                              placement="top"
                              pressed={feedback[m.id] === 'down'}
                              onClick={() => {
                                setFeedback((f) => ({ ...f, [m.id]: 'down' }));
                                notify('Thanks, Damia will learn from this');
                              }}
                            >
                              <ThumbsDownIcon />
                            </IconAction>
                            {cited.map((source) => (
                              <Tooltip key={source.id} content={`Open ${source.title}`} placement="top">
                                <Button color="ghost" size="xs" leftIcon={<SourceIcon kind={source.kind} />} onClick={() => openSource(source.id)}>
                                  {source.title}
                                </Button>
                              </Tooltip>
                            ))}
                          </span>
                        )
                      }
                    >
                      {thinking === m.id ? <Skeleton type="text" label="Damia is thinking" /> : <Rich text={shown} />}
                      {settled && (m.noteId || m.followUps?.length) ? (
                        <div className={`flex flex-wrap gap-2 pt-2 ${ENTER}`} aria-label="Next steps">
                          {m.noteId && (
                            <span className={LIFT}>
                              <Button color="secondary" size="sm" leftIcon={<WandMagicSparklesIcon />} onClick={() => openNote(m.noteId!)}>
                                Open in Studio
                              </Button>
                            </span>
                          )}
                          {m.followUps?.map((f) => (
                            <span key={f.kind} className={LIFT}>
                              <Button color="tertiary" size="sm" disabled={creating !== null} onClick={() => createOutput(f.kind)}>
                                {f.label}
                              </Button>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </ChatBubble>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 pb-4 sm:px-6 sm:pb-6">
        <Textarea
          ref={input}
          rows={3}
          aria-label="Ask Damia"
          placeholder="How can I help you today?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          footer={
            <>
              <Dropdown label="Response style" className="w-56" trigger={<TextareaToolButton label={`Response style: ${style}`}><AdjustmentsHorizontalIcon /></TextareaToolButton>}>
                {(['Concise', 'Detailed'] as const).map((s) => (
                  <DropdownRadioItem key={s} checked={style === s} onSelect={() => setStyle(s)}>
                    {s}
                  </DropdownRadioItem>
                ))}
              </Dropdown>
              <span className="ms-auto truncate text-xs text-body">
                {busy ? 'Damia is answering…' : <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line</span>}
              </span>
              <TextareaToolButton label="Send" brand disabled={!draft.trim() || busy} onClick={() => ask(draft)}>
                <PaperPlaneIcon />
              </TextareaToolButton>
            </>
          }
        />
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2" aria-label="Suggested questions">
            {SUGGESTED_QUESTIONS.map((q) => (
              <span key={q} className={`${LIFT} ${ENTER}`}>
                <Button color="tertiary" size="sm" onClick={() => ask(q)}>
                  {q}
                </Button>
              </span>
            ))}
          </div>
        )}
      </div>
      </div>
    </Card>
  );
}
