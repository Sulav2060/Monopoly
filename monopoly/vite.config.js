import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  build: {
    rollupOptions: {
      output: {
        // manualChunks removed to fix React 19 production build crash
        //need to find a better solution later
      },
    },
  },
})
