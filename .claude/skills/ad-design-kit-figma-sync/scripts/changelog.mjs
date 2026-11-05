#!/usr/bin/env node
// Version history of the AD Design Kit design system: what changed in Figma, version by version.
//
// The Figma sync commits a snapshot of the Figma file into the repo (token exports, the component registry, the
// icon export). This script compares those snapshots between versions, records each version's changes in
// references/changelog.json, and renders CHANGELOG.md and the Storybook page (Guides → Changelog) from it.
// Every version is a git tag, ds-v<version>, so the system can be checked out as it was at any version.
//
//   node changelog.mjs                         status: changes since the last version (exit 1 when there are some)
//   node changelog.mjs --release --title "…"  record the changes as the next version  [--figma-version "…"] [--date YYYY-MM-DD]
//   node changelog.mjs --tag                   tag HEAD as the latest version, once its entry is committed
//   node changelog.mjs --write                 re-render CHANGELOG.md and the Storybook data from changelog.json
//   node changelog.mjs --check                 fail when the rendered files are stale or a Figma change has no entry
//   node changelog.mjs --backfill <ref>        one-off: rebuild the history from git, starting at <ref> (1.0.0)
//
// Version numbers: a breaking change (anything removed or renamed: token, mode, effect, component set, variant
// property or value, icon) bumps the major number; anything added bumps the minor number; changed values only
// bump the patch number.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const has = (n) => argv.includes(n);

const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 }).trim();
const tryGit = (...a) => { try { return git(...a); } catch { return null; } };
const root = git('rev-parse', '--show-toplevel');
process.chdir(root);

const DS = '.claude/skills/ad-design-kit-design-system';
const FILES = {
  primitives: `${DS}/tokens/figma-primitives.json`,
  themes: `${DS}/tokens/figma-themes.json`,
  effects: `${DS}/tokens/figma-effects.json`,
  components: `${DS}/references/components.json`,
  icons: `${DS}/icons/figma-icons.json`,
  specs: `${DS}/references/figma-specs.json`,
};
const LOG = `${DS}/references/changelog.json`;
const MD = 'CHANGELOG.md';
const TS = '.storybook/generated/ad-design-kit-changelog.ts';
const tagOf = (v) => `ds-v${v}`;

// ---- Snapshots ---------------------------------------------------------------------------------------------------

/** The design system as committed at `ref`, or as in the working tree when `ref` is null. */
function snapshot(ref) {
  const read = (p) => (ref ? tryGit('show', `${ref}:${p}`) : fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);
  return Object.fromEntries(Object.entries(FILES).map(([k, p]) => { const s = read(p); return [k, s ? JSON.parse(s) : null]; }));
}

/** The snapshot of a version tag. A file added to the snapshot after that tag (such as the styling snapshot) is taken
 *  from the first commit that has it, so its first recorded state is the baseline, not a list of "added" changes. */
function baseSnapshot(tag) {
  const snap = snapshot(tag);
  for (const [k, p] of Object.entries(FILES)) {
    if (snap[k]) continue;
    const first = tryGit('log', '--reverse', '--format=%H', `${tag}..HEAD`, '--', p)?.split('\n')[0];
    const text = first ? tryGit('show', `${first}:${p}`) : null;
    if (text) snap[k] = JSON.parse(text);
  }
  return snap;
}

function stats(s) {
  return {
    tokens: Object.keys(s.primitives?.tokens ?? {}).length + Object.keys(s.themes?.tokens ?? {}).length,
    modes: s.themes?.modes ?? [],
    effects: Object.keys(s.effects?.effects ?? {}).length,
    components: s.components?.components?.length ?? 0,
    icons: s.icons?.icons?.length ?? 0,
  };
}

// ---- Diff --------------------------------------------------------------------------------------------------------

const show = (v) => (v !== null && typeof v === 'object' ? JSON.stringify(v) : String(v));
const LIST_AT = 12; // more items than this in one change → one grouped change with a list

function diff(a, b) {
  const out = [];
  const add = (area, change, name, detail = '', items) =>
    out.push({ area, change, name, ...(detail ? { detail } : {}), ...(items ? { items } : {}), ...(change === 'removed' || change === 'renamed' ? { breaking: true } : {}) });

  // Tokens (Primitives and Themes collections) and their modes.
  for (const key of ['primitives', 'themes']) {
    const A = a[key], B = b[key];
    if (!A || !B) { if (B) add('token', 'added', `${key} collection`); else if (A) add('token', 'removed', `${key} collection`); continue; }
    if (key === 'themes') {
      for (const m of A.modes.filter((m) => !B.modes.includes(m))) add('mode', 'removed', m);
      for (const m of B.modes.filter((m) => !A.modes.includes(m))) add('mode', 'added', m);
    }
    const val = (t, i) => (Array.isArray(t.v) ? t.v[i] : t.v);
    const removed = Object.keys(A.tokens).filter((k) => !(k in B.tokens));
    const added = Object.keys(B.tokens).filter((k) => !(k in A.tokens));
    // A removed and an added token with the same values is a rename.
    for (const r of [...removed]) {
      const same = added.find((n) => JSON.stringify(A.tokens[r].v) === JSON.stringify(B.tokens[n].v));
      if (!same) continue;
      add('token', 'renamed', r, `→ ${same}`);
      removed.splice(removed.indexOf(r), 1);
      added.splice(added.indexOf(same), 1);
    }
    for (const r of removed) add('token', 'removed', r);
    for (const n of added) add('token', 'added', n);
    for (const k of Object.keys(B.tokens)) {
      if (!(k in A.tokens) || JSON.stringify(A.tokens[k].v) === JSON.stringify(B.tokens[k].v)) continue;
      const modes = B.modes.filter((m) => A.modes.includes(m));
      const per = modes.map((m) => [m, val(A.tokens[k], A.modes.indexOf(m)), val(B.tokens[k], B.modes.indexOf(m))]).filter(([, x, y]) => show(x) !== show(y));
      if (!per.length) continue; // only a removed mode changed, already listed
      const same = per.length > 1 && per.every(([, x, y]) => show(x) === show(per[0][1]) && show(y) === show(per[0][2]));
      add('token', 'changed', k, same || B.modes.length === 1 ? `${show(per[0][1])} → ${show(per[0][2])}` : per.map(([m, x, y]) => `${m}: ${show(x)} → ${show(y)}`).join('; '));
    }
  }

  // Effect styles (shadows, focus rings).
  const EA = a.effects?.effects ?? {}, EB = b.effects?.effects ?? {};
  const goneFx = Object.keys(EA).filter((k) => !(k in EB));
  const newFx = Object.keys(EB).filter((k) => !(k in EA));
  // Same style under a new name or folder (e.g. moved into _demo/) is a rename.
  for (const r of [...goneFx]) {
    const same = newFx.find((n) => n.endsWith(`/${r}`) || JSON.stringify(EA[r]) === JSON.stringify(EB[n]));
    if (!same) continue;
    add('effect', 'renamed', r, `→ ${same}`);
    goneFx.splice(goneFx.indexOf(r), 1);
    newFx.splice(newFx.indexOf(same), 1);
  }
  for (const k of goneFx) add('effect', 'removed', k);
  for (const k of newFx) add('effect', 'added', k);
  for (const k of Object.keys(EB)) if (k in EA && JSON.stringify(EA[k]) !== JSON.stringify(EB[k])) add('effect', 'changed', k);

  // Component sets and their variant properties, keyed by Figma node id so a renamed set is still the same set.
  const CA = new Map((a.components?.components ?? []).map((c) => [c.node, c]));
  const CB = new Map((b.components?.components ?? []).map((c) => [c.node, c]));
  const nameOf = (c) => c.figmaName ?? c.react;
  for (const [node, c] of CA) if (!CB.has(node)) add('component', 'removed', nameOf(c));
  for (const [node, c] of CB) {
    const old = CA.get(node);
    if (!old) {
      const props = Object.entries(c.figmaVariants ?? {}).map(([p, v]) => `${p} (${v.length})`).join(', ');
      add('component', 'added', nameOf(c), props ? `variants: ${props}` : '');
      continue;
    }
    if (nameOf(old) !== nameOf(c)) add('component', 'changed', nameOf(c), `renamed in Figma from “${nameOf(old)}”`);
    const VA = old.figmaVariants ?? {}, VB = c.figmaVariants ?? {};
    for (const p of Object.keys(VA)) if (!(p in VB)) add('variant', 'removed', `${nameOf(c)} · ${p}`, VA[p].join(', '));
    for (const p of Object.keys(VB)) {
      if (!(p in VA)) { add('variant', 'added', `${nameOf(c)} · ${p}`, VB[p].join(', ')); continue; }
      const gone = VA[p].filter((v) => !VB[p].includes(v));
      const fresh = VB[p].filter((v) => !VA[p].includes(v));
      if (gone.length) add('variant', 'removed', `${nameOf(c)} · ${p}`, gone.join(', '));
      if (fresh.length) add('variant', 'added', `${nameOf(c)} · ${p}`, fresh.join(', '));
    }
  }

  // Icons, grouped when many change at once.
  const IA = new Map((a.icons?.icons ?? []).map((i) => [i.name, i]));
  const IB = new Map((b.icons?.icons ?? []).map((i) => [i.name, i]));
  const icons = {
    removed: [...IA.keys()].filter((n) => !IB.has(n)),
    added: [...IB.keys()].filter((n) => !IA.has(n)),
    changed: [...IB.keys()].filter((n) => IA.has(n) && (IA.get(n).body !== IB.get(n).body || IA.get(n).viewBox !== IB.get(n).viewBox)),
  };
  for (const [change, names] of Object.entries(icons)) {
    if (!names.length) continue;
    if (names.length > LIST_AT) add('icon', change, `${names.length} icons`, '', names.sort());
    else for (const n of names) add('icon', change, n);
  }

  // Component styling (figma-specs.json): per set, how many variants use each radius, padding, fill… value.
  // Only compared when both sides have it; the first snapshot of a set is its baseline.
  const SA = a.specs?.components ?? {}, SB = b.specs?.components ?? {};
  const PROP = { r: 'corner radius', pad: 'padding', gap: 'gap', fill: 'fill', st: 'border', fx: 'shadow / focus ring', h: 'height', tx: 'text style' };
  const label = (vals) => Object.entries(vals).map(([v, n]) => `${v} (${n})`).join(', ');
  const setName = Object.fromEntries((b.components?.components ?? []).map((c) => [c.react, c.figmaName ?? c.react]));
  for (const react of Object.keys(SB)) {
    if (!SA[react]) continue;
    for (const p of [...new Set([...Object.keys(SA[react]), ...Object.keys(SB[react])])]) {
      const va = SA[react][p] ?? {}, vb = SB[react][p] ?? {};
      if (JSON.stringify(va) === JSON.stringify(vb)) continue;
      const gone = Object.fromEntries(Object.entries(va).filter(([v, n]) => vb[v] !== n));
      const now = Object.fromEntries(Object.entries(vb).filter(([v, n]) => va[v] !== n));
      add('style', 'changed', `${setName[react] ?? react} · ${PROP[p] ?? p}`, `${label(gone) || 'none'} → ${label(now) || 'none'}`);
    }
  }
  return out;
}

// A grouped change (e.g. "447 icons") counts once per item.
const sum = (list) => list.reduce((n, c) => n + (c.items?.length ?? 1), 0);
const count = (changes) => ({
  added: sum(changes.filter((c) => c.change === 'added')),
  removed: sum(changes.filter((c) => c.change === 'removed')),
  renamed: sum(changes.filter((c) => c.change === 'renamed')),
  changed: sum(changes.filter((c) => c.change === 'changed')),
  breaking: sum(changes.filter((c) => c.breaking)),
});
const bumpOf = (changes) => (changes.some((c) => c.breaking) ? 'major' : changes.some((c) => c.change === 'added') ? 'minor' : 'patch');
const next = (v, bump) => {
  const [M, m, p] = v.split('.').map(Number);
  return bump === 'major' ? `${M + 1}.0.0` : bump === 'minor' ? `${M}.${m + 1}.0` : `${M}.${m}.${p + 1}`;
};

// ---- The log -----------------------------------------------------------------------------------------------------

function repository() {
  const url = tryGit('remote', 'get-url', 'origin');
  const m = url?.match(/github\.com[:/](.+?)(?:\.git)?$/);
  return m ? `https://github.com/${m[1]}` : null;
}
const loadLog = () => (fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : null);
const tagged = (v) => Boolean(tryGit('rev-parse', '--verify', '--quiet', `refs/tags/${tagOf(v)}`));
/** The newest version that already has its tag, and the entries above it (written but not tagged yet). */
function released(log) {
  const i = log.versions.findIndex((v) => tagged(v.version));
  return { last: i >= 0 ? log.versions[i] : null, pending: i >= 0 ? log.versions.slice(0, i) : log.versions };
}

function saveLog(log) {
  fs.writeFileSync(LOG, `${JSON.stringify(log, null, 2)}\n`);
  render(log);
}

// ---- Rendering ---------------------------------------------------------------------------------------------------

const AREAS = [
  ['mode', 'Theme modes'],
  ['token', 'Tokens'],
  ['effect', 'Effect styles'],
  ['component', 'Component sets'],
  ['variant', 'Variants'],
  ['style', 'Component styling'],
  ['icon', 'Icons'],
];
const VERB = { added: 'Added', removed: 'Removed', renamed: 'Renamed', changed: 'Changed' };

function markdown(log) {
  const repo = log.repository;
  const lines = [
    '# AD Design Kit changelog',
    '',
    'Every change to the design system that came from Figma, newest first: tokens, theme modes, effect styles, component sets, variants and icons. Each version is a git tag (`ds-v<version>`), so the system can be checked out as it was at any of them.',
    '',
    'Versions follow semver: anything removed or renamed is **breaking** (major), anything added is a minor version, changed values are a patch.',
    '',
    `<!-- Generated by .claude/skills/ad-design-kit-figma-sync/scripts/changelog.mjs from ${LOG}. Do not edit by hand. -->`,
    '',
  ];
  log.versions.forEach((v, i) => {
    const prev = log.versions[i + 1];
    const links = repo ? [`[Code](${repo}/tree/${tagOf(v.version)})`, ...(prev ? [`[Diff](${repo}/compare/${tagOf(prev.version)}...${tagOf(v.version)})`] : [])] : [];
    lines.push(`## ${v.version} — ${v.date}`, '', `**${v.title}**${v.figmaVersion ? ` · Figma version “${v.figmaVersion}”` : ''}`, '');
    const c = v.counts;
    const summary = v.baseline
      ? `Baseline: ${v.stats.components} component sets, ${v.stats.tokens} tokens, ${v.stats.modes.length} theme modes, ${v.stats.effects} effect styles, ${v.stats.icons} icons.`
      : [`${v.bump[0].toUpperCase()}${v.bump.slice(1)}`, c.breaking && `**${c.breaking} breaking**`, c.added && `${c.added} added`, c.removed && `${c.removed} removed`, c.renamed && `${c.renamed} renamed`, c.changed && `${c.changed} changed`].filter(Boolean).join(' · ');
    lines.push([summary, ...links].join(' · '), '');
    for (const [area, label] of AREAS) {
      const list = v.changes.filter((ch) => ch.area === area);
      if (!list.length) continue;
      const bullets = list.map((ch) => {
        const what = `${ch.breaking ? '**Breaking** · ' : ''}${VERB[ch.change]} \`${ch.name}\`${ch.detail ? ` — ${ch.detail}` : ''}`;
        return ch.items ? `- ${what}: ${ch.items.map((n) => `\`${n}\``).join(', ')}` : `- ${what}`;
      });
      if (bullets.length > 15) lines.push(`<details><summary>${label} (${bullets.length})</summary>`, '', ...bullets, '', '</details>', '');
      else lines.push(`**${label}**`, '', ...bullets, '');
    }
  });
  return `${lines.join('\n').trimEnd()}\n`;
}

function storybookData(log) {
  return `// GENERATED by .claude/skills/ad-design-kit-figma-sync/scripts/changelog.mjs from ${LOG} — do not edit by hand.

export type ADDesignKitChangeArea = 'mode' | 'token' | 'effect' | 'component' | 'variant' | 'style' | 'icon';
export interface ADDesignKitChange { area: ADDesignKitChangeArea; change: 'added' | 'removed' | 'renamed' | 'changed'; name: string; detail?: string; items?: string[]; breaking?: boolean }
export interface ADDesignKitVersion {
  version: string;
  date: string;
  title: string;
  figmaVersion?: string;
  baseline?: boolean;
  bump: 'major' | 'minor' | 'patch';
  counts: { added: number; removed: number; renamed: number; changed: number; breaking: number };
  stats: { tokens: number; modes: string[]; effects: number; components: number; icons: number };
  changes: ADDesignKitChange[];
}
export interface ADDesignKitChangelog { repository: string | null; versions: ADDesignKitVersion[] }

export const adDesignKitChangelog: ADDesignKitChangelog = ${JSON.stringify({ repository: log.repository, versions: log.versions })};
`;
}

function render(log, check = false) {
  const files = [[MD, markdown(log)], [TS, storybookData(log)]];
  const stale = files.filter(([p, s]) => !fs.existsSync(p) || fs.readFileSync(p, 'utf8') !== s).map(([p]) => p);
  if (!check) for (const [p, s] of files) fs.writeFileSync(p, s);
  return stale;
}

// ---- Output helpers ----------------------------------------------------------------------------------------------

function printChanges(changes) {
  for (const [area, label] of AREAS) {
    const list = changes.filter((c) => c.area === area);
    if (!list.length) continue;
    console.log(`  ${label}`);
    for (const c of list) console.log(`    ${c.breaking ? '!' : ' '} ${c.change.padEnd(8)} ${c.name}${c.detail ? `  ${c.detail}` : ''}${c.items ? `  (${c.items.slice(0, 8).join(', ')}${c.items.length > 8 ? ', …' : ''})` : ''}`);
  }
  const n = count(changes);
  console.log(`  ${sum(changes)} change(s): ${n.added} added · ${n.removed} removed · ${n.renamed} renamed · ${n.changed} changed${n.breaking ? ` · ${n.breaking} breaking` : ''}`);
}

const today = () => new Date().toISOString().slice(0, 10);

// ---- Commands ----------------------------------------------------------------------------------------------------

if (has('--backfill')) {
  const from = opt('--backfill');
  if (!from) { console.error('usage: changelog.mjs --backfill <ref>'); process.exit(2); }
  if (loadLog() && !has('--force')) { console.error(`${LOG} exists; pass --force to rebuild it.`); process.exit(2); }
  const commits = git('rev-list', '--reverse', `${from}^..HEAD`, '--', ...Object.values(FILES)).split('\n').filter(Boolean);
  const versions = [];
  let prev = null;
  for (const sha of commits) {
    const snap = snapshot(sha);
    const meta = { date: git('log', '-1', '--format=%as', sha), title: git('log', '-1', '--format=%s', sha) };
    if (!prev) {
      versions.unshift({ version: '1.0.0', ...meta, baseline: true, bump: 'major', counts: count([]), stats: stats(snap), changes: [], commit: sha });
    } else {
      const changes = diff(prev, snap);
      if (!changes.length) continue;
      const bump = bumpOf(changes);
      versions.unshift({ version: next(versions[0].version, bump), ...meta, bump, counts: count(changes), stats: stats(snap), changes, commit: sha });
    }
    prev = snap;
  }
  for (const v of versions) {
    if (!tagged(v.version)) git('tag', '-a', tagOf(v.version), v.commit, '-m', `AD Design Kit ${v.version}: ${v.title}`);
    delete v.commit;
  }
  saveLog({ $comment: 'AD Design Kit version history. Written by changelog.mjs (figma-sync skill); render with --write.', repository: repository(), versions });
  for (const v of [...versions].reverse()) console.log(`${tagOf(v.version).padEnd(10)} ${v.date}  ${v.bump.padEnd(5)}  ${v.title}`);
  console.log(`\n${versions.length} version(s) written to ${LOG}, ${MD} and ${TS}; tags created locally (push them with \`git push --tags\`).`);
  process.exit(0);
}

const log = loadLog();
if (!log) { console.error(`No ${LOG} yet: run \`node changelog.mjs --backfill <first ref>\` once.`); process.exit(2); }

if (has('--write')) {
  const stale = render(log);
  console.log(stale.length ? `Rendered ${stale.join(', ')}` : `Changelog: ${log.versions.length} versions · up to date`);
  process.exit(0);
}

if (has('--tag')) {
  const latest = log.versions[0];
  if (tagged(latest.version)) { console.log(`${tagOf(latest.version)} already exists.`); process.exit(0); }
  const committed = tryGit('show', `HEAD:${LOG}`);
  if (!committed || JSON.parse(committed).versions[0]?.version !== latest.version) {
    console.error(`${latest.version} is not committed yet: commit ${LOG} (and the synced files) first, then run --tag.`);
    process.exit(1);
  }
  const dirty = tryGit('status', '--porcelain', '--', ...Object.values(FILES), LOG);
  if (dirty) { console.error(`Uncommitted changes in the snapshot files:\n${dirty}\nCommit them first so the tag matches the entry.`); process.exit(1); }
  git('tag', '-a', tagOf(latest.version), '-m', `AD Design Kit ${latest.version}: ${latest.title}`);
  console.log(`Tagged HEAD as ${tagOf(latest.version)}. Push it with \`git push origin ${tagOf(latest.version)}\` (or \`git push --follow-tags\`).`);
  process.exit(0);
}

const { last, pending } = released(log);
// The changes waiting for a version: the working tree against the last tagged version.
const base = last ? baseSnapshot(tagOf(last.version)) : null;
const changes = base ? diff(base, snapshot(null)) : null;

if (has('--release')) {
  if (!last) { console.error('No tagged version to compare with (fetch the tags: `git fetch --tags`).'); process.exit(2); }
  if (!changes.length) { console.log(`Nothing to release: the Figma snapshot matches ${last.version}.`); process.exit(0); }
  const title = opt('--title');
  if (!title) { console.error('Give the version a title: --title "What changed in Figma"'); process.exit(2); }
  const bump = bumpOf(changes);
  // Re-running before the commit replaces the untagged entry instead of stacking a second one.
  const entry = {
    version: next(last.version, bump),
    date: opt('--date') ?? today(),
    title,
    ...(opt('--figma-version') ? { figmaVersion: opt('--figma-version') } : {}),
    bump,
    counts: count(changes),
    stats: stats(snapshot(null)),
    changes,
  };
  log.versions = [entry, ...log.versions.slice(pending.length)];
  saveLog(log);
  // The npm package (ad-design-kit) carries the design system version.
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.version !== entry.version) {
    pkg.version = entry.version;
    fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
  }
  console.log(`${entry.version} (${bump}) — ${title}`);
  printChanges(changes);
  console.log(`\nWritten to ${LOG}, ${MD}, ${TS} and the package.json version. After committing, run \`npm run changelog:tag\`; pushing the tag publishes the npm package.`);
  process.exit(0);
}

if (has('--check')) {
  const problems = render(log, true).map((p) => `${p} is stale: run \`npm run changelog -- --write\``);
  if (!last) {
    console.log(`Changelog: ${log.versions.length} versions · no version tags in this checkout, Figma changes not checked`);
  } else if (pending.length) {
    // An entry written but not tagged yet must describe exactly what changed since the last tag.
    if (JSON.stringify(pending[0].changes) !== JSON.stringify(changes)) problems.push(`${pending[0].version} does not match the Figma snapshot any more: run \`npm run changelog:release -- --title "…"\` again`);
  } else if (changes.length) {
    problems.push(`The Figma snapshot changed since ${last.version} (${changes.length} change(s)) without a changelog entry: run \`npm run changelog:release -- --title "…"\``);
  }
  if (problems.length) { for (const p of problems) console.error(p); process.exit(1); }
  if (last) console.log(`Changelog: ${log.versions.length} versions · latest ${log.versions[0].version}${pending.length ? ' (not tagged yet)' : ''} · up to date`);
  process.exit(0);
}

// Status.
if (!last) { console.log('No version tags in this checkout (fetch them: `git fetch --tags`).'); process.exit(0); }
if (pending.length) console.log(`${pending[0].version} is recorded but not tagged yet: commit it, then \`npm run changelog:tag\`.`);
if (!changes.length) { console.log(`The Figma snapshot matches ${pending.length ? pending[0].version : last.version}.`); process.exit(0); }
console.log(`Changes since ${last.version}:`);
printChanges(changes);
console.log(`\nNext version: ${next(last.version, bumpOf(changes))} (${bumpOf(changes)}). Record it with \`npm run changelog:release -- --title "…"\`.`);
process.exit(pending.length && JSON.stringify(pending[0].changes) === JSON.stringify(changes) ? 0 : 1);
