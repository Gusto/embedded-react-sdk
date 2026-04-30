---
title: Payroll.ConfirmWireDetails
sidebar_position: 15
---

Wire transfer confirmation step for verifying payment details before submitting payroll. Used when the company pays via wire transfer.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.ConfirmWireDetails
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
| `wireInId`   | `string`                                      | No       | The wire-in identifier.                   |
| `onEvent`    | `(eventType: string, data?: unknown) => void` | No       | Callback invoked when events are emitted. |
| `dictionary` | `object`                                      | No       | Custom label overrides for UI text.       |

## Events

| Event                              | Description                                          | Data                           |
| ---------------------------------- | ---------------------------------------------------- | ------------------------------ |
| `PAYROLL_WIRE_START_TRANSFER`      | Fired when user initiates the wire transfer flow.    | None                           |
| `PAYROLL_WIRE_INSTRUCTIONS_SELECT` | Fired when user selects a wire-in request.           | `{ selectedWireInId: string }` |
| `PAYROLL_WIRE_INSTRUCTIONS_DONE`   | Fired when user completes viewing wire instructions. | `{ selectedWireInId: string }` |
| `PAYROLL_WIRE_INSTRUCTIONS_CANCEL` | Fired when user cancels viewing wire instructions.   | None                           |
| `PAYROLL_WIRE_FORM_DONE`           | Fired when user completes the wire confirmation.     | `{ wireInRequest: object }`    |
| `PAYROLL_WIRE_FORM_CANCEL`         | Fired when user cancels the wire confirmation form.  | None                           |
