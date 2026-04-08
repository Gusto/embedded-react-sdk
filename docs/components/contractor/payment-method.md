---
title: Contractor.PaymentMethod
sidebar_position: 7
---

Manages contractor payment method setup, including bank account creation and payment method configuration.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentMethod
      contractorId="c123e456-7890-1234-abcd-ef5678901234"
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
| `contractorId` | `string` | Yes | The contractor identifier. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `CONTRACTOR_BANK_ACCOUNT_CREATED` | Fired when a bank account is successfully created for the contractor. | None |
| `CONTRACTOR_PAYMENT_METHOD_UPDATED` | Fired when the contractor's payment method is updated. | None |
| `CONTRACTOR_PAYMENT_METHOD_DONE` | Fired when the payment method step is complete. | None |
