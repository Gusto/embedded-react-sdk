---
title: Dismissal Payroll
order: 6
---

## Overview

The Dismissal Payroll workflow provides a guided experience for running a terminated employee's final payroll. It presents unprocessed termination pay periods for the employee, creates an off-cycle payroll for the selected period, and then transitions into the standard payroll execution flow for configuration, review, and submission.

This workflow is typically launched from the [Employee Termination](./employee-termination.md) flow when the user selects "Run a dismissal payroll" as the final paycheck option.

> **Important**: Make sure employees are paid on time by checking your [state's requirement guide](https://support.gusto.com/article/100895878100000/Final-paychecks). Some states require employees to receive their final wages within 24 hours (unless they consent otherwise), in which case running a dismissal payroll may be the only option.

### Implementation

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Payroll.DismissalFlow
      companyId="your-company-id"
      employeeId="employee-id"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type     | Description                                                                                                               |
| ------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| companyId Required  | string   | The associated company identifier.                                                                                        |
| employeeId Required | string   | The identifier of the terminated employee.                                                                                |
| onEvent Required    | function | See events table for available events.                                                                                    |
| payrollId           | string   | Optional payroll identifier. When provided, the flow skips pay period selection and starts directly at payroll execution. |

#### Events

Events emitted during the pay period selection phase:

| Event type                    | Description                                        | Data                    |
| ----------------------------- | -------------------------------------------------- | ----------------------- |
| DISMISSAL_PAY_PERIOD_SELECTED | Fired when user selects a pay period and continues | { payrollUuid: string } |

Once the payroll is created, all standard [run payroll events](./run-payroll.md) are emitted during execution (e.g. `RUN_PAYROLL_CALCULATED`, `RUN_PAYROLL_SUBMITTED`, `RUN_PAYROLL_PROCESSED`).

## Workflow Steps

The flow adapts based on whether a `payrollId` is provided:

**Without `payrollId` (default)**:

1. **Pay Period Selection**: Displays unprocessed termination pay periods for the employee. The user selects which period to run the final payroll for.
2. **Execution**: The standard payroll execution flow takes over — configure employee compensation, review, submit, and view receipts.

**With `payrollId`**:

1. **Execution**: Skips pay period selection and goes directly to payroll execution for the specified payroll.

## Integration with Employee Termination

The dismissal payroll flow integrates with the [Employee Termination workflow](./employee-termination.md):

- When the user selects "Run a dismissal payroll" during termination, the `EMPLOYEE_TERMINATION_RUN_PAYROLL` event is emitted with `{ employeeId, companyId, payrollUuid, termination }`
- Your application should handle this event by rendering `Payroll.DismissalFlow` with the appropriate `companyId` and `employeeId`
- The dismissal flow fetches the employee's unprocessed termination pay periods and guides the user through the final payroll

```jsx
import { useState } from 'react'
import { Employee, Payroll, componentEvents } from '@gusto/embedded-react-sdk'

function TerminationPage({ companyId, employeeId }) {
  const [showDismissalPayroll, setShowDismissalPayroll] = useState(false)

  const handleEvent = (eventType, data) => {
    if (eventType === componentEvents.EMPLOYEE_TERMINATION_RUN_PAYROLL) {
      setShowDismissalPayroll(true)
    }
  }

  if (showDismissalPayroll) {
    return (
      <Payroll.DismissalFlow companyId={companyId} employeeId={employeeId} onEvent={() => {}} />
    )
  }

  return (
    <Employee.TerminationFlow companyId={companyId} employeeId={employeeId} onEvent={handleEvent} />
  )
}
```

## Pay Period Selection

The pay period selection step fetches unprocessed termination pay periods for the employee and presents them as options. Each option shows the pay period date range. When only one pay period is available, it is automatically pre-selected.

Upon selection and submission, the component creates an off-cycle payroll with the `DismissedEmployee` reason using the selected pay period's start and end dates.

## API Reference

The dismissal payroll uses these API endpoints:

- **Get unprocessed termination pay periods**: [`GET /v1/companies/{company_id}/pay_periods/unprocessed_termination_pay_periods`](https://docs.gusto.com/embedded-payroll/reference/get-v1-companies-company_id-unprocessed_termination_pay_periods)
- **Create off-cycle payroll**: [`POST /v1/companies/{company_id}/payrolls`](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls) (with `off_cycle_reason: "Dismissed employee"`)
- **Calculate payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/calculate`
- **Submit payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/submit`
- **Cancel payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/cancel`

### Skipping a Dismissal Payroll

If someone accidentally selects dismissal payroll as the final paycheck option and doesn't want to run a dismissal payroll, they can use the [Skip a payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/post-companies-payroll-skip-company_uuid) to bypass the requirement.
