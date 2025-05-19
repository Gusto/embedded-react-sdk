import { defineConfig } from 'vite'
import { resolve } from 'path'
import baseViteConfig from '../vite.config'
import svgr from 'vite-plugin-svgr'

// Get the base config by calling the function with development mode
const baseConfig = baseViteConfig({ mode: 'development', command: 'serve' })

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
  build: baseConfig.build,
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'), // Need to point one level lower than ladle config
    },
  },
  css: baseConfig.css,
})
