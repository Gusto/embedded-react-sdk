---
title: Payroll.PayrollOverview
sidebar_position: 12
---

Review and submission step that displays payroll totals, employee breakdowns, and handles final payroll confirmation. This is the last step before submitting the payroll for processing.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollOverview
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
| `payrollId` | `string` | Yes | The payroll identifier. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |
| `alerts` | `array` | No | Optional array of alert objects to display. |
| `withReimbursements` | `boolean` | No | Whether to include reimbursement details. |
| `dictionary` | `object` | No | Custom label overrides for UI text. |
| `ConfirmWireDetailsComponent` | `React.ComponentType` | No | Custom component to render for wire transfer confirmation. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `RUN_PAYROLL_EDIT` | Fired when user chooses to edit payroll. | None |
| `RUN_PAYROLL_SUBMITTED` | Fired when payroll is successfully submitted. | API response |
| `RUN_PAYROLL_PROCESSED` | Fired when payroll processing is completed. | None |
| `RUN_PAYROLL_PROCESSING_FAILED` | Fired when payroll processing fails. | Error details |
| `RUN_PAYROLL_CANCELLED` | Fired when a payroll is cancelled. | API response |
| `RUN_PAYROLL_RECEIPT_GET` | Fired when user requests payroll receipt. | `{ payrollId: string }` |
| `RUN_PAYROLL_PDF_PAYSTUB_VIEWED` | Fired when user views employee paystub PDF. | `{ employeeId: string }` |
