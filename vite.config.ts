import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },
  assetsInclude: ['**/*.worker.js'],
  server: {
    // Prevent page reloads when switching tabs
    hmr: {
      overlay: false
    },
    // Disable automatic reloading on file changes
    watch: {
      usePolling: false,
      interval: 1000
    }
  }
})
