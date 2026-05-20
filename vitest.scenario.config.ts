import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['e2e/scenario/**/*.test.ts'],
    globals: false,
  },
})
