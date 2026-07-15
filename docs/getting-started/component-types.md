---
title: Component types
description: How the SDK organizes UI into hooks (headless), blocks (granular building blocks), and workflows (end-to-end, off-the-shelf flows)—with tradeoffs around control and build speed.
order: 1
---

The SDK offers three levels of abstraction. You can mix and match them across workflows in your application—use whichever fits each part of your build.

| Type          | What it gives you                                               | Best for                                         |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| **Workflows** | Full multi-step experiences as a single component               | Fastest path to a working feature                |
| **Blocks**    | Individual form and UI components with SDK logic built in       | Custom layouts and sequencing, mid-level control |
| **Hooks**     | Headless utilities—you own all UI, the SDK handles data and API | Design-system-first teams, deepest customization |

## Workflows

Workflows are single components that encapsulate an entire multi-step user experience. They're the fastest path to a production-ready feature and support the same theming and event handling as individual blocks.

See the [Workflows overview](../guides/workflows-overview.md) for all available workflows.

## Blocks

Blocks are individual components for a single step or interaction (for example, `CompanyOnboarding.FederalTaxes`). They give you control over layout and sequencing while handling the business logic of each step. Using blocks instead of a full workflow means:

- You can reorder or omit steps
- You can insert your own content between SDK steps
- You can apply [component adapters](../guides/component-adapter/component-adapter.md) to bring your own UI components while keeping the SDK's business logic

See the [Workflows overview](../guides/workflows-overview.md) for the blocks available in each domain.

## Hooks

Hooks are headless—they handle data fetching, form state, validation, and API submission while you supply all markup and styling. If your team has a mature design system and wants the SDK to stay out of your UI, hooks are the right choice.

See the [Hooks reference](../reference/hooks.md) and each domain's Hooks reference for available hooks and usage examples.

> Not sure which type is right for you? Starting with a workflow and dropping down to blocks or hooks for areas that need more control is a common pattern.

## Navigating the Reference

The [Reference](../reference/index.mdx) is organized by **Domain** > **Namespace** > **Component type**, meaning the three component types described on this guide (**Workflows**, **Blocks**, and **Hooks**).

Namespaces correspond to exports from the SDK. For example, to use `CompanyOnboarding` components, you'd import `CompanyOnboarding`:

```typescript
import { CompanyOnboarding } from '@gusto/embedded-react-sdk'
...
```
