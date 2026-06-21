import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500, // Artırılmış uyarı limiti (1.5 MB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules içindeki kütüphaneleri "vendor" adında ayrı bir dosyaya böl
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
