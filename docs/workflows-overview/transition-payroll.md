---
title: Transition Payroll
order: 7
---

## Overview

The Transition Payroll workflow handles payrolls that cover gaps between old and new pay schedules. When a company changes its pay schedule, there may be workdays that fall between the end of the old schedule and the start of the new one. Transition payrolls ensure employees are paid for those days.

The SDK provides two components for transition payrolls:

- **`Payroll.TransitionFlow`**: A full creation-to-execution flow for running a specific transition payroll
- **`TransitionPayrollAlert`**: An alert component (rendered on the Payroll Landing page) that surfaces upcoming transition pay periods and allows users to run or skip them

### Implementation

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Payroll.TransitionFlow
      companyId="your-company-id"
      startDate="2025-01-16"
      endDate="2025-01-31"
      payScheduleUuid="pay-schedule-uuid"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type     | Description                                                      |
| ------------------------ | -------- | ---------------------------------------------------------------- |
| companyId Required       | string   | The associated company identifier.                               |
| startDate Required       | string   | The start date of the transition pay period (YYYY-MM-DD).        |
| endDate Required         | string   | The end date of the transition pay period (YYYY-MM-DD).          |
| payScheduleUuid Required | string   | The UUID of the pay schedule this transition is associated with. |
| onEvent Required         | function | See events table for each subcomponent to see available events.  |

#### Events

Events emitted during the creation phase:

| Event type         | Description                                  | Data                    |
| ------------------ | -------------------------------------------- | ----------------------- |
| TRANSITION_CREATED | Fired when the transition payroll is created | { payrollUuid: string } |

Once the payroll is created and the flow transitions to execution, all standard [run payroll events](./run-payroll.md) are emitted (e.g. `RUN_PAYROLL_CALCULATED`, `RUN_PAYROLL_SUBMITTED`, `RUN_PAYROLL_PROCESSED`).

## Workflow Steps

1. **Creation**: Displays the transition details (pay period dates, pay schedule name) and allows the user to configure the check date, deduction preferences, and tax withholding rates
2. **Execution**: The standard payroll execution flow takes over — configure employee compensation, review, submit, and view receipts

## Using Transition Subcomponents

Transition payroll components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- [Payroll.TransitionCreation](#payrolltransitioncreation)

### Payroll.TransitionCreation

The creation form for transition payrolls. Displays the transition pay period and pay schedule information, and allows configuration of check date, deductions, and tax withholding.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.TransitionCreation
      companyId="your-company-id"
      startDate="2025-01-16"
      endDate="2025-01-31"
      payScheduleUuid="pay-schedule-uuid"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type     | Description                                  |
| ------------------------ | -------- | -------------------------------------------- |
| companyId Required       | string   | The associated company identifier.           |
| startDate Required       | string   | The start date of the transition pay period. |
| endDate Required         | string   | The end date of the transition pay period.   |
| payScheduleUuid Required | string   | The UUID of the associated pay schedule.     |
| onEvent Required         | function | See events table for available events.       |
| dictionary               | object   | Optional translations for component text.    |

#### Events

| Event type         | Description                                  | Data                    |
| ------------------ | -------------------------------------------- | ----------------------- |
| TRANSITION_CREATED | Fired when the transition payroll is created | { payrollUuid: string } |

#### Form Fields

- **Pay period** (read-only): Displays the transition pay period start and end dates
- **Pay schedule** (read-only): Shows the name of the associated pay schedule
- **Check date**: The date employees will be paid (must be at least 2 business days from today for ACH processing)
- **Deductions and contributions**: Include or skip regular deductions. Defaults to including deductions.
- **Tax withholding rates**: Configure withholding pay period frequency and rate type (regular or supplemental). Defaults to regular withholding.

## Transition Payroll Alert

The `TransitionPayrollAlert` component is automatically rendered on the `Payroll.PayrollLanding` page when there are unprocessed transition pay periods. It looks ahead 90 days for upcoming transition periods, groups them by pay schedule, and presents options to run or skip each one.

The alert explains why transition payrolls are needed and warns that skipping means employees will not be paid for the transition period.

> **Important**: Transition pay periods must be resolved (either run or skipped) before the company can run regular payrolls again. Pay period selection and regular payroll processing are disabled until all transition pay periods are resolved.

### Alert Events

| Event type                 | Description                                         | Data                                                            |
| -------------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| RUN_TRANSITION_PAYROLL     | Fired when user chooses to run a transition payroll | { startDate: string, endDate: string, payScheduleUuid: string } |
| TRANSITION_PAYROLL_SKIPPED | Fired when a transition payroll is skipped          | { startDate: string, endDate: string, payScheduleUuid: string } |

### Handling the Run Transition Event

When the `RUN_TRANSITION_PAYROLL` event is emitted from the Payroll Landing page, your application should render the `Payroll.TransitionFlow` component with the provided dates and pay schedule UUID:

```jsx
import { useState } from 'react'
import { Payroll, componentEvents } from '@gusto/embedded-react-sdk'

function PayrollPage({ companyId }) {
  const [transitionData, setTransitionData] = useState(null)

  const handleEvent = (eventType, data) => {
    if (eventType === componentEvents.RUN_TRANSITION_PAYROLL) {
      setTransitionData(data)
    }
  }

  if (transitionData) {
    return (
      <Payroll.TransitionFlow
        companyId={companyId}
        startDate={transitionData.startDate}
        endDate={transitionData.endDate}
        payScheduleUuid={transitionData.payScheduleUuid}
        onEvent={() => {}}
      />
    )
  }

  return <Payroll.PayrollLanding companyId={companyId} onEvent={handleEvent} />
}
```

### Skipping a Transition Payroll

Users can skip transition payrolls directly from the alert. A confirmation dialog warns that skipping means employees will not be paid for the transition period and that it is the employer's responsibility to ensure proper payment. Upon confirmation, the payroll is skipped via the [Skip a payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/post-companies-payroll-skip-company_uuid).

## API Reference

The transition payroll uses these API endpoints:

- **Get pay periods**: `GET /v1/companies/{company_id}/pay_periods` (filtered by transition payroll type)
- **Get pay schedules**: `GET /v1/companies/{company_id}/pay_schedules`
- **Create off-cycle payroll**: [`POST /v1/companies/{company_id}/payrolls`](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls) (with `off_cycle_reason: "Transition from old pay schedule"`)
- **Skip payroll**: [`POST /v1/companies/{company_uuid}/payrolls/skip`](https://docs.gusto.com/embedded-payroll/reference/post-companies-payroll-skip-company_uuid) (with `payroll_type: "Transition from old pay schedule"`)
- **Calculate payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/calculate`
- **Submit payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/submit`
- **Cancel payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/cancel`
