---
title: Payroll.PayrollLanding
sidebar_position: 7
---

Landing page for payroll that combines the payroll list with action options such as running a new payroll. Serves as the entry point for the payroll workflow.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollLanding
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
| `withReimbursements` | `boolean` | No | Whether to include reimbursement inputs in the payroll. |
| `showPayrollCancelledAlert` | `boolean` | No | Whether to display an alert indicating a payroll was cancelled. |
| `dictionary` | `object` | No | Custom label overrides for UI text. |
| `ConfirmWireDetailsComponent` | `React.ComponentType` | No | Custom component to render for wire transfer confirmation. |

## Events

This flow component orchestrates several sub-components (PayrollList, PayrollHistory, PayrollOverview, PayrollReceipts) and forwards their events. The following events are handled internally for navigation between states:

| Event | Description | Data |
| --- | --- | --- |
| `RUN_PAYROLL_SUMMARY_VIEWED` | Fired when user views a payroll summary from history. Navigates to the overview state. | `{ payrollId: string, startDate?: string, endDate?: string }` |
| `RUN_PAYROLL_RECEIPT_VIEWED` | Fired when user views a payroll receipt from history. Navigates to the receipt state. | `{ payrollId: string, startDate?: string, endDate?: string }` |
| `RUN_PAYROLL_RECEIPT_GET` | Fired from overview to navigate to the receipt state. | `{ payrollId: string }` |
| `RUN_PAYROLL_BACK` | Fired to navigate back from overview or receipt to the previous state. | None |
| `RUN_PAYROLL_CANCELLED` | Fired when a payroll is cancelled. Returns to the tabs state with a cancellation alert. | `{ payrollId: string, result: object }` |
| `RUN_PAYROLL_CANCELLED_ALERT_DISMISSED` | Fired when the cancellation alert is dismissed. | None |
| `RUN_PAYROLL_BLOCKERS_VIEW_ALL` | Fired when user clicks to view all payroll blockers. | None |

Events from child components (e.g. `RUN_PAYROLL_SELECTED`, `RUN_OFF_CYCLE_PAYROLL` from PayrollList) are also forwarded through `onEvent`.
