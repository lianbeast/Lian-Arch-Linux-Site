import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // Relative base so the build resolves from any subpath, including a
  // GitHub Pages project site served at /<repo>/.
  base: './',

  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split the framework out so app changes do not bust its cache.
        //
        // This must be a function. Vite 8 builds with Rolldown, which rejects
        // the object form that Rollup accepted:
        //   "Invalid type: Expected Function but received Object"
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react'
          }
        },
      },
    },
  },
})
