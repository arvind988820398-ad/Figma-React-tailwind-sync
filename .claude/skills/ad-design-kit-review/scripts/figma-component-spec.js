// AD Design Kit — extract the token spec of a Figma component set, one row per variant.
// Run through the Figma MCP `use_figma` tool (fileKey TKsoawKvPxaNCff4q43Mli).
// Fill in PAGE_ID and SET_ID from references/components.json, optionally FILTER / MODE.
//
// MODE 'atom'    — root frame spec + first texts + first icon. Best for Button, Input, Badge…
// MODE 'summary' — root spec + every token used inside (fills, text styles, strokes, radii,
//                  paddings, effects), nested AD Design Kit components ("use") and icon sizes/colors
//                  ("ic"). Nested component instances are listed, not descended into.
//                  Best for Card, Modal, Navbar, Table and other composites.
//
// Values are bound Figma variable names with prefixes stripped (`s2․5` = spacing/2․5).
// `RAW…` marks an unbound value — report it as a Figma finding, not a code error.

const PAGE_ID = '2542:21012';
const SET_ID = '1146:24616';
const MODE = 'atom'; // 'atom' | 'summary'
const FILTER = (v) => true; // e.g. (v) => v.State === 'Initial' && v.Breakpoint !== 'Mobile'
const MAX_ROWS = 60;

const hex = (c) => '#' + [c.r, c.g, c.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
const names = {};
async function V(id) {
  if (!(id in names)) {
    const v = await figma.variables.getVariableByIdAsync(id);
    names[id] = v ? v.name.replace(/^colors\/(background|text|border)\//, '').replace(/^border\/border-(radius|width)\//, '').replace(/^spacing\//, 's') : '?';
  }
  return names[id];
}
async function paint(n, key) {
  const arr = n[key];
  if (!arr || arr === figma.mixed || !arr.length) return null;
  const p = arr.find((x) => x.visible !== false);
  if (!p) return null;
  const op = p.opacity < 1 ? '@' + Math.round(p.opacity * 100) : '';
  if (p.boundVariables && p.boundVariables.color) return (await V(p.boundVariables.color.id)) + op;
  if (p.type === 'SOLID') return 'RAW' + hex(p.color) + op;
  return p.type === 'IMAGE' ? 'img' : p.type.slice(0, 6);
}
// LINE/VECTOR nodes have no per-side stroke weights; fall back to strokeWeight.
async function bound(n, k) {
  if (!(k in n)) k = k.startsWith('stroke') ? 'strokeWeight' : k;
  if (!(k in n)) return null;
  const b = (n.boundVariables || {})[k];
  if (b) return await V(b.id);
  const v = n[k];
  if (v === figma.mixed) return 'mx';
  return typeof v === 'number' && v !== 0 ? 'RAW' + Math.round(v * 10) / 10 : v;
}
async function effect(n) {
  if (n.effectStyleId) { const e = await figma.getStyleByIdAsync(n.effectStyleId); return e ? e.name : '?'; }
  return n.effects && n.effects.some((e) => e.visible !== false) ? 'RAWfx' : null;
}
const lineHeight = (t) => (t.lineHeight === figma.mixed ? 'mx' : t.lineHeight.unit === 'AUTO' ? 'auto' : Math.round(t.lineHeight.value) + (t.lineHeight.unit === 'PIXELS' ? 'px' : '%'));
async function textSpec(t) {
  return `${t.fontSize === figma.mixed ? 'mx' : t.fontSize}/${t.fontName === figma.mixed ? 'mx' : t.fontName.style} ${await paint(t, 'fills')} lh${lineHeight(t)}`;
}

async function root(n) {
  const o = { sz: Math.round(n.width) + 'x' + Math.round(n.height) };
  if (n.layoutMode && n.layoutMode !== 'NONE') {
    o.pad = [await bound(n, 'paddingTop'), await bound(n, 'paddingRight'), await bound(n, 'paddingBottom'), await bound(n, 'paddingLeft')].join(',');
    o.gap = await bound(n, 'itemSpacing');
  }
  if ('cornerRadius' in n) o.r = await bound(n, 'topLeftRadius');
  o.bg = await paint(n, 'fills');
  const st = await paint(n, 'strokes');
  if (st) { o.st = st; o.sw = [await bound(n, 'strokeTopWeight'), await bound(n, 'strokeRightWeight'), await bound(n, 'strokeBottomWeight'), await bound(n, 'strokeLeftWeight')].join('/'); }
  const fx = await effect(n);
  if (fx) o.fx = fx;
  return o;
}

async function atom(n) {
  const o = await root(n);
  if ('findAll' in n) {
    o.t = [];
    for (const t of n.findAll((x) => x.type === 'TEXT' && x.visible).slice(0, 3)) o.t.push(await textSpec(t));
    const ic = n.findOne((x) => x.type === 'INSTANCE' && x.visible);
    if (ic) {
      const vec = ic.findOne((x) => 'fills' in x && x.fills !== figma.mixed && x.fills.length > 0);
      o.icon = Math.round(ic.width) + (vec ? ' ' + (await paint(vec, 'fills')) : '');
    }
  }
  return o;
}

async function summary(r) {
  const T = { bg: new Set(), tx: new Set(), st: new Set(), r: new Set(), pad: new Set(), fx: new Set(), use: new Set(), ic: new Set() };
  const queue = [...(r.children || [])];
  let count = 0;
  while (queue.length && count < 400) {
    const n = queue.shift(); count++;
    if (n.visible === false) continue;
    if (n.type === 'INSTANCE') {
      const hasText = !!n.findOne((x) => x.type === 'TEXT' && x.visible);
      if (!hasText && n.width <= 40) {
        const v = n.findOne((x) => 'fills' in x && x.type !== 'INSTANCE' && x.fills !== figma.mixed && x.fills.length && x.visible);
        T.ic.add(Math.round(n.width) + ':' + (v ? await paint(v, 'fills') : '-'));
        continue;
      }
      const m = await n.getMainComponentAsync();
      const nm = m ? (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name.trim() + '(' + Object.values(m.variantProperties || {}).join('/') + ')' : m.name) : n.name;
      T.use.add(nm.slice(0, 70));
      continue;
    }
    if (n.type === 'TEXT') { T.tx.add(await textSpec(n)); continue; }
    const b = await paint(n, 'fills'); if (b) T.bg.add(b);
    const s = await paint(n, 'strokes'); if (s) T.st.add(s + '/' + (await bound(n, 'strokeTopWeight')));
    if ('cornerRadius' in n) { const rr = await bound(n, 'topLeftRadius'); if (rr) T.r.add(rr); }
    if (n.layoutMode && n.layoutMode !== 'NONE') {
      const p = [await bound(n, 'paddingTop'), await bound(n, 'paddingRight'), await bound(n, 'paddingBottom'), await bound(n, 'paddingLeft')];
      if (p.some((x) => x)) T.pad.add(p.join(',') + ' g' + (await bound(n, 'itemSpacing')));
    }
    const fx = await effect(n); if (fx) T.fx.add(fx);
    if ('children' in n) queue.push(...n.children);
  }
  const o = {};
  for (const [k, v] of Object.entries(T)) if (v.size) o[k] = [...v].slice(0, 14);
  const raw = JSON.stringify(o).match(/RAW[#\w.@-]*/g);
  if (raw) o.raw = [...new Set(raw)].slice(0, 12);
  return o;
}

const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set) throw new Error('SET_ID not found: ' + SET_ID);
const variants = set.type === 'COMPONENT_SET' ? set.children : [set];
const rows = [];
for (const c of variants) {
  const v = c.variantProperties || {};
  if (!FILTER(v)) continue;
  const key = Object.entries(v).map(([k, x]) => `${k}=${x}`).join(', ');
  rows.push(MODE === 'summary' ? `${key} :: ${JSON.stringify(await root(c))} :: ${JSON.stringify(await summary(c))}` : `${key} ${JSON.stringify(await atom(c))}`);
  if (rows.length >= MAX_ROWS) break;
}
let out = `${set.name} — ${variants.length} variants, ${rows.length} shown (${MODE})\n` + rows.join('\n');
if (out.length > 46000) out = out.slice(0, 46000) + '\nTRUNCATED — narrow FILTER';
return out;
