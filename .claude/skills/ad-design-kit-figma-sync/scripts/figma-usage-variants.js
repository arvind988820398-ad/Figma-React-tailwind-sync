// Run through the Figma MCP `use_figma` tool (file TKsoawKvPxaNCff4q43Mli).
// Adds (or replaces) the "Variants — when to use" section in each "Usage guidelines — <Component>" frame: one table row
// per variant value with its code, when to use it and when not to.
// DATA comes from `node scripts/build-variant-guidance.mjs [Component …]`, which reads the "**Variants**" table of each
// component's doc section, so Figma and Storybook say the same thing. Edit the doc, never this frame.
// Run it after figma-usage-frame.js or figma-usage-frame-generic.js (a rebuilt frame loses the section). Keep each call
// under the 50 KB code limit (about 10 components per call); calls on different pages can run in parallel.
// The section goes after "When to use" (generated frames) or "Do and don’t" (hand-built frames).
const DATA = [/* paste here */];

for (const s of ['Regular', 'Semi Bold']) await figma.loadFontAsync({ family: 'Inter', style: s });
const VC = {};
const V = async (id) => VC[id] || (VC[id] = await figma.variables.getVariableByIdAsync(id));
const C = { sunken: 'VariableID:1260:540', border: 'VariableID:1260:542', heading: 'VariableID:1260:580', body: 'VariableID:1260:606' };
const R = { base: 'VariableID:1146:444' };
const SP = { 3: 'VariableID:1146:16', 4: 'VariableID:1146:17', 6: 'VariableID:1146:19' };
const ST = {
  h2: 'S:5d64dbcf94656b0127d969b9abb249455b63f29e,', // text-xl/font-semibold
  sm: 'S:b9bd8cb05dc4e86ec3ec07d739b91e66231b3957,', // text-sm/font-normal
  smSemi: 'S:70b8f18a5ec85ae39f8d93086f7ae6b41541728b,', // text-sm/font-semibold
};
const paint = async (id) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await V(id));
const box = async (dir, o = {}) => {
  const f = figma.createAutoLayout(dir);
  f.name = o.name || 'Frame';
  f.fills = o.fill ? [await paint(o.fill)] : [];
  if (o.gap) f.setBoundVariable('itemSpacing', await V(SP[o.gap]));
  if (o.pad) for (const k of ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']) f.setBoundVariable(k, await V(SP[o.pad]));
  if (o.radius) for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) f.setBoundVariable(k, await V(R.base));
  if (o.stroke) { f.strokes = [await paint(o.stroke)]; f.strokeWeight = 1; }
  return f;
};
const txt = async (s, style, color, w) => {
  const t = figma.createText();
  t.textStyleId = ST[style];
  t.characters = s;
  t.fills = [await paint(C[color])];
  if (w) { t.resize(w, 20); t.textAutoResize = 'HEIGHT'; }
  return t;
};
const add = (p, c, fill) => { p.appendChild(c); if (fill) c.layoutSizingHorizontal = 'FILL'; return c; };
const SECTION = 'Variants — when to use';
const WIDTHS = [190, 230, 420, 420];

const done = [];
const skipped = [];
for (const d of DATA) {
  const page = await figma.getNodeByIdAsync(d.page);
  await page.loadAsync();
  const W = page.children.find((n) => n.name === 'Usage guidelines — ' + d.react);
  if (!W) { skipped.push(d.react + ' (no usage frame)'); continue; }
  for (const old of W.children.filter((n) => n.name === SECTION)) old.remove();
  const s = await box('VERTICAL', { name: SECTION, gap: 6 });
  add(s, await txt(SECTION, 'h2', 'heading'));
  add(s, await txt('One row per Figma variant. Hover, focus and disabled are CSS states and breakpoints are responsive classes, so they are not listed.', 'sm', 'body', 1100));
  const t = await box('VERTICAL', { name: 'Variant table', stroke: C.border, radius: true });
  t.clipsContent = true;
  add(s, t);
  const rows = [['Variant', 'Code', 'Use when', 'Don’t use when'], ...d.rows];
  for (const [i, r] of rows.entries()) {
    const row = await box('HORIZONTAL', { name: i === 0 ? 'Header' : r[0], fill: i === 0 ? C.sunken : null, pad: 3, gap: 4 });
    add(t, row);
    if (i > 0 && i < rows.length) { row.strokes = [await paint(C.border)]; row.strokeTopWeight = 1; row.strokeBottomWeight = 0; row.strokeLeftWeight = 0; row.strokeRightWeight = 0; }
    for (const [j, cell] of r.slice(0, 4).entries()) add(row, await txt(cell || '—', i === 0 || j === 0 ? 'smSemi' : 'sm', i === 0 || j === 0 ? 'heading' : 'body', WIDTHS[j]));
    row.layoutSizingHorizontal = 'FILL';
  }
  t.layoutSizingHorizontal = 'FILL';
  const after = W.children.find((n) => n.name === 'When to use') || W.children.find((n) => n.name === 'Do and don’t');
  const before = W.children.find((n) => n.name === 'Accessibility');
  const idx = after ? W.children.indexOf(after) + 1 : before ? W.children.indexOf(before) : 1;
  W.insertChild(idx, s);
  s.layoutSizingHorizontal = 'FILL';
  done.push({ react: d.react, frame: W.id, rows: d.rows.length });
}
return { done, skipped };
