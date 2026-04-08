---
title: Payroll.OffCycleFlow
sidebar_position: 4
---

Workflow for creating and running off-cycle payrolls such as bonuses, corrections, or other payments outside the regular payroll schedule.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Payroll.OffCycleFlow
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
| `payrollType` | `string` | No | The type of off-cycle payroll. Defaults to `'bonus'`. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. Receives events from all subcomponents. |
| `withReimbursements` | `boolean` | No | Whether to include reimbursement inputs in the payroll. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `OFF_CYCLE_CREATED` | Fired when the off-cycle payroll is successfully created. | `{ payrollUuid: string }` |
