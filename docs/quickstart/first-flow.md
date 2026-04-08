---
title: Your First Flow
sidebar_position: 1
---

Now that you have the SDK installed and a proxy running, render a full multi-step workflow with a single component.

## What is a flow?

A flow is a pre-built component that orchestrates an entire business process. It manages its own internal navigation, form state, API calls, and validation — you render one component and it handles the rest.

## Render the Employee Onboarding Flow

`Employee.OnboardingFlow` walks a user through the complete employee onboarding process: personal profile, federal and state taxes, payment method, and document signing.

```jsx
import '@gusto/embedded-react-sdk/style.css'
import { GustoProvider, Employee } from '@gusto/embedded-react-sdk'

function OnboardingPage({ companyId }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Employee.OnboardingFlow companyId={companyId} onEvent={handleEvent} />
    </GustoProvider>
  )
}
```

The flow renders each step in sequence and advances automatically when the user completes a step. You don't need to manage routing or step transitions — the flow handles that internally.

## Handle events

Every flow emits events through the `onEvent` callback. Use these to respond to user actions, track progress, or trigger side effects in your application.

```jsx
import { Employee, GustoProvider, componentEvents } from '@gusto/embedded-react-sdk'

function handleEvent(eventType, data) {
  switch (eventType) {
    case componentEvents.EMPLOYEE_CREATED:
      console.log('New employee:', data.uuid)
      break

    case componentEvents.EMPLOYEE_ONBOARDING_DONE:
      // Navigate the user to the next page in your app
      window.location.href = '/dashboard'
      break
  }
}

function OnboardingPage({ companyId }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Employee.OnboardingFlow companyId={companyId} onEvent={handleEvent} />
    </GustoProvider>
  )
}
```

Events include both lifecycle signals (step completed, flow done) and data payloads from API responses (employee created, tax info updated). The `data` argument shape varies by event — lifecycle events have no data, while creation/update events include the API response.

## Using individual blocks instead

If you need more control over layout or step ordering, you can use the individual building blocks that make up a flow. For example, render just the compensation step:

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

<Employee.Compensation
  employeeId={employeeId}
  startDate="2025-01-01"
  onEvent={handleEvent}
/>
```

Each step of a flow is available as a standalone component. You can rearrange them, mix them with your own UI, or integrate them into your existing routing. See [Composition](../concepts/composition.md) for details.

## Next steps

See [Next Steps](./next-steps.md) for curated links to theming, proxy setup, and advanced guides.
