---
title: Payroll.PayrollList
sidebar_position: 8
---

Displays a list of payrolls for a company with their status, pay period, and available actions.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollList
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
| `onEvent`    | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |
| `dictionary` | `object`                                      | No       | Custom label overrides for UI text.       |

## Events

| Event                   | Description                                      | Data |
| ----------------------- | ------------------------------------------------ | ---- |
| `RUN_PAYROLL_SELECTED`  | Fired when a payroll is selected to run.         | None |
| `REVIEW_PAYROLL`        | Fired when the user selects a payroll to review. | None |
| `PAYROLL_SKIPPED`       | Fired when a payroll is skipped.                 | None |
| `RUN_OFF_CYCLE_PAYROLL` | Fired when user initiates an off-cycle payroll.  | None |
