# Embedded React SDK

React component library for Gusto's Embedded Payroll product. Built with TypeScript, React, react-hook-form, TanStack Query, Zod, Vite, Vitest, Playwright, i18next, and Storybook.

## Commands

```bash
npm run build # Build the SDK
npm run test -- --run # Run tests once and exit (omitting --run starts watch mode, which won't exit)
npm run storybook # Start Storybook on port 6006
npm run e2e:serve # Start E2E test app
npm run test:e2e # Run E2E tests (requires gws-flows + ZenPayroll running)
npm run dev:setup # Link SDK into gws-flows for local development
npm run i18n:generate # Generate translation types
```

## SDK Dev App

To get started, first run `npm install`, then for a dev SDK build:

```bash
npm run sdk-app # Dev build with HMR
```

Or for a production SDK build:

```bash
npm run sdk-app-prod # Production build (uses built dist/)
```

See [sdk-app/README.md](sdk-app/README.md) for all available commands and environment options.

## Code Style

- Write self-explanatory code; avoid comments unless they are JSDoc for public APIs, TODO/FIXME for temporary workarounds, or legal notices
- Use descriptive variable/function names that eliminate the need for comments
- NEVER use `!important` in CSS/SCSS files — use proper CSS specificity instead
- Do not include `@use` imports in `.module.scss` for modules globally available via Vite (e.g., `@/styles/Helpers` is auto-injected)

## Documentation

Files under `docs/` are **partner-facing**. They document the public SDK API for engineers integrating it into their own app. When writing or editing them:

- Don't refer to "partners" in third person; the reader **is** the partner. Write neutrally or in second person ("supply the value at submit time", not "partners supply the value at submit time").
- Don't speculate about the integrator's app or workflow ("captured on a previous step", "in your onboarding wizard", etc.). Describe what the API does and how to use it, not why someone might want it — there are many valid reasons.
- Code samples must compile against the published SDK surface only. No `@/` import aliases, no internal helpers.

`CLAUDE.md`, source comments, and other internal docs can reference "partners" and our team freely — they're written for SDK maintainers.

## SDK Architecture

### ComponentsContext Pattern

All UI rendering goes through `useComponentContext()`. Never import UI primitives directly:

```tsx
const Components = useComponentContext()
return <Components.TextInput {...props} />
```

### Field Components for react-hook-form

Use Field components from `src/components/Common/Fields/` inside `FormProvider`. For inputs outside react-hook-form, use UI primitives from `useComponentContext()` directly.

### Component Organization

```text
src/components/
├── Common/ # Shared UI primitives and Field components
│ ├── Fields/ # Form-connected Field components (use for forms)
│ └── UI/ # Low-level UI components (via ComponentsContext)
├── Company/ # Company domain features
├── Employee/ # Employee domain features
├── Contractor/ # Contractor domain features
├── Payroll/ # Payroll domain features
└── Flow/ # Multi-step flow orchestration
```

### API Layer (`@gusto/embedded-api`)

All API calls go through the Gusto Embedded API — imported via the version-agnostic `@gusto/embedded-api` alias, declared in `package.json` as `npm:@gusto/embedded-api-v-<date>` and currently pinned to `@gusto/embedded-api-v-2026-02-01`. Import specifiers must use the alias (enforced by the `sdk-conventions/use-embedded-api-alias` lint rule), so a version bump only updates the alias target plus `API_VERSION` rather than editing import paths.

Import paths:

- `@gusto/embedded-api/react-query/<operation>` — React Query hooks
- `@gusto/embedded-api/models/components/<name>` — Entity types
- `@gusto/embedded-api/models/operations/<name>` — Request/response types
- `@gusto/embedded-api/models/errors/<name>` — Error types

Hook naming: `use<Resource><Action>Suspense` (queries), `use<Resource><Action>Mutation` (mutations)

#### Auto-invalidation on mutation success

The `QueryClient` produced by `createSdkQueryClient` (in `src/contexts/ApiProvider/createSdkQueryClient.ts`) sets a global mutation default: on any successful mutation under the `[API_QUERY_NAMESPACE]` key — the _resolved_ package name `@gusto/embedded-api-v-2026-02-01`, not the `@gusto/embedded-api` alias, since TanStack keys off the real package — it invalidates **every** SDK query. Hand-written keys must read `API_QUERY_NAMESPACE` (enforced by the `sdk-conventions/no-literal-api-query-namespace` lint rule), never the dated string directly. Both `ApiProvider` (production) and `GustoTestProvider` (tests) use this factory, so the behavior is identical in both environments.

Implications when writing SDK code:

- **Do not call `queryClient.invalidateQueries(...)` after a successful `@gusto/embedded-api` mutation.** It's redundant — the global `onSuccess` already invalidated the entire SDK namespace. Just `await mutateAsync(...)` and the next render's queries refetch automatically.
- This is why `usePaymentMethodList`, `useEmployeeCompensation`, etc. don't manually invalidate after their delete/update mutations.
- If a partner brings their own `QueryClient` to `ApiProvider`, the defaults are **not** applied to it — they're responsible for matching the contract if they want this behavior. Don't paper over that with manual invalidation in hooks; treat it as their responsibility.
- If you need to invalidate _more narrowly_ (e.g. you only want one query to refetch, not the whole namespace), that's a code smell — most likely the global invalidate is already doing what you want.

### Provider Stack

```text
GustoProvider → ComponentsProvider → ThemeProvider → LocaleProvider / I18nextProvider → ApiProvider → {children}
```

### i18n

All user-facing text uses i18next. Run `npm run i18n:generate` after changing translations. Use the `useTranslation` hook.

### Partner hooks (`composeErrorHandler` / `composeSubmitHandler`)

Exported headless hooks build `errorHandling` with **`composeErrorHandler`** (not a React hook). For multi-form screens, **`composeSubmitHandler`** coordinates validation + ordered submits and returns `{ handleSubmit, errorHandling }` aggregated across those forms. The result plugs back into `composeErrorHandler` when partners need extra `@gusto/embedded-api` queries or screen-level submit state in the same error surface.

### Component & Feature Conventions

Durable conventions that apply SDK-wide to any component or feature:

- **One i18n namespace per self-contained component.** A self-contained component owns a single translation namespace and reads only from it — never reach across namespaces. Run `npm run i18n:generate` after changing translations.
- **Scoped, unique events.** Prefer unique event names scoped to the component/surface that fires them over sharing or borrowing names across flows (e.g. don't reuse an onboarding event from a different surface).
- **Standalone components take IDs, not entities.** Public/standalone components accept entity IDs (e.g. `employeeId`, `jobId`) and fetch their own data rather than receiving full entity objects across the public API. Passing data structures is fine for internal-only components.
- **Non-form data hooks return the standard union.** Data-fetching hooks return the `HookLoadingResult | BaseHookReady<…>` discriminated union (see `src/partner-hook-utils/types.ts`) for consistent loading/error/action ergonomics.
- **Shared UI stays presentational.** UI reused across multiple flows takes its copy via props or an injected `dictionary` so a partner's copy override in one surface doesn't leak into another (e.g. the `DeductionsForm` + `useFormDictionary` pattern).
- **Partial, in-place loading.** Prefer consistent partial loading — component chrome plus an inline loader — over full-surface loaders.
- **Thin orchestrators.** Orchestrators stay thin and compose standalone, independently-consumable pieces.

## PR and Commit Conventions

- Follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, etc.
- Prefer small, focused PRs (~400 lines max). Split large work into types → hooks → UI → integration.
- During 0.x.x: `feat:` → MINOR bump, `fix:` → PATCH bump, `feat!:`/`fix!:` → MINOR bump (breaking)

## Local Development Environment

Three-repo architecture with sibling directories:

```text
~/workspace/
├── zenpayroll/ # Core Rails app
├── gws-flows/ # Rails API proxy for local SDK testing
└── embedded-react-sdk/ # This repo
```

Use `../gws-flows` as the source of truth for current API behavior and response shapes. Do NOT copy gws-flows code 1:1 — understand the "what" then implement it the SDK way.

## Storybook-First Development

Build and test components in Storybook (`npm run storybook`) before integrating into flows. No backend required. Verify all states: default, loading, error, empty, and edge cases.

## Testing

- **Always** use `npm run test -- --run` to avoid watch mode hanging
- Run specific tests: `npm run test -- --run src/components/MyComponent.test.tsx`
- Run with coverage: `npm run test -- --run --coverage`
- Update snapshots: `npm run test -- --run -u`
- E2E tests require gws-flows and ZenPayroll running. See `e2e/local.config.example.env`.

### Asserting on HTTP requests

When a test needs to verify which HTTP requests went out (verb, path, body, call count, ordering across endpoints), use `vi.fn()` to wrap the MSW resolver. Do **not** introduce a custom request-spy utility — vitest and MSW already provide everything needed.

Always pass the resolver type as a generic to `vi.fn` — without it, `request` is inferred as `any` and `request.json()` / `request.url` fail `@typescript-eslint/no-unsafe-call`. Import the type from `msw`:

```ts
import { HttpResponse, type HttpResponseResolver } from 'msw'
```

Per-endpoint assertions (call count, request body):

```ts
let createJobBody: Record<string, unknown> | null = null
const createJobResolver = vi.fn<HttpResponseResolver>(async ({ request }) => {
  createJobBody = (await request.json()) as Record<string, unknown>
  return HttpResponse.json({ uuid: 'new-job-uuid' /* ... */ }, { status: 201 })
})

server.use(handleCreateEmployeeJob(createJobResolver))

// ...interact with the component...

expect(createJobResolver).toHaveBeenCalledTimes(1)
expect(createJobBody).toMatchObject({ title: 'Engineer', hire_date: '2025-01-15' })
```

Cross-endpoint ordering — use `mock.invocationCallOrder` (vitest assigns a global counter to every spy invocation):

```ts
expect(createJobResolver.mock.invocationCallOrder[0]!).toBeLessThan(
  updateCompensationResolver.mock.invocationCallOrder[0]!,
)
```

Path assertions when the path itself encodes IDs (e.g., `PUT /v1/jobs/:id`) — capture the URL inside the resolver:

```ts
let updateJobPath: string | null = null
const updateJobResolver = vi.fn<HttpResponseResolver>(({ request }) => {
  updateJobPath = new URL(request.url).pathname
  return HttpResponse.json({/* ... */})
})

// ...
expect(updateJobPath).toBe('/v1/jobs/job-uuid')
```

When you want to assert that a specific endpoint was _not_ called, register its handler with a `vi.fn()` resolver alongside the one(s) you do expect, then `expect(resolver).not.toHaveBeenCalled()`. This is more explicit than relying on the default mock returning success.

Most form-hook tests don't need this at all — assertions on the rendered DOM, the `onEvent`/`onSaved` callback payload, and the hook's `data`/`status` typically pin behavior sufficiently. Reach for resolver spies only when the wire-level contract (verb, path, version, sequence) is the thing under test, e.g. when a refactor needs to prove that two endpoints are still called in the right order or that the body still carries an optimistic-locking `version`.

## Cursor Cloud specific instructions

### Development workflow

The primary development command is `npm run sdk-app`, which starts the SDK Dev App on port 5200 with HMR. It auto-provisions a demo company against `flows.gusto-demo.com` on first run (writes credentials to `sdk-app/env/.env.demo`). No additional backend services or configuration are needed.

- `npm run build` is for production artifacts only — not needed during development.
- Storybook (`npm run storybook`, port 6006) is available for isolated component development without any API backend.

### Running tests

- Always use `npm run test -- --run` (the `--run` flag is critical to avoid vitest watch mode, which hangs in non-interactive shells).
- Run a single test file: `npm run test -- --run src/components/MyComponent.test.tsx`
- All unit tests use MSW mocks — no external services required.
- E2E tests (`npm run test:e2e`) require GWS-Flows + ZenPayroll which are not available in Cloud Agent VMs.

### Lint and format

- `npm run lint:check` — ESLint (exits 0 with pre-existing warnings, no errors)
- `npm run format:check` — Prettier
- `npm run lint` — ESLint with `--fix`
- `npm run format` — Prettier with `--write`

### Git hooks

Husky pre-commit hook runs `lint-staged`; commit-msg hook runs `commitlint`. Use conventional commit format (`feat:`, `fix:`, `chore:`, etc.).

### Gotchas

- The `sdk-app/env/` directory is gitignored. The SDK app auto-provisions on first run, but if the env file already exists with an expired token, use `npm run sdk-app:setup` to re-provision.
- Node version 22.x is required (see `.nvmrc`). The VM ships with a compatible version.
