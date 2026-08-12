import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  // Served from the root domain (user site: edgarhovsepyan.github.io), so the
  // base is '/'. A project page would need '/<repo>/' here instead.
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
        },
      },
    },
  },
});
