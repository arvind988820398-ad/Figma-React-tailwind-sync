// Knowledge graph of the design system (Guides → Graph): components, the tokens and icons they use, the
// components they build on, the app screens that use them and the gaps those screens recorded. Data and a seed
// layout come from .storybook/scripts/build-graph.mjs; this file draws it with react-force-graph-2d (live physics,
// draggable nodes) and adds the search, filters and side panel.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type LinkObject, type NodeObject } from 'react-force-graph-2d';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Toggle } from '../../src/components/ui/Toggle';
import { adDesignKitGraph, type ADDesignKitGraphKind, type ADDesignKitGraphLink, type ADDesignKitGraphNode } from '../generated/ad-design-kit-graph';
import { docsId } from './figma';

const { nodes, links, counts } = adDesignKitGraph;
const byId = new Map(nodes.map((n) => [n.id, n]));

const kinds: { kind: ADDesignKitGraphKind; label: string; color: string }[] = [
  { kind: 'component', label: 'Components', color: 'var(--adk-bg-brand)' },
  { kind: 'category', label: 'Categories', color: 'var(--adk-text-heading)' },
  { kind: 'token', label: 'Tokens', color: 'var(--adk-bg-teal)' },
  { kind: 'icon', label: 'Icons', color: 'var(--adk-bg-orange)' },
  { kind: 'screen', label: 'App screens', color: 'var(--adk-bg-success)' },
  { kind: 'gap', label: 'Gaps for Figma', color: 'var(--adk-bg-danger)' },
];
const colorOf = Object.fromEntries(kinds.map((k) => [k.kind, k.color])) as Record<ADDesignKitGraphKind, string>;

const neighbours = new Map<string, Set<string>>();
for (const l of links) {
  (neighbours.get(l.from) ?? neighbours.set(l.from, new Set()).get(l.from)!).add(l.to);
  (neighbours.get(l.to) ?? neighbours.set(l.to, new Set()).get(l.to)!).add(l.from);
}

// ---- Canvas colours ---------------------------------------------------------------------------------------------
// The canvas cannot read CSS variables, so the token colours are resolved to RGB once per theme.
type RGB = [number, number, number];
const rgba = ([r, g, b]: RGB, a = 1) => `rgba(${r},${g},${b},${a})`;
const haloVars = ['--adk-bg-purple', '--adk-bg-sky', '--adk-bg-pink', '--adk-bg-cyan', '--adk-bg-fuchsia', '--adk-bg-indigo', '--adk-bg-warning'];
const categories = nodes.filter((n) => n.kind === 'category').map((n) => n.group);
type Palette = { kind: Record<ADDesignKitGraphKind, RGB>; halo: Record<string, RGB>; heading: RGB; surface: RGB; line: RGB; brand: RGB; font: string };

function readPalette(host: HTMLElement): Palette {
  const probe = document.createElement('span');
  host.appendChild(probe);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  // Any CSS colour format (hex, rgb, oklch…) → RGB, by painting one pixel.
  const read = (cssVar: string): RGB => {
    probe.style.color = `var(${cssVar})`;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = '#000';
    ctx.fillStyle = getComputedStyle(probe).color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  };
  const palette: Palette = {
    kind: Object.fromEntries(kinds.map((k) => [k.kind, read(k.color.slice(4, -1))])) as Record<ADDesignKitGraphKind, RGB>,
    halo: Object.fromEntries(categories.map((c, i) => [c, read(haloVars[i % haloVars.length])])),
    heading: read('--adk-text-heading'),
    surface: read('--adk-bg-neutral-primary-soft'),
    line: read('--adk-border-default-strong'),
    brand: read('--adk-bg-brand'),
    font: getComputedStyle(host).fontFamily,
  };
  probe.remove();
  return palette;
}

// ---- Graph model ------------------------------------------------------------------------------------------------
type GNode = NodeObject<ADDesignKitGraphNode>;
type GLink = LinkObject<ADDesignKitGraphNode, { kind: ADDesignKitGraphLink['kind'] }>;
// The view fits the components and their hubs; lone tokens and icons on the rim may sit just outside it.
const fitCore = (n: GNode) => n.kind === 'component' || n.kind === 'category' || n.kind === 'screen' || n.kind === 'gap';
const endId = (v: GLink['source']) => (typeof v === 'object' && v ? String(v.id) : String(v));

// Size in graph units: hubs are big, and the more a part is used, the bigger its dot.
const size = (n: ADDesignKitGraphNode) =>
  n.kind === 'category' ? 9 : n.kind === 'screen' || n.kind === 'gap' ? 8 : n.kind === 'component' ? 3.5 + Math.min(5, Math.sqrt(n.degree) * 0.75) : 1.8 + Math.min(4, Math.sqrt(n.degree) * 0.6);

// Link lengths and pulls per kind: category and composition links hold clusters together; the many token and
// icon links are long and weak, so shared tokens settle between the clusters that use them.
const linkDistance: Record<ADDesignKitGraphLink['kind'], number> = { category: 30, uses: 55, screen: 120, gap: 36, token: 80, icon: 26 };
const linkStrength: Record<ADDesignKitGraphLink['kind'], number> = { category: 0.6, uses: 0.06, screen: 0.03, gap: 0.6, token: 0.035, icon: 0.4 };

// Pull every component towards its category hub, so each category reads as one cluster.
function clusterForce(strength: number) {
  let all: GNode[] = [];
  let hubs = new Map<string, GNode>();
  const force = (alpha: number) => {
    for (const n of all) {
      const hub = n.kind === 'component' ? hubs.get(n.group) : undefined;
      if (!hub || hub.x == null || hub.y == null || n.x == null || n.y == null) continue;
      n.vx = (n.vx ?? 0) + (hub.x - n.x) * strength * alpha;
      n.vy = (n.vy ?? 0) + (hub.y - n.y) * strength * alpha;
    }
  };
  force.initialize = (ns: GNode[]) => {
    all = ns;
    hubs = new Map(ns.filter((n) => n.kind === 'category').map((n) => [n.group, n]));
  };
  return force;
}

// Keep dots from overlapping, and category hubs far enough apart that their clusters stay separate
// (the graph is small enough for a direct pass).
function collideForce(padding: number, hubGap: number) {
  let all: GNode[] = [];
  const force = () => {
    for (let i = 0; i < all.length; i++) {
      const a = all[i];
      for (let j = i + 1; j < all.length; j++) {
        const b = all[j];
        const dx = (b.x ?? 0) - (a.x ?? 0), dy = (b.y ?? 0) - (a.y ?? 0);
        const min = a.kind === 'category' && b.kind === 'category' ? hubGap : size(a) + size(b) + padding;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min * min || d2 === 0) continue;
        const d = Math.sqrt(d2), push = ((min - d) / d) * 0.5;
        a.vx = (a.vx ?? 0) - dx * push * 0.5;
        a.vy = (a.vy ?? 0) - dy * push * 0.5;
        b.vx = (b.vx ?? 0) + dx * push * 0.5;
        b.vy = (b.vy ?? 0) + dy * push * 0.5;
      }
    }
  };
  force.initialize = (ns: GNode[]) => {
    all = ns;
  };
  return force;
}

function NodeButton({ node, onSelect }: { node: ADDesignKitGraphNode; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className="inline-flex items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-start text-xs font-medium text-heading hover:bg-neutral-secondary-medium focus-visible:shadow-focus-brand focus-visible:outline-none"
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: colorOf[node.kind] }} />
      {node.label}
    </button>
  );
}

function Group({ title, ids, onSelect }: { title: string; ids: string[]; onSelect: (id: string) => void }) {
  if (!ids.length) return null;
  return (
    <section className="flex flex-col gap-1.5">
      <h4 className="m-0 text-xs font-semibold uppercase tracking-tight text-body-subtle">
        {title} <span className="font-normal">({ids.length})</span>
      </h4>
      <div className="flex flex-wrap gap-1">
        {ids
          .map((id) => byId.get(id)!)
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((n) => (
            <NodeButton key={n.id} node={n} onSelect={onSelect} />
          ))}
      </div>
    </section>
  );
}

function Details({ node, onSelect }: { node: ADDesignKitGraphNode; onSelect: (id: string) => void }) {
  const out = links.filter((l) => l.from === node.id);
  const inc = links.filter((l) => l.to === node.id);
  const to = (kind: string) => out.filter((l) => l.kind === kind).map((l) => l.to);
  const from = (kind: string) => inc.filter((l) => l.kind === kind).map((l) => l.from);
  const extra: ReactNode[] = [];
  if (node.kind === 'component') {
    extra.push(
      <div key="links" className="flex flex-wrap gap-3 text-sm">
        <a href={`./?path=/docs/${docsId(node.host ?? node.label)}`} target="_top" className="font-medium text-fg-brand hover:underline">
          Open docs
        </a>
        {node.figma && (
          <a href={node.figma} target="_blank" rel="noreferrer" className="font-medium text-fg-brand hover:underline">
            Open in Figma{node.figmaName ? ` (${node.figmaName})` : ''}
          </a>
        )}
      </div>,
    );
  }
  if (node.kind === 'token' && node.values) {
    extra.push(
      <div key="values" className="flex flex-col gap-1 text-xs">
        {Object.entries(node.values).map(([mode, value]) => (
          <div key={mode} className="flex items-center justify-between gap-3">
            <span className="text-body">{mode}</span>
            <span className="flex items-center gap-1.5 font-mono text-heading">
              {/^#/.test(value) && <span aria-hidden className="size-3 rounded-xs border border-default" style={{ background: value }} />}
              {value}
            </span>
          </div>
        ))}
      </div>,
    );
  }
  if (node.kind === 'gap') {
    extra.push(
      <div key="gap" className="flex flex-col gap-2 text-sm text-body">
        <p className="m-0"><b className="text-heading">Proposed in Figma:</b> {node.proposal}</p>
        <p className="m-0"><b className="text-heading">Stand-in until then:</b> {node.standIn}</p>
      </div>,
    );
  }
  if (node.kind === 'screen') extra.push(<p key="path" className="m-0 font-mono text-xs text-body">{node.path}</p>);
  const kindLabel = kinds.find((k) => k.kind === node.kind)!.label.replace(/s$/, '');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-full" style={{ background: colorOf[node.kind] }} />
          <h3 className="m-0 text-base font-semibold text-heading">{node.label}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge color="gray">{kindLabel}</Badge>
          <Badge color="white">{node.group}</Badge>
        </div>
      </div>
      {extra}
      <Group title="Builds on" ids={to('uses')} onSelect={onSelect} />
      <Group title="Used by components" ids={from('uses').concat(from('token'), from('icon')).filter((id) => byId.get(id)?.kind === 'component')} onSelect={onSelect} />
      <Group title="Used by screens" ids={from('screen')} onSelect={onSelect} />
      <Group title="Components" ids={node.kind === 'category' ? from('category') : to('screen')} onSelect={onSelect} />
      <Group title="Tokens" ids={to('token')} onSelect={onSelect} />
      <Group title="Icons" ids={to('icon')} onSelect={onSelect} />
      <Group title="Gaps for Figma" ids={to('gap')} onSelect={onSelect} />
      <Group title="Recorded by" ids={node.kind === 'gap' ? from('gap') : []} onSelect={onSelect} />
    </div>
  );
}

export function KnowledgeGraph() {
  const [show, setShow] = useState<Record<ADDesignKitGraphKind, boolean>>({ component: true, category: true, token: true, icon: true, screen: true, gap: true });
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [width, setWidth] = useState(0);
  const [palette, setPalette] = useState<Palette | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const fg = useRef<ForceGraphMethods<GNode, GLink> | undefined>(undefined);
  const fitted = useRef(false);

  // The library moves these objects as the simulation runs, so they are copies, made once per mount.
  // The build's layout seeds the positions, so the graph opens close to settled.
  const [data] = useState(() => ({
    nodes: nodes.map((n) => ({ ...n })) as GNode[],
    links: links.map((l) => ({ source: l.from, target: l.to, kind: l.kind })) as GLink[],
  }));
  const live = useMemo(() => new Map(data.nodes.map((n) => [String(n.id), n])), [data]);
  const clusters = useMemo(() => categories.map((c) => ({ group: c, hub: live.get(`cat:${c}`), members: data.nodes.filter((n) => n.kind === 'component' && n.group === c) })), [data, live]);

  const focus = hover ?? selected;
  const lit = focus ? new Set([focus, ...(neighbours.get(focus) ?? [])]) : null;
  const matches = query.trim() ? nodes.filter((n) => n.label.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8) : [];

  // Width follows the container; colours follow the theme toolbar (data-theme and .dark on <html>).
  useEffect(() => {
    const el = host.current;
    if (!el) return undefined;
    setPalette(readPalette(el));
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    const mo = new MutationObserver(() => setPalette(readPalette(el)));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  // Forces, once the graph exists.
  const ready = Boolean(palette && width);
  useEffect(() => {
    const g = fg.current;
    if (!ready || !g) return;
    g.d3Force('link')?.distance((l: GLink) => linkDistance[l.kind]).strength((l: GLink) => linkStrength[l.kind]);
    g.d3Force('charge')?.strength((n: GNode) => (n.kind === 'category' ? -520 : n.kind === 'component' ? -60 : -14)).distanceMax(280);
    g.d3Force('cluster', clusterForce(0.12));
    g.d3Force('collide', collideForce(2, 190));
    g.d3ReheatSimulation();
  }, [ready]);

  const select = (id: string | null) => {
    if (!id || id === selected) {
      setSelected(null);
      return;
    }
    const n = live.get(id);
    if (!n) return;
    setSelected(id);
    setShow((s) => ({ ...s, [n.kind]: true }));
    const g = fg.current;
    if (g && n.x != null && n.y != null) {
      g.centerAt(n.x, n.y, 700);
      if (g.zoom() < 1.6) g.zoom(2, 700);
    }
  };

  const isOn = (l: GLink) => focus != null && (endId(l.source) === focus || endId(l.target) === focus);
  const isSelectedLink = (l: GLink) => selected != null && (endId(l.source) === selected || endId(l.target) === selected);

  const drawNode = (n: GNode, ctx: CanvasRenderingContext2D, scale: number) => {
    if (!palette || n.x == null || n.y == null) return;
    const id = String(n.id);
    const r = size(n);
    const col = palette.kind[n.kind];
    const inFocus = !lit || lit.has(id);
    ctx.save();
    ctx.globalAlpha = inFocus ? 1 : 0.12;
    // Glow on the focused node and everything it touches.
    if (lit && inFocus) {
      ctx.shadowColor = rgba(col, 0.95);
      ctx.shadowBlur = id === focus ? 28 : 14;
    }
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = rgba(col);
    ctx.fill();
    ctx.shadowBlur = 0;
    if (id === selected) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, r + 3 / scale, 0, 2 * Math.PI);
      ctx.lineWidth = 2 / scale;
      ctx.strokeStyle = rgba(palette.heading);
      ctx.stroke();
    }
    // Labels: hubs always; components once zoomed in a little; everything when close or in focus.
    const hub = n.kind === 'category' || n.kind === 'screen' || n.kind === 'gap';
    if (hub || (lit && inFocus) || (n.kind === 'component' && scale > 1.3) || scale > 3.2) {
      const px = (n.kind === 'category' ? 13 : 11) / scale;
      ctx.font = `${hub || id === focus ? 600 : 400} ${px}px ${palette.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = rgba(palette.surface, 0.9);
      const label = n.kind === 'category' ? n.label.toUpperCase() : n.label;
      ctx.strokeText(label, n.x, n.y + r + 3 / scale);
      ctx.fillStyle = rgba(palette.heading, n.kind === 'token' || n.kind === 'icon' ? 0.8 : 1);
      ctx.fillText(label, n.x, n.y + r + 3 / scale);
    }
    ctx.restore();
  };

  // Soft halos behind each category's components.
  const drawHalos = (ctx: CanvasRenderingContext2D, scale: number) => {
    if (!palette || !show.component) return;
    for (const { group, hub, members } of clusters) {
      const pts = members.concat(hub ? [hub] : []).filter((n) => n.x != null && n.y != null);
      if (pts.length < 2) continue;
      const cx = pts.reduce((s, n) => s + n.x!, 0) / pts.length;
      const cy = pts.reduce((s, n) => s + n.y!, 0) / pts.length;
      // Most of the cluster, not its farthest member: a component pulled away by its links would blow the halo up.
      const dist = pts.map((n) => Math.hypot(n.x! - cx, n.y! - cy) + size(n)).sort((a, b) => a - b);
      const radius = dist[Math.floor((dist.length - 1) * 0.85)] + 14;
      const tint = palette.halo[group];
      const dim = lit && !pts.some((n) => lit.has(String(n.id)));
      const fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      fill.addColorStop(0, rgba(tint, dim ? 0.03 : 0.14));
      fill.addColorStop(1, rgba(tint, dim ? 0.01 : 0.04));
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.setLineDash([4 / scale, 4 / scale]);
      ctx.lineWidth = 1 / scale;
      ctx.strokeStyle = rgba(tint, dim ? 0.1 : 0.45);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  return (
    <div className="my-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="relative w-64">
          <Input
            type="search"
            size="sm"
            aria-label="Find a component, token, icon or screen"
            placeholder="Find a component, token, icon…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches[0]) {
                select(matches[0].id);
                setQuery('');
              }
            }}
          />
          {matches.length > 0 && (
            <ul className="absolute start-0 top-full z-20 m-0 mt-1 flex w-full list-none flex-col rounded-base border border-default-medium bg-neutral-primary-medium p-1 shadow-lg">
              {matches.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      select(n.id);
                      setQuery('');
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-sm text-body hover:bg-neutral-tertiary-medium hover:text-heading focus-visible:bg-neutral-tertiary-medium focus-visible:outline-none"
                  >
                    <span aria-hidden className="size-2 rounded-full" style={{ background: colorOf[n.kind] }} />
                    {n.label}
                    <span className="ms-auto text-xs text-body-subtle">{n.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {kinds.map((k) => (
          <Toggle key={k.kind} checked={show[k.kind]} onCheckedChange={(on) => setShow((s) => ({ ...s, [k.kind]: on }))}>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: k.color }} />
              {k.label} <span className="text-body-subtle">{counts[k.kind]}</span>
            </span>
          </Toggle>
        ))}
        <Button
          size="xs"
          color="secondary"
          onClick={() => {
            setSelected(null);
            fg.current?.zoomToFit(700, 70, fitCore);
          }}
        >
          Reset view
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div
          ref={host}
          role="img"
          aria-label={`Graph of ${counts.component} components, ${counts.token} tokens, ${counts.icon} icons, ${counts.screen} app screens and ${counts.gap} gaps. Use the search or the list beside it to explore.`}
          className="relative h-160 min-w-0 flex-1 overflow-hidden rounded-base border border-default bg-neutral-primary-soft"
        >
          {ready && (
            <ForceGraph2D<ADDesignKitGraphNode, { kind: ADDesignKitGraphLink['kind'] }>
              ref={fg}
              width={width}
              height={640}
              graphData={data}
              backgroundColor="rgba(0,0,0,0)"
              autoPauseRedraw={false}
              warmupTicks={40}
              cooldownTime={8000}
              minZoom={0.3}
              maxZoom={12}
              nodeLabel={() => ''}
              nodeVisibility={(n) => show[n.kind]}
              linkVisibility={(l) => show[byId.get(endId(l.source))!.kind] && show[byId.get(endId(l.target))!.kind]}
              nodeCanvasObject={drawNode}
              nodePointerAreaPaint={(n, color, ctx) => {
                if (n.x == null || n.y == null) return;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(n.x, n.y, size(n) + 2, 0, 2 * Math.PI);
                ctx.fill();
              }}
              linkColor={(l) => {
                const line = palette!.line;
                if (lit) return isOn(l) ? rgba(palette!.brand, 0.85) : rgba(line, 0.04);
                return rgba(line, l.kind === 'token' || l.kind === 'icon' ? 0.22 : 0.5);
              }}
              linkWidth={(l) => (isOn(l) ? 1.6 : l.kind === 'uses' || l.kind === 'category' ? 0.9 : 0.5)}
              linkDirectionalParticles={(l) => (isSelectedLink(l) ? 3 : 0)}
              linkDirectionalParticleWidth={3}
              linkDirectionalParticleSpeed={0.007}
              linkDirectionalParticleColor={() => rgba(palette!.brand)}
              onRenderFramePre={drawHalos}
              onNodeHover={(n) => setHover(n ? String(n.id) : null)}
              onNodeClick={(n) => select(String(n.id))}
              onBackgroundClick={() => setSelected(null)}
              onEngineStop={() => {
                if (fitted.current) return;
                fitted.current = true;
                fg.current?.zoomToFit(700, 70, fitCore);
              }}
            />
          )}
          <p className="pointer-events-none absolute bottom-2 start-3 m-0 rounded-sm bg-neutral-primary-soft px-1.5 py-0.5 text-xs text-body-subtle">Drag a node to pull it · scroll to zoom · click a node to see its connections</p>
        </div>

        <aside aria-label="Selected node" className="w-full shrink-0 rounded-base border border-default bg-neutral-primary-soft p-4 lg:w-80 lg:max-h-160 lg:overflow-y-auto">
          {selected && byId.get(selected) ? (
            <Details node={byId.get(selected)!} onSelect={select} />
          ) : (
            <div className="flex flex-col gap-3 text-sm text-body">
              <p className="m-0 font-semibold text-heading">Explore the system</p>
              <p className="m-0">Click a node, or find one by name, to see what it is connected to. Every connection comes from the code: imports between components, token classes in their source, icons they render, and the components each app screen uses.</p>
              <Group title="Most used tokens" ids={nodes.filter((n) => n.kind === 'token').sort((a, b) => b.degree - a.degree).slice(0, 8).map((n) => n.id)} onSelect={select} />
              <Group title="Components most built on" ids={nodes.filter((n) => n.kind === 'component').sort((a, b) => links.filter((l) => l.kind === 'uses' && l.to === b.id).length - links.filter((l) => l.kind === 'uses' && l.to === a.id).length).slice(0, 8).map((n) => n.id)} onSelect={select} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
