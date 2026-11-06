// The workspace state the three panels share (sources, connectors, conversation, Studio notes) and the toast.
import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';
import type { Connector, Creation, Message, Note, Source, SourceKind } from './data';

export type PanelMode = 'default' | 'closed' | 'open';

export interface Workspace {
  sources: Source[];
  setSources: Dispatch<SetStateAction<Source[]>>;
  connectors: Connector[];
  setConnectors: Dispatch<SetStateAction<Connector[]>>;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  notes: Note[];
  setNotes: Dispatch<SetStateAction<Note[]>>;
  notify: (message: string) => void;
  /** Open a source in the Sources panel's view. */
  openSource: (id: string) => void;
  /** Add a source: Damia reads it (progress 0 → 100), then it is ticked and a toast says it is ready. */
  addSource: (title: string, kind: SourceKind, extra?: Partial<Source>) => void;
  /** The output Studio is creating right now, with its progress, or null. */
  creating: { kind: Creation; progress: number } | null;
  /** Create an output from the selected sources, from Studio or from a follow-up in the conversation. */
  createOutput: (kind: Creation) => void;
  /** Open a note or output in Studio. */
  openNote: (id: string) => void;
}

export const WorkspaceContext = createContext<Workspace | null>(null);

export function useWorkspace() {
  const w = useContext(WorkspaceContext);
  if (!w) throw new Error('useWorkspace must be used inside <DamiaApp>');
  return w;
}
