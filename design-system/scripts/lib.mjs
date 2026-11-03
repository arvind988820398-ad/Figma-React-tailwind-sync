// Shared paths and helpers for the design-system producer.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

export const REPO = path.resolve(import.meta.dirname, '..', '..');
export const DS = path.join(REPO, 'design-system');
export const DIST = path.join(DS, 'dist');
export const BUILD = path.join(DIST, 'build');
export const OUT = path.join(DIST, 'project');
export const require = createRequire(path.join(REPO, 'package.json'));
export const system = JSON.parse(fs.readFileSync(path.join(DS, 'system.json'), 'utf8'));

export function sha() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: REPO, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}
export function repoSlug() {
  try {
    const url = execSync('git remote get-url origin', { cwd: REPO, encoding: 'utf8' }).trim();
    const m = url.match(/github\.com[:/]([^/]+\/[^/.]+)/);
    return m ? m[1] : 'unknown/unknown';
  } catch {
    return 'unknown/unknown';
  }
}
export function ensure(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
export function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
export function writeJson(p, v) {
  ensure(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(v, null, 1) + '\n');
}
/** The generated Storybook docs data (a TS const) as JSON. */
export function loadDocs() {
  const src = fs.readFileSync(path.join(REPO, '.storybook/generated/ad-design-kit-docs.ts'), 'utf8');
  const i = src.indexOf('export const adDesignKitDocs');
  const j = src.indexOf('= {', i) + 2;
  return JSON.parse(src.slice(j).trim().replace(/;\s*$/, ''));
}
