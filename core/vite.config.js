import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      copyDtsFiles: false,
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.mjs' : 'index.js'
    },
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        preserveModules: false
      }
    }
  },
  root: process.cwd(),
  optimizeDeps: {
    entries: []
  }
})