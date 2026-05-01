---
title: Contractor.PaymentSummary
sidebar_position: 13
---

Summary view of a contractor payment group, displaying payment totals and details for all contractors included in the payment.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentSummary
      paymentGroupId="pg-123e456-7890-1234-abcd-ef5678901234"
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name             | Type                                          | Required | Description                                                           |
| ---------------- | --------------------------------------------- | -------- | --------------------------------------------------------------------- |
| `paymentGroupId` | `string`                                      | Yes      | The payment group identifier.                                         |
| `companyId`      | `string`                                      | Yes      | The associated company identifier.                                    |
| `onEvent`        | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                             |
| `alerts`         | `array`                                       | No       | Optional array of alert objects to display above the payment summary. |

## Events

| Event                     | Description                                    | Data |
| ------------------------- | ---------------------------------------------- | ---- |
| `CONTRACTOR_PAYMENT_EXIT` | Fired when the user exits the payment summary. | None |
