import { defineConfig } from 'vite'
import { resolve } from 'path'
import baseViteConfig from '../vite.config'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        exportType: 'default',
        titleProp: true,
      },
      include: ['**/*.svg?react', '**/*.svg'],
    }),
  ],
  build: baseViteConfig.build,
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'), // Need to point one level lower than ladle config
    },
  },
  css: baseViteConfig.css,
})
