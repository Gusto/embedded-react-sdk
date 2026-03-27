---
title: What is the GEP React SDK?
order: 0
---

## Introduction

The Gusto Embedded Payroll (GEP) React SDK is a React component library with built-in business logic for building payroll experiences on top of the Gusto Embedded API. It handles the complexity of payroll workflows -- onboarding companies and employees, running payroll, managing contractors, handling taxes -- so you can ship a full-featured payroll product without becoming a payroll domain expert.

The SDK complements Gusto's existing integration options (iframe-based Flows and the underlying REST API) by offering a middle ground: faster than building on raw APIs, more customizable than iframes.

## Why use the SDK?

### Ship faster

Pre-built workflow components encapsulate multi-step processes like employee onboarding or payroll execution. A single `<Employee.OnboardingFlow>` component handles profile collection, tax setup, payment method configuration, and document signing -- all in one React component.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

<Employee.OnboardingFlow companyId={companyId} onEvent={handleEvent} />
```

### Full UI control

Unlike iframes, the SDK renders native React components inside your application. You control the look and feel through:

- **[Theming](./theming/theming.md)** -- override CSS variables for colors, typography, spacing, and more
- **[Component Adapters](./component-adapter/component-adapter.md)** -- swap SDK primitives for your own design system components
- **[Composition](./integration-guide/composition.md)** -- rearrange, add, or remove sections within any workflow

### Event-driven integration

Every component emits typed events for user actions and API responses. Use events to drive navigation, trigger side effects, or feed analytics in your own application.

```jsx
import { componentEvents } from '@gusto/embedded-react-sdk'

function handleEvent(eventType, data) {
  if (eventType === componentEvents.EMPLOYEE_CREATED) {
    trackAnalytics('employee_created', { id: data.uuid })
  }
}
```

### Built-in business logic

The SDK manages API calls, form validation, error handling, and state transitions internally. Components use [React Query](https://tanstack.com/query) for data fetching and caching, [react-hook-form](https://react-hook-form.com/) for form state, and [Zod](https://zod.dev/) for schema validation -- all wired together so you don't have to be.

## How it compares

| | React SDK | Flows (iframes) | Raw API |
| --- | --- | --- | --- |
| **UI customization** | Full (theming, component adapters, composition) | Limited (CSS overrides) | You build everything |
| **Build effort** | Low-medium | Low | High |
| **Business logic** | Included | Included | You implement |
| **Framework** | React required | Any (iframe) | Any |

For a deeper comparison, see [Build Pathways: SDK, Flows, and API](./deciding-to-build-with-the-sdk/build-pathways-sdk-flows-api.md).

## Next steps

- **[Getting Started](./getting-started/getting-started.md)** -- install the SDK, configure the provider, and set up your proxy
- **[Workflows Overview](./workflows-overview/workflows-overview.md)** -- see the available pre-built workflows
- **[Integration Guide](./integration-guide/integration-guide.md)** -- learn about events, composition, theming, and more
