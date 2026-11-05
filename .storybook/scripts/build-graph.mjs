#!/usr/bin/env node
// AD Design Kit knowledge graph for Storybook (Guides → Graph).
//
//   node .storybook/scripts/build-graph.mjs [--check]
//
// Nodes: the registry's components, their categories, the tokens and Figma icons the components use, the app screens
// under src/features and the gaps they recorded for Figma. Edges come from the code itself:
//   component → component   a component file imports another (Dropdown → Button)
//   component → token       a token class in the component's source (bg-brand, rounded-base, shadow-lg…)
//   component → icon        an icon imported from components/icons
//   screen → component      a screen imports a component
//   screen → gap            a `// ad-design-kit-gap: <id>` marker in the screen
//   component → category    the registry category (hub nodes that cluster the graph)
// The layout is a seeded force simulation run here, so the page renders instantly and the same code always gives the
// same picture. Writes .storybook/generated/ad-design-kit-graph.ts; --check exits 1 when it is stale.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const skill = path.join(root, '.claude/skills/ad-design-kit-design-system');
const outFile = path.join(here, '..', 'generated', 'ad-design-kit-graph.ts');
const check = process.argv.includes('--check');
const read = (p) => fs.readFileSync(p, 'utf8');

const registryFile = JSON.parse(read(path.join(skill, 'references/components.json')));
const registry = registryFile.components;
const fileKey = registryFile.fileKey || manifestFileKey();
const manifest = JSON.parse(read(path.join(skill, 'tokens/token-manifest.json')));
function manifestFileKey() {
  return JSON.parse(read(path.join(skill, 'tokens/token-manifest.json'))).generatedFrom.fileKey;
}
const icons = JSON.parse(read(path.join(skill, 'icons/figma-icons.json'))).icons;
const gaps = JSON.parse(read(path.join(root, '.claude/skills/ad-design-kit-compose/references/gaps.json'))).gaps;
const tokenCss = read(path.join(root, 'src/styles/ad-design-kit.css'));
const uiDir = path.join(root, 'src/components/ui');
const featuresDir = path.join(root, 'src/features');

const nodes = new Map();
const edges = new Map();
const node = (id, n) => {
  if (!nodes.has(id)) nodes.set(id, { id, ...n });
  return nodes.get(id);
};
const edge = (from, to, kind) => {
  if (from === to) return;
  const key = `${from}→${to}`;
  if (!edges.has(key)) edges.set(key, { from, to, kind });
};

// ---------- components and categories ----------
const host = (c) => path.basename(c.template).replace(/\.tsx$/, '');
const fileOf = new Map(); // ui file basename → component ids defined there
for (const c of registry) {
  const h = host(c);
  node(`c:${c.react}`, { kind: 'component', label: c.react, group: c.doc.split('#')[0].replace('.md', ''), host: h, figma: c.node ? `https://www.figma.com/design/${fileKey}/?node-id=${c.node.replace(':', '-')}` : null, figmaName: c.figmaName });
  (fileOf.get(h) || fileOf.set(h, []).get(h)).push(`c:${c.react}`);
}
const categoryLabels = Object.fromEntries([...read(path.join(here, '..', 'ad-design-kit/figma.ts')).matchAll(/'?([a-z-]+)'?:\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));
for (const n of [...nodes.values()]) {
  node(`cat:${n.group}`, { kind: 'category', label: categoryLabels[n.group] ?? n.group, group: n.group });
  edge(n.id, `cat:${n.group}`, 'category');
}

// ---------- tokens ----------
const shadowNames = [...tokenCss.matchAll(/--shadow-([\w-]+):/g)].map((m) => `shadow-${m[1]}`);
const tokenRole = new Map();
for (const [cls, t] of Object.entries(manifest.tokens)) tokenRole.set(cls, t.role || (cls.startsWith('rounded') ? 'radius' : 'type'));
for (const s of shadowNames) tokenRole.set(s, 'shadow');
// fill-*/stroke-* use the background tokens; ring/outline/divide use the border tokens.
const alias = (cls) => {
  const m = /^(fill|stroke)-(.+)$/.exec(cls);
  if (m && tokenRole.has(`bg-${m[2]}`)) return `bg-${m[2]}`;
  const b = /^(ring|outline|divide)-(.+)$/.exec(cls);
  if (b && tokenRole.has(`border-${b[2]}`)) return `border-${b[2]}`;
  return cls;
};
function tokensIn(src) {
  const found = new Set();
  for (const m of src.matchAll(/[\w:[\]&>*.-]*?((?:bg|text|border|fill|stroke|ring|outline|divide|rounded|shadow|font)-[a-z0-9-]+|rounded)(?![\w-])/g)) {
    const cls = alias(m[1]);
    if (tokenRole.has(cls)) found.add(cls);
  }
  return found;
}
const tokenValue = (cls) => {
  const t = manifest.tokens[cls];
  if (!t?.values) return null;
  return Object.fromEntries(Object.entries(t.values).map(([k, v]) => [k, String(v).split(' ')[0]]));
};

// ---------- icons ----------
const pascal = (n) => n.split(/[^a-zA-Z0-9]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join('');
const iconGroup = new Map(icons.map((i) => [`${pascal(i.name)}Icon`, { group: i.group, figma: i.figmaName }]));
const iconsIn = (src) => new Set([...src.matchAll(/import\s*\{([^}]*)\}\s*from\s*'[^']*\/icons'/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter((n) => iconGroup.has(n))));

// ---------- component sources ----------
const importsOf = (src) => [...src.matchAll(/from\s*'\.\/(\w+)'/g)].map((m) => m[1]);
for (const [h, ids] of fileOf) {
  const src = read(path.join(uiDir, `${h}.tsx`));
  const primary = ids[0];
  for (const imp of importsOf(src)) for (const target of fileOf.get(imp) || []) edge(primary, target, 'uses');
  // Parts exported from the same file (Label, HelperText in Input.tsx) are part of their host.
  for (const other of ids.slice(1)) edge(other, primary, 'uses');
  for (const t of tokensIn(src)) {
    node(`t:${t}`, { kind: 'token', label: t, group: tokenRole.get(t), values: tokenValue(t) });
    edge(primary, `t:${t}`, 'token');
  }
  for (const i of iconsIn(src)) {
    const info = iconGroup.get(i);
    node(`i:${i}`, { kind: 'icon', label: i, group: info.group, figmaName: info.figma });
    edge(primary, `i:${i}`, 'icon');
  }
}

// ---------- screens and gaps ----------
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(dir, e.name)] : []));
if (fs.existsSync(featuresDir)) {
  for (const screen of fs.readdirSync(featuresDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()) {
    const id = `s:${screen}`;
    node(id, { kind: 'screen', label: screen, group: 'screens', path: `src/features/${screen}` });
    for (const file of walk(path.join(featuresDir, screen))) {
      const src = read(file);
      for (const m of src.matchAll(/from\s*'[^']*components\/ui\/(\w+)'/g)) for (const target of fileOf.get(m[1]) || []) edge(id, target, 'screen');
      for (const m of src.matchAll(/ad-design-kit-gap:\s*([a-z0-9-]+)/g)) {
        const g = gaps.find((x) => x.id === m[1]);
        if (!g) continue;
        node(`g:${g.id}`, { kind: 'gap', label: g.title, group: g.status, proposal: g.proposal, standIn: g.standIn });
        edge(id, `g:${g.id}`, 'gap');
      }
    }
  }
}
for (const g of gaps) if (!nodes.has(`g:${g.id}`)) node(`g:${g.id}`, { kind: 'gap', label: g.title, group: g.status, proposal: g.proposal, standIn: g.standIn });

// ---------- layout: seeded force simulation ----------
const list = [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id));
const links = [...edges.values()].sort((a, b) => `${a.from}${a.to}`.localeCompare(`${b.from}${b.to}`));
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const index = new Map(list.map((n, i) => [n.id, i]));
const N = list.length;
const pos = list.map((n, i) => {
  const a = (i / N) * Math.PI * 2;
  const r = n.kind === 'category' ? 120 : n.kind === 'component' ? 260 : 420;
  return [Math.cos(a) * r + rand() * 40, Math.sin(a) * r + rand() * 40];
});
const degree = new Array(N).fill(0);
for (const l of links) {
  degree[index.get(l.from)]++;
  degree[index.get(l.to)]++;
}
const strength = { category: 0.5, uses: 0.35, screen: 0.2, gap: 0.4, token: 0.14, icon: 0.2 };
const ideal = { category: 70, uses: 90, screen: 160, gap: 70, token: 120, icon: 70 };
for (let it = 0; it < 500; it++) {
  const t = 1 - it / 500;
  const force = pos.map(() => [0, 0]);
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      let dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1];
      let d2 = dx * dx + dy * dy;
      if (d2 < 1) { dx = rand() - 0.5; dy = rand() - 0.5; d2 = 1; }
      if (d2 > 640000) continue;
      const f = 1800 / d2;
      force[i][0] += dx * f; force[i][1] += dy * f;
      force[j][0] -= dx * f; force[j][1] -= dy * f;
    }
  }
  for (const l of links) {
    const a = index.get(l.from), b = index.get(l.to);
    const dx = pos[b][0] - pos[a][0], dy = pos[b][1] - pos[a][1];
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const f = ((d - ideal[l.kind]) * strength[l.kind]) / d;
    force[a][0] += dx * f; force[a][1] += dy * f;
    force[b][0] -= dx * f; force[b][1] -= dy * f;
  }
  for (let i = 0; i < N; i++) {
    force[i][0] -= pos[i][0] * 0.02;
    force[i][1] -= pos[i][1] * 0.02;
    const step = Math.min(Math.hypot(force[i][0], force[i][1]), 30 * t + 1);
    const len = Math.hypot(force[i][0], force[i][1]) || 1;
    pos[i][0] += (force[i][0] / len) * step;
    pos[i][1] += (force[i][1] / len) * step;
  }
}
// Normalise to a 1000-unit-wide box centred on 0, so the page can size dots and labels in screen pixels.
{
  const xs = pos.map((p) => p[0]), ys = pos.map((p) => p[1]);
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  const k = 1000 / (Math.max(...xs) - Math.min(...xs) || 1);
  for (const p of pos) {
    p[0] = (p[0] - cx) * k;
    p[1] = (p[1] - cy) * k;
  }
}
const round = (v) => Math.round(v * 10) / 10;
const graph = {
  nodes: list.map((n, i) => ({ ...n, x: round(pos[i][0]), y: round(pos[i][1]), degree: degree[i] })),
  links,
  counts: Object.fromEntries(['component', 'category', 'token', 'icon', 'screen', 'gap'].map((k) => [k, list.filter((n) => n.kind === k).length])),
};

const header = `// GENERATED by .storybook/scripts/build-graph.mjs — do not edit by hand. Regenerate: npm run docs:build.

export type ADDesignKitGraphKind = 'component' | 'category' | 'token' | 'icon' | 'screen' | 'gap';
export interface ADDesignKitGraphNode {
  id: string;
  kind: ADDesignKitGraphKind;
  label: string;
  group: string;
  x: number;
  y: number;
  degree: number;
  host?: string;
  figma?: string | null;
  figmaName?: string;
  values?: Record<string, string> | null;
  path?: string;
  proposal?: string;
  standIn?: string;
}
export interface ADDesignKitGraphLink { from: string; to: string; kind: 'uses' | 'token' | 'icon' | 'screen' | 'gap' | 'category' }
export interface ADDesignKitGraph { nodes: ADDesignKitGraphNode[]; links: ADDesignKitGraphLink[]; counts: Record<ADDesignKitGraphKind, number> }

export const adDesignKitGraph: ADDesignKitGraph = `;
const output = header + JSON.stringify(graph) + ';\n';
const previous = fs.existsSync(outFile) ? read(outFile) : '';
if (check) {
  const stale = previous !== output;
  console.log(`Graph: ${graph.nodes.length} nodes, ${graph.links.length} links · ${stale ? 'STALE (run npm run docs:build)' : 'up to date'}`);
  process.exit(stale ? 1 : 0);
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, output);
console.log(`Wrote ${path.relative(root, outFile)} — ${graph.nodes.length} nodes (${Object.entries(graph.counts).map(([k, v]) => `${v} ${k}`).join(', ')}), ${graph.links.length} links.`);
