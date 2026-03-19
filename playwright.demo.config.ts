import { defineConfig, devices } from '@playwright/test'

process.env.E2E_LOCAL = 'true'
process.env.E2E_GWS_FLOWS_HOST = process.env.E2E_GWS_FLOWS_HOST || 'https://flows.gusto-demo.com'

export default defineConfig({
  globalSetup: './e2e/globalSetup.ts',
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  maxFailures: process.env.CI ? 1 : undefined,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 120_000,
  expect: {
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI
      ? 'npm run e2e:preview'
      : 'npm run i18n:generate && npx vite build && npm run e2e:install-sdk && npm run e2e:build && npm run e2e:preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
