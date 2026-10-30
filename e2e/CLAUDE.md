# Playwright E2E Testing

## Running Tests

```bash
npm run test:e2e                          # MSW mode (no backend)
npm run test:e2e:local                    # Against real gws-flows (requires zenpayroll + gws-flows running locally)
npm run test:e2e:demo                     # Against the hosted demo backend (same target CI uses)
npm run test:e2e:local -- "tests/payroll/"  # Single domain (path substring, not --grep — see note below)
```

Tests live in `e2e/tests/` organized by domain (e.g., `e2e/tests/payroll/`).

`--grep @<domain>` does **not** work for filtering by domain, even though the `@<domain>`
tag exists (see "Writing a Test" below) — that tag is pushed via `testInfo.annotations` at
_test-execution_ time, inside a fixture, but `--grep` filters during the earlier
collection/listing phase and only matches literal test-title text. No title contains
`@payroll`, so `--grep @payroll` reports "No tests found." CI filters by domain the same
way shown above — a path substring against the matrix domain (`.github/workflows/ci.yaml`,
the `Run e2e tests` step) — so match that locally instead of reaching for `--grep`.

## Reproducing a CI failure locally

CI's `e2e` job runs `npm run test:e2e:demo` against the hosted demo backend at
`https://flows.gusto-demo.com` (set in `playwright.demo.config.ts`) — **not** a local
zenpayroll/gws-flows stack. `test:e2e:local` is a different mode entirely, for driving a
backend you're running yourself; using it won't reproduce a demo-backend failure, and you
don't need zenpayroll or gws-flows up at all to match what CI did.

To rerun a specific failing spec headed (visible browser) against that same backend:

```bash
npx playwright install chromium   # one-time, if you hit "Executable doesn't exist"
npm run test:e2e:demo -- e2e/tests/payroll/91-regular-submit.spec.ts --headed --project=chromium
```

`npm run` needs the `--` separator before any flags you want passed through to Playwright
(`--headed`, `--grep`, a spec path, etc.). `globalSetup` provisions/refreshes a demo company
against the live backend before the test runs, so the first launch can take a minute or two.

## File naming convention: numeric prefix encodes mutation class

Specs within each domain folder use a numeric prefix that signals whether the spec is read-only/safe or mutates the shared company:

- **`01-89`**: read-only specs or specs that create uniquely-named entities (timestamped names). Safe to share a company with each other.
- **`90-99`**: mutating specs that permanently change state (submit a payroll consuming the open pay period, terminate a seed employee, complete the onboarding wizard, etc.). Within `90-99`, lower numbers run first — encode any inter-mutation dependencies in the prefix.

Playwright with `workers: 1` runs spec files alphabetically by full path within each shard. Numeric prefixes give explicit, glance-able control over the run order.

Example from `e2e/tests/payroll/`:

```text
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

The `scenario` fixture looks up the pre-provisioned context, injects flowToken/companyId into `page.goto`, and auto-tags the test with `@<domain>` — this lands in `testInfo.annotations` and shows up in the HTML/JSON report for filtering _results_, but it's applied too late (at test-execution time) to affect `--grep`, which filters at collection time. To run only one domain's tests, filter by path instead (see "Running Tests" above).

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

## Accessibility checks

Every spec using `localTestFixture`'s `page` fixture gets an automatic axe check for free: after the test body finishes, if the test passed (or wasn't given a status) and navigated somewhere real, `expectNoAxeViolations(page)` (`e2e/utils/a11y.ts`, wrapping `@axe-core/playwright`) runs against the flow's rendered output. No per-test call needed — this is what makes the e2e layer worth having alongside the vitest gate (`src/test/setup.ts`): it renders in real Chromium, so unlike jsdom it can actually validate color contrast.

The check is scoped to `<main>` (`e2e/main.tsx` wraps every flow in one), not the whole page, and doesn't require an `<h1>` or other page chrome from the harness. The SDK doesn't own the host page's landmarks, heading hierarchy, `lang`, or title — a real partner page supplies those — so checking against a bare test harness's page structure would just be testing the harness, not the SDK. Scoping to `main` matches the existing vitest precedent (`DEFAULT_DISABLED_RULES` scopes to the component's own `container`, not `document.body`, for the same reason).

`color-contrast` is temporarily disabled by default in `expectNoAxeViolations` (see the `TEMPORARILY_DISABLED_RULES` comment in `e2e/utils/a11y.ts`) — a real contrast bug on a shared `Text` component fails nearly every spec that renders it. Remove that once it's fixed.

Call `expectNoAxeViolations(page)` manually mid-test only when you need to check an intermediate screen the test navigates away from before ending (see `e2e/tests/contractor/04-cancel-mid-onboarding.spec.ts` for an example) — the automatic check only sees the final state.

## Serving the E2E App

```bash
npm run e2e:serve
```
