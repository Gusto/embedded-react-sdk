---
title: Payroll.RecoveryCases
sidebar_position: 20
---

Displays and manages payroll recovery cases that require action, such as failed payments or returned transactions.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.RecoveryCases
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name        | Type                                          | Required | Description                               |
| ----------- | --------------------------------------------- | -------- | ----------------------------------------- |
| `companyId` | `string`                                      | Yes      | The associated company identifier.        |
| `onEvent`   | `(eventType: string, data?: unknown) => void` | No       | Callback invoked when events are emitted. |

## Events

| Event                           | Description                                           | Data |
| ------------------------------- | ----------------------------------------------------- | ---- |
| `RECOVERY_CASE_RESOLVE`         | Fired when a recovery case is resolved.               | None |
| `RECOVERY_CASE_RESUBMIT`        | Fired when a recovery case is resubmitted.            | None |
| `RECOVERY_CASE_RESUBMIT_DONE`   | Fired when a recovery case resubmission is complete.  | None |
| `RECOVERY_CASE_RESUBMIT_CANCEL` | Fired when a recovery case resubmission is cancelled. | None |
