import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['typedoc-custom/**/*.test.ts'],
  },
})
