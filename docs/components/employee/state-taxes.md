---
title: Employee.StateTaxes
sidebar_position: 9
---

## Description

Provides required form inputs for configuring employee state tax withholding. Renders state-specific tax form fields based on the employee's work state.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle state tax events
  }

  return (
    <Employee.StateTaxes
      employeeId={employeeId}
      onEvent={handleEvent}
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **employeeId** | `string` | | Yes | The associated employee identifier. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |
| **isAdmin** | `boolean` | `false` | No | When true, configures the form for admin onboarding. When false, configures for self-onboarding. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_STATE_TAXES_UPDATED` | Fired when state taxes are successfully updated | Response from the Update state taxes endpoint |
| `EMPLOYEE_STATE_TAXES_DONE` | Fired when the form is submitted, the API request completes, and the step is ready to advance | None |
