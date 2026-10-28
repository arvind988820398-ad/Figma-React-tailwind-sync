// Materials state with optional browser persistence. Pass `storageKey: null` (Storybook, tests) to keep it in memory.
import { useCallback, useEffect, useState } from 'react';
import { SAMPLE_INDENTS, type Indent, type IndentStatus } from './indents';
import { SAMPLE_MATERIALS, type Material, type MaterialDraft, type Scope } from './types';

export const MATERIALS_STORAGE_KEY = 'auxokit-materials';

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

function loadList<T>(key: string | null): T[] | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

export function materialsFromSeed(seed: Omit<Material, 'id' | 'createdAt'>[]): Material[] {
  return seed.map((m, i) => ({ ...m, id: `sample-${i + 1}`, createdAt: new Date(Date.now() - i * 864e5).toISOString() }));
}

export interface UseMaterialsOptions {
  storageKey?: string | null;
  seed?: Omit<Material, 'id' | 'createdAt'>[];
}

export function useMaterials({ storageKey = MATERIALS_STORAGE_KEY, seed }: UseMaterialsOptions = {}) {
  const [materials, setMaterials] = useState<Material[]>(() => loadList<Material>(storageKey) ?? (seed ? materialsFromSeed(seed) : []));

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(materials));
    } catch {
      // Private mode or quota: the list still works for this visit.
    }
  }, [materials, storageKey]);

  const add = useCallback((draft: MaterialDraft, scope: Scope) => {
    const material: Material = { ...draft, id: newId(), scope, createdAt: new Date().toISOString() };
    setMaterials((list) => [material, ...list]);
    return material;
  }, []);

  const update = useCallback((id: string, draft: MaterialDraft) => {
    setMaterials((list) => list.map((m) => (m.id === id ? { ...m, ...draft } : m)));
  }, []);

  const remove = useCallback((ids: Iterable<string>) => {
    const gone = new Set(ids);
    setMaterials((list) => list.filter((m) => !gone.has(m.id)));
  }, []);

  const loadSamples = useCallback(() => setMaterials(materialsFromSeed(SAMPLE_MATERIALS)), []);
  const clear = useCallback(() => setMaterials([]), []);

  return { materials, add, update, remove, loadSamples, clear };
}

// ---------------- Indents ----------------
export const INDENTS_STORAGE_KEY = 'auxokit-indents';

export interface UseIndentsOptions {
  storageKey?: string | null;
}

/** Outcome of a review: approved quantities per line (partial approval when any is lower than requested). */
export interface IndentDecision {
  approvedQty: number[];
  note?: string;
  by?: string;
}

export function useIndents({ storageKey = INDENTS_STORAGE_KEY }: UseIndentsOptions = {}) {
  const [indents, setIndents] = useState<Indent[]>(() => {
    const stored = storageKey ? loadList<Indent>(storageKey) : null;
    return stored ?? SAMPLE_INDENTS.map((i, n) => ({ ...i, id: `indent-${n + 1}` }));
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(indents));
    } catch {
      // Storage unavailable: the list still works for this visit.
    }
  }, [indents, storageKey]);

  const approve = useCallback((id: string, { approvedQty, note, by = 'You' }: IndentDecision) => {
    setIndents((list) =>
      list.map((i) => {
        if (i.id !== id) return i;
        const lines = i.lines.map((l, n) => ({ ...l, approvedQty: Math.max(0, Math.min(l.requestedQty, approvedQty[n] ?? l.requestedQty)) }));
        const partial = lines.some((l) => (l.approvedQty ?? 0) < l.requestedQty);
        const status: IndentStatus = partial ? 'Partially approved' : 'Approved';
        return { ...i, lines, status, history: [...i.history, { at: new Date().toISOString(), title: status, by, description: note || undefined }] };
      }),
    );
  }, []);

  const reject = useCallback((id: string, note?: string, by = 'You') => {
    setIndents((list) => list.map((i) => (i.id === id ? { ...i, status: 'Rejected', history: [...i.history, { at: new Date().toISOString(), title: 'Rejected', by, description: note || undefined }] } : i)));
  }, []);

  const reset = useCallback(() => setIndents(SAMPLE_INDENTS.map((i, n) => ({ ...i, id: `indent-${n + 1}` }))), []);

  return { indents, approve, reject, reset };
}
