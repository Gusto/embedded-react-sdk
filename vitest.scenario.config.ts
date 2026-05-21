import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['e2e/scenario/**/*.test.ts', 'e2e/utils/**/*.test.ts'],
    globals: false,
  },
})
