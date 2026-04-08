---
title: Employee.FederalTaxes
sidebar_position: 8
---

## Description

Provides required form inputs for configuring employee federal tax withholding. Renders the appropriate federal tax form fields based on the employee's W-4 configuration.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle federal tax events
  }

  return (
    <Employee.FederalTaxes
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

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_FEDERAL_TAXES_UPDATED` | Fired when federal taxes are successfully updated | Response from the Update federal taxes endpoint |
| `EMPLOYEE_FEDERAL_TAXES_DONE` | Fired when the form is submitted, the API request completes, and the step is ready to advance | None |
