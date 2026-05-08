# Playwright E2E Testing

## Running Tests

```bash
npm run test:e2e
```

Tests live in the `e2e/` directory and require both gws-flows and ZenPayroll running locally. See `e2e/local.config.example.env` for environment configuration.

## Playwright MCP Server

Use the Playwright MCP server for browser debugging and automation during E2E development. It provides tools for navigating, clicking, typing, taking screenshots, and inspecting page state.

## Validating Behavior with E2E Tests

E2E tests are a powerful way to validate that features work correctly end-to-end. When investigating bugs or verifying new behavior:

- Write or run E2E tests to confirm the expected behavior
- Use Playwright's video recording to capture test runs for review and debugging
- Share test videos with reviewers to demonstrate that the feature works as expected

## Test Patterns

Follow existing patterns in `e2e/` for consistency:

- Use `e2e/globalSetup.ts` for shared setup logic (server health checks, token refresh)
- Use `e2e/scripts/refreshToken.ts` for auth token management
- Place test fixtures and helpers alongside tests

## Serving the E2E App

```bash
npm run e2e:serve
```

This starts a Vite dev server for the E2E test application.

## Visual diffing (opt-in)

`playwright.config.ts` and the local/demo configs all set a deliberately loose
threshold for Playwright's built-in screenshot comparison:

```ts
expect: {
  toHaveScreenshot: { threshold: 0.2, maxDiffPixelRatio: 0.5 },
}
```

The intent is to catch catastrophic regressions (wrong design system, broken
theme, missing CSS) without flagging the small flakiness inherent to live e2e
flows. Tighter visual checks belong in Storybook
(`npm run test:visual`) or Chromatic — see the project README "Visual
diffing" section.

### Adding a visual check to a spec

Visual checks are **opt-in**: existing flow specs do not screenshot the page,
because they hit a live backend and contain dynamic data (SSNs, emails,
timestamps). When adding a visual check:

1. Reach a stable, deterministic state in the test (e.g. an empty form before
   typing).
2. Snapshot only the rendered SDK container — never the whole page chrome —
   for example `await expect(page.locator('main')).toHaveScreenshot('foo.png')`.
3. Mask any dynamic regions with the `mask:` option so they are blacked out
   before comparison.

### Updating baselines

Snapshots are stored alongside the spec under
`<spec-name>-snapshots/` and are platform-sensitive. Generate them in CI
(Linux) — never locally on macOS or Windows.

To regenerate, run the e2e workflow with the `--update-snapshots` flag (e.g.
via a manual `workflow_dispatch` that appends `-- --update-snapshots` to the
test command), download the resulting PNGs from the workflow artifacts, and
commit them.
