import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  //vendor-three.js dherai heavy vayera chunk ma break gareko
  //with this, change in index.js wont load whole three.js again (1.5mb) but only our code
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('three-stdlib')) {
              return 'vendor-three-stdlib';
            }
            if (id.includes('@react-three/drei')) {
              return 'vendor-react-three-drei';
            }
            if (id.includes('@react-three/fiber')) {
              return 'vendor-react-three-fiber';
            }
            if (id.includes('three')) {
              return 'vendor-three';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})
