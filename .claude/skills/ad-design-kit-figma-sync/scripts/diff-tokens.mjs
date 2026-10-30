#!/usr/bin/env node
// Compare two AD Design Kit token exports (the committed one vs a fresh Figma export).
//
//   node diff-tokens.mjs --old <dir> --new <dir> [--json]
//
// Each dir holds figma-primitives.json, figma-themes.json and (optionally) figma-effects.json.
// Prints added / removed / renamed-looking / changed tokens, per mode for themed tokens.
// Exit code 0 = identical, 3 = differences found (so CI can detect drift).

import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const oldDir = opt('--old'), newDir = opt('--new');
if (!oldDir || !newDir) { console.error('usage: diff-tokens.mjs --old <dir> --new <dir> [--json]'); process.exit(2); }

const load = (dir, f) => { const p = path.join(dir, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null; };
const changes = [];
const push = (kind, file, token, detail) => changes.push({ kind, file, token, detail });

function diffCollection(file) {
  const a = load(oldDir, file), b = load(newDir, file);
  if (!a || !b) { if (a || b) push(a ? 'removed-file' : 'added-file', file, '', ''); return; }
  if (JSON.stringify(a.modes) !== JSON.stringify(b.modes)) push('modes', file, '', `${a.modes.join(', ')}  →  ${b.modes.join(', ')}`);
  const modes = b.modes;
  const val = (t, i) => (Array.isArray(t.v) ? t.v[i] : t.v);
  const removed = Object.keys(a.tokens).filter((k) => !(k in b.tokens));
  const added = Object.keys(b.tokens).filter((k) => !(k in a.tokens));
  // Pair removed/added with identical values as probable renames.
  for (const r of [...removed]) {
    const same = added.find((n) => JSON.stringify(a.tokens[r].v) === JSON.stringify(b.tokens[n].v));
    if (same) { push('renamed', file, r, `→ ${same}`); removed.splice(removed.indexOf(r), 1); added.splice(added.indexOf(same), 1); }
  }
  for (const r of removed) push('removed', file, r, JSON.stringify(a.tokens[r].v));
  for (const n of added) push('added', file, n, JSON.stringify(b.tokens[n].v));
  for (const k of Object.keys(b.tokens)) {
    if (!(k in a.tokens)) continue;
    const ta = a.tokens[k], tb = b.tokens[k];
    if (JSON.stringify(ta.v) === JSON.stringify(tb.v)) continue;
    const perMode = modes.map((m, i) => [m, val(ta, i), val(tb, i)]).filter(([, x, y]) => x !== y);
    push('changed', file, k, perMode.map(([m, x, y]) => `${m}: ${x} → ${y}`).join('; '));
  }
  for (const w of b.warnings || []) push('figma-warning', file, '', w);
}

diffCollection('figma-primitives.json');
diffCollection('figma-themes.json');

const ea = load(oldDir, 'figma-effects.json'), eb = load(newDir, 'figma-effects.json');
if (ea && eb) {
  for (const k of new Set([...Object.keys(ea.effects), ...Object.keys(eb.effects)])) {
    if (!(k in eb.effects)) { if (!k.startsWith('focus-')) push('removed', 'figma-effects.json', k, ''); continue; }
    if (!(k in ea.effects)) { push('added', 'figma-effects.json', k, JSON.stringify(eb.effects[k])); continue; }
    if (JSON.stringify(ea.effects[k]) !== JSON.stringify(eb.effects[k])) push('changed', 'figma-effects.json', k, `${JSON.stringify(ea.effects[k])} → ${JSON.stringify(eb.effects[k])}`);
  }
}

if (argv.includes('--json')) console.log(JSON.stringify(changes, null, 2));
else if (!changes.length) console.log('Tokens in sync — no differences.');
else {
  const order = ['figma-warning', 'modes', 'removed', 'renamed', 'added', 'changed', 'added-file', 'removed-file'];
  changes.sort((x, y) => order.indexOf(x.kind) - order.indexOf(y.kind));
  for (const c of changes) console.log(`${c.kind.padEnd(13)} ${c.file.padEnd(24)} ${c.token}  ${c.detail}`);
  const n = (k) => changes.filter((c) => c.kind === k).length;
  console.log(`\n${changes.length} change(s): ${n('added')} added · ${n('removed')} removed · ${n('renamed')} renamed · ${n('changed')} changed`);
  if (n('removed') || n('renamed')) console.log('Removed/renamed tokens are breaking: run the token linter on the app to find usages.');
}
process.exit(changes.length ? 3 : 0);
