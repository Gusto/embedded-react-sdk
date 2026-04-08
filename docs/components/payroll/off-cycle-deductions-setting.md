---
title: Payroll.OffCycleDeductionsSetting
sidebar_position: 17
---

Configuration for deductions in off-cycle payrolls. Allows the user to specify which deductions should be applied to the off-cycle payroll run.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.OffCycleDeductionsSetting
      skipRegularDeductions={false}
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
| `skipRegularDeductions` | `boolean` | Yes | Whether to skip regular deductions in the off-cycle payroll. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `OFF_CYCLE_DEDUCTIONS_CHANGE` | Fired when the user changes the deduction setting. | `{ skipRegularDeductions: boolean }` |
