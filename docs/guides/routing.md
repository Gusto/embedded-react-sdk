---
title: Routing
sidebar_position: 2
---

The Gusto Embedded React SDK is router-agnostic — it does not ship with or require any specific routing library. Instead, it uses an event-driven approach that integrates with whichever router you choose.

This guide walks through a complete example using [React Router](https://reactrouter.com/) to build the Employee Self-Onboarding flow.

## Overview

Employee Self-Onboarding is comprised of the following steps, each available as a subcomponent of `Employee`:

```
Employee.Landing
Employee.Profile
Employee.Taxes
Employee.PaymentMethod
Employee.DocumentSigner
Employee.OnboardingSummary
```

For this flow, you need a `companyId` and an `employeeId`. Not all steps require both, but each requires the `employeeId`.

## Step 1: Create the Routes

Create a router with a route for each step in the flow:

```tsx
import { createBrowserRouter } from 'react-router-dom'

const createEmployeeSelfOnboardingRouter = ({
  companyId,
  employeeId,
}: {
  companyId: string
  employeeId: string
}) =>
  createBrowserRouter([
    {
      path: '/',
      element: <AppWrapperElement />,
      errorElement: <AppErrorElement />,
      children: [
        { path: '/' },
        { path: '/profile' },
        { path: '/taxes' },
        { path: '/payment_method' },
        { path: '/document_signer' },
        { path: '/onboarding_summary' },
      ],
    },
  ])
```

## Step 2: Create Wrapper Components with Navigation

Each SDK component has an `onEvent` prop. When a component is ready for navigation, it fires an event. Create wrapper components that handle these events and navigate to the next step:

```tsx
import { Employee, componentEvents } from '@gusto/embedded-react-sdk'
import { useNavigate } from 'react-router-dom'

function EmployeeLandingWrapper({ companyId, employeeId }) {
  const navigate = useNavigate()
  return (
    <Employee.Landing
      employeeId={employeeId}
      companyId={companyId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_SELF_ONBOARDING_START) {
          navigate('/profile')
        }
      }}
    />
  )
}
```

Each step component is independent and usable in isolation. When a user saves data, the component makes its own API call. You can rearrange steps in any order.

## Step 3: Put It All Together

Here is the full working example with all wrapper components and the router configuration:

```tsx
import { Employee, componentEvents, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'

interface AppProps {
  companyId: string
  employeeId: string
}

function EmployeeLandingWrapper({
  companyId,
  employeeId,
}: {
  companyId: string
  employeeId: string
}) {
  const navigate = useNavigate()

  return (
    <Employee.Landing
      employeeId={employeeId}
      companyId={companyId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_SELF_ONBOARDING_START) {
          navigate('/profile')
        }
      }}
    />
  )
}

function EmployeeProfileWrapper({
  companyId,
  employeeId,
}: {
  companyId: string
  employeeId: string
}) {
  const navigate = useNavigate()

  return (
    <Employee.Profile
      employeeId={employeeId}
      companyId={companyId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_PROFILE_DONE) {
          navigate('/taxes')
        }
      }}
    />
  )
}

function EmployeeTaxesWrapper({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate()

  return (
    <Employee.Taxes
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
          navigate('/payment_method')
        }
      }}
    />
  )
}

function EmployeePaymentMethodWrapper({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate()

  return (
    <Employee.PaymentMethod
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_PAYMENT_METHOD_DONE) {
          navigate('/document_signer')
        }
      }}
    />
  )
}

function EmployeeDocumentSignerWrapper({ employeeId }: { employeeId: string }) {
  const navigate = useNavigate()

  return (
    <Employee.DocumentSigner
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_FORMS_DONE) {
          navigate('/onboarding_summary')
        }
      }}
    />
  )
}

function EmployeeOnboardingSummaryWrapper({ employeeId }: { employeeId: string }) {
  return <Employee.OnboardingSummary employeeId={employeeId} onEvent={() => {}} />
}

const createEmployeeSelfOnboardingRouter = ({
  companyId,
  employeeId,
}: {
  companyId: string
  employeeId: string
}) =>
  createBrowserRouter([
    {
      path: '/',
      element: <AppWrapperElement />,
      errorElement: <AppErrorElement />,
      children: [
        {
          path: '/',
          element: <EmployeeLandingWrapper employeeId={employeeId} companyId={companyId} />,
        },
        {
          path: '/profile',
          element: <EmployeeProfileWrapper employeeId={employeeId} companyId={companyId} />,
        },
        {
          path: '/taxes',
          element: <EmployeeTaxesWrapper employeeId={employeeId} />,
        },
        {
          path: '/payment_method',
          element: <EmployeePaymentMethodWrapper employeeId={employeeId} />,
        },
        {
          path: '/document_signer',
          element: <EmployeeDocumentSignerWrapper employeeId={employeeId} />,
        },
        {
          path: '/onboarding_summary',
          element: <EmployeeOnboardingSummaryWrapper employeeId={employeeId} />,
        },
      ],
    },
  ])

export default function App({ companyId, employeeId }: AppProps) {
  const router = createEmployeeSelfOnboardingRouter({
    companyId,
    employeeId,
  })
  return (
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <RouterProvider router={router} />
    </GustoProvider>
  )
}
```
