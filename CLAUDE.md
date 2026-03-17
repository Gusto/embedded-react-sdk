# Embedded React SDK

React component library for Gusto's Embedded Payroll product. Built with TypeScript, React, react-hook-form, TanStack Query, Zod, Vite, Vitest, Playwright, i18next, and Storybook.

## Commands

```bash
npm run build          # Build the SDK
npm run test -- --run  # Run tests once and exit (omitting --run starts watch mode, which won't exit)
npm run storybook      # Start Storybook on port 6006
npm run e2e:serve      # Start E2E test app
npm run test:e2e       # Run E2E tests (requires gws-flows + ZenPayroll running)
npm run dev:setup      # Link SDK into gws-flows for local development
npm run i18n:generate  # Generate translation types
```

## Code Style

- Write self-explanatory code; avoid comments unless they are JSDoc for public APIs, TODO/FIXME for temporary workarounds, or legal notices
- Use descriptive variable/function names that eliminate the need for comments
- NEVER use `!important` in CSS/SCSS files — use proper CSS specificity instead
- Do not include `@use` imports in `.module.scss` for modules globally available via Vite (e.g., `@/styles/Helpers` is auto-injected)

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

```
src/components/
├── Common/         # Shared UI primitives and Field components
│   ├── Fields/     # Form-connected Field components (use for forms)
│   └── UI/         # Low-level UI components (via ComponentsContext)
├── Company/        # Company domain features
├── Employee/       # Employee domain features
├── Contractor/     # Contractor domain features
├── Payroll/        # Payroll domain features
└── Flow/           # Multi-step flow orchestration
```

### API Layer (`@gusto/embedded-api`)

All API calls go through `@gusto/embedded-api` with React Query hooks and Zod schema validation.

Import paths:
- `@gusto/embedded-api/react-query/<operation>` — React Query hooks
- `@gusto/embedded-api/models/components/<name>` — Entity types
- `@gusto/embedded-api/models/operations/<name>` — Request/response types
- `@gusto/embedded-api/models/errors/<name>` — Error types

Hook naming: `use<Resource><Action>Suspense` (queries), `use<Resource><Action>Mutation` (mutations)

### Provider Stack

```
GustoProvider → ComponentsProvider → ThemeProvider → LocaleProvider / I18nextProvider → ApiProvider → {children}
```

### i18n

All user-facing text uses i18next. Run `npm run i18n:generate` after changing translations. Use the `useTranslation` hook.

## PR and Commit Conventions

- Follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, etc.
- Prefer small, focused PRs (~400 lines max). Split large work into types → hooks → UI → integration.
- During 0.x.x: `feat:` → MINOR bump, `fix:` → PATCH bump, `feat!:`/`fix!:` → MINOR bump (breaking)

## Local Development Environment

Three-repo architecture with sibling directories:

```
~/workspace/
├── zenpayroll/          # Core Rails app
├── gws-flows/           # Rails API proxy for local SDK testing
└── embedded-react-sdk/  # This repo
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
