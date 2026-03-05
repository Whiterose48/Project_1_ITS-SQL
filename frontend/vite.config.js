import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    }
  },
  build: {
    // ═══ Content-Hash Filenames for Cache Busting ═══
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Split DuckDB wasm into its own chunk (large, rarely changes)
    chunkSizeWarningLimit: 1500,
    sourcemap: false,
    target: 'esnext',
    minify: 'esbuild',
  },
});
