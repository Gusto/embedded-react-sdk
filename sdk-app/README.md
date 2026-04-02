# SDK Dev App

A standalone development application for building and testing SDK components with live API data. No local linking required.

## Quick Start

```bash
npm run sdk-app              # Demo environment (default)
npm run sdk-app-dev:local    # Local ZenPayroll
npm run sdk-app-dev:staging  # Staging environment
```

The app opens at `http://localhost:5200` (or the next available port).

## Commands

| Command                       | Build | Environment              |
| ----------------------------- | ----- | ------------------------ |
| `npm run sdk-app`             | dev   | demo (default)           |
| `npm run sdk-app-dev:demo`    | dev   | demo                     |
| `npm run sdk-app-dev:staging` | dev   | staging                  |
| `npm run sdk-app-dev:local`   | dev   | local ZenPayroll         |
| `npm run sdk-app-prod`        | prod  | staging                  |
| `npm run sdk-app:setup`       | —     | Re-provision current env |

### Dev vs Prod Build

- **Dev build**: Imports SDK from source (`src/`). Full HMR -- changes to SDK code reflect instantly.
- **Prod build**: Builds the SDK first (`npm run build`), then imports from `dist/`. Tests the actual published artifact.

## Environments

All environments auto-provision on first run. The setup script creates a demo company, extracts the flow token, fetches entity IDs, and writes everything to `sdk-app/env/.env.{env}`.

### Demo / Staging

Routes through GWS-Flows (`flows.gusto-demo.com` or `flows.gusto-staging.com`). Zero configuration required -- just run the command and it handles everything.

### Local

Routes through a **local GWS-Flows instance** at `http://localhost:7777`. You need both ZenPayroll and gws-flows running locally before starting the local SDK app.

#### Prerequisites

1. **ZenPayroll** must be running locally. See the Gusto [Developer Environment Setup](https://gustohq.atlassian.net/wiki/spaces/ED/pages/298615870/Developer+Environment+Setup) wiki. Start the server with `bin/server` in the zenpayroll repo.

2. **gws-flows** must be set up and running. Follow the setup instructions at [github.com/Gusto/gws-flows](https://github.com/Gusto/gws-flows):
   - Run `bin/rails partners_api:dev_setup_for_gws_onboarding` in the **zenpayroll** repo to create the GWS partner and OAuth application
   - Run `bin/setup` in the **gws-flows** repo to install dependencies and set up the database
   - Start gws-flows with `bin/dev` (or `bin/rails s` without overmind)
   - Confirm `http://localhost:7777` is reachable

#### Running

```bash
npm run sdk-app-dev:local
```

On first run, the setup script will create a demo through your local gws-flows, which in turn provisions a company with test entities on your local ZenPayroll.

## Features

- **Component Explorer**: All SDK components in a searchable sidebar, categorized by domain (Company, Employee, Contractor, Payroll, Info Requests)
- **Live API Data**: Components make real API calls through the proxy
- **Entity ID Management**: Set company, employee, contractor, and payroll IDs in the Settings panel
- **Demo Management**: Create new demos, refresh expired tokens, and switch between "Company Onboarded" and "New Company" demo types from the Settings panel
- **Shareable URLs**: Each component has a URL like `/employee/Profile` that can be shared with teammates
- **Events Log**: See `onEvent` callbacks from components in real time
- **Multi-Instance**: Run multiple instances simultaneously (auto-assigns ports)

## Architecture

```
Browser Request: /api/v1/companies/{id}/employees
       │
       ▼
  Vite Dev Server Proxy
       │
       Rewrites to /fe_sdk/{token}/v1/...
       Forwards to GWS-Flows host (demo, staging, or local)
       GWS-Flows handles OAuth token injection → proxies to ZenPayroll
```

## Troubleshooting

### Token expired

The top bar shows token status. If expired:

- **CLI**: Run `npm run sdk-app:setup` to create a fresh demo
- **In-app**: Open Settings > click "Refresh Token" or "Create New Demo"

### Port already in use

The app automatically tries the next available port. Check the console output for the actual URL.

### Local environment not working

Make sure gws-flows is running at `http://localhost:7777` before starting the local SDK app. If you're using overmind, check that both the web and sidekiq processes are healthy.

### Components showing errors

1. Check that entity IDs are set in Settings
2. Verify the token is valid (green dot in top bar)
3. Check the browser console for API errors
