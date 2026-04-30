---
title: Employee.Taxes
sidebar_position: 19
---

## Description

Combined federal and state taxes component. This is a legacy component that renders both federal and state tax forms in a single step. For new implementations, prefer using [Employee.FederalTaxes](./federal-taxes.md) and [Employee.StateTaxes](./state-taxes.md) as separate components.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle tax events
  }

  return <Employee.Taxes employeeId={employeeId} onEvent={handleEvent} />
}
```

## Props

| Name           | Type                                          | Default | Required | Description                               |
| -------------- | --------------------------------------------- | ------- | -------- | ----------------------------------------- |
| **employeeId** | `string`                                      |         | Yes      | The associated employee identifier.       |
| **onEvent**    | `(eventType: string, data?: unknown) => void` |         | Yes      | Callback invoked when events are emitted. |

## Events

| Event                 | Description                                                                               | Data |
| --------------------- | ----------------------------------------------------------------------------------------- | ---- |
| `EMPLOYEE_TAXES_DONE` | Fired when both federal and state tax forms are complete and the step is ready to advance | None |
