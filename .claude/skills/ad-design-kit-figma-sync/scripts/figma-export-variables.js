// AD Design Kit — Figma variable/effect exporter.
// Run through the Figma MCP `use_figma` tool (Plugin API: top-level await + return).
// Set PART, run, and save the returned string verbatim:
//   'primitives' -> ad-design-kit-design-system/tokens/figma-primitives.json
//   'themes'     -> ad-design-kit-design-system/tokens/figma-themes.json
//   'effects'    -> ad-design-kit-design-system/tokens/figma-effects.json (all local effect styles; focus rings
//                   carry `colorToken` instead of a literal color)
// Aliases are written "{variable/name}" (to the Primitives collection) or "{~variable/name}" (same collection).
// A token identical in every mode is written once; otherwise as an array in `modes` order.

const PART = 'themes'; // 'primitives' | 'themes' | 'effects'

const hex = (c) => {
  const h = [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  const a = c.a !== undefined && c.a < 1 ? Math.round(c.a * 255).toString(16).padStart(2, '0') : '';
  return '#' + h + a;
};
const exportedAt = new Date().toISOString();

if (PART === 'effects') {
  const styles = await figma.getLocalEffectStylesAsync();
  const effects = {};
  for (const s of styles) {
    effects[s.name] = [];
    for (const e of s.effects.filter((e) => e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW')) {
      const o = { x: e.offset.x, y: e.offset.y, blur: e.radius, spread: Math.round((e.spread || 0) * 100) / 100 };
      // Focus rings bind their color to a Themes variable, so they follow theme and dark mode.
      const bound = e.boundVariables && e.boundVariables.color;
      const tv = bound && (await figma.variables.getVariableByIdAsync(bound.id));
      if (tv) o.colorToken = tv.name;
      else Object.assign(o, { color: hex({ r: e.color.r, g: e.color.g, b: e.color.b }), alpha: Math.round(e.color.a * 1000) / 1000 });
      if (e.type === 'INNER_SHADOW') o.inset = true;
      effects[s.name].push(o);
    }
  }
  return JSON.stringify({ source: { fileKey: figma.fileKey || 'TKsoawKvPxaNCff4q43Mli', collection: 'Effect styles', exportedAt }, effects });
}

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const col = collections.find((c) => c.name === (PART === 'primitives' ? 'Primitives' : 'Themes'));
if (!col) throw new Error('Collection not found for PART=' + PART + '. Collections: ' + collections.map((c) => c.name).join(', '));

// Themes colors alias the local Primitives collection. Warn if any alias points elsewhere (e.g. a
// re-linked library), because local Primitive edits would then stop reaching the themes.
const localPrim = {};
const primCol = collections.find((c) => c.name === 'Primitives');
if (PART === 'themes' && primCol) {
  for (const id of primCol.variableIds) {
    const p = await figma.variables.getVariableByIdAsync(id);
    const pv = p.valuesByMode[primCol.modes[0].modeId];
    localPrim[p.name] = p.resolvedType === 'COLOR' ? hex(pv) : pv;
  }
}
const warnings = [];
const cache = {};
async function fmt(v, val) {
  if (val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS') {
    if (!cache[val.id]) {
      const target = await figma.variables.getVariableByIdAsync(val.id);
      cache[val.id] = (target.variableCollectionId === col.id ? '~' : '') + target.name;
      if (PART === 'themes' && target.variableCollectionId !== col.id && (!primCol || target.variableCollectionId !== primCol.id)) {
        const tv = Object.values(target.valuesByMode)[0];
        const resolved = tv && tv.type === 'VARIABLE_ALIAS' ? 'alias' : target.resolvedType === 'COLOR' ? hex(tv) : tv;
        if (!(target.name in localPrim)) warnings.push(`Remote alias ${target.name} has no local Primitive`);
        else if (resolved !== localPrim[target.name]) warnings.push(`Remote ${target.name}=${resolved} differs from local Primitive ${localPrim[target.name]}`);
      }
    }
    return '{' + cache[val.id] + '}';
  }
  if (v.resolvedType === 'COLOR') return hex(val);
  if (typeof val === 'number') return Math.round(val * 1000) / 1000;
  return val;
}

const tokens = {};
for (const id of col.variableIds) {
  const v = await figma.variables.getVariableByIdAsync(id);
  const vals = [];
  for (const m of col.modes) vals.push(await fmt(v, v.valuesByMode[m.modeId]));
  const same = vals.every((x) => x === vals[0]);
  tokens[v.name] = { t: v.resolvedType[0], v: same ? vals[0] : vals };
}

return JSON.stringify({
  source: { fileKey: figma.fileKey || 'TKsoawKvPxaNCff4q43Mli', collection: col.name, exportedAt },
  modes: col.modes.map((m) => m.name.replace(/\s+/g, ' ').trim()),
  ...(warnings.length ? { warnings } : {}),
  tokens,
});
