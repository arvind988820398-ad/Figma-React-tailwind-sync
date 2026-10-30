// Run through the Figma MCP `use_figma` tool (file TKsoawKvPxaNCff4q43Mli).
// Builds a generated "Usage guidelines — <Component>" frame for each item in DATA, on that component's page,
// to the left of the page content (frames on the same page sit side by side, 200px apart).
// DATA comes from `node scripts/build-usage-frame-data.mjs` (summary, Use, Don't, Accessibility, code signature
// and Storybook link from generated/figma-descriptions.json; page and set ids from components.json).
// Hand-built frames (figma-usage-frame.js: Button, Input, Table, Modal, Tabs, Navbar) are richer; this script never
// touches a frame whose component is listed in HAND_BUILT.
// Every color, spacing and radius is bound to a variable and every text uses a local text style. Examples are real
// instances: one per value of the main variant property, plus State and Size rows when the set has them.
// No page switching: nodes are created then moved to their page, so one call can cover many pages.
const DATA = [/* paste here */];
const HAND_BUILT = ['Button', 'Input', 'Table', 'Modal', 'Tabs', 'Navbar'];

for (const s of ['Regular', 'Medium', 'Semi Bold', 'Bold']) await figma.loadFontAsync({ family: 'Inter', style: s });
const VC = {};
const V = async (id) => VC[id] || (VC[id] = await figma.variables.getVariableByIdAsync(id));
const C = { surface: 'VariableID:1260:615', sunken: 'VariableID:1260:540', border: 'VariableID:1260:542', heading: 'VariableID:1260:580', body: 'VariableID:1260:606', subtle: 'VariableID:1260:618' };
const R = { base: 'VariableID:1146:444' };
const SP = { 2: 'VariableID:1146:15', 3: 'VariableID:1146:16', 4: 'VariableID:1146:17', 6: 'VariableID:1146:19', 8: 'VariableID:1146:21', 12: 'VariableID:1146:25' };
const ST = {
  h1: 'S:4effbe5d2e5e7674543f995446680731e272920b,', h2: 'S:5d64dbcf94656b0127d969b9abb249455b63f29e,',
  lead: 'S:5237613a235559f197bed8347ae4d7a1655277c0,', sm: 'S:b9bd8cb05dc4e86ec3ec07d739b91e66231b3957,',
  xsMed: 'S:81269762dad5dfbd2dde1d871a7526169a2ce27f,',
};
const paint = async (id) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await V(id));
const pad = async (f, n) => { for (const k of ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']) f.setBoundVariable(k, await V(SP[n])); };
const radius = async (f) => { for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) f.setBoundVariable(k, await V(R.base)); };
const box = async (dir, o = {}) => {
  const f = figma.createAutoLayout(dir);
  f.name = o.name || 'Frame';
  f.fills = o.fill ? [await paint(o.fill)] : [];
  if (o.gap) f.setBoundVariable('itemSpacing', await V(SP[o.gap]));
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
const verdict = (kind) => verdictSet.children.find((c) => c.name === 'Kind=' + kind).createInstance();
const section = async (parent, title, intro) => {
  const s = await box('VERTICAL', { name: title, gap: 6 });
  add(parent, s, true);
  add(s, await txt(title, 'h2', 'heading'));
  if (intro) add(s, await txt(intro, 'sm', 'body', 1000));
  return s;
};
const fit = (n, maxW, maxH) => { const k = Math.min(1, maxW / n.width, maxH / n.height); if (k < 1) n.rescale(k); return n; };
const labeled = async (node, label) => {
  const f = await box('VERTICAL', { name: label, gap: 2 });
  f.counterAxisAlignItems = 'CENTER';
  f.appendChild(node);
  f.appendChild(await txt(label, 'xsMed', 'subtle'));
  return f;
};
const wrapRow = async (parent, name) => {
  const r = await box('HORIZONTAL', { name, fill: C.sunken, pad: 8, gap: 8, radius: true });
  add(parent, r, true);
  r.layoutWrap = 'WRAP';
  r.setBoundVariable('counterAxisSpacing', await V(SP[8]));
  r.counterAxisAlignItems = 'MIN';
  return r;
};
const variantProps = (set) => {
  const out = {};
  for (const [k, d] of Object.entries(set.componentPropertyDefinitions)) if (d.type === 'VARIANT') out[k] = d.variantOptions;
  return out;
};
const parse = (name) => Object.fromEntries(name.split(', ').map((p) => p.split('=')));
const pick = (set, prop, value) => {
  const base = parse(set.defaultVariant.name);
  const want = Object.assign({}, base, { [prop]: value });
  const exact = set.children.find((c) => { const v = parse(c.name); return Object.entries(want).every(([k, x]) => v[k] === x); });
  return exact || set.children.find((c) => parse(c.name)[prop] === value);
};
const row = async (parent, set, prop, values, title, intro) => {
  const s = await section(parent, title, intro);
  const r = await wrapRow(s, title);
  for (const v of values.slice(0, 12)) {
    const c = pick(set, prop, v);
    if (!c) continue;
    r.appendChild(await labeled(fit(c.createInstance(), 400, 320), v));
  }
};

const done = [];
const skipped = [];
for (const d of DATA) {
  if (HAND_BUILT.includes(d.react)) { skipped.push(d.react); continue; }
  const page = await figma.getNodeByIdAsync(d.page);
  await page.loadAsync();
  const set = await figma.getNodeByIdAsync(d.node);
  if (!set || set.type !== 'COMPONENT_SET') { skipped.push(d.react + ' (not a set)'); continue; }
  const name = 'Usage guidelines — ' + d.react;
  for (const old of page.children.filter((n) => n.name === name)) old.remove();
  const W = await box('VERTICAL', { name, fill: C.surface, stroke: C.border, pad: 12, gap: 12, radius: true });
  W.resize(1440, 100);
  W.primaryAxisSizingMode = 'AUTO';
  const h = await box('VERTICAL', { name: 'Header', gap: 3 });
  add(W, h, true);
  add(h, await txt(d.react + ' — usage guidelines', 'h1', 'heading'));
  add(h, await txt(d.summary, 'lead', 'body', 1100));
  add(h, await txt(`Code: ${d.code}   ·   Docs: ${d.docUrl}   ·   Generated from the code docs; edit those, not this frame.`, 'sm', 'subtle', 1200));
  const u = await section(W, 'When to use');
  const pr = await box('HORIZONTAL', { name: 'Do and don’t', gap: 6 });
  add(u, pr, true);
  pr.counterAxisAlignItems = 'MIN';
  for (const [kind, text] of [['Do', d.use], ['Don’t', d.dont]]) {
    const v = verdict(kind);
    add(pr, v);
    v.layoutSizingHorizontal = 'FILL';
    v.setProperties({ 'Caption#19342:2': text });
  }
  const props = variantProps(set);
  const order = ['Type', 'Variant', 'Color', 'Theme', 'Style', 'Device', 'Orientation', 'Direction', 'Position'];
  const main = order.find((k) => props[k] && props[k].length > 1) || Object.keys(props).find((k) => props[k].length > 1 && !['State', 'Size', 'Breakpoint', 'User', 'Keyboard'].includes(k));
  if (main) await row(W, set, main, props[main], main === 'Type' ? 'Variants' : main, `Figma property "${main}". Swap the instances to explore.`);
  else if (props.Keyboard) await row(W, set, 'Keyboard', props.Keyboard, 'Examples', 'A sample of the keys in the set.');
  const colorProp = ['Color', 'Theme'].find((k) => k !== main && props[k] && props[k].length > 1);
  if (colorProp) await row(W, set, colorProp, props[colorProp], 'Colors', `Figma property "${colorProp}".`);
  if (props.State && main !== 'State' && props.State.length > 1) await row(W, set, 'State', props.State, 'States', 'Hover, focus and disabled are CSS states in code, never props.');
  if (props.Size && props.Size.length > 1) await row(W, set, 'Size', props.Size, 'Sizes', 'Use the default size unless the layout needs another.');
  const a = await section(W, 'Accessibility');
  const l = await box('VERTICAL', { name: 'List', gap: 2 });
  add(a, l, true);
  for (const it of d.a11y) add(l, await txt('•  ' + it, 'sm', 'body', 1100), true);
  // place left of the page content and of any usage frame already there
  page.appendChild(W);
  const others = page.children.filter((n) => n !== W && n.name.startsWith('Usage guidelines'));
  const content = page.children.filter((n) => n !== W && !n.name.startsWith('Usage guidelines') && !n.name.startsWith('_'));
  const left = Math.min(0, ...content.map((n) => n.x), ...others.map((n) => n.x));
  W.x = left - 1640;
  W.y = 0;
  done.push({ react: d.react, id: W.id, h: Math.round(W.height) });
}
return { done, skipped };
