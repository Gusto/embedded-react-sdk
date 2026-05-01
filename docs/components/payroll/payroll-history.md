---
title: Payroll.PayrollHistory
sidebar_position: 9
---

Displays historical payroll runs with summary information, receipt access, and cancellation options.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollHistory
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name         | Type                                          | Required | Description                               |
| ------------ | --------------------------------------------- | -------- | ----------------------------------------- |
| `companyId`  | `string`                                      | Yes      | The associated company identifier.        |
| `onEvent`    | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |
| `dictionary` | `object`                                      | No       | Custom label overrides for UI text.       |

## Events

| Event                        | Description                               | Data |
| ---------------------------- | ----------------------------------------- | ---- |
| `RUN_PAYROLL_SUMMARY_VIEWED` | Fired when the payroll summary is viewed. | None |
| `RUN_PAYROLL_RECEIPT_VIEWED` | Fired when a payroll receipt is viewed.   | None |
| `RUN_PAYROLL_CANCELLED`      | Fired when a payroll is cancelled.        | None |
