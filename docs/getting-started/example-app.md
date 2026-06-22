---
title: Example App
description: A complete, runnable reference application that orchestrates Gusto Embedded React SDK workflows with a router and a backend proxy across onboarding, payroll, and management flows.
order: 4
---

The [Gusto Embedded React SDK demo app](https://github.com/Gusto/embedded-react-sdk-demo-app) is a complete, runnable reference application that shows how to orchestrate the SDK across a hypothetical full product. Where the rest of these guides cover one concept at a time, the demo app puts them together end to end: workflow components composed behind a router, a backend proxy for authentication, theming, and several full experiences wired into a single app.

It is the best place to see how the individual pieces connect into a cohesive integration.

## What it demonstrates

- **Composing workflows behind a router.** Each flow is split into its own steps and mapped to routes with [React Router](https://reactrouter.com/), driven by the SDK's `onEvent` callbacks. This is the same pattern described in [Routing](../integration-guide/routing.md) and [Composition](../integration-guide/composition.md), realized as working code.
- **A backend proxy.** An Express server sits in front of the Gusto Embedded API, handling OAuth token acquisition and refresh and forwarding authenticated requests — the proxy layer described in [Getting Started](./getting-started.md) and [Authentication](./authentication.mdx).
- **Theming.** SDK components are restyled through the `theme` prop on `GustoProvider`, with an interactive tray for experimenting with overrides.
- **Multiple complete flows in one app**, including:
  - Company onboarding
  - Employee onboarding (admin-driven)
  - Employee self-onboarding
  - An onboarded-company experience covering running payrolls as well as management of: employees, time off, terminations, bank accounts, locations, documents, pay schedules, and tax setup

## What it doesn't yet demonstrate

- **Hooks.** The demo app uses the component-based workflows to show the end-to-end experience. If you prefer a headless integration, the SDK also exports [hooks](../hooks/hooks.md) that give you full control over UI and state management. You can use hooks to replicate the experience shown in the demo app in a way that aligns better with your own design system.
- **Contractor functionality.** The SDK includes components for contractor onboarding and payments. These will be added to the demo app soon. In the meantime, you can learn more about contractor workflows in the [Contractor Onboarding](../workflows-overview/contractor-onboarding.md) and [Contractor Payments](../workflows-overview/contractor-payments.md) guides.

## Running it

The repository's [README](https://github.com/Gusto/embedded-react-sdk-demo-app#readme) walks through the full setup: creating a developer app, obtaining credentials, creating a partner managed company, and configuring the backend proxy and frontend. Once configured, the backend runs the proxy and the frontend serves the SDK-powered app locally.
