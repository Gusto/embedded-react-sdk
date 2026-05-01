---
title: Payroll.DismissalFlow
sidebar_position: 5
---

Workflow for processing dismissal (termination) payrolls. Handles pay period selection and final payment processing for terminated employees.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Payroll.DismissalFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name         | Type                                          | Required | Description                                                                       |
| ------------ | --------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `companyId`  | `string`                                      | Yes      | The associated company identifier.                                                |
| `employeeId` | `string`                                      | No       | The employee identifier for the dismissed employee.                               |
| `payrollId`  | `string`                                      | No       | An existing payroll identifier to continue processing.                            |
| `onEvent`    | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. Receives events from all subcomponents. |

## Events

| Event                           | Description                                                    | Data |
| ------------------------------- | -------------------------------------------------------------- | ---- |
| `DISMISSAL_PAY_PERIOD_SELECTED` | Fired when a pay period is selected for the dismissal payroll. | None |
