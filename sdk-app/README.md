# SDK Dev App

A standalone development application for building and testing SDK components with live API data. No local linking required.

## Quick Start

```bash
npm run sdk-app              # Demo environment (default)
npm run sdk-app:local        # Local ZenPayroll
npm run sdk-app:staging      # Staging environment
npm run sdk-app:partner      # Direct to the demo API with your own OAuth client credentials
```

The app opens at `http://localhost:5200` (or the next available port).

## Commands

| Command                   | Build | Environment              |
| ------------------------- | ----- | ------------------------ |
| `npm run sdk-app`         | dev   | demo (default)           |
| `npm run sdk-app:demo`    | dev   | demo                     |
| `npm run sdk-app:staging` | dev   | staging                  |
| `npm run sdk-app:local`   | dev   | local ZenPayroll         |
| `npm run sdk-app:partner` | dev   | direct to demo API       |
| `npm run sdk-app-prod`    | prod  | demo                     |
| `npm run sdk-app:setup`   | —     | Re-provision current env |

### Dev vs Prod Build

- **Dev build**: Imports SDK from source (`src/`). Full HMR -- changes to SDK code reflect instantly.
- **Prod build**: Builds the SDK first (`npm run build`), then imports from `dist/`. Tests the actual published artifact.

## Environments

Demo, Staging, and Local auto-provision on first run: the setup script creates a demo company, extracts the flow token, fetches entity IDs, and writes everything to `sdk-app/env/.env.{env}`. Partner is the exception — see below.

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
npm run sdk-app:local
```

On first run, the setup script will create a demo through your local gws-flows, which in turn provisions a company with test entities on your local ZenPayroll.

### Partner

Talks directly to the real Embedded API (`https://api.gusto-demo.com` by default) using your own demo-environment OAuth client credentials, bypassing gws-flows entirely. Use this when you need to test behavior gated by a per-partner feature flag or setting.

**There's no "create a new onboarded company" step for this mode.** You need an _existing_ partner-managed company's tokens up front:

1. Mint one via `POST /v1/partner_managed_companies` with your `CLIENT_ID`/`CLIENT_SECRET` (a `system_access` grant, then that endpoint).
2. Copy `sdk-app/env/.env.partner.example` to `sdk-app/env/.env.partner` (gitignored, not auto-generated) and fill in:

   ```text
   CLIENT_ID=your_partner_client_id
   CLIENT_SECRET=your_partner_client_secret
   REFRESH_TOKEN=the_company_scoped_refresh_token_from_step_1
   VITE_COMPANY_ID=the_company_uuid_from_step_1
   ```

   `REFRESH_TOKEN` must be the one issued for that specific company — a `CLIENT_ID`/`CLIENT_SECRET` pair alone can't mint a token for an arbitrary `VITE_COMPANY_ID` you didn't create yourself; the embedded API only supports a `refresh_token` grant for company-scoped tokens, not a company-scoped `client_credentials` grant.

3. `npm run sdk-app:partner`. The dev server refreshes the access token server-side as needed — it's never exposed to the browser. Gusto's OAuth server rotates the refresh token on every use; the rotated value is cached in `sdk-app/scripts/.partner-refresh-token-cache.json` (gitignored) rather than written back to `.env.partner`, so it survives process restarts without hitting Vite's config-reload watcher. If you paste a new `REFRESH_TOKEN` into `.env.partner` (e.g. after switching companies), the cache is invalidated automatically — no need to delete it by hand.

Since there's no gws-flows demo to fall back on, entity auto-fetch and the Settings panel's demo-management controls (create/refresh demo, entity catalog) are inactive in this mode — set any additional entity IDs (`VITE_EMPLOYEE_ID`, etc.) directly in `.env.partner` if a component needs them.

## Features

- **Component Explorer**: All SDK components in a searchable sidebar, categorized by domain (Company, Employee, Contractor, Payroll, Info Requests)
- **Live API Data**: Components make real API calls through the proxy
- **Entity ID Management**: Set company, employee, contractor, and payroll IDs in the Settings panel
- **Demo Management**: Create new demos, refresh expired tokens, and switch between "Company Onboarded" and "New Company" demo types from the Settings panel
- **Shareable URLs**: Each component has a URL like `/employee/Profile` that can be shared with teammates
- **Events Log**: See `onEvent` callbacks from components in real time
- **Multi-Instance**: Run multiple instances simultaneously (auto-assigns ports)

## Architecture

```text
Browser Request: /api/v1/companies/{id}/employees
       │
       ▼
  Vite Dev Server Proxy
       │
       Rewrites to /fe_sdk/{token}/v1/...
       Forwards to GWS-Flows host (demo, staging, or local)
       GWS-Flows handles OAuth token injection → proxies to ZenPayroll
```

Partner mode skips GWS-Flows entirely:

```text
Browser Request: /api/v1/companies/{id}/employees
       │
       ▼
  Vite Dev Server Middleware (scripts/partner-proxy.ts)
       │
       Refreshes your access token as needed using your own client credentials
       Forwards straight to GUSTO_API_BASE_URL, bearer token attached server-side
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
