#!/usr/bin/env node
// Brings gap reports from people who use the npm package into references/gaps.json, so Storybook → Guides → Figma sync
// → Gaps for Figma lists them next to the gaps found in this repo's own screens.
//
//   npm run gaps:pull                  add every report labelled gap:accepted that is not in gaps.json yet
//   npm run gaps:pull -- --dry-run     show what would be added, change nothing
//   npm run gaps:pull -- --close-done  also comment on and close the reports whose gap is now done
//
// Reports are GitHub issues opened with .github/ISSUE_TEMPLATE/gap-report.yml (label `gap`). Only issues a maintainer
// labelled `gap:accepted` are pulled: unreviewed reports stay on GitHub. A pulled row is never overwritten later, so
// edit it in gaps.json freely (title, proposal, status); `source.issue` links it to its report. Screenshots in the
// report are saved next to gaps.json as references/gaps/<id>-figma.<ext> (what they need) and <id>-code.<ext> (their
// stand-in). Needs the GitHub CLI (`gh auth login` once).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const closeDone = args.includes('--close-done');
const here = path.dirname(fileURLToPath(import.meta.url));
const refs = path.join(here, '..', 'references');
const gapsFile = path.join(refs, 'gaps.json');
const root = path.resolve(here, '../../../..');

const gh = (...a) => execFileSync('gh', a, { encoding: 'utf8', cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
try {
  gh('auth', 'status');
} catch {
  console.error('gaps:pull needs the GitHub CLI signed in: run `gh auth login` once.');
  process.exit(2);
}
const repo = JSON.parse(gh('repo', 'view', '--json', 'nameWithOwner')).nameWithOwner;
const data = JSON.parse(fs.readFileSync(gapsFile, 'utf8'));
const issues = JSON.parse(gh('issue', 'list', '--repo', repo, '--label', 'gap:accepted', '--state', 'all', '--limit', '500', '--json', 'number,title,body,author,url,createdAt,state'));

// Issue forms render each field as "### <label>\n\n<value>"; an empty optional field is "_No response_".
const sections = (body) => {
  const out = {};
  for (const part of `\n${body ?? ''}`.split(/\n### /).slice(1)) {
    const nl = part.indexOf('\n');
    const value = part.slice(nl + 1).trim();
    out[part.slice(0, nl).trim()] = value === '_No response_' ? '' : value;
  }
  return out;
};
const imageUrls = (text) => [...(text ?? '').matchAll(/!\[[^\]]*\]\((https:\/\/[^)\s]+)\)|<img[^>]+src="(https:\/\/[^"]+)"/g)].map((m) => m[1] || m[2]);
const plain = (text) =>
  (text ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)|<img[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/^\[gap\]:?\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
    .replace(/-$/, '');
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' };

// GitHub attachment links redirect to signed storage URLs; public repos need no token.
async function download(url, base) {
  const host = new URL(url).hostname;
  if (!/(^|\.)github(usercontent)?\.com$/.test(host)) return { skipped: `not a GitHub attachment (${host})` };
  const res = await fetch(url, { redirect: 'follow' });
  const type = (res.headers.get('content-type') || '').split(';')[0];
  if (!res.ok || !EXT[type]) return { skipped: `${res.status} ${type || 'unknown type'}` };
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 8 * 1024 * 1024) return { skipped: 'larger than 8 MB' };
  const file = `gaps/${base}.${EXT[type]}`;
  if (!dryRun) {
    fs.mkdirSync(path.join(refs, 'gaps'), { recursive: true });
    fs.writeFileSync(path.join(refs, file), buf);
  }
  return { file };
}

const known = new Map(data.gaps.filter((g) => g.source?.issue).map((g) => [g.source.issue, g]));
const ids = new Set(data.gaps.map((g) => g.id));
const added = [];
for (const issue of issues.sort((a, b) => a.number - b.number)) {
  if (known.has(issue.number)) continue;
  const f = sections(issue.body);
  const title = issue.title.replace(/^\[gap\]:?\s*/i, '').trim() || `Gap report #${issue.number}`;
  let id = slug(title) || `report-${issue.number}`;
  if (ids.has(id)) id = `${id}-${issue.number}`;
  ids.add(id);
  const row = {
    id,
    title,
    status: 'open',
    found: issue.createdAt.slice(0, 10),
    screen: f['Screen'] ? `${f['Project or company']}: ${plain(f['Screen'])}` : f['Project or company'] || 'npm package user',
    reference: `Gap report #${issue.number}${f['Screen'] ? ` (${plain(f['Screen'])})` : ''}${plain(f['Screenshot of what you need']) ? `: ${plain(f['Screenshot of what you need'])}` : ''}`,
    need: plain(f['What the screen needs']) || title,
    proposal: plain(f['Proposed component or variant']) || 'To decide: see the report.',
    standIn: plain(f['What you use instead today']) || 'Not given in the report.',
    source: {
      issue: issue.number,
      url: issue.url,
      reportedBy: issue.author?.login ?? 'unknown',
      project: plain(f['Project or company']),
      version: plain(f['ad-design-kit version']).replace(/^v/, ''),
    },
  };
  const images = {};
  for (const [kind, field] of [['figma', 'Screenshot of what you need'], ['code', 'What you use instead today']]) {
    const url = imageUrls(f[field])[0];
    if (!url) continue;
    const got = await download(url, `${id}-${kind}`).catch((e) => ({ skipped: e.message }));
    if (got.file) images[kind] = got.file;
    else console.warn(`  #${issue.number}: ${field} screenshot not saved (${got.skipped}); add it by hand if you want it in Storybook.`);
  }
  if (Object.keys(images).length) row.images = images;
  added.push(row);
}

for (const row of added) console.log(`${dryRun ? 'Would add' : 'Added'} ${row.id} — "${row.title}" from @${row.source.reportedBy} (${row.source.project || 'no project'}, v${row.source.version || '?'}) · #${row.source.issue}${row.images ? ` · ${Object.keys(row.images).length} screenshot(s)` : ''}`);
const pending = JSON.parse(gh('issue', 'list', '--repo', repo, '--label', 'gap', '--state', 'open', '--limit', '500', '--json', 'number,labels')).filter((i) => !i.labels.some((l) => l.name === 'gap:accepted'));
console.log(`${added.length ? '' : 'No new accepted reports. '}${pending.length} report(s) waiting for review: https://github.com/${repo}/issues?q=is%3Aopen+label%3Agap+-label%3Agap%3Aaccepted`);

if (added.length && !dryRun) {
  data.gaps.push(...added);
  fs.writeFileSync(gapsFile, JSON.stringify(data, null, 2) + '\n');
  console.log('Updated references/gaps.json; refreshing the Storybook docs (npm run docs:build)…');
  execFileSync('npm', ['run', '-s', 'docs:build'], { cwd: root, stdio: 'inherit' });
}

// Done gaps: tell the reporter and close the report.
if (closeDone) {
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  const open = new Set(issues.filter((i) => i.state === 'OPEN').map((i) => i.number));
  for (const g of data.gaps.filter((x) => x.status === 'done' && open.has(x.source?.issue))) {
    const msg = `This is now in AD Design Kit${g.doneIn || version ? ` ${g.doneIn || version}` : ''}: ${g.title}. See Storybook → Guides → Figma sync → Gaps for Figma (https://ad-design-kit-storybook.netlify.app). Thanks for reporting it.`;
    if (dryRun) console.log(`Would close #${g.source.issue} (${g.id})`);
    else {
      gh('issue', 'close', String(g.source.issue), '--repo', repo, '--comment', msg);
      console.log(`Closed #${g.source.issue} (${g.id})`);
    }
  }
}
