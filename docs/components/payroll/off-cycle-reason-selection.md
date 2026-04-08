---
title: Payroll.OffCycleReasonSelection
sidebar_position: 18
---

Selection of the reason for running an off-cycle payroll, such as a bonus, correction, or final pay.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.OffCycleReasonSelection
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
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `OFF_CYCLE_SELECT_REASON` | Fired when the user selects a reason for the off-cycle payroll. | `{ reason: string, defaults: object }` |
