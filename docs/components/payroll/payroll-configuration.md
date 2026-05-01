---
title: Payroll.PayrollConfiguration
sidebar_position: 10
---

Payroll preparation step for configuring employee hours, earnings, and deductions. This is where the user enters compensation details for each employee before submitting the payroll.

## Usage

```tsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollConfiguration
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

| Name                 | Type                                          | Required | Description                                                     |
| -------------------- | --------------------------------------------- | -------- | --------------------------------------------------------------- |
| `companyId`          | `string`                                      | Yes      | The associated company identifier.                              |
| `payrollId`          | `string`                                      | Yes      | The payroll identifier to configure.                            |
| `onEvent`            | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                       |
| `alerts`             | `ReactNode`                                   | No       | Optional alert content to display above the configuration form. |
| `withReimbursements` | `boolean`                                     | No       | Whether to include reimbursement inputs.                        |
| `dictionary`         | `object`                                      | No       | Custom label overrides for UI text.                             |

## Events

| Event                             | Description                                                   | Data                                                          |
| --------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `RUN_PAYROLL_EMPLOYEE_EDIT`       | Fired when user clicks to edit an employee's compensation.    | `{ employeeId: string, firstName: string, lastName: string }` |
| `RUN_PAYROLL_EMPLOYEE_SKIP`       | Fired when user toggles an employee's excluded status.        | `{ employeeId: string }`                                      |
| `RUN_PAYROLL_EMPLOYEE_SAVED`      | Fired after an employee compensation update is saved.         | `{ payrollPrepared: object }`                                 |
| `RUN_PAYROLL_CALCULATED`          | Fired when payroll calculation completes successfully.        | `{ payrollId: string, alert: object, payPeriod: object }`     |
| `RUN_PAYROLL_PROCESSING_FAILED`   | Fired when payroll calculation fails or times out.            | None                                                          |
| `RUN_PAYROLL_BLOCKERS_VIEW_ALL`   | Fired when user clicks to view all payroll blockers.          | None                                                          |
| `RUN_PAYROLL_GROSS_UP_SELECTED`   | Fired when user selects an employee for gross-up calculation. | `{ employeeUuid: string }`                                    |
| `RUN_PAYROLL_GROSS_UP_CALCULATED` | Fired when a gross-up calculation completes.                  | `{ grossUp: string, netPay: number, employeeUuid: string }`   |
