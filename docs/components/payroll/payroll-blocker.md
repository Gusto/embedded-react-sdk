---
title: Payroll.PayrollBlockerList
sidebar_position: 14
---

Displays blocking issues that must be resolved before running payroll. This component may forward events from embedded recovery or information-request flows it renders inline.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollBlockerList
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
| `dictionary` | `object` | No | Custom label overrides for UI text. |

## Events

This component does not emit its own events directly. It renders embedded RecoveryCases and InformationRequestsFlow sub-components and forwards their events through the `onEvent` callback.
