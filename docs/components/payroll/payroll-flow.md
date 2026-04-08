---
title: Payroll.PayrollFlow
sidebar_position: 2
---

End-to-end payroll workflow that orchestrates the full payroll lifecycle — from the payroll landing page through configuration, employee editing, review, submission, and receipt viewing.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Payroll.PayrollFlow
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
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. Receives events from all subcomponents. |
| `withReimbursements` | `boolean` | No | Whether to include reimbursement inputs in the payroll. Defaults to `true`. |
| `defaultValues` | `object` | No | Default values for individual flow step components. |
| `dictionary` | `object` | No | Custom label overrides for UI text within payroll components. |
| `ConfirmWireDetailsComponent` | `React.ComponentType` | No | Custom component to render for wire transfer confirmation. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `RUN_PAYROLL_SELECTED` | Fired when a payroll is selected to run. | None |
| `RUN_PAYROLL_CALCULATED` | Fired when payroll calculations are complete. | None |
| `RUN_PAYROLL_EDIT` | Fired when the user enters edit mode for a payroll. | None |
| `RUN_PAYROLL_EMPLOYEE_EDIT` | Fired when an employee's payroll details are opened for editing. | None |
| `RUN_PAYROLL_EMPLOYEE_SAVED` | Fired when an employee's payroll edits are saved. | None |
| `RUN_PAYROLL_EMPLOYEE_CANCELLED` | Fired when employee payroll editing is cancelled. | None |
| `RUN_PAYROLL_SUBMITTED` | Fired when the payroll is submitted for processing. | None |
| `RUN_PAYROLL_PROCESSED` | Fired when the payroll has been successfully processed. | None |
| `RUN_PAYROLL_PROCESSING_FAILED` | Fired when payroll processing fails. | None |
| `RUN_PAYROLL_CANCELLED` | Fired when the payroll is cancelled. | None |
| `RUN_PAYROLL_SUMMARY_VIEWED` | Fired when the payroll summary is viewed. | None |
| `RUN_PAYROLL_RECEIPT_VIEWED` | Fired when a payroll receipt is viewed. | None |
