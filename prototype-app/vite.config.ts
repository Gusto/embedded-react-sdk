import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { scssPreprocessorOptions, svgrPlugin } from '../vite.config'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react(), svgrPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  css: {
    preprocessorOptions: scssPreprocessorOptions,
  },
  server: {
    port: 5300,
    strictPort: false,
    open: true,
  },
})
