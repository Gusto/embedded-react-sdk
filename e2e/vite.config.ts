import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, 'public'),
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default',
        titleProp: true,
      },
      include: ['**/*.svg?react', '**/*.svg'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        additionalData: `@use "@/styles/Helpers" as *; @use '@/styles/Responsive' as *;\n`,
      },
    },
  },
  server: {
    port: 5173,
  },
})
