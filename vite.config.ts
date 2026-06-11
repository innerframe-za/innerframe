import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // Split stable deps into named chunks — they keep their cache hash between app-only deploys
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router')) return 'react-vendor'
          if (id.includes('@supabase/')) return 'supabase'
          if (id.includes('/lucide-react/') || id.includes('@base-ui/')) return 'ui-vendor'
        },
      },
    },
  },
})
