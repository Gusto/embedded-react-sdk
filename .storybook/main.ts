// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import { resolve, dirname } from 'path'
// @ts-expect-error Storybook v10 requires explicit .ts extension for native ESM resolution
import { scssPreprocessorOptions } from '../vite.config.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: ['./static'],
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
