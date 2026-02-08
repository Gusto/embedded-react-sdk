// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import { resolve, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const scssPreprocessorOptions = {
  scss: {
    api: 'modern-compiler',
    additionalData: `@use "@/styles/Helpers" as *; @use '@/styles/Responsive' as *;\n`,
  },
} as const

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['./static', '../public'],
  viteFinal: async config => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': resolve(__dirname, '../src'),
        },
      },
      css: {
        preprocessorOptions: scssPreprocessorOptions,
      },
    })
  },
}

export default config
