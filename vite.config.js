import { defineConfig } from 'vite';

// When deployed to GitHub Pages under a project path (e.g. /free-day-finder/),
// Vite needs the correct base so assets resolve. Override via env in CI.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['../tests/**/*.test.js'],
  },
});
