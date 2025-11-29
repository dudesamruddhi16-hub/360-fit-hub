import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: 'all', // Allow all hosts
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React-related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Bootstrap UI libraries
          'ui-vendor': ['react-bootstrap', 'bootstrap'],
          // Split chart library
          'charts': ['recharts'],
          // Split utilities and services
          'utils': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB
  },
})