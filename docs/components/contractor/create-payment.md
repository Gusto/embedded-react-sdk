---
title: Contractor.CreatePayment
sidebar_position: 11
---

Form for creating a new contractor payment. Supports editing, previewing, and submitting the payment.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.CreatePayment
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
| `onEvent`   | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |

## Events

| Event                             | Description                                                   | Data |
| --------------------------------- | ------------------------------------------------------------- | ---- |
| `CONTRACTOR_PAYMENT_EDIT`         | Fired when the user enters edit mode for the payment.         | None |
| `CONTRACTOR_PAYMENT_UPDATE`       | Fired when the payment is updated.                            | None |
| `CONTRACTOR_PAYMENT_PREVIEW`      | Fired when the user previews the payment before submission.   | None |
| `CONTRACTOR_PAYMENT_BACK_TO_EDIT` | Fired when the user returns to edit mode from the preview.    | None |
| `CONTRACTOR_PAYMENT_CREATED`      | Fired when the payment is successfully created and submitted. | None |
| `CONTRACTOR_PAYMENT_RFI_RESPOND`  | Fired when user clicks to respond to an information request.  | None |
