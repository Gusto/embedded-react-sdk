---
title: Employee Termination
order: 4
---

## Overview

The Employee Termination workflow provides a complete experience for terminating employees. It guides users through selecting a termination date, choosing how to process final payroll, reviewing termination details, and managing the offboarding process.

### Implementation

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Employee.TerminationFlow
      companyId="your-company-id"
      employeeId="employee-id"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type     | Description                                                     |
| ------------------- | -------- | --------------------------------------------------------------- |
| companyId Required  | string   | The associated company identifier.                              |
| employeeId Required | string   | The employee identifier to terminate.                           |
| onEvent Required    | function | See events table for each subcomponent to see available events. |
| dictionary          | object   | Optional translations for component text.                       |

#### Events

| Event type                                 | Description                                                | Data                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| EMPLOYEE_TERMINATION_CREATED               | Fired when a new termination is created                    | { employeeId: string, effectiveDate: string, payrollOption: PayrollOption }                                  |
| EMPLOYEE_TERMINATION_UPDATED               | Fired when an existing termination is updated              | { employeeId: string, effectiveDate: string, payrollOption: PayrollOption }                                  |
| EMPLOYEE_TERMINATION_DONE                  | Fired when the termination process is complete             | { employeeId: string, effectiveDate: string, payrollOption: PayrollOption, payrollUuid?: string }            |
| EMPLOYEE_TERMINATION_VIEW_SUMMARY          | Fired when viewing an existing termination summary         | { employeeId: string, effectiveDate: string }                                                                |
| EMPLOYEE_TERMINATION_EDIT                  | Fired when user clicks to edit termination details         | { employeeId: string }                                                                                       |
| EMPLOYEE_TERMINATION_CANCELLED             | Fired when a termination is cancelled                      | { employeeId: string, alert?: { type: 'success' \| 'error' \| 'info', title: string, content?: ReactNode } } |
| EMPLOYEE_TERMINATION_RUN_PAYROLL           | Fired when user chooses to run termination payroll         | { employeeId: string, companyId: string, effectiveDate: string }                                             |
| EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL | Fired when user chooses to run an off-cycle payroll        | { employeeId: string, companyId: string }                                                                    |
| EMPLOYEE_TERMINATION_PAYROLL_CREATED       | Fired when an off-cycle payroll is created for termination | { employeeId: string, effectiveDate: string }                                                                |
| EMPLOYEE_TERMINATION_PAYROLL_FAILED        | Fired when off-cycle payroll creation fails                | { employeeId: string }                                                                                       |

#### Payroll Options

The workflow supports three payroll processing options:

- **`dismissalPayroll`**: Run a dismissal payroll (off-cycle payroll with termination reason)
- **`regularPayroll`**: Process final pay in the employee's regular payroll
- **`anotherWay`**: Handle final pay outside of Gusto (triggers off-cycle payroll creation flow)

## Using Termination Subcomponents

Employee termination components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- [Employee.TerminateEmployee](#employeeterminateemployee)
- [Employee.TerminationSummary](#employeeterminationsummary)

### Employee.TerminateEmployee

The main termination form where users specify the last day of work and select how to process the final payroll.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.TerminateEmployee
      companyId="your-company-id"
      employeeId="employee-id"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type     | Description                               |
| ------------------- | -------- | ----------------------------------------- |
| companyId Required  | string   | The associated company identifier.        |
| employeeId Required | string   | The employee identifier to terminate.     |
| onEvent Required    | function | See events table for available events.    |
| dictionary          | object   | Optional translations for component text. |

#### Events

| Event type                        | Description                                         | Data                                                                        |
| --------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| EMPLOYEE_TERMINATION_CREATED      | Fired when a new termination is created             | { employeeId: string, effectiveDate: string, payrollOption: PayrollOption } |
| EMPLOYEE_TERMINATION_UPDATED      | Fired when an existing termination is updated       | { employeeId: string, effectiveDate: string, payrollOption: PayrollOption } |
| EMPLOYEE_TERMINATION_DONE         | Fired when the termination form is completed        | { employeeId: string, effectiveDate: string, payrollOption: PayrollOption } |
| EMPLOYEE_TERMINATION_VIEW_SUMMARY | Fired when redirecting to view existing termination | { employeeId: string, effectiveDate: string }                               |

#### Form Fields

- **Last day of work**: The effective date for the termination (must be on or after the employee's start date)
- **Payroll option**: How to process the employee's final pay
  - Run a dismissal payroll
  - Include in their regular payroll
  - I'll handle it another way

### Employee.TerminationSummary

Displays termination details and provides actions for managing the termination (edit, cancel, run payroll). Also includes an offboarding checklist for post-termination tasks.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.TerminationSummary
      companyId="your-company-id"
      employeeId="employee-id"
      payrollOption="dismissalPayroll"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type          | Description                                                                     |
| ------------------- | ------------- | ------------------------------------------------------------------------------- |
| companyId Required  | string        | The associated company identifier.                                              |
| employeeId Required | string        | The employee identifier.                                                        |
| payrollOption       | PayrollOption | The selected payroll processing option. When provided, shows the success alert. |
| payrollUuid         | string        | UUID of the created payroll (if applicable).                                    |
| onEvent Required    | function      | See events table for available events.                                          |
| dictionary          | object        | Optional translations for component text.                                       |

#### Events

| Event type                                 | Description                                        | Data                                                             |
| ------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------------- |
| EMPLOYEE_TERMINATION_EDIT                  | Fired when user clicks to edit termination details | { employeeId: string }                                           |
| EMPLOYEE_TERMINATION_CANCELLED             | Fired when a termination is successfully cancelled | { employeeId: string, alert?: { type: string, title: string } }  |
| EMPLOYEE_TERMINATION_RUN_PAYROLL           | Fired when user clicks to run termination payroll  | { employeeId: string, companyId: string, effectiveDate: string } |
| EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL | Fired when user clicks to run an off-cycle payroll | { employeeId: string, companyId: string }                        |

#### Conditional Actions

The summary displays different action buttons based on the termination state:

- **Edit termination**: Available when the termination date is in the future and the employee is not yet terminated
- **Cancel termination**: Available when the termination is cancelable (before processing)
- **Run termination payroll**: Shown for dismissal payroll option
- **Run off-cycle payroll**: Shown when user selected "I'll handle it another way"

#### Offboarding Checklist

The summary includes an offboarding checklist with guidance on:

- **Run payroll**: Recommendations for timing and state requirements
- **Tax forms and documents**: Ensuring former employees have access to paystubs and tax documents
- **Disconnect accounts and services**: Removing access to company resources

## Workflow States

The termination flow consists of two main states:

1. **Form State**: User inputs termination details (last day of work, payroll option)
2. **Summary State**: Displays termination confirmation, actions, and offboarding checklist

The flow automatically handles:

- Detection of existing terminations (redirects to summary if employee is already terminated)
- Update vs. create logic (updates existing active terminations)
- Optimistic locking (uses version field for concurrent update protection)
- Navigation between form and summary via breadcrumbs
- Integration with off-cycle payroll creation flow (when "another way" is selected)

## Integration Notes

### Existing Termination Detection

When the TerminateEmployee component loads, it automatically checks for existing terminations:

- If an active termination exists, the form is pre-populated for editing
- If the employee is already terminated, the user is redirected to the summary view
- The VIEW_SUMMARY event is emitted without the `payrollOption` to prevent showing a success alert for existing terminations

### Optimistic Locking

Terminations use a `version` field for optimistic locking. When updating an existing termination, include the current version in the request. The API will reject updates if the version has changed (concurrent update protection).

### Off-Cycle Payroll Integration

When the user selects "I'll handle it another way" or clicks "Run off-cycle payroll" from the summary:

- The `EMPLOYEE_TERMINATION_RUN_OFF_CYCLE_PAYROLL` event is emitted
- The flow transitions to the off-cycle payroll creation flow
- Upon successful off-cycle payroll creation, the flow returns to the termination summary
