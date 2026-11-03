// Bundles the library (+ its stories, used by the previews) into components/bundle.js,
// React into components/lib/*.js, the Tailwind stylesheet into components/bundle.css
// and the type declarations into components/index.d.ts.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { REPO, BUILD, OUT as PROJECT, require, system, readJson } from './lib.mjs';

const OUT = path.join(PROJECT, 'components');
const esbuild = require('esbuild');
const NS = system.namespace;

fs.mkdirSync(path.join(OUT, 'lib'), { recursive: true });
fs.mkdirSync(path.join(BUILD, 'entries'), { recursive: true });

const reactVersion = require('react/package.json').version;

// ---- globals plugin: react & friends resolve to window globals ------------------------
const globals = {
  react: 'window.React',
  'react/jsx-runtime': 'window.ReactJSXRuntime',
  'react/jsx-dev-runtime': 'window.ReactJSXRuntime',
  'react-dom': 'window.ReactDOM',
  'react-dom/client': 'window.ReactDOM',
};
const globalsPlugin = {
  name: 'globals',
  setup(b) {
    b.onResolve({ filter: /^(react|react\/jsx-runtime|react\/jsx-dev-runtime|react-dom|react-dom\/client)$/ }, (a) => ({ path: a.path, namespace: 'globals' }));
    b.onLoad({ filter: /.*/, namespace: 'globals' }, (a) => ({ contents: `module.exports = ${globals[a.path]};`, loader: 'js' }));
    // storybook test helpers only run inside play(); stub them
    b.onResolve({ filter: /^storybook\/test$/ }, () => ({ path: 'storybook-test', namespace: 'shim' }));
    b.onResolve({ filter: /\.storybook\/ad-design-kit\/figma$/ }, () => ({ path: 'figma', namespace: 'shim' }));
    b.onLoad({ filter: /^storybook-test$/, namespace: 'shim' }, () => ({
      contents: `const mk = () => { const f = () => undefined; f.mockReturnValue = () => f; f.mockImplementation = () => f; return f; };
export const fn = mk; export const expect = new Proxy(() => undefined, { get: () => () => ({}), apply: () => new Proxy({}, { get: () => () => ({}) }) });
export const within = () => new Proxy({}, { get: () => () => ({}) }); export const waitFor = async (f) => f(); export const userEvent = new Proxy({}, { get: () => async () => undefined }); export const screen = within();`,
      loader: 'js',
    }));
    b.onLoad({ filter: /^figma$/, namespace: 'shim' }, () => ({ contents: `export const figmaDesign = () => undefined; export const docsId = (c) => c; export const categoryLabels = {};`, loader: 'js' }));
  },
};

// ---- React libs ----------------------------------------------------------------------------
fs.writeFileSync(path.join(BUILD, 'entries/react.js'), `import * as React from 'react'; import * as JSX from 'react/jsx-runtime'; window.React = React; window.ReactJSXRuntime = JSX;`);
fs.writeFileSync(path.join(BUILD, 'entries/react-dom.js'), `import * as ReactDOM from 'react-dom'; import * as Client from 'react-dom/client'; window.ReactDOM = Object.assign({}, ReactDOM, Client);`);
for (const [entry, out] of [['react.js', 'react.js'], ['react-dom.js', 'react-dom.js']]) {
  await esbuild.build({
    entryPoints: [path.join(BUILD, 'entries', entry)],
    bundle: true, format: 'iife', minify: true, platform: 'browser', target: 'es2020',
    define: { 'process.env.NODE_ENV': '"production"' },
    nodePaths: [path.join(REPO, 'node_modules')],
    outfile: path.join(OUT, 'lib', out), legalComments: 'none', logLevel: 'error',
    plugins: out === 'react-dom.js' ? [{ name: 'react-global', setup(b) {
      b.onResolve({ filter: /^react$/ }, (a) => ({ path: a.path, namespace: 'globals' }));
      b.onLoad({ filter: /.*/, namespace: 'globals' }, () => ({ contents: 'module.exports = window.React;', loader: 'js' }));
    } }] : [],
  });
}

// ---- the library + stories entry ---------------------------------------------------------
const uiDir = path.join(REPO, 'src/components/ui');
const compFiles = fs.readdirSync(uiDir).filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx')).map((f) => f.replace(/\.tsx$/, ''));
let entry = `import * as React from 'react';\nimport * as ReactDOM from 'react-dom/client';\nimport * as Icons from '${uiDir}/../icons/index.ts';\n`;
compFiles.forEach((c, i) => { entry += `import * as M${i} from '${uiDir}/${c}.tsx';\nimport * as S${i} from '${uiDir}/${c}.stories.tsx';\n`; });
const order = Object.fromEntries(compFiles.map((c) => [c, [...fs.readFileSync(`${uiDir}/${c}.stories.tsx`, 'utf8').matchAll(/^export const (\w+)/gm)].map((m) => m[1])]));
entry += `const storyOrder = ${JSON.stringify(order)};\n`;
entry += `const mods = {${compFiles.map((c, i) => `${c}: M${i}`).join(', ')}};\nconst storyMods = {${compFiles.map((c, i) => `${c}: S${i}`).join(', ')}};\n`;
entry += fs.readFileSync(path.join(import.meta.dirname, 'preview-runtime.js'), 'utf8').replaceAll('__NS__', NS);
const entryPath = path.join(BUILD, 'entries/bundle.tsx');
fs.writeFileSync(entryPath, entry);

const result = await esbuild.build({
  entryPoints: [entryPath],
  bundle: true, format: 'iife', minify: true, platform: 'browser', target: 'es2020',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.DEV': 'false', 'import.meta.env.MODE': '"production"' },
  loader: { '.svg': 'dataurl', '.jpg': 'dataurl', '.png': 'dataurl' },
  plugins: [globalsPlugin],
  nodePaths: [path.join(REPO, 'node_modules')],
  write: false, legalComments: 'none', logLevel: 'warning', metafile: true,
});
let code = result.outputFiles[0].text;
if (/<\/script|<!--/i.test(code)) {
  code = code.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
}
// exported component names: everything PascalCase that is a function/forwardRef object, by module order
const header = { format: 4, namespace: NS, components: [] };
const names = readJson(path.join(BUILD, 'components.json'));
for (const n of Object.keys(names.comps)) header.components.push({ name: n });
code = `/* @ds-bundle: ${JSON.stringify(header)} */\n` + code;
fs.writeFileSync(path.join(OUT, 'bundle.js'), code);
console.log('bundle.js', (code.length / 1024).toFixed(0), 'KB · react', reactVersion, '· components', compFiles.length);
fs.writeFileSync(path.join(BUILD, 'react-version.txt'), reactVersion);

// ---- stylesheet: Tailwind v4 over the components, without the token declarations ------------
// Colour, radius, spacing and shadow values come from the design system's tokens.css; only the
// per-theme font family and the Enterprise radius overrides that tokens.css cannot express stay here.
const src = fs.readFileSync(path.join(REPO, 'src/styles/ad-design-kit.css'), 'utf8');
const start = src.indexOf('/* ---------- Primitives');
const end = src.indexOf('/* ---------- Tailwind theme');
if (start < 0 || end < 0) throw new Error('ad-design-kit.css: expected the Primitives and Tailwind theme sections');
const override = `/* Token values live in the design system's tokens.css; only what it cannot express is declared here. */
:root { --adk-font-base: var(--font-sans); --adk-text-xxs: 8px; }
[data-theme="enterprise"], [data-theme="enterprise-dark"] {
  --adk-font-base: var(--font-serif);
  --adk-rounded-xxs: 1px; --adk-rounded-xs: 1px; --adk-rounded-sm: 1px; --adk-rounded: 4px;
  --adk-rounded-base: 4px; --adk-rounded-lg: 4px; --adk-rounded-xl: 4px;
}
[data-theme="modern-dark"], [data-theme="enterprise-dark"] { color-scheme: dark; }

`;
const cssHeader = src.slice(0, src.indexOf('@custom-variant'));
const modified = cssHeader + '@custom-variant dark (&:where([data-theme$="-dark"], [data-theme$="-dark"] *));\n\n' + override + src.slice(end);
fs.writeFileSync(path.join(BUILD, 'adk-modified.css'), modified);
fs.writeFileSync(path.join(BUILD, 'input.css'), `@import "tailwindcss" source(none);\n@source "${path.join(REPO, 'src/components')}";\n@source "${path.join(REPO, 'src/assets')}";\n@import "./adk-modified.css";\n`);
execFileSync(path.join(REPO, 'node_modules/.bin/tailwindcss'), ['-i', path.join(BUILD, 'input.css'), '-o', path.join(OUT, 'bundle.css'), '--minify'], { stdio: 'inherit' });

// ---- types: declaration emit of the components, merged into one index.d.ts ---------------------
const dtsDir = path.join(BUILD, 'dts');
fs.rmSync(dtsDir, { recursive: true, force: true });
fs.writeFileSync(path.join(BUILD, 'tsconfig.dts.json'), JSON.stringify({
  compilerOptions: { target: 'es2023', lib: ['ES2023', 'DOM'], module: 'esnext', moduleResolution: 'bundler', jsx: 'react-jsx', skipLibCheck: true, declaration: true, emitDeclarationOnly: true, outDir: dtsDir, rootDir: path.join(REPO, 'src'), allowImportingTsExtensions: true, verbatimModuleSyntax: true, types: [] },
  include: [path.join(REPO, 'src/components/ui/*.tsx'), path.join(REPO, 'src/components/icons/*.ts*'), path.join(REPO, 'src/lib/cn.ts')],
  exclude: [path.join(REPO, 'src/**/*.stories.tsx')],
}, null, 1));
try { execFileSync(path.join(REPO, 'node_modules/.bin/tsc'), ['-p', path.join(BUILD, 'tsconfig.dts.json')], { stdio: 'pipe' }); } catch { /* type errors do not block the emit */ }
const uiDts = path.join(dtsDir, 'components/ui');
let dts = `// ${system.title} — types of the components in bundle.js (window.${NS}). Generated from src/components/ui/*.tsx; documentation, not a build input.\nimport type * as React from "react";\n\n`;
for (const f of fs.readdirSync(uiDts).filter((f) => f.endsWith('.d.ts')).sort()) {
  let t = fs.readFileSync(path.join(uiDts, f), 'utf8').split('\n').filter((l) => !/^import /.test(l) || /from .react./.test(l)).join('\n').replace(/^import .*from .react.*;\n?/gm, '');
  dts += `// ---- ${f.replace('.d.ts', '.tsx')} ----\n${t.trim()}\n\n`;
}
const iconNames = (fs.readFileSync(path.join(dtsDir, 'components/icons/figma.d.ts'), 'utf8').match(/export declare const (\w+)/g) || []).map((s) => s.replace('export declare const ', ''));
dts += `// ---- icons (src/components/icons) — ${iconNames.length} icons, each a 1em SVG component taking IconProps; window.${NS}.Icons.<Name> ----\nexport interface IconProps extends React.SVGProps<SVGSVGElement> { /** Accessible name; without it the icon is hidden from assistive technology. */ title?: string }\n`;
dts += iconNames.map((n) => `export declare const ${n}: (props: IconProps) => React.JSX.Element;`).join('\n') + '\n';
fs.writeFileSync(path.join(OUT, 'index.d.ts'), dts);
console.log('bundle.css + index.d.ts written');
