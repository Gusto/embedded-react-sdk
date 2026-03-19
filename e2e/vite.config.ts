import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { svgrPlugin } from '../vite.config'

const gwsFlowsHost = process.env.E2E_GWS_FLOWS_HOST || 'http://localhost:7777'

const proxyConfig = {
  '/fe_sdk': {
    target: gwsFlowsHost,
    changeOrigin: true,
    secure: false,
  },
}

export default defineConfig({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'public'),
  plugins: [react(), svgrPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: proxyConfig,
  },
  preview: {
    port: 4173,
    proxy: proxyConfig,
  },
})
