import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/alloy-design-system/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      // Resolve shared deps from preview's own node_modules so imports in
      // ../../src and ../../specimens don't fail when built from here.
      // Array form with regex `find` lets us match exact specifiers only.
      { find: 'clsx',                    replacement: path.resolve(__dirname, 'node_modules/clsx/dist/clsx.mjs') },
      { find: 'react/jsx-runtime',       replacement: path.resolve(__dirname, 'node_modules/react/jsx-runtime.js') },
      { find: 'react/jsx-dev-runtime',   replacement: path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js') },
      { find: /^react$/, replacement:    path.resolve(__dirname, 'node_modules/react/index.js') },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, 'node_modules/react-dom/index.js') },
    ],
  },
  server: {
    port: 5180,
    fs: {
      allow: ['..'],
    },
  },
});
