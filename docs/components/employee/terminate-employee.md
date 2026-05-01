---
title: Employee.TerminateEmployee
sidebar_position: 17
---

## Description

The main termination form where users specify the employee's last day of work and select how to process the final payroll. Automatically detects existing terminations — if an active termination exists, the form is pre-populated for editing. If the employee is already terminated, the user is redirected to the summary view.

### Form fields

- **Last day of work** — The effective date for the termination. Can be in the past or future. Must be on or after the employee's hire date.
- **Payroll option** — How to process the employee's final pay: run a dismissal payroll, include in regular payroll, or handle it another way.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId, employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle termination form events
  }

  return (
    <Employee.TerminateEmployee
      companyId={companyId}
      employeeId={employeeId}
      onEvent={handleEvent}
    />
  )
}
```

## Props

| Name           | Type                                          | Default | Required | Description                               |
| -------------- | --------------------------------------------- | ------- | -------- | ----------------------------------------- |
| **companyId**  | `string`                                      |         | Yes      | The associated company identifier.        |
| **employeeId** | `string`                                      |         | Yes      | The employee identifier to terminate.     |
| **onEvent**    | `(eventType: string, data?: unknown) => void` |         | Yes      | Callback invoked when events are emitted. |
| **dictionary** | `object`                                      |         | No       | Optional translations for component text. |

## Events

| Event                               | Description                                            | Data                                           |
| ----------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| `EMPLOYEE_TERMINATION_CREATED`      | Fired when a new termination is created                | `{ employeeId, effectiveDate, payrollOption }` |
| `EMPLOYEE_TERMINATION_UPDATED`      | Fired when an existing termination is updated          | `{ employeeId, effectiveDate, payrollOption }` |
| `EMPLOYEE_TERMINATION_DONE`         | Fired when the termination form is completed           | `{ employeeId, effectiveDate, payrollOption }` |
| `EMPLOYEE_TERMINATION_VIEW_SUMMARY` | Fired when redirecting to view an existing termination | `{ employeeId, effectiveDate }`                |
