import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        work: resolve(import.meta.dirname, 'work/index.html'),
        approach: resolve(import.meta.dirname, 'approach/index.html'),
        studio: resolve(import.meta.dirname, 'studio/index.html'),
        start: resolve(import.meta.dirname, 'start/index.html')
      }
    }
  }
});
