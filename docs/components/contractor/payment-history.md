---
title: Contractor.PaymentHistory
sidebar_position: 12
---

Displays the payment history for a specific contractor payment, with options to view details or cancel the payment.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentHistory
      paymentId="p123e456-7890-1234-abcd-ef5678901234"
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
| `paymentId` | `string`                                      | Yes      | The payment identifier.                   |
| `onEvent`   | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |

## Events

| Event                             | Description                                                        | Data |
| --------------------------------- | ------------------------------------------------------------------ | ---- |
| `CONTRACTOR_PAYMENT_VIEW_DETAILS` | Fired when the user requests to view detailed payment information. | None |
| `CONTRACTOR_PAYMENT_CANCEL`       | Fired when the user cancels the payment.                           | None |
