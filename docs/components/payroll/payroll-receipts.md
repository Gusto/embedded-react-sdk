---
title: Payroll.PayrollReceipts
sidebar_position: 13
---

Displays payroll receipts and payment details after a payroll has been submitted and processed.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollReceipts
      payrollId="pay-123e456-7890-1234-abcd-ef5678901234"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name                 | Type                                          | Required | Description                               |
| -------------------- | --------------------------------------------- | -------- | ----------------------------------------- |
| `payrollId`          | `string`                                      | Yes      | The payroll identifier.                   |
| `onEvent`            | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |
| `withReimbursements` | `boolean`                                     | No       | Whether to include reimbursement details. |
| `dictionary`         | `object`                                      | No       | Custom label overrides for UI text.       |

## Events

This component is purely presentational and does not emit any events directly. When used within PayrollLanding, navigation events such as `RUN_PAYROLL_BACK` are handled by the parent flow.
