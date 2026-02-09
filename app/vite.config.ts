import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {normalizePath} from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, 'web.config')),
          dest: './',
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
