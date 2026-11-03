// Icons → SVG files, logo copies, per-component READMEs.
import fs from 'node:fs';
import path from 'node:path';
import { REPO, OUT, BUILD, loadDocs, writeJson } from './lib.mjs';

const docs = loadDocs();

// ---- icons ---------------------------------------------------------------------------
const icons = JSON.parse(fs.readFileSync(path.join(REPO, '.claude/skills/ad-design-kit-design-system/icons/figma-icons.json'), 'utf8')).icons;
const iconDir = path.join(OUT, 'assets/Icons');
fs.mkdirSync(iconDir, { recursive: true });
const groups = {};
for (const ic of icons) {
  const g = ic.group.replace(/[^A-Za-z0-9_-]+/g, '-');
  fs.mkdirSync(path.join(iconDir, g), { recursive: true });
  // <img> can't inherit currentColor: ink the file with the Modern body-text colour (adk-gray-600) so it previews.
  const body = ic.body.replace(/currentColor/g, '#4a5565');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ic.viewBox}" width="24" height="24" fill="none">${body}</svg>\n`;
  fs.writeFileSync(path.join(iconDir, g, `${ic.name}.svg`), svg);
  (groups[g] ||= []).push(ic);
}
const pascal = (n) => n.split(/[^a-z0-9]+/i).filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('') + 'Icon';
let iconReadme = `# Icons\n\nThe ${icons.length} icons of the Figma Icons page, one SVG per icon, grouped as in Figma. In code they are React components generated from the same snapshot: import \`${pascal(icons[1].name)}\` from \`src/components/icons\` for \`${icons[1].name}\`; every icon is a 1em square that inherits \`currentColor\`, so colour it with the surrounding \`text-*\` class and size it with the parent's text size or a \`[&_svg]:size-*\` rule. Decorative by default (\`aria-hidden\`); pass \`title\` when the icon is the only content of a control.\n\nThe files here are inked \`#4a5565\` (\`adk-gray-600\`, the Modern body-text colour) because an \`<img>\` cannot inherit colour; the React components use \`currentColor\`.\n\n`;
for (const [g, list] of Object.entries(groups).sort()) {
  iconReadme += `## ${g} (${list.length})\n\n${list.map((i) => `\`${i.name}\``).join(' · ')}\n\n`;
}
fs.writeFileSync(path.join(iconDir, 'README.md'), iconReadme);

// ---- logos -------------------------------------------------------------------------------
const logoDir = path.join(OUT, 'assets/Logos');
fs.mkdirSync(logoDir, { recursive: true });
fs.copyFileSync(path.join(REPO, 'src/assets/logos/ad-design-kit.svg'), path.join(logoDir, 'ad-design-kit.svg'));
fs.copyFileSync(path.join(REPO, 'public/logo-mark.svg'), path.join(logoDir, 'logo-mark.svg'));
fs.writeFileSync(
  path.join(logoDir, 'README.md'),
  `# Logos\n\nThe AD Design Kit mark: four chevron-cut quadrants meeting at the centre, filled with the mark's own gradients (they are part of the logo, not tokens).\n\n- \`ad-design-kit.svg\` — the 30px mark used in Navbar, Sidebar and Footer examples (\`src/assets/logos/ad-design-kit.svg\`).\n- \`logo-mark.svg\` — the 24px favicon/app-icon version (\`public/logo-mark.svg\`, also served as \`favicon.svg\`).\n\nKeep the mark on \`adk-bg-neutral-primary\` or \`adk-bg-neutral-primary-soft\`; give it at least \`spacing-2\` of clear space; never recolour it with a token. The product name beside it is set in \`label\` weight (\`text-sm font-semibold text-heading\`) or \`text-xl font-semibold\` in headers. Third-party logos in the repository's stories (Figma, Tailwind, wallet providers) are example content, not brand assets, and are not copied here.\n`,
);

// ---- component READMEs ----------------------------------------------------------------
const catLabel = { actions: 'Actions', forms: 'Forms', feedback: 'Feedback', overlays: 'Overlays', navigation: 'Navigation', 'data-display': 'Data display', marketing: 'Marketing' };
const summaries = {};
// a one-line summary from the "When to use" / "Use" sentence of each doc, else from the choosing table
for (const row of docs.guides.choosing.split('\n')) {
  const m = row.match(/^\| (.+?) \| `([A-Za-z]+)`/);
  if (m) summaries[m[2]] ||= m[1];
}
const comps = {};
for (const [name, c] of Object.entries(docs.components)) {
  const dir = path.join(OUT, 'components', name);
  fs.mkdirSync(dir, { recursive: true });
  const variants = Object.entries(c.figmaVariants || {})
    .map(([k, v]) => `**${k}**: ${v.join(' · ')}`)
    .join('; ');
  const props = Object.entries(c.propMap || {})
    .map(([fig, p]) => `| ${fig} | \`${p.prop ?? '—'}\` | ${p.values ? Object.entries(p.values).map(([a, b]) => `${a} → \`${b}\``).join(', ') : (p.note ?? '')} |`)
    .join('\n');
  const summary = firstSentence(c.doc) || `${name} mirrors the Figma "${c.figmaName}" component set.`;
  let md = `${summary}\n\n`;
  md += `Mirrors the Figma set **${c.figmaName}** (${c.figmaLine}). Category: ${catLabel[c.category]}. Story: \`${c.storyTitle}\`. Source: \`src/components/ui/${c.template ?? name + '.tsx'}\`.\n\n`;
  if (variants) md += `Figma variants — ${variants}. Interaction states (hover, focus, active, disabled) are CSS states, never props; breakpoints are responsive classes.\n\n`;
  if (props) md += `### Figma property → React prop\n\n| Figma property | Prop | Values |\n|---|---|---|\n${props}\n\n`;
  md += c.doc.trim() + '\n';
  if (c.extraDocs?.length) md += '\n' + c.extraDocs.map((d) => (typeof d === 'string' ? d : d.body ?? '')).join('\n\n') + '\n';
  if (c.related?.length) md += `\nRelated: ${c.related.map((r) => `\`${r}\``).join(', ')}.\n`;
  fs.writeFileSync(path.join(dir, 'README.md'), md);
  comps[name] = `src/components/ui/${name}.tsx`;
}
// Label and HelperText live in Input.tsx and share Input's doc section
for (const extra of ['Label', 'HelperText']) {
  const dir = path.join(OUT, 'components', extra);
  fs.mkdirSync(dir, { recursive: true });
  const c = docs.components.Input;
  fs.writeFileSync(
    path.join(dir, 'README.md'),
    `${extra === 'Label' ? 'Label is the field caption used above every form control: text, an optional required asterisk, an icon and a hint.' : 'HelperText is the line of guidance or validation feedback rendered under a form control.'}\n\nExported from \`src/components/ui/Input.tsx\` and documented with Input (Figma "Label" and "Helper text" sets on the Forms page). Use it only with the field components of this system; \`status="success" | "danger"\` colours HelperText with \`text-fg-success-strong\` / \`text-fg-danger-strong\`.\n\n` +
      extractSection(c.doc, extra === 'Label' ? /label/i : /helper/i),
  );
  comps[extra] = 'src/components/ui/Input.tsx';
}
writeJson(path.join(BUILD, 'components.json'), { comps, catLabel, categories: Object.fromEntries(Object.entries(docs.components).map(([n, c]) => [n, catLabel[c.category]])) });

function firstSentence(doc) {
  const m = doc.match(/\*\*When to use\*\*:?\s*([^\n]+)/) || doc.match(/\*\*Use\*\*\s*([^\n]+)/);
  if (!m) return '';
  let s = m[1].replace(/\*\*/g, '').trim();
  s = s.charAt(0).toUpperCase() + s.slice(1);
  const end = s.search(/[.;](\s|$)/);
  if (end > 20) s = s.slice(0, end + 1);
  s = s.charAt(0).toLowerCase() + s.slice(1);
  s = s.replace(/^(for|on|when|in)\s+/i, (m) => m); // keep the author's preposition
  return (/^(for|on|when|in|to)\s/i.test(s) ? `Use ${s}` : `Use for ${s}`).replace(/\.?$/, '.');
}
function extractSection(doc, re) {
  const parts = doc.split(/\n(?=###? )/);
  const hit = parts.filter((p) => re.test(p.split('\n')[0]));
  return hit.length ? hit.join('\n') + '\n' : '';
}
console.log('icons', icons.length, 'groups', Object.keys(groups), 'components', Object.keys(comps).length);
