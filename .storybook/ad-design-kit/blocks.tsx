// Doc blocks for the AD Design Kit Storybook: token tables, theme matrix, sync status and the per-component
// Figma header. All data comes from the generated registry (.storybook/generated/ad-design-kit-docs.ts).
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Badge } from '../../src/components/ui/Badge';
import { Button, buttonVariants } from '../../src/components/ui/Button';
import { Input, Label } from '../../src/components/ui/Input';
import { Toggle } from '../../src/components/ui/Toggle';
import { cn } from '../../src/lib/cn';
import { adDesignKitDocs, type ADDesignKitColorToken, type ADDesignKitComponentDoc, type ADDesignKitDrift } from '../generated/ad-design-kit-docs';
import { categoryLabels, docsId } from './figma';

const { tokens, components, drift } = adDesignKitDocs;

// ---------- shared ----------
const tableClass = 'w-full border-collapse text-left text-sm text-body';
const thClass = 'border-b border-default-medium py-2 pr-4 text-xs font-semibold uppercase tracking-tight text-body-subtle';
const tdClass = 'border-b border-default-subtle py-2 pr-4 align-top';
const codeClass = 'rounded-xs bg-neutral-tertiary px-1 py-0.5 font-mono text-xs text-heading';

function Code({ children }: { children: ReactNode }) {
  return <code className={codeClass}>{children}</code>;
}

function DocsLink({ component, children }: { component: string; children?: ReactNode }) {
  return (
    <a href={`./?path=/docs/${docsId(component)}`} target="_top" className="font-medium text-fg-brand hover:underline">
      {children ?? component}
    </a>
  );
}

const hex = (value: string) => value.split(' ')[0];

// ---------- component docs page ----------
export function FigmaHeader({ entry }: { entry: ADDesignKitComponentDoc }) {
  const inSync = entry.drift.length === 0;
  return (
    <div className="my-4 flex flex-col gap-3 rounded-base border border-default bg-neutral-primary-soft p-4">
      <div className="flex flex-wrap items-center gap-2">
        {entry.figmaUrl ? (
          <a href={entry.figmaUrl} target="_blank" rel="noreferrer" className={buttonVariants({ color: 'brand', size: 'sm' })}>
            Open in Figma
          </a>
        ) : null}
        {entry.pageUrl ? (
          <a href={entry.pageUrl} target="_blank" rel="noreferrer" className={buttonVariants({ color: 'tertiary', size: 'sm' })}>
            Figma page
          </a>
        ) : null}
        <Badge color={entry.specVerified ? 'success' : 'warning'}>{entry.specVerified ? 'Spec verified' : 'Spec not verified'}</Badge>
        <Badge color={inSync ? 'success' : 'danger'}>{inSync ? 'Registry ↔ code in sync' : `${entry.drift.length} drift finding${entry.drift.length > 1 ? 's' : ''}`}</Badge>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-body-subtle">Figma set</dt>
        <dd className="text-heading">
          “{entry.figmaName}” <Code>{entry.node}</Code>
          {entry.figmaLine ? <span className="text-body"> · {entry.figmaLine.replace(/`/g, '')}</span> : null}
        </dd>
        <dt className="text-body-subtle">React</dt>
        <dd className="text-heading">
          <Code>src/components/ui/{entry.template}</Code>
          {entry.related.length ? <span className="text-body"> · also exports {entry.related.join(', ')}</span> : null}
        </dd>
        {Object.keys(entry.parts).length ? (
          <>
            <dt className="text-body-subtle">Figma parts</dt>
            <dd className="text-body">{Object.entries(entry.parts).map(([part, node]) => `${part} (${node})`).join(' · ')}</dd>
          </>
        ) : null}
        <dt className="text-body-subtle">Snapshot</dt>
        <dd className="text-body">
          Registry {adDesignKitDocs.registrySnapshotAt} · tokens {tokens.themesExportedAt.slice(0, 10)} · docs built {adDesignKitDocs.generatedAt}
        </dd>
      </dl>
    </div>
  );
}

type PropMapEntry = { prop?: string | null; values?: Record<string, unknown>; css?: boolean; slot?: boolean; component?: string | Record<string, string>; allowedWith?: Record<string, string[]>; except?: Record<string, unknown> };

function describeMapping(m: PropMapEntry): ReactNode {
  if (m.css) {
    const except = m.except ? ` (except ${Object.keys(m.except).join(', ')})` : '';
    return <span>CSS state, not a prop{except}</span>;
  }
  const comps = typeof m.component === 'string' ? [m.component] : m.component ? Object.values(m.component) : [];
  const parts: ReactNode[] = [];
  if (comps.length) parts.push(<span key="c">component {comps.map((c, i) => <span key={c}>{i ? ' / ' : ''}<Code>{`<${c}>`}</Code></span>)}</span>);
  if (m.prop) parts.push(<span key="p">{comps.length ? ' · ' : ''}<Code>{m.prop}</Code>{m.slot ? ' slot (ReactNode)' : m.values ? '' : ' boolean / value'}</span>);
  if (m.values) {
    parts.push(
      <span key="v" className="block text-xs text-body-subtle">
        {Object.entries(m.values).map(([figma, code], i) => (
          <span key={figma}>{i ? ' · ' : ''}{figma} → <Code>{typeof code === 'string' ? code : code === null ? '—' : JSON.stringify(code)}</Code></span>
        ))}
      </span>,
    );
  }
  if (m.allowedWith) parts.push(<span key="a" className="block text-xs text-body-subtle">only with {Object.entries(m.allowedWith).map(([k, v]) => `${k}: ${v.join(' | ')}`).join('; ')}</span>);
  return parts.length ? parts : <span>—</span>;
}

export function VariantMap({ entry }: { entry: ADDesignKitComponentDoc }) {
  const propMap = entry.propMap as Record<string, PropMapEntry | unknown>;
  const rows: { figma: string; values: string[]; mapping: ReactNode }[] = [];
  const isEntry = (m: unknown): m is PropMapEntry => !!m && typeof m === 'object' && !Array.isArray(m) && ('prop' in m || 'values' in m || 'css' in m || 'component' in m);
  for (const [figmaProp, m] of Object.entries(propMap)) {
    if (isEntry(m)) rows.push({ figma: figmaProp, values: entry.figmaVariants[figmaProp] ?? [], mapping: describeMapping(m) });
    else if (m && typeof m === 'object' && !Array.isArray(m)) {
      for (const [sub, subMap] of Object.entries(m as Record<string, unknown>)) {
        if (isEntry(subMap)) rows.push({ figma: `${figmaProp} › ${sub}`, values: [], mapping: describeMapping(subMap) });
      }
    }
  }
  for (const [figmaProp, values] of Object.entries(entry.figmaVariants)) {
    if (!rows.some((r) => r.figma === figmaProp)) rows.push({ figma: figmaProp, values, mapping: <span className="text-body-subtle">not mapped</span> });
  }
  if (!rows.length) return <p className="text-sm text-body">This component set has no variant properties; see the usage notes below.</p>;
  return (
    <table className={tableClass}>
      <thead>
        <tr>
          <th className={thClass}>Figma property</th>
          <th className={thClass}>Figma values</th>
          <th className={thClass}>React</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.figma}>
            <td className={cn(tdClass, 'whitespace-nowrap font-medium text-heading')}>{r.figma}</td>
            <td className={tdClass}>{r.values.join(' · ') || '—'}</td>
            <td className={tdClass}>{r.mapping}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function DriftList({ findings }: { findings: ADDesignKitDrift[] }) {
  return (
    <div className="mt-4 rounded-base border border-danger-subtle bg-danger-soft p-4 text-sm text-fg-danger-strong">
      <p className="font-semibold">Registry ↔ code drift</p>
      <ul className="mt-2 list-disc space-y-1 ps-5">
        {findings.map((f, i) => (
          <li key={i}>
            <Code>{f.kind}</Code> {f.detail}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs">Fix in code or in the registry, then run the ad-design-kit-figma-sync skill and <Code>npm run docs:build</Code>.</p>
    </div>
  );
}

export function FigmaEmbed({ entry }: { entry: ADDesignKitComponentDoc }) {
  const [open, setOpen] = useState(false);
  if (!entry.node) return null;
  const src = `https://embed.figma.com/design/${adDesignKitDocs.fileKey}/?node-id=${entry.node.replace(':', '-')}&embed-host=ad-design-kit-storybook`;
  return (
    <details className="rounded-base border border-default bg-neutral-primary-soft p-4" onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary className="cursor-pointer text-sm font-medium text-heading">Show the Figma component set inline (needs access to the AD Design Kit file)</summary>
      {open ? <iframe title={`Figma: ${entry.figmaName}`} src={src} className="mt-3 h-[480px] w-full rounded border border-default" allowFullScreen /> : null}
    </details>
  );
}

// ---------- tokens ----------
function Swatch({ role, token }: { role: 'bg' | 'text' | 'border'; token: ADDesignKitColorToken }) {
  const v = `var(${token.cssVar})`;
  if (role === 'bg') return <span className="inline-block size-8 rounded border border-default-subtle" style={{ backgroundColor: v }} aria-hidden />;
  if (role === 'text') return <span className="inline-flex size-8 items-center justify-center rounded border border-default-subtle bg-neutral-primary-soft text-lg font-semibold" style={{ color: v }} aria-hidden>Aa</span>;
  return <span className="inline-block size-8 rounded border-2 bg-neutral-primary-soft" style={{ borderColor: v }} aria-hidden />;
}

export function ColorTokens({ role }: { role: 'bg' | 'text' | 'border' }) {
  const [allModes, setAllModes] = useState(false);
  const rows = tokens.colors[role];
  const modes = tokens.modes.map((m) => `${m.theme}-${m.scheme}`);
  return (
    <div className="my-4">
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm text-body">The swatch column is live: switch Theme or Scheme in the toolbar.</p>
        <Button size="xs" color="tertiary" onClick={() => setAllModes((v) => !v)}>{allModes ? 'Show Modern only' : 'Show all modes'}</Button>
      </div>
      <div className="overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Live</th>
              <th className={thClass}>Class</th>
              <th className={thClass}>Use for</th>
              {allModes ? modes.map((m) => <th key={m} className={cn(thClass, 'whitespace-nowrap')}>{m}</th>) : (<><th className={thClass}>Modern light</th><th className={thClass}>Modern dark</th></>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.cls}>
                <td className={tdClass}><Swatch role={role} token={t} /></td>
                <td className={cn(tdClass, 'whitespace-nowrap')}><Code>{t.cls}</Code></td>
                <td className={cn(tdClass, 'min-w-64')}>{t.use}</td>
                {allModes
                  ? modes.map((m) => (
                      <td key={m} className={tdClass}>
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-xs"><span className="inline-block size-3.5 rounded-xs border border-default-subtle" style={{ backgroundColor: hex(t.values[m] ?? '') }} />{hex(t.values[m] ?? '')}</span>
                      </td>
                    ))
                  : (<><td className={cn(tdClass, 'whitespace-nowrap font-mono text-xs')}>{t.light}</td><td className={cn(tdClass, 'whitespace-nowrap font-mono text-xs')}>{t.dark}</td></>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Literal class maps so Tailwind picks the utilities up at build time.
const radiusClass: Record<string, string> = {
  'rounded-0': 'rounded-none', 'rounded-xxs': 'rounded-xxs', 'rounded-xs': 'rounded-xs', 'rounded-sm': 'rounded-sm', rounded: 'rounded',
  'rounded-base': 'rounded-base', 'rounded-lg': 'rounded-lg', 'rounded-xl': 'rounded-xl', 'rounded-full': 'rounded-full',
};
const shadowClass: Record<string, string> = {
  'shadow-xs': 'shadow-xs', shadow: 'shadow', 'shadow-md': 'shadow-md', 'shadow-lg': 'shadow-lg', 'shadow-xl': 'shadow-xl', 'shadow-2xl': 'shadow-2xl',
  'shadow-bottom-dropdown': 'shadow-bottom-dropdown', 'shadow-top': 'shadow-top', 'shadow-focus-brand': 'shadow-focus-brand',
  'shadow-focus-secondary': 'shadow-focus-secondary', 'shadow-focus-success': 'shadow-focus-success', 'shadow-focus-danger': 'shadow-focus-danger',
  'shadow-focus-warning': 'shadow-focus-warning', 'shadow-focus-dark': 'shadow-focus-dark',
};
const textClass: Record<string, string> = {
  'text-xxs': 'text-xxs', 'text-xs': 'text-xs', 'text-sm': 'text-sm', 'text-base': 'text-base', 'text-lg': 'text-lg', 'text-xl': 'text-xl',
  'text-2xl': 'text-2xl', 'text-3xl': 'text-3xl', 'text-4xl': 'text-4xl', 'text-5xl': 'text-5xl', 'text-6xl': 'text-6xl',
};

export function RadiusScale() {
  return (
    <div className="my-4 overflow-x-auto">
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>Live</th>
            <th className={thClass}>Class</th>
            {tokens.radius.themes.map((t) => <th key={t} className={thClass}>{t}</th>)}
          </tr>
        </thead>
        <tbody>
          {tokens.radius.rows.map((r) => (
            <tr key={r.cls}>
              <td className={tdClass}><span className={cn('inline-block size-10 border-2 border-brand bg-brand-softer', radiusClass[r.cls])} aria-hidden /></td>
              <td className={tdClass}><Code>{r.cls}</Code></td>
              {r.values.map((v, i) => <td key={i} className={cn(tdClass, 'font-mono text-xs')}>{v}px</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ShadowScale() {
  return (
    <div className="my-4 grid gap-4 sm:grid-cols-2">
      {tokens.shadows.map((s) => {
        const classes = s.cls.split(/\s*\/\s*/).map((c) => c.trim()).flatMap((c) => (c.startsWith('shadow') ? [c] : s.cls.split(' / ')[0].replace(/-[a-z]+$/, c)));
        return (
          <div key={s.cls} className="rounded-base border border-default bg-neutral-primary p-4">
            <div className="flex flex-wrap gap-4">
              {classes.map((c) => (
                <div key={c} className={cn('flex h-16 w-28 items-center justify-center rounded-base border border-default bg-neutral-primary-soft text-xs text-body', shadowClass[c] ?? '')}>{c}</div>
              ))}
            </div>
            <p className="mt-3 text-sm text-body">{s.use}</p>
          </div>
        );
      })}
    </div>
  );
}

export function TypeScale() {
  const sizes = Object.keys(textClass);
  return (
    <div className="my-4 space-y-3">
      {sizes.map((cls) => {
        const row = tokens.typography.find((t) => t.cls === cls || t.cls.includes(cls));
        return (
          <div key={cls} className="flex items-baseline gap-4 border-b border-default-subtle pb-2">
            <Code>{cls}</Code>
            <span className={cn('truncate text-heading', textClass[cls])}>The quick brown fox jumps over the lazy dog</span>
            {row?.size && !row.cls.includes('…') ? <span className="ms-auto whitespace-nowrap font-mono text-xs text-body-subtle">{row.size}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

// ---------- themes ----------
function ThemeSample({ theme, dark }: { theme: string; dark: boolean }) {
  const font = tokens.fonts[theme]?.split(' (')[0] ?? '';
  const base = tokens.radius.rows.find((r) => r.cls === 'rounded-base')?.values[tokens.radius.themes.indexOf(theme)];
  return (
    <div data-theme={theme} className={cn('flex flex-col gap-3 rounded-base border border-default bg-neutral-primary p-4 text-body', dark && 'dark')}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold capitalize text-heading">{theme} · {dark ? 'dark' : 'light'}</span>
        <Badge color="gray">{font} · base {base}px</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" color="secondary">Secondary</Button>
        <Badge color="brand">Badge</Badge>
        <Badge color="success">Success</Badge>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`sample-${theme}-${dark ? 'd' : 'l'}`}>Email</Label>
        <Input id={`sample-${theme}-${dark ? 'd' : 'l'}`} size="sm" placeholder="name@company.com" readOnly />
      </div>
      <Toggle checked onCheckedChange={() => {}}>Notifications</Toggle>
    </div>
  );
}

export function ThemeMatrix() {
  return (
    <div className="my-4 grid gap-4 md:grid-cols-2">
      {tokens.themes.flatMap((theme) => [false, true].map((dark) => <ThemeSample key={`${theme}-${dark}`} theme={theme} dark={dark} />))}
    </div>
  );
}

export function ModeTable() {
  return (
    <table className={cn(tableClass, 'my-4')}>
      <thead>
        <tr><th className={thClass}>Figma mode</th><th className={thClass}>data-theme</th><th className={thClass}>.dark</th><th className={thClass}>Font</th></tr>
      </thead>
      <tbody>
        {tokens.modes.map((m) => (
          <tr key={m.figma}>
            <td className={tdClass}>{m.figma}</td>
            <td className={tdClass}><Code>{m.theme}</Code></td>
            <td className={tdClass}>{m.scheme === 'dark' ? 'yes' : 'no'}</td>
            <td className={tdClass}>{tokens.fonts[m.theme]?.split(' (')[0]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ---------- sync & index ----------
export function SyncSummary() {
  const list = Object.values(components);
  const withDrift = list.filter((c) => c.drift.length);
  const verified = list.filter((c) => c.specVerified).length;
  const stat = (label: string, value: ReactNode, ok?: boolean) => (
    <div className="rounded-base border border-default bg-neutral-primary-soft p-4">
      <p className="text-xs uppercase tracking-tight text-body-subtle">{label}</p>
      <p className={cn('mt-1 text-lg font-semibold', ok === false ? 'text-fg-danger' : 'text-heading')}>{value}</p>
    </div>
  );
  return (
    <div className="my-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stat('Figma file', <a className="text-fg-brand hover:underline" href={adDesignKitDocs.fileUrl} target="_blank" rel="noreferrer">{adDesignKitDocs.fileKey}</a>)}
      {stat('Registry snapshot', adDesignKitDocs.registrySnapshotAt)}
      {stat('Token export', tokens.themesExportedAt.slice(0, 10), tokens.cssInSync)}
      {stat('Components', `${list.length} documented · ${verified} spec verified`)}
      {stat('Token CSS', tokens.cssInSync ? 'App copy matches generated tokens' : 'App copy is out of date', tokens.cssInSync)}
      {stat('Registry ↔ code', withDrift.length ? `${drift.length} finding(s) in ${withDrift.length} component(s)` : 'No drift', !withDrift.length)}
      {stat('Docs generated', adDesignKitDocs.generatedAt)}
      {stat('Stories', `${list.filter((c) => c.storyTitle).length} / ${list.length} components`)}
    </div>
  );
}

export function SyncTable() {
  const rows = Object.values(components).sort((a, b) => a.category.localeCompare(b.category) || a.react.localeCompare(b.react));
  return (
    <div className="my-4 overflow-x-auto">
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>Component</th>
            <th className={thClass}>Category</th>
            <th className={thClass}>Figma set</th>
            <th className={thClass}>Spec</th>
            <th className={thClass}>Registry ↔ code</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.react}>
              <td className={tdClass}><DocsLink component={c.react} /></td>
              <td className={tdClass}>{categoryLabels[c.category] ?? c.category}</td>
              <td className={tdClass}>{c.figmaUrl ? <a className="text-fg-brand hover:underline" href={c.figmaUrl} target="_blank" rel="noreferrer">{c.figmaName} <span className="font-mono text-xs text-body-subtle">{c.node}</span></a> : '—'}</td>
              <td className={tdClass}><Badge color={c.specVerified ? 'success' : 'warning'}>{c.specVerified ? 'verified' : 'unverified'}</Badge></td>
              <td className={tdClass}>
                {c.drift.length ? (
                  <ul className="list-disc space-y-0.5 ps-4 text-xs text-fg-danger">{c.drift.map((d, i) => <li key={i}>{d.detail}</li>)}</ul>
                ) : (
                  <Badge color="success">in sync</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComponentIndex() {
  const groups = Object.values(components).reduce<Record<string, ADDesignKitComponentDoc[]>>((acc, c) => ((acc[c.category] ||= []).push(c), acc), {});
  return (
    <div className="my-4 space-y-6">
      {Object.entries(groups).map(([category, list]) => (
        <section key={category}>
          <h3 className="mb-2 text-base font-semibold text-heading">{categoryLabels[category] ?? category}</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {list.sort((a, b) => a.react.localeCompare(b.react)).map((c) => (
              <a key={c.react} href={`./?path=/docs/${docsId(c.react)}`} target="_top" className="flex flex-col gap-0.5 rounded-base border border-default bg-neutral-primary-soft p-3 transition-colors hover:bg-neutral-secondary-medium">
                <span className="text-sm font-medium text-heading">{c.react}</span>
                <span className="text-xs text-body-subtle">Figma “{c.figmaName}” · {c.node}{c.related.length ? ` · +${c.related.join(', ')}` : ''}</span>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function TokenPairingRule() {
  return tokens.pairingRule ? <p className="my-4 rounded-base border border-brand-subtle bg-brand-softer p-4 text-sm text-fg-brand-strong">{tokens.pairingRule.replace(/`/g, '')}</p> : null;
}

export const docsStyle: CSSProperties = {};
