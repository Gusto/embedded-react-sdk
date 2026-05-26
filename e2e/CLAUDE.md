# Playwright E2E Testing

## Running Tests

```bash
npm run test:e2e                          # MSW mode (no backend)
npm run test:e2e:local                    # Against real gws-flows
npm run test:e2e:local -- --grep @payroll # Single domain
```

Tests live in `e2e/tests/` organized by domain (e.g., `e2e/tests/payroll/`).

## File naming convention: numeric prefix encodes mutation class

Specs within each domain folder use a numeric prefix that signals whether the spec is read-only/safe or mutates the shared company:

- **`01-89`**: read-only specs or specs that create uniquely-named entities (timestamped names). Safe to share a company with each other.
- **`90-99`**: mutating specs that permanently change state (submit a payroll consuming the open pay period, terminate a seed employee, complete the onboarding wizard, etc.). Within `90-99`, lower numbers run first — encode any inter-mutation dependencies in the prefix.

Playwright with `workers: 1` runs spec files alphabetically by full path within each shard. Numeric prefixes give explicit, glance-able control over the run order.

Example from `e2e/tests/payroll/`:

```
01-regular-landing.spec.ts            <- RO: assert landing renders
02-off-cycle-landing.spec.ts          <- RO
...
90-dismissal-submit.spec.ts           <- mutating: runs BEFORE 91-regular-submit consumes the open pay period
91-regular-submit.spec.ts             <- mutating
99-transition-submit.spec.ts          <- runs LAST: changes pay schedule globally
```

New specs slot into the right range based on what they mutate. If a spec creates timestamped policies but doesn't touch shared state, it goes in the RO range even if it's technically a write.

## Scenario-Driven Architecture

Tests declare the state they need via **scenarios** — JSON files in `e2e/scenarios/shared/` that describe the company, employees, pay schedules, and payrolls to provision. There are 2 shared scenarios:

- **`shared/fresh-wizard`**: a fresh `react_sdk_demo` company with one HQ location. Used by every company-onboarding spec that drives the wizard from an empty state.
- **`shared/onboarded`**: a fully-onboarded `react_sdk_demo_company_onboarded` company with biweekly pay schedule, two employees (`alice`, `selfee`), three contractors (`individual`, `business`, `payable`). Used by every non-wizard spec in every domain.

Plus shared fragments in `e2e/scenarios/fragments/` that scenarios `$ref` for common entity shapes (`w2-salaried-employee`, `contractor-1099`, etc.).

### How provisioning works

Both shared scenarios are provisioned **once** in the CI `e2e-setup` job, validated with a hard health gate (`onboarding_completed=true`, signatory with identity verification Pass, zero payroll blockers, at least one onboarded employee), and serialized to `e2e/.e2e-scenarios.json` which all downstream e2e shards download as an artifact. Tests load their scenario context via a Map lookup in milliseconds — no per-test demo creation, no race against the demo backend during test runs.

### Writing a Test

```typescript
import { test, expect } from '../../utils/localTestFixture'

test.describe('My feature', () => {
  test.beforeEach(({}, testInfo) => {
    testInfo.annotations.push({
      type: 'scenario',
      description: 'shared/onboarded',
    })
  })

  test('does something', async ({ page, scenario }) => {
    await page.goto('/?flow=payroll')
    // scenario.employeeIds.alice, scenario.companyId, etc. are available
  })
})
```

The `scenario` fixture looks up the pre-provisioned context, injects flowToken/companyId into `page.goto`, and auto-tags the test with `@<domain>` for grep filtering.

### Adding a new scenario

1. Create a JSON file in `e2e/scenarios/shared/<name>.json` matching the schema in `e2e/scenarios/schema/scenario.schema.json`
2. Set `baseDemo`, add `decorations`, list `expectedContext` paths, set `requireOnboardedCompany` / `requireSignatory` / `requireNoBlockers` as appropriate
3. Validate: `npm run scenarios:validate`
4. Reference it from tests via `testInfo.annotations.push({ type: 'scenario', description: 'shared/<name>' })`

`e2e-setup` discovers shared scenarios via `readdirSync('e2e/scenarios/shared')` — no CI workflow edit needed when adding one.

### Prewarm

```bash
npm run e2e:scenarios:prewarm                    # All scenarios
```

Useful for confirming scenarios are well-formed locally before pushing.

### Phase timings

The custom Playwright reporter at `e2e/reporters/scenario-reporter.ts` writes two artifacts after every run:

- `e2e/reports/results.json` — structured per-test results (status, durations, phase timings)
- `e2e/reports/timings.md` — human-readable per-domain summary showing how much of each test's wall time is spent on `provisioning` (cached Map lookup now, was demo creation) vs `body` (navigation, SDK interaction, backend round-trips)

With the shared-artifact model, `provisioning` should be <100ms per test (Map lookup). If you see provisioning take longer, the artifact may be missing and the fixture is falling through to per-test creation — check that `e2e/.e2e-scenarios.json` exists.

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
