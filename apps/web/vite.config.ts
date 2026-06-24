import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query', 'axios'],
          'ui-vendor': ['lucide-react'],
          'chart-vendor': ['recharts']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    headers: { 'Cross-Origin-Opener-Policy': 'unsafe-none' },
    proxy: { '/api': 'http://localhost:3001' }
  }
}));
