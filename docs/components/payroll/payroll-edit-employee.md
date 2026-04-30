---
title: Payroll.PayrollEditEmployee
sidebar_position: 11
---

Form for editing an individual employee's payroll details including hours, earnings, deductions, and reimbursements.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollEditEmployee
      employeeId="emp-123e456-7890-1234-abcd-ef5678901234"
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

| Name                 | Type                                          | Required | Description                               |
| -------------------- | --------------------------------------------- | -------- | ----------------------------------------- |
| `employeeId`         | `string`                                      | Yes      | The employee identifier.                  |
| `companyId`          | `string`                                      | Yes      | The associated company identifier.        |
| `payrollId`          | `string`                                      | Yes      | The payroll identifier.                   |
| `onEvent`            | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |
| `withReimbursements` | `boolean`                                     | No       | Whether to include reimbursement inputs.  |
| `dictionary`         | `object`                                      | No       | Custom label overrides for UI text.       |

## Events

| Event                            | Description                                       | Data                                            |
| -------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| `RUN_PAYROLL_EMPLOYEE_SAVED`     | Fired after the employee's compensation is saved. | `{ payrollPrepared: object, employee: object }` |
| `RUN_PAYROLL_EMPLOYEE_CANCELLED` | Fired when the user cancels editing.              | None                                            |
