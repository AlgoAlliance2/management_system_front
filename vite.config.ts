import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Increase the warning limit slightly (optional, prevents noise)
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        // 2. Manual Chunks: Split heavy libraries into separate files
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'date-fns', 'sonner', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
})