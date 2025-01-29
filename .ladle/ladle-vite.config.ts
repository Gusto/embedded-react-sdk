import { defineConfig } from 'vite'
import { resolve } from 'path'
import baseViteConfig from '../vite.config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'), // Need to point one level lower than ladle config
    },
  },
  css: baseViteConfig.css,
})
