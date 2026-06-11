---
title: Sub-components
description: Standalone sub-components for transition payroll — render in isolation or compose into a custom workflow.
order: 2
---

# Transition Payroll sub-components

Transition payroll components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../../integration-guide/composition.md).

After creation, the flow hands off to the shared [`Payroll.PayrollExecutionFlow`](../run-payroll/sub-components#execution-flow) for the configuration → overview → submission → receipts steps. If you build your own creation step in front of the standard execution UI, render `Payroll.PayrollExecutionFlow` directly with the payroll you created.

---

## Transition creation

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

#### Form fields

- **Pay period** (read-only): Displays the transition pay period start and end dates
- **Pay schedule** (read-only): Shows the name of the associated pay schedule, when available
- **Check date**: The date employees will be paid (must be at least 2 business days from today for ACH processing)
- **Deductions and contributions**: Include or skip regular deductions. Defaults to including deductions.
- **Tax withholding rates**: Configure withholding pay period frequency and rate type (regular or supplemental). Defaults to regular rate with every-other-week frequency.
