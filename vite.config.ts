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
    // three.js alone is ~500 kB; it already lives in its own chunk, so lift the
    // warning threshold to keep the CI build log clean.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
        },
      },
    },
  },
});
