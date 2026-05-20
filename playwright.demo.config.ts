import { defineConfig, devices, type ReporterDescription } from '@playwright/test'

process.env.E2E_USE_REAL_BACKEND = 'true'
process.env.E2E_GWS_FLOWS_HOST = process.env.E2E_GWS_FLOWS_HOST || 'https://flows.gusto-demo.com'

// Reporter stack: `list` gives per-test live stdout (status + duration as
// each test starts/finishes) so the GitHub Actions log shows progress
// instead of going silent for the duration of the run. `html` writes the
// browseable report we already upload as an artifact, and the custom
// scenario-reporter writes the structured JSON + timings.md alongside.
// `github` is CI-only — it surfaces failed tests as PR-level annotations
// in the Files Changed view with file/line refs.
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
  testIgnore: ['**/transition-payroll*'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  // Run sequentially everywhere: the scenario fixture caches a provisioned
  // demo company per worker, so running multiple workers means multiple
  // demo creations against flows.gusto-demo.com for tests that share a
  // scenario ID. With workers: 1 the worker-scoped cache effectively
  // becomes suite-scoped, collapsing N tests on one scenario down to a
  // single POST /demos round-trip. Override locally with --workers=N if
  // you specifically want parallel debugging of independent scenarios.
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
