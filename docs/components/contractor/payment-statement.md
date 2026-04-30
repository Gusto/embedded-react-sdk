---
title: Contractor.PaymentStatement
sidebar_position: 14
---

Displays a detailed payment statement for a contractor payment, including line items and payment breakdown.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentStatement
      paymentGroupId="group-uuid"
      contractorUuid="contractor-uuid"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name             | Type                                          | Required | Description                               |
| ---------------- | --------------------------------------------- | -------- | ----------------------------------------- |
| `paymentGroupId` | `string`                                      | Yes      | The payment group identifier.             |
| `contractorUuid` | `string`                                      | Yes      | The contractor identifier.                |
| `onEvent`        | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |
