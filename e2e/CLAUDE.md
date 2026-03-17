# E2E Testing

## Running Tests

```bash
npm run test:e2e
```

Tests live in this directory and require both gws-flows and ZenPayroll running locally. Use the `/start-servers` command to get them running. See `local.config.example.env` for environment configuration.

## Playwright MCP Server

Use the Playwright MCP server for browser debugging and automation during E2E development. It provides tools for navigating, clicking, typing, taking screenshots, and inspecting page state.

## Validating Behavior with E2E Tests

E2E tests are a powerful way to validate that features work correctly end-to-end. When investigating bugs or verifying new behavior:

- Write or run E2E tests to confirm the expected behavior
- Use Playwright's video recording to capture test runs for review and debugging
- Share test videos with reviewers to demonstrate that the feature works as expected

## Test Patterns

Follow existing patterns in this directory for consistency:

- Use `globalSetup.ts` for shared setup logic (server health checks, token refresh)
- Use `scripts/refreshToken.ts` for auth token management
- Place test fixtures and helpers alongside tests

## Serving the E2E App

```bash
npm run e2e:serve
```

This starts a Vite dev server for the E2E test application.
