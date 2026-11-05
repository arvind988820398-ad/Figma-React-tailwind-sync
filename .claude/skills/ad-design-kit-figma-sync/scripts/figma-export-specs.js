// AD Design Kit — styling snapshot of the registry's component sets, for the changelog.
// Run through the Figma MCP `use_figma` tool (file TKsoawKvPxaNCff4q43Mli), read-only. Fill SETS with
// [react, node] pairs from references/components.json (`node build-spec-sets.mjs` prints them in batches); run the
// batches in parallel and save every returned line in one .jsonl file for `build-specs.mjs`.
//
// For each set it counts, over all variants, the values of the variant's root frame: corner radius (r), padding
// (pad), gap, fill, border colour and width (st), effect style (fx), height (h) and the first visible text's
// size/weight/colour/line height (tx). Values are Figma variable or style names with prefixes stripped; an unbound
// value is written RAW<value>. Only the set's own root is read: a change inside a nested instance shows up in the
// nested component's own row.

const SETS = [/* ['Button', '1146:24616'], … */];

const K = ['topLeftRadius', 'topRightRadius', 'bottomRightRadius', 'bottomLeftRadius'];
const names = {};
const short = (n) => n.replace(/^colors\/(background|text|border)\//, '').replace(/^border\/border-(radius|width)\//, '').replace(/^spacing\//, 's');
async function vname(id) {
  if (!(id in names)) { const v = await figma.variables.getVariableByIdAsync(id); names[id] = v ? short(v.name) : '?'; }
  return names[id];
}
async function bound(n, k) {
  const b = (n.boundVariables || {})[k];
  if (b) return vname(b.id);
  const v = n[k];
  return v === figma.mixed ? 'mixed' : v ? 'RAW' + Math.round(v * 10) / 10 : '0';
}
async function paint(n, key) {
  const arr = n[key];
  if (!arr || arr === figma.mixed || !arr.length) return 'none';
  const p = arr.find((x) => x.visible !== false);
  if (!p) return 'none';
  const op = p.opacity < 1 ? '@' + Math.round(p.opacity * 100) : '';
  if (p.boundVariables && p.boundVariables.color) return (await vname(p.boundVariables.color.id)) + op;
  if (p.type === 'SOLID') return 'RAW#' + [p.color.r, p.color.g, p.color.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('') + op;
  return p.type.toLowerCase();
}
async function spec(n) {
  const o = {};
  const corners = [];
  for (const k of K) corners.push(k in n ? await bound(n, k) : '0');
  o.r = new Set(corners).size === 1 ? corners[0] : corners.join(' ');
  if (n.layoutMode && n.layoutMode !== 'NONE') {
    o.pad = [await bound(n, 'paddingTop'), await bound(n, 'paddingRight'), await bound(n, 'paddingBottom'), await bound(n, 'paddingLeft')].join(',');
    o.gap = await bound(n, 'itemSpacing');
  }
  o.fill = await paint(n, 'fills');
  const st = await paint(n, 'strokes');
  if (st !== 'none') o.st = st + ' ' + (await bound(n, 'strokeTopWeight' in n ? 'strokeTopWeight' : 'strokeWeight'));
  if (n.effectStyleId) { const e = await figma.getStyleByIdAsync(n.effectStyleId); o.fx = e ? e.name : '?'; }
  else if (n.effects && n.effects.some((e) => e.visible !== false)) o.fx = 'RAWeffect';
  o.h = Math.round(n.height);
  const t = 'findOne' in n ? n.findOne((x) => x.type === 'TEXT' && x.visible) : null;
  if (t) {
    const lh = t.lineHeight === figma.mixed ? 'mixed' : t.lineHeight.unit === 'AUTO' ? 'auto' : Math.round(t.lineHeight.value) + (t.lineHeight.unit === 'PIXELS' ? 'px' : '%');
    o.tx = `${t.fontSize === figma.mixed ? 'mixed' : t.fontSize}/${t.fontName === figma.mixed ? 'mixed' : t.fontName.style} ${await paint(t, 'fills')} lh${lh}`;
  }
  return o;
}

const result = {};
for (const [react, id] of SETS) {
  const set = await figma.getNodeByIdAsync(id);
  if (!set) { result[react] = { missing: true }; continue; }
  const variants = set.type === 'COMPONENT_SET' ? set.children : [set];
  const counts = {};
  for (const v of variants) {
    const s = await spec(v);
    for (const [k, val] of Object.entries(s)) {
      (counts[k] ||= {})[val] = ((counts[k] || {})[val] || 0) + 1;
    }
  }
  result[react] = counts;
}
return JSON.stringify(result);
