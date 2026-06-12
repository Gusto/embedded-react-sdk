---
title: Workflows
description: Drop-in React components that render a complete multi-step Gusto Embedded experience end to end — routing, data fetching, validation, and error handling included.
order: 0
---

# Workflows

A workflow is a single React component that renders a complete multi-step experience end to end. It manages routing between steps, data fetching, validation, submission, and error handling internally. Supply IDs and an event handler — the workflow handles the rest.

Workflows are the fastest way to ship a complete surface. The tradeoff is composition: the order and presence of steps is fixed, so reach for [sub-components](./sub-components.md) when you need to reorder, insert, or replace steps, and [hooks](./hooks.md) when you need to own the layout entirely.

## What a workflow includes

- A single component that mounts the full flow
- Built-in step routing, including back/next behavior and conditional steps
- Data fetching for every step from the Gusto API
- Validation and submission for every step
- A unified `onEvent` callback that fires at meaningful checkpoints (step completed, entity created, flow finished)

## Example

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function EmployeeOnboardingPage({ companyId }) {
  return (
    <EmployeeOnboarding.OnboardingFlow
      companyId={companyId}
      onEvent={(eventType, data) => {
        // React to flow events — e.g. record analytics or
        // navigate elsewhere when onboarding completes.
      }}
    />
  )
}
```

Each surface in the SDK ships a workflow. See the [Surfaces section](../surfaces/surfaces.mdx) for the full list, with the props and events each one accepts.
