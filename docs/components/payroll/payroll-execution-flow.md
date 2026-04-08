---
title: Payroll.PayrollExecutionFlow
sidebar_position: 3
---

Full payroll execution workflow for a specific payroll, from configuration through employee editing, review, and submission. Use this when you already have a payroll ID and want to skip the landing and list steps.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Payroll.PayrollExecutionFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      payrollId="pay-123e456-7890-1234-abcd-ef5678901234"
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
| `payrollId` | `string` | Yes | The payroll identifier to execute. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. Receives events from all subcomponents. |
| `initialState` | `'configuration' \| 'overview'` | No | Which step of the execution flow to start on. Defaults to `'configuration'`. |
| `initialPayPeriod` | `object` | No | Initial pay period to use when starting the flow. |
| `withReimbursements` | `boolean` | No | Whether to include reimbursement inputs in the payroll. |
| `ConfirmWireDetailsComponent` | `React.ComponentType` | No | Custom component to render for wire transfer confirmation. |

## Events

This component emits events from all of its subcomponents. See the individual block documentation for the specific events each step produces:

- [PayrollConfiguration events](./payroll-configuration.md#events)
- [PayrollEditEmployee events](./payroll-edit-employee.md#events)
- [PayrollOverview events](./payroll-overview.md#events)
- [PayrollReceipts events](./payroll-receipts.md#events)
