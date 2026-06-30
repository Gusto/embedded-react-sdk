---
title: Component Types
description: How the SDK organizes UI into hooks (headless), sub-components (granular building blocks), and workflows (end-to-end, off-the-shelf flows) — with tradeoffs around control and build speed.
order: 1
---

## SDK component types

The SDK offers three levels of abstraction. They can be mixed and matched across workflows in your application — use whichever fits each part of your build.

| Type               | What it gives you                                             | Best for                                         |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------ |
| **Hooks**          | Headless utilities — you own all UI, SDK handles data and API | Design-system-first teams; deepest customization |
| **Sub-components** | Individual form and UI components with SDK logic built in     | Custom layouts and sequencing; mid-level control |
| **Workflows**      | Full multi-step experiences as a single component             | Fastest path to a working feature                |

### Hooks

Hooks are headless — they handle data fetching, form state, validation, and API submission while you supply all markup and styling. If your team has a mature design system and wants the SDK to stay out of your UI, hooks are the right choice.

See the [Hooks documentation](../hooks/hooks.md) for available hooks and usage examples.

### Sub-components

Sub-components are individual components for a single step or interaction (for example, `CompanyOnboarding.FederalTaxes`). They give you control over layout and sequencing while handling the business logic of each step. Using sub-components instead of a full workflow means:

- You can re-order or omit steps
- You can insert your own content between SDK steps
- You can apply [Component Adapters](../guides/component-adapter/component-adapter.md) to bring your own UI components while keeping the SDK's business logic

See the [Workflows Overview](../guides/workflows-overview.md) for the sub-components available in each domain.

### Workflows

Workflows are single components that encapsulate an entire multi-step user experience. They are the fastest path to a production-ready feature and support the same theming and event handling as individual sub-components.

See the [Workflows Overview](../guides/workflows-overview.md) for all available workflows.

> Not sure which type is right for you? Starting with a workflow and dropping down to sub-components or hooks for areas that need more control is a common pattern.

## Finding components in the Reference

The [Reference](../reference/index.md) is organized by **domain**, then by **component type** within each domain.

The five domains map to the major areas of payroll:

- **Company** — onboarding and information requests
- **Employee** — onboarding, management, and termination
- **Contractor** — onboarding and payments
- **Payroll** — running, off-cycle, dismissal, and transition payroll
- **Time off** — policy management

Within each domain, pages are grouped by the three component types from above:

- **Flows** — the workflow components for that domain
- **Blocks** — the sub-components for that domain
- **Hooks** — the headless hooks for that domain

A few reference pages live outside the domain structure: [events](../reference/events.md), [theme variables](../reference/theme-variables.md), the [component inventory](../reference/component-inventory.md), [API models](../reference/APIModels/index.md), and [utilities](../reference/utilities.md).
