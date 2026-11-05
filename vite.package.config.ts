// Library build for the npm package (scripts/build-package.mjs runs it). One ESM file per source module, so apps
// tree-shake to the components and icons they import; React, clsx and tailwind-merge stay external.
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
      external: [/^react($|\/)/, /^react-dom($|\/)/, 'clsx', 'tailwind-merge'],
      output: { preserveModules: true, preserveModulesRoot: 'src', entryFileNames: '[name].js' },
    },
  },
});
