import { defineConfig, devices, type ReporterDescription } from '@playwright/test'

// See playwright.demo.config.ts for the full reporter rationale. We mirror
// the stack here so the MSW-mode default config produces the same live
// stdout signal and PR annotations as the demo/local configs.
const reporters: ReporterDescription[] = [
  ['list'],
  ['html'],
  ['./e2e/reporters/scenario-reporter.ts'],
]
if (process.env.GITHUB_ACTIONS === 'true') {
  reporters.push(['github'])
}

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: reporters,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://localhost:5173',
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
    command: 'npm run e2e:serve',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
