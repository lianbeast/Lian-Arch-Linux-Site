import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Heavy 3D runtime — cached independently from app code, split for parallel loading
            {
              name: 'vendor-three',
              test: /node_modules[\\/](three|three-stdlib|@react-three|postprocessing)[\\/]/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
})
