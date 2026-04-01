

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react() , tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['lucide-react']
  },
  ssr: {
    noExternal: ['lucide-react']
  },
  resolve: {
    alias: {
      // optional: helps resolution in tricky setups (remove if unnecessary)
      'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react')
    }
  }
});