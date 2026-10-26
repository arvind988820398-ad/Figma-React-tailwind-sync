// Layout helpers shared by the component gallery sections.
import { Fragment, type ReactNode } from 'react'

export function Section({ id, title, figma, note, children }: { id: string; title: string; figma: string; note?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-28 flex-col gap-6 border-b border-default pb-12">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold leading-8 text-heading">{title}</h2>
        <p className="text-sm text-body-subtle">Figma: {figma}</p>
        {note && <p className="text-sm text-body">{note}</p>}
      </div>
      {children}
    </section>
  )
}

export function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
      {children}
    </div>
  )
}

/** Row × column matrix: `cell(row, col)` renders one variant. */
export function Matrix<R extends string, C extends string>({ rows, cols, cell, rowLabel = (r) => r }: {
  rows: readonly R[]
  cols: readonly C[]
  cell: (row: R, col: C) => ReactNode
  rowLabel?: (row: R) => ReactNode
}) {
  return (
    <div className="overflow-x-auto rounded-base border border-default bg-neutral-primary-soft">
      <div className="grid min-w-max items-center gap-x-6 gap-y-4 p-5" style={{ gridTemplateColumns: `8rem repeat(${cols.length}, max-content)` }}>
        <span />
        {cols.map((c) => (
          <span key={c} className="text-xs text-body-subtle">{c}</span>
        ))}
        {rows.map((r) => (
          <Fragment key={r}>
            <span className="text-xs text-body-subtle">{rowLabel(r)}</span>
            {cols.map((c) => (
              <div key={c}>{cell(r, c)}</div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-4 rounded-base border border-default bg-neutral-primary-soft p-5">{children}</div>
}

export function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {children}
      <span className="text-xs text-body-subtle">{label}</span>
    </div>
  )
}
