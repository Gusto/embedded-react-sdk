---
title: Workflow
description: Drop-in Payroll.OffCycleFlow component that creates the off-cycle payroll and hands off to the standard execution flow.
order: 1
---

# Off-Cycle Payroll workflow

The Off-Cycle Payroll workflow renders the full off-cycle experience — bonus or correction creation, then payroll execution — as a single component. After creation, the flow transitions into the standard [Payroll Processing](../run-payroll/run-payroll.mdx) execution experience (configuration, overview, submission, and receipts). All off-cycle payroll types share the same execution steps as regular payrolls — the only difference is how the payroll is created.

---

## Implementation

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <Payroll.OffCycleFlow companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type                        | Description                                                                                                |
| ------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| companyId Required | string                      | The associated company identifier.                                                                         |
| onEvent Required   | function                    | See events table for each subcomponent to see available events.                                            |
| payrollType        | `'bonus'` \| `'correction'` | Optional pre-selected off-cycle reason. When provided, the creation form starts with this reason selected. |

#### Events

Events emitted during the creation phase:

| Event type        | Description                                 | Data                    |
| ----------------- | ------------------------------------------- | ----------------------- |
| OFF_CYCLE_CREATED | Fired when the off-cycle payroll is created | { payrollUuid: string } |

Additional events are available when using the standalone subcomponents — see [Sub-components](./sub-components).

Once the payroll is created and the flow transitions to execution, all standard [run payroll events](../run-payroll/workflow#events) are emitted (e.g. `RUN_PAYROLL_CALCULATED`, `RUN_PAYROLL_SUBMITTED`, `RUN_PAYROLL_PROCESSED`).

---

## Workflow steps

1. **Creation**: User configures pay period dates, selects a reason (bonus or correction), chooses employees, and sets deduction/withholding preferences.
2. **Execution**: The standard payroll execution flow takes over — configure employee compensation, review, submit, and view receipts.

---

## Off-cycle reasons

The creation form presents two reasons with different defaults:

| Reason     | Description                                        | Default Deductions         | Default Withholding |
| ---------- | -------------------------------------------------- | -------------------------- | ------------------- |
| Bonus      | Pay a bonus, gift, or commission                   | Skip regular deductions    | Supplemental rate   |
| Correction | Run a payroll outside of your regular pay schedule | Include regular deductions | Regular rate        |

When the user changes the reason, deduction and withholding defaults update automatically.

---

## API reference

The off-cycle payroll creation uses the [Create an off-cycle payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls). After creation, the standard payroll execution endpoints apply:

- **Calculate payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/calculate`
- **Submit payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/submit`
- **Cancel payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/cancel`
