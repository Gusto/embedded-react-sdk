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

### Prewarm & Cache

```bash
npm run e2e:scenarios:prewarm                    # All scenarios
npm run e2e:scenarios:prewarm -- --domain payroll # Single domain
npm run e2e:scenarios:clear                      # Clear cache
```

The runner caches provisioned companies in `e2e/.scenario-cache.json` (gitignored). Re-runs reuse cached companies when the scenario structure hasn't changed and the flow token is still valid.

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
