---
title: Employee.OnboardingSummary
sidebar_position: 15
---

## Description

Displays the current state of employee onboarding completion. Shows a summary of all onboarding steps and their status. Used as the final step in both admin onboarding and self-onboarding flows.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle summary events
  }

  return (
    <Employee.OnboardingSummary
      employeeId={employeeId}
      onEvent={handleEvent}
      isAdmin
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **employeeId** | `string` | | Yes | The associated employee identifier. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |
| **isAdmin** | `boolean` | `false` | No | When true, configures for admin onboarding. When false, configures for self-onboarding. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEES_LIST` | Fired when user clicks to return to the employee list | None |
| `EMPLOYEE_CREATE` | Fired when user clicks to add another employee | None |
