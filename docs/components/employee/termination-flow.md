---
title: Employee.TerminationFlow
sidebar_position: 4
---

## Description

Full employee termination workflow. Guides users through selecting a termination date, choosing how to process final payroll, reviewing termination details, and managing the offboarding process. The flow consists of two main states: the termination form and the termination summary.

### Payroll options

The workflow supports three payroll processing options for the employee's final paycheck:

- **`dismissalPayroll`** — Run a dismissal payroll. Automatically determines the pay period and makes default PTO payout recommendations.
- **`regularPayroll`** — Process final pay in the employee's regular payroll. Defers payroll action until the next scheduled regular payroll.
- **`anotherWay`** — Handle final pay outside of Gusto. Triggers the off-cycle payroll creation flow.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId, employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle termination events
  }

  return (
    <Employee.TerminationFlow
      companyId={companyId}
      employeeId={employeeId}
      onEvent={handleEvent}
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **companyId** | `string` | | Yes | The associated company identifier. |
| **employeeId** | `string` | | Yes | The employee identifier to terminate. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |
| **dictionary** | `object` | | No | Optional translations for component text. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_TERMINATION_CREATED` | Fired when a new termination is created | `{ employeeId, effectiveDate, payrollOption }` |
| `EMPLOYEE_TERMINATION_UPDATED` | Fired when an existing termination is updated | `{ employeeId, effectiveDate, payrollOption }` |
| `EMPLOYEE_TERMINATION_DONE` | Fired when the termination process is complete | `{ employeeId, effectiveDate, payrollOption, payrollUuid? }` |
| `EMPLOYEE_TERMINATION_VIEW_SUMMARY` | Fired when viewing an existing termination summary | `{ employeeId, effectiveDate }` |
| `EMPLOYEE_TERMINATION_EDIT` | Fired when user clicks to edit termination details | `{ employeeId }` |
| `EMPLOYEE_TERMINATION_CANCELLED` | Fired when a termination is cancelled | `{ employeeId, alert? }` |
| `EMPLOYEE_TERMINATION_RUN_PAYROLL` | Fired when user chooses to run termination payroll | `{ employeeId, companyId, effectiveDate }` |
| `EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL` | Fired when user chooses to run an off-cycle payroll | `{ employeeId, companyId }` |
| `EMPLOYEE_TERMINATION_PAYROLL_CREATED` | Fired when an off-cycle payroll is created for termination | `{ employeeId, effectiveDate }` |
| `EMPLOYEE_TERMINATION_PAYROLL_FAILED` | Fired when off-cycle payroll creation fails | `{ employeeId }` |
