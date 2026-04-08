---
title: Employee.TerminationSummary
sidebar_position: 18
---

## Description

Displays termination details and provides actions for managing the termination — editing details, cancelling the termination, or running payroll. Also includes an offboarding checklist with guidance on final pay timing, tax forms, and account disconnection.

### Conditional actions

The summary displays different action buttons based on the termination state:

- **Edit termination** — Available when the termination date is in the future and the employee is not yet terminated.
- **Cancel termination** — Available when "Include in regular payroll" or "I'll handle it another way" was selected. Cannot cancel if "Run a dismissal payroll" was selected.
- **Run termination payroll** — Shown for the dismissal payroll option.
- **Run off-cycle payroll** — Shown when "I'll handle it another way" was selected.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId, employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle termination summary events
  }

  return (
    <Employee.TerminationSummary
      companyId={companyId}
      employeeId={employeeId}
      payrollOption="dismissalPayroll"
      onEvent={handleEvent}
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **companyId** | `string` | | Yes | The associated company identifier. |
| **employeeId** | `string` | | Yes | The employee identifier. |
| **payrollOption** | `PayrollOption` | | No | The selected payroll processing option. When provided, shows a success alert. |
| **payrollUuid** | `string` | | No | UUID of the created payroll, if applicable. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |
| **dictionary** | `object` | | No | Optional translations for component text. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_TERMINATION_EDIT` | Fired when user clicks to edit termination details | `{ employeeId }` |
| `EMPLOYEE_TERMINATION_CANCELLED` | Fired when a termination is successfully cancelled | `{ employeeId, alert? }` |
| `EMPLOYEE_TERMINATION_RUN_PAYROLL` | Fired when user clicks to run termination payroll | `{ employeeId, companyId, effectiveDate }` |
| `EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL` | Fired when user clicks to run an off-cycle payroll | `{ employeeId, companyId }` |
