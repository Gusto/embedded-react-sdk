import { defineConfig, devices, type ReporterDescription } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, 'e2e/local.config.env') })

process.env.E2E_USE_REAL_BACKEND = 'true'
process.env.E2E_GWS_FLOWS_HOST = process.env.E2E_GWS_FLOWS_HOST || 'http://localhost:7777'

// See playwright.demo.config.ts for the full reporter rationale; the same
// stack runs against the local gws-flows + ZenPayroll proxy so output shape
// stays consistent across environments.
const reporters: ReporterDescription[] = [
  ['list'],
  ['html'],
  ['./e2e/reporters/scenario-reporter.ts'],
]
if (process.env.GITHUB_ACTIONS === 'true') {
  reporters.push(['github'])
}

export default defineConfig({
  globalSetup: './e2e/globalSetup.ts',
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  // Run sequentially everywhere: the scenario fixture caches a provisioned
  // demo company per worker, so running multiple workers means multiple
  // demo creations for tests that share a scenario ID. With workers: 1
  // the worker-scoped cache effectively becomes suite-scoped. Override
  // locally with --workers=N for parallel debugging of independent
  // scenarios.
  workers: 1,
  reporter: reporters,
  timeout: 120_000,
  expect: {
    timeout: 30_000,
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
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
