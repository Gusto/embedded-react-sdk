---
title: Payroll.TransitionFlow
sidebar_position: 6
---

Workflow for creating transition payrolls when changing pay schedules. Handles the gap period between the old and new pay schedule.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Payroll.TransitionFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      startDate="2025-01-01"
      endDate="2025-01-15"
      payScheduleUuid="ps-123e456-7890-1234-abcd-ef5678901234"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name              | Type                                          | Required | Description                                                                       |
| ----------------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `companyId`       | `string`                                      | Yes      | The associated company identifier.                                                |
| `startDate`       | `string`                                      | Yes      | The start date of the transition period (ISO 8601 format).                        |
| `endDate`         | `string`                                      | Yes      | The end date of the transition period (ISO 8601 format).                          |
| `payScheduleUuid` | `string`                                      | Yes      | The pay schedule identifier for the transition.                                   |
| `onEvent`         | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. Receives events from all subcomponents. |

## Events

| Event                | Description                                                | Data |
| -------------------- | ---------------------------------------------------------- | ---- |
| `TRANSITION_CREATED` | Fired when the transition payroll is successfully created. | None |
