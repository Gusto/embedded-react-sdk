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
- Extract complex logic into well-named functions
- Break down complex conditions into readable boolean expressions
- Use constants for magic numbers and strings

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
- Prefer small, focused PRs (~400 lines max). One concern per PR — don't mix refactoring with new features.
- During 0.x.x: `feat:` → MINOR bump, `fix:` → PATCH bump, `feat!:`/`fix!:` → MINOR bump (breaking)
- When implementing a feature, split into independently mergeable PRs:
  1. Types and interfaces — data models, API types, shared contracts
  2. Hooks and logic — custom hooks, utilities, business logic
  3. UI components — presentational components with Storybook stories
  4. Integration — wiring components to real data and flows
- When PRs have sequential dependencies, create them as draft PRs chained together
- When asked to implement something large, proactively suggest a breakdown into smaller shippable units

## Local Development Environment

Three-repo architecture with sibling directories:

```
~/workspace/
├── zenpayroll/          # Core Rails app, database, services
├── gws-flows/           # Rails API proxy for local SDK testing
└── embedded-react-sdk/  # This repo
```

Three local services need to be running for full SDK development:

- **ZenPayroll services** — started via `bin/server` in `~/workspace/zenpayroll`
- **ZenPayroll Rails** — started via `bin/rails s` in `~/workspace/zenpayroll`
- **gws-flows** — started via `bin/rails s` in `../gws-flows`

Run `npm run dev:setup` to link React/ReactDOM from gws-flows and register the SDK with gws-flows via `yarn link`. This avoids duplicate React instances.

### gws-flows as Source of Truth

Use `../gws-flows` as the source of truth for how things currently work in production — API behavior, response shapes, and flow logic. Do NOT copy gws-flows code 1:1 — understand the "what" then implement it the SDK way.

Key paths in gws-flows:

- `app/controllers/` — API endpoint handlers
- `config/routes.rb` — Route definitions
- `app/views/` — View templates and flow logic
- `lib/` — Shared utilities and service objects

## Storybook-First Development

Build and test components in Storybook (`npm run storybook`) before integrating into flows. No backend required. Verify all states: default, loading, error, empty, and edge cases.

## Testing

- **Always** use `npm run test -- --run` to avoid watch mode hanging
- Run specific tests: `npm run test -- --run src/components/MyComponent.test.tsx`
- Run with coverage: `npm run test -- --run --coverage`
- Update snapshots: `npm run test -- --run -u`
- E2E tests require gws-flows and ZenPayroll running. See `e2e/local.config.example.env`.

## Research Before Building

Before starting new work, use available MCP research tools to gather context. Don't build in a vacuum -- search for existing decisions, specs, and documentation first.

Available research tools (use whichever are enabled):

- **Glean** -- search internal docs, PRDs, Confluence, Google Drive
- **JIRA / Confluence** -- check for related tickets, technical specs, prior work
- **Notion** -- check team knowledge base for runbooks and processes

Research workflow:

1. Search for the topic across available tools (Glean for broad search, JIRA for tickets)
2. Read the most relevant documents found
3. Store key findings in the Memory MCP for future sessions
4. Proceed with implementation informed by real context

## Library Documentation (Context7)

Use the Context7 MCP server to retrieve up-to-date library documentation before writing code that depends on third-party APIs. Never guess at or hallucinate library APIs when real docs are one tool call away.

Workflow:

1. Call `resolve-library-id` with the library name to get its Context7 ID
2. Call `get-library-docs` with the library ID and your specific question

Verify API usage with Context7 when working with: React, react-hook-form, TanStack Query, Zod, Vite, Vitest, Playwright, i18next, Storybook.

## Memory MCP

Use the Memory MCP server to build a persistent knowledge graph across sessions. Search memory for prior context before diving into a task.

What to store (save whenever you discover something non-obvious):

- Bug investigations: root cause, fix, and related issues
- Architectural decisions: why a particular approach was chosen
- API discoveries: response shapes, undocumented behavior, schema mismatches
- Environment gotchas: setup quirks, version incompatibilities, workarounds
- Feature context: PRD links, Figma references, JIRA tickets, implementation notes

Entity naming convention:

- `EmbeddedSDK:Feature:{FeatureName}`
- `EmbeddedSDK:Bug:{Description}`
- `EmbeddedSDK:API:{EndpointOrDomain}`
- `EmbeddedSDK:Architecture:{Decision}`
- `EmbeddedSDK:Environment:{Topic}`

Always save conclusions at the end of a research or debugging session.
