---
title: Composition
sidebar_position: 5
---

The SDK supports flexible composition. Use a Flow component for the full out-of-the-box experience, or use individual Blocks to build a custom flow tailored to your application.

## Using a Flow

A single Flow component renders an entire multi-step user journey:

```tsx
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ companyId }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Employee.OnboardingFlow
        companyId={companyId}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
```

This handles internal navigation between steps, data loading, validation, and API calls. It's the fastest path to a working integration.

## Using individual Blocks

Each step of a Flow is also available as a standalone Block. You can render any Block in isolation:

```tsx
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ employeeId, startDate }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Employee.Compensation
        employeeId={employeeId}
        startDate={startDate}
        onEvent={(eventType) => {
          if (eventType === 'employee/compensations/done') {
            // Navigate to your next step
          }
        }}
      />
    </GustoProvider>
  )
}
```

Because each Block is independent and saves data via the API on submission, you can:

- **Reorder steps** to match your desired user flow
- **Skip steps** that aren't relevant to your use case
- **Insert your own content** between SDK steps
- **Embed Blocks** within your existing page layouts

## Integrating with your router

Blocks work naturally with any routing library. Use `onEvent` to trigger navigation when a step completes.

Here's an abbreviated example with React Router:

```tsx
import { Employee, componentEvents, GustoProvider } from '@gusto/embedded-react-sdk'
import { Routes, Route, useNavigate } from 'react-router-dom'

function ProfileStep({ companyId, employeeId }) {
  const navigate = useNavigate()

  return (
    <Employee.Profile
      companyId={companyId}
      employeeId={employeeId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_PROFILE_DONE) {
          navigate('/onboarding/taxes')
        }
      }}
    />
  )
}

function TaxesStep({ employeeId }) {
  const navigate = useNavigate()

  return (
    <Employee.Taxes
      employeeId={employeeId}
      onEvent={(eventType) => {
        if (eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
          navigate('/onboarding/payment')
        }
      }}
    />
  )
}

function OnboardingApp({ companyId, employeeId }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Routes>
        <Route
          path="/onboarding/profile"
          element={<ProfileStep companyId={companyId} employeeId={employeeId} />}
        />
        <Route
          path="/onboarding/taxes"
          element={<TaxesStep employeeId={employeeId} />}
        />
        {/* Additional steps... */}
      </Routes>
    </GustoProvider>
  )
}
```

The same pattern applies to Next.js, TanStack Router, or any other routing solution. The key is listening for the appropriate `*_DONE` event from each Block and triggering navigation in your `onEvent` handler.
