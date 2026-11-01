import { useEffect, useMemo, useState } from 'react';

/** Client-side paging for a list; resets to page 1 when the list shrinks below the current page. */
export function usePaged<T>(rows: T[], initialSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = useMemo(() => rows.slice((current - 1) * pageSize, current * pageSize), [rows, current, pageSize]);
  return {
    visible,
    footer: {
      page: current,
      pageCount,
      onPage: setPage,
      pageSize,
      onPageSize: (n: number) => {
        setPageSize(n);
        setPage(1);
      },
      total: rows.length,
    },
  };
}

/** Row selection by id. */
export function useSelection(ids: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const live = new Set([...selected].filter((id) => ids.includes(id)));
  const all = ids.length > 0 && ids.every((id) => live.has(id));
  return {
    selected: live,
    all,
    toggle: (id: string) =>
      setSelected((s) => {
        const n = new Set(s);
        if (n.has(id)) n.delete(id);
        else n.add(id);
        return n;
      }),
    toggleAll: () => setSelected(all ? new Set() : new Set(ids)),
    clear: () => setSelected(new Set()),
  };
}

const readHash = (defaultTab: string) => {
  const [, tab, extra] = window.location.hash.split('/');
  return [tab || defaultTab, extra] as const;
};

/** `#/tab/extra` routing, so the sidebar links, tabs and the browser's back button agree. */
export function useHashRoute(defaultTab: string): [string, string | undefined, (tab: string, extra?: string) => void] {
  const [route, setRoute] = useState(() => readHash(defaultTab));
  useEffect(() => {
    const on = () => setRoute(readHash(defaultTab));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, [defaultTab]);
  const go = (tab: string, extra?: string) => {
    window.location.hash = `/${tab}${extra ? `/${extra}` : ''}`;
  };
  return [route[0], route[1], go];
}
