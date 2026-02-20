import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { scssPreprocessorOptions, svgrPlugin } from '../vite.config'

const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST || 'http://localhost:7777'

export default defineConfig({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'public'),
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
    port: 5173,
    proxy: {
      '/fe_sdk': {
        target: gwsFlowsHost,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
