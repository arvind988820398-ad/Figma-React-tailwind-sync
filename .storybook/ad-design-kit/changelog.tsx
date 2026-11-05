// Version history of the design system (Guides → Changelog). Data comes from
// .storybook/generated/ad-design-kit-changelog.ts, rendered by the figma-sync skill's changelog.mjs.
import { useState } from 'react';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { adDesignKitChangelog, type ADDesignKitChange, type ADDesignKitChangeArea, type ADDesignKitVersion } from '../generated/ad-design-kit-changelog';

const { repository, versions } = adDesignKitChangelog;
const tag = (v: string) => `ds-v${v}`;

const areas: [ADDesignKitChangeArea, string][] = [
  ['mode', 'Theme modes'],
  ['token', 'Tokens'],
  ['effect', 'Effect styles'],
  ['component', 'Component sets'],
  ['variant', 'Variants'],
  ['style', 'Component styling'],
  ['icon', 'Icons'],
  ['code', 'Code fixes'],
];
const verb = { added: 'Added', removed: 'Removed', renamed: 'Renamed', changed: 'Changed' } as const;
const verbColor = { added: 'success', removed: 'danger', renamed: 'warning', changed: 'brand' } as const;
const bumpBadge = { major: { color: 'danger', label: 'Major · breaking' }, minor: { color: 'brand', label: 'Minor' }, patch: { color: 'gray', label: 'Patch' } } as const;

const codeClass = 'rounded-xs bg-neutral-tertiary px-1 py-0.5 font-mono text-xs text-heading';
const linkClass = 'font-medium text-fg-brand hover:underline';

function Items({ items }: { items: string[] }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 24);
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      {shown.map((n) => (
        <code key={n} className={codeClass}>{n}</code>
      ))}
      {items.length > shown.length && (
        <Button size="xs" color="ghost" onClick={() => setAll(true)}>
          Show all {items.length}
        </Button>
      )}
    </div>
  );
}

function Change({ c }: { c: ADDesignKitChange }) {
  return (
    <li className="flex flex-col py-1.5">
      <span className="flex flex-wrap items-center gap-2 text-sm text-body">
        <Badge color={verbColor[c.change]}>{verb[c.change]}</Badge>
        {c.breaking && <Badge color="danger">Breaking</Badge>}
        <code className={codeClass}>{c.name}</code>
        {c.detail && <span>{c.detail}</span>}
      </span>
      {c.items && <Items items={c.items} />}
    </li>
  );
}

function Version({ v, prev }: { v: ADDesignKitVersion; prev?: ADDesignKitVersion }) {
  const n = v.counts;
  const summary = v.baseline
    ? `Baseline: ${v.stats.components} component sets, ${v.stats.tokens} tokens, ${v.stats.modes.length} theme modes, ${v.stats.effects} effect styles, ${v.stats.icons} icons`
    : [n.added && `${n.added} added`, n.removed && `${n.removed} removed`, n.renamed && `${n.renamed} renamed`, n.changed && `${n.changed} changed`].filter(Boolean).join(' · ');
  return (
    <section className="sb-unstyled flex flex-col gap-3 rounded-base border border-default bg-neutral-primary-soft p-5">
      <header className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="skip-toc m-0 border-0 p-0 text-xl font-semibold text-heading">{v.version}</h3>
          {v.baseline ? <Badge color="gray">Baseline</Badge> : <Badge color={bumpBadge[v.bump].color}>{bumpBadge[v.bump].label}</Badge>}
          <span className="text-sm text-body-subtle">{v.date}</span>
        </div>
        <p className="m-0 text-base font-medium text-heading">{v.title}</p>
        <p className="m-0 flex flex-wrap gap-x-3 gap-y-1 text-sm text-body">
          <span>{summary}</span>
          {v.figmaVersion && <span>Figma version “{v.figmaVersion}”</span>}
          {repository && (
            <a className={linkClass} href={`${repository}/tree/${tag(v.version)}`} target="_blank" rel="noreferrer">
              Code at {tag(v.version)}
            </a>
          )}
          {repository && prev && (
            <a className={linkClass} href={`${repository}/compare/${tag(prev.version)}...${tag(v.version)}`} target="_blank" rel="noreferrer">
              Diff with {prev.version}
            </a>
          )}
        </p>
      </header>
      {areas.map(([area, label]) => {
        const list = v.changes.filter((c) => c.area === area);
        if (!list.length) return null;
        return (
          <div key={area} className="flex flex-col">
            <h4 className="skip-toc m-0 text-xs font-semibold uppercase tracking-tight text-body-subtle">{label}</h4>
            <ul className="m-0 mt-1 list-none divide-y divide-default p-0">
              {list.map((c, i) => (
                <Change key={i} c={c} />
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export function ChangelogSummary() {
  const latest = versions[0];
  const first = versions[versions.length - 1];
  if (!latest) return null;
  const breaking = versions.filter((v) => !v.baseline && v.bump === 'major').length;
  return (
    <p className="my-4 rounded-base border border-brand-subtle bg-brand-softer p-4 text-sm text-fg-brand-strong">
      Current version <b>{latest.version}</b> ({latest.date}) · {versions.length} versions since {first.date} · {breaking} with breaking changes · {latest.stats.components} component sets, {latest.stats.tokens} tokens, {latest.stats.icons} icons
    </p>
  );
}

export function Changelog() {
  return (
    <div className="my-4 flex flex-col gap-4">
      {versions.map((v, i) => (
        <Version key={v.version} v={v} prev={versions[i + 1]} />
      ))}
    </div>
  );
}
