---
title: Contractor.PaymentFlow
sidebar_position: 3
---

End-to-end contractor payment workflow that orchestrates the full payment lifecycle — listing payments, creating new payments, reviewing payment details, and viewing payment history.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Contractor.PaymentFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name        | Type                                          | Required | Description                                                                       |
| ----------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `companyId` | `string`                                      | Yes      | The associated company identifier.                                                |
| `onEvent`   | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. Receives events from all subcomponents. |

## Events

This component emits events from all of its subcomponents. See the individual block documentation for the specific events each step produces:

- [PaymentsList events](./payments-list.md#events)
- [CreatePayment events](./create-payment.md#events)
- [PaymentHistory events](./payment-history.md#events)
- [PaymentSummary events](./payment-summary.md#events)
