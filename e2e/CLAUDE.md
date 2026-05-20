# Playwright E2E Testing

## Running Tests

```bash
npm run test:e2e                          # MSW mode (no backend)
npm run test:e2e:local                    # Against real gws-flows
npm run test:e2e:local -- --grep @payroll # Single domain
```

Tests live in `e2e/tests/` organized by domain (e.g., `e2e/tests/payroll/`).

## Scenario-Driven Architecture

Tests declare the state they need via **scenarios** — JSON files in `e2e/scenarios/<domain>/` that describe the company, employees, pay schedules, and payrolls to provision.

### Writing a Scenario

1. Create a JSON file in `e2e/scenarios/<domain>/<name>.json`
2. Set `baseDemo` to the cheapest gws-flows demo type that gets close
3. Add `decorations` for the entities your test needs (locations, employees, contractors, pay schedules, payrolls)
4. List `expectedContext` paths that must be populated after provisioning
5. Validate: `npm run scenarios:validate`

Scenarios support `$ref` to shared fragments in `e2e/scenarios/fragments/` and template tokens (`{{ts}}` for uniqueness, `{{relative:+Nd:DayName}}` for date arithmetic).

### Writing a Test

```typescript
import { test, expect } from '../../utils/localTestFixture'

test.describe('My feature', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'payroll/standard-biweekly-2-employees',
    })
  })

  test('does something', async ({ page, scenario }) => {
    await page.goto('/?flow=payroll')
    // scenario.employeeIds.alice, scenario.companyId, etc. are available
  })
})
```

The `scenario` fixture provisions the company (or returns a cached result), injects flowToken/companyId into `page.goto`, and auto-tags the test with `@<domain>` for grep filtering.

### Prewarm

```bash
npm run e2e:scenarios:prewarm                    # All scenarios
npm run e2e:scenarios:prewarm -- --domain payroll # Single domain
```

The prewarm script walks every scenario JSON and calls `provisionScenario()` against the demo backend so you can confirm scenarios are well-formed before running specs against them. **There is currently no provisioning cache** — every test run, and every test inside a run, creates a fresh demo company. See `e2e/reports/timings.md` after a run for per-test phase timings (provisioning vs body) to see how much wall time this costs.

### Phase timings

The custom Playwright reporter at `e2e/reporters/scenario-reporter.ts` writes two artifacts after every run:

- `e2e/reports/results.json` — structured per-test results (status, durations, phase timings)
- `e2e/reports/timings.md` — human-readable per-domain summary showing how much of each test's wall time is spent on `provisioning` (creating + decorating a fresh demo company) vs `body` (everything else: navigation, SDK interaction, backend round-trips)

If `provisioning` dominates `body`, the suite is paying repeatedly for setup that could be shared across tests. If `body` dominates, the bottleneck is in the SDK flow itself or the backend's response time — not something a caching change will fix.

### Scenario Module Tests

```bash
npm run test:scenarios  # Runs vitest for e2e/scenario/ modules
```

## Playwright MCP Server

Use the Playwright MCP server for browser debugging and automation during E2E development.

## Serving the E2E App

```bash
npm run e2e:serve
```
