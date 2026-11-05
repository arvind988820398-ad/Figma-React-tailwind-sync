// Library build for the npm package (scripts/build-package.mjs runs it). One ESM file per source module, so apps
// tree-shake to the components and icons they import; React, clsx, tailwind-merge and Floating UI stay external.
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Next.js App Router renders Server Components by default; a module that uses React state, effects, context or event
// handlers must say "use client" to be imported there. Each such module gets the directive as a banner (so the source
// maps stay right); purely presentational ones (Badge, Card, Kbd…) and the icons stay usable on the server.
const CLIENT = /\buse(State|Effect|LayoutEffect|Ref|Id|Memo|Callback|Context|Reducer|SyncExternalStore|Transition|Anchored|Floating)\b|\bcreateContext\b|\bon[A-Z]\w*=\{\s*(\(|async\b|[\w$]+\s*=>)/;
const needsClient = new Map<string, boolean>();
export const isClientModule = (id: string | null | undefined) => {
  if (!id || !/\/src\/.*\.tsx?$/.test(id)) return false;
  if (!needsClient.has(id)) needsClient.set(id, CLIENT.test(fs.readFileSync(id, 'utf8')));
  return needsClient.get(id)!;
};

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'dist-package',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: { index: 'src/index.ts', icons: 'src/components/icons/index.ts' },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, 'clsx', 'tailwind-merge', /^@floating-ui\//],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        banner: (chunk) => (isClientModule(chunk.facadeModuleId) ? "'use client';" : ''),
      },
    },
  },
});
