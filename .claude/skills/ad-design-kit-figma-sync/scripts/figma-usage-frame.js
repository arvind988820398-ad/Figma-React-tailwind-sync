// Run through the Figma MCP `use_figma` tool (file TKsoawKvPxaNCff4q43Mli), one call per component page.
// Builds (or rebuilds) the hand-made "Usage guidelines — <Component>" frame to the left of a component page's content:
// Header · Anatomy · Do and don't · States or Variants · Sizes / Specs · Accessibility.
//
// Rules the helpers enforce:
// - every color, padding, gap and radius is bound to a Themes / spacing variable; every text uses a local text style
//   (text-3xl/font-bold, text-xl/font-semibold, text-base/font-normal, text-sm/*, text-xs/font-medium);
// - examples are real instances of the page's component set (variant(set, {Prop: 'Value'})), never drawings;
// - Do / Don't captions use the unpublished `_Usage / Verdict` set (19342:1039, Buttons page);
// - a Don't that cannot be shown honestly with a real component is a short text description in the stage;
// - all text comes from the component's doc section (Use / Don't / A11y lines and the recipe), so Figma,
//   Storybook and the code docs agree. Re-run the page's script after the doc changes.
//
// Existing frames: Buttons 2542:21012 · Forms (Input) 3279:34618 · Tables 3284:22719 · Modals 3284:23179 ·
// Nav Tabs 3283:24214 · Navbar 3279:21067. Each sits at x = -1640, y = 0, width 1440.
//
// To add a page: copy everything above "CONTENT", set PAGE and the set id, then write the sections with
// header(), section(), parts(), pairRow(), wrapRow() + labeled(), table() and bullets().

const PAGE = '2542:21012';
const X = -1640;
const Y = 0;
const page = await figma.getNodeByIdAsync(PAGE);
await figma.setCurrentPageAsync(page);
for (const s of ['Regular', 'Medium', 'Semi Bold', 'Bold']) await figma.loadFontAsync({ family: 'Inter', style: s });

const VC = {};
const V = async (id) => VC[id] || (VC[id] = await figma.variables.getVariableByIdAsync(id));
const C = {
  surface: 'VariableID:1260:615', // bg-neutral-primary-soft
  sunken: 'VariableID:1260:540', // bg-neutral-secondary-soft
  border: 'VariableID:1260:542', // border-default
  heading: 'VariableID:1260:580', // text-heading
  body: 'VariableID:1260:606', // text-body
  subtle: 'VariableID:1260:618', // text-body-subtle
};
const R = { base: 'VariableID:1146:444' }; // rounded-base
const SP = { 2: 'VariableID:1146:15', 3: 'VariableID:1146:16', 4: 'VariableID:1146:17', 6: 'VariableID:1146:19', 8: 'VariableID:1146:21', 12: 'VariableID:1146:25' };
const ST = {
  h1: 'S:4effbe5d2e5e7674543f995446680731e272920b,', // text-3xl/font-bold
  h2: 'S:5d64dbcf94656b0127d969b9abb249455b63f29e,', // text-xl/font-semibold
  lead: 'S:5237613a235559f197bed8347ae4d7a1655277c0,', // text-base/font-normal
  sm: 'S:b9bd8cb05dc4e86ec3ec07d739b91e66231b3957,', // text-sm/font-normal
  smMed: 'S:10ae0a7cdbb8831cacc73bddb8aa217c4b379bfe,', // text-sm/font-medium
  smSemi: 'S:70b8f18a5ec85ae39f8d93086f7ae6b41541728b,', // text-sm/font-semibold
  xsMed: 'S:81269762dad5dfbd2dde1d871a7526169a2ce27f,', // text-xs/font-medium
};
const paint = async (id) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await V(id));
const pad = async (f, n) => { for (const k of ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']) f.setBoundVariable(k, await V(SP[n])); };
const gap = async (f, n) => f.setBoundVariable('itemSpacing', await V(SP[n]));
const radius = async (f) => { for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) f.setBoundVariable(k, await V(R.base)); };
const box = async (dir, o = {}) => {
  const f = figma.createAutoLayout(dir);
  f.name = o.name || 'Frame';
  f.fills = o.fill ? [await paint(o.fill)] : [];
  if (o.gap) await gap(f, o.gap);
  if (o.pad) await pad(f, o.pad);
  if (o.radius) await radius(f);
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
const verdictSet = await figma.getNodeByIdAsync('19342:1039');
const variant = (set, props) => set.children.find((c) => Object.entries(props).every(([k, v]) => c.name.split(', ').includes(`${k}=${v}`)));
const inst = (set, props, over, scale) => {
  const v = variant(set, props);
  if (!v) throw new Error('No variant ' + JSON.stringify(props));
  const i = v.createInstance();
  if (over) i.setProperties(over);
  if (scale) i.rescale(scale);
  return i;
};
const section = async (parent, title, intro) => {
  const s = await box('VERTICAL', { name: title, gap: 6 });
  add(parent, s, true);
  add(s, await txt(title, 'h2', 'heading'));
  if (intro) add(s, await txt(intro, 'sm', 'body', 900));
  return s;
};
const stage = async (name) => {
  const f = await box('HORIZONTAL', { name, fill: C.sunken, pad: 8, gap: 4, radius: true });
  f.counterAxisAlignItems = 'CENTER';
  f.primaryAxisAlignItems = 'CENTER';
  f.minHeight = 160;
  return f;
};
const card = async (parent, kind, caption, nodes) => {
  const c = await box('VERTICAL', { name: kind + ' card', gap: 3 });
  add(parent, c);
  c.layoutSizingHorizontal = 'FILL';
  const st = await stage('Example');
  add(c, st, true);
  if (typeof nodes === 'string') {
    const t = await txt(nodes, 'sm', 'subtle', 480);
    t.textAlignHorizontal = 'CENTER';
    st.appendChild(t);
  } else for (const n of nodes) st.appendChild(n);
  const v = variant(verdictSet, { Kind: kind }).createInstance();
  add(c, v, true);
  v.setProperties({ 'Caption#19342:2': caption });
  return c;
};
const pairRow = async (parent, doCap, doNodes, dontCap, dontNodes) => {
  const r = await box('HORIZONTAL', { name: 'Pair', gap: 6 });
  add(parent, r, true);
  r.counterAxisAlignItems = 'MIN';
  await card(r, 'Do', doCap, doNodes);
  await card(r, 'Don’t', dontCap, dontNodes);
  return r;
};
const labeled = async (node, label) => {
  const f = await box('VERTICAL', { name: label, gap: 2 });
  f.counterAxisAlignItems = 'CENTER';
  f.appendChild(node);
  f.appendChild(await txt(label, 'xsMed', 'subtle'));
  return f;
};
const bullets = async (parent, items) => {
  const l = await box('VERTICAL', { name: 'List', gap: 2 });
  add(parent, l, true);
  for (const it of items) add(l, await txt('•  ' + it, 'sm', 'body', 1000), true);
  return l;
};
const table = async (parent, rows, widths) => {
  const t = await box('VERTICAL', { name: 'Spec table', stroke: C.border, radius: true });
  t.clipsContent = true;
  add(parent, t, true);
  for (const [i, r] of rows.entries()) {
    const row = await box('HORIZONTAL', { name: 'Row', fill: i === 0 ? C.sunken : null, pad: 3, gap: 4 });
    add(t, row, true);
    for (const [j, cell] of r.entries()) add(row, await txt(cell, i === 0 ? 'smSemi' : 'sm', i === 0 ? 'heading' : 'body', (widths || [])[j] || 190));
  }
  return t;
};
const wrapRow = async (parent, name) => {
  const r = await box('HORIZONTAL', { name, fill: C.sunken, pad: 8, gap: 8, radius: true });
  add(parent, r, true);
  r.layoutWrap = 'WRAP';
  r.setBoundVariable('counterAxisSpacing', await V(SP[8]));
  r.counterAxisAlignItems = 'MAX';
  return r;
};
const header = async (W, title, lead, meta) => {
  const h = await box('VERTICAL', { name: 'Header', gap: 3 });
  add(W, h, true);
  add(h, await txt(title, 'h1', 'heading'));
  add(h, await txt(lead, 'lead', 'body', 1100));
  add(h, await txt(meta, 'sm', 'subtle', 1100));
};
const parts = async (s, stageNode, list, stageW) => {
  const an = await box('HORIZONTAL', { name: 'Anatomy', gap: 12 });
  add(s, an, true);
  an.counterAxisAlignItems = 'CENTER';
  const st = await stage('Example');
  st.resize(stageW || 460, 200);
  st.primaryAxisSizingMode = 'FIXED';
  st.counterAxisSizingMode = 'AUTO'; // resize() fixes both axes; let the height hug the example
  st.appendChild(stageNode);
  an.appendChild(st);
  const al = await box('VERTICAL', { name: 'Parts', gap: 3 });
  add(an, al);
  al.layoutGrow = 1;
  for (const [i, p] of list.entries()) add(al, await txt(`${i + 1}  ${p}`, 'sm', 'body', 760), true);
};
const FRAME = 'Usage guidelines — Button'; // one frame per component
for (const n of page.children.filter((n) => n.name === FRAME)) n.remove();
const W = await box('VERTICAL', { name: FRAME, fill: C.surface, stroke: C.border, pad: 12, gap: 12, radius: true });
W.resize(1440, 100);
W.layoutSizingHorizontal = 'FIXED';
W.primaryAxisSizingMode = 'AUTO';
W.x = X;
W.y = Y;
page.appendChild(W);

// ---------- CONTENT (Button example; text from references/components/actions.md) ----------
const set = await figma.getNodeByIdAsync('1146:24616');
const base = { Color: 'Brand', Size: 'base', State: 'Initial', 'Icon only': 'False', Outline: 'False', 'Logo inside': 'False' };
const B = (o, label) => inst(set, Object.assign({}, base, o), label ? { 'Button text#27:0': label, 'Show left icon#27:451': false, 'Show right icon#27:1804': false } : null);
await header(W, 'Button — usage guidelines', 'Triggers an action: submit a form, open an overlay or start a flow.', 'Code: <Button color size outline iconOnly leftIcon rightIcon>   ·   Storybook: Components / Button');
let s = await section(W, 'Anatomy');
await parts(s, inst(set, Object.assign({}, base, { Size: 'lg' }), { 'Button text#27:0': 'Create project' }), ['Container — bg-brand fill, rounded-base corners, shadow-xs.', 'Left icon — optional, 16px.', 'Label — text-sm, font-medium, text-white. Start with a verb.', 'Right icon — optional; disclosure or external link.'], 420);
s = await section(W, 'Do and don’t');
await pairRow(s, 'Use one Brand button per section and Secondary or Tertiary for the rest.', [B({}, 'Save changes'), B({ Color: 'Tertiary' }, 'Cancel')], 'Don’t put two Brand buttons side by side.', [B({}, 'Save'), B({}, 'Publish')]);
s = await section(W, 'States');
const sr = await wrapRow(s, 'States');
for (const st of ['Initial', 'Hover', 'Focus', 'Disabled']) sr.appendChild(await labeled(B({ State: st }, 'Button'), st));
s = await section(W, 'Accessibility');
await bullets(s, ['A native <button>; type="button" by default.', 'Icon-only buttons need an aria-label and a Tooltip.']);
await W.screenshot({ scale: 0.4 });
return { wrapper: W.id, h: Math.round(W.height) };
