---
title: Workflow
description: Drop-in Payroll.TransitionFlow component that creates a transition payroll and hands off to the standard execution flow.
order: 1
---

# Transition Payroll workflow

The Transition Payroll workflow renders the full experience — creation, then standard payroll execution — for a transition payroll covering the gap between an old and new pay schedule.

After creation, the flow transitions into the standard [Payroll Processing](../run-payroll/run-payroll.mdx) execution experience — the same steps used by regular and other off-cycle payrolls.

---

## Implementation

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

Once the payroll is created and the flow transitions to execution, all standard [run payroll events](../run-payroll/workflow#events) are emitted (e.g. `RUN_PAYROLL_CALCULATED`, `RUN_PAYROLL_SUBMITTED`, `RUN_PAYROLL_PROCESSED`).

---

## Workflow steps

1. **Creation**: Displays the transition details (pay period dates, pay schedule name) and allows the user to configure the check date, deduction preferences, and tax withholding rates.
2. **Execution**: The standard payroll execution flow takes over — configure employee compensation, review, submit, and view receipts.

---

## Transition payroll alert

The transition payroll alert is automatically rendered within [`Payroll.PayrollLanding`](../run-payroll/sub-components#landing) when there are unprocessed transition pay periods. It looks ahead 90 days for upcoming transition periods, groups them by pay schedule, and presents options to run or skip each one.

The alert explains why transition payrolls are needed and warns that skipping means employees will not be paid for the transition period.

> **Important**: Transition pay periods should be resolved (either run or skipped) before the company runs regular payrolls. The Gusto API may enforce this requirement by returning errors when attempting to process regular payrolls while unresolved transition periods exist.

### Alert events

| Event type                 | Description                                         | Data                                                                         |
| -------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| RUN_TRANSITION_PAYROLL     | Fired when user chooses to run a transition payroll | { startDate: string, endDate: string, payScheduleUuid: string \| undefined } |
| TRANSITION_PAYROLL_SKIPPED | Fired when a transition payroll is skipped          | { startDate: string, endDate: string, payScheduleUuid: string \| undefined } |

### Handling the run transition event

When the `RUN_TRANSITION_PAYROLL` event is emitted from the Payroll Landing page, your application should render the `Payroll.TransitionFlow` component with the provided dates and pay schedule UUID:

```jsx
import { useState } from 'react'
import { Payroll, componentEvents } from '@gusto/embedded-react-sdk'

function PayrollPage({ companyId }) {
  const [transitionData, setTransitionData] = useState(null)

  const handleEvent = (eventType, data) => {
    if (eventType === componentEvents.RUN_TRANSITION_PAYROLL && data.payScheduleUuid) {
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

> **Note**: The example guards on `data.payScheduleUuid` because `Payroll.TransitionFlow` requires it as a prop. In practice, `payScheduleUuid` is expected to be present for transition pay periods, but the event type allows `undefined`. If you need to handle the undefined case, add your own fallback logic (e.g. displaying an error or refetching pay schedule data).

---

## Skipping a transition payroll

Users can skip transition payrolls directly from the alert. A confirmation dialog warns that skipping means employees will not be paid for the transition period and that it is the employer's responsibility to ensure proper payment. Upon confirmation, the payroll is skipped via the [Skip a payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/post-companies-payroll-skip-company_uuid).

---

## API reference

The transition payroll uses these API endpoints:

- **Get pay periods**: `GET /v1/companies/{company_id}/pay_periods` (filtered by transition payroll type)
- **Get pay schedules**: `GET /v1/companies/{company_id}/pay_schedules`
- **Create off-cycle payroll**: [`POST /v1/companies/{company_id}/payrolls`](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls) (with `off_cycle_reason: "Transition from old pay schedule"`)
- **Skip payroll**: [`POST /v1/companies/{company_uuid}/payrolls/skip`](https://docs.gusto.com/embedded-payroll/reference/post-companies-payroll-skip-company_uuid) (with `payroll_type: "Transition from old pay schedule"`)
- **Calculate payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/calculate`
- **Submit payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/submit`
- **Cancel payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/cancel`
