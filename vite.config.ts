import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages can publish the "docs" folder of the repository.
// Relative base ("./") makes the built site work in ANY directory,
// including https://basiq653.github.io/vlink.github.io/.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'docs',
  },
});
