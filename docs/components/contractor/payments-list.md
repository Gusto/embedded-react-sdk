---
title: Contractor.PaymentsList
sidebar_position: 10
---

Displays a list of contractor payments for a company, with options to create new payments, view existing payments, and respond to information requests.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentsList
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `companyId` | `string` | Yes | The associated company identifier. |
| `alerts` | `array` | No | Optional array of alert objects to display above the payments list. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `CONTRACTOR_PAYMENT_CREATE` | Fired when the user initiates creating a new payment. | None |
| `CONTRACTOR_PAYMENT_VIEW` | Fired when the user selects a payment to view. | `{ paymentId: string }` |
| `CONTRACTOR_PAYMENT_RFI_RESPOND` | Fired when the user responds to a payment-related information request. | None |
