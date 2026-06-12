---
title: Sub-components
description: Standalone sub-components for off-cycle payroll — render in isolation or compose into a custom workflow.
order: 2
---

# Off-Cycle Payroll sub-components

Off-cycle components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../../integration-guide/composition.md).

After creation, the off-cycle flow hands off to the shared [`Payroll.PayrollExecutionFlow`](../run-payroll/sub-components#execution-flow) for the configuration → overview → submission → receipts steps. If you build your own creation step in front of the standard execution UI, render `Payroll.PayrollExecutionFlow` directly with the payroll you created.

---

## Off-cycle creation

The main creation form for off-cycle payrolls. Includes reason selection, pay period date configuration, employee selection, deduction settings, and tax withholding configuration.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.OffCycleCreation companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type                        | Description                                                |
| ------------------ | --------------------------- | ---------------------------------------------------------- |
| companyId Required | string                      | The associated company identifier.                         |
| onEvent Required   | function                    | See events table for available events.                     |
| payrollType        | `'bonus'` \| `'correction'` | Optional pre-selected payroll type. Defaults to `'bonus'`. |
| dictionary         | object                      | Optional translations for component text.                  |

#### Events

| Event type        | Description                                 | Data                    |
| ----------------- | ------------------------------------------- | ----------------------- |
| OFF_CYCLE_CREATED | Fired when the off-cycle payroll is created | { payrollUuid: string } |

#### Form fields

- **Check-only payroll**: Toggle for check-only payments — when enabled, all employees will be paid by check (not direct deposit), the check date can be set to today or any future date, and start/end dates are not required
- **Start date**: Beginning of the pay period (required unless check-only; cannot be in the future for correction payrolls)
- **End date**: End of the pay period (required unless check-only; must be on or after start date)
- **Payment date (check date)**: The date employees will be paid (must be at least 2 business days from today for direct deposit, unless check-only)
- **Reason**: Bonus or Correction payment
- **Employee selection**: Include all employees or select specific employees
- **Deductions and contributions**: Include or skip regular deductions (see [Deductions setting](#deductions-setting))
- **Tax withholding rates**: Configure withholding pay period and rate type (regular or supplemental)

---

## Reason selection

Presents the reason selection UI for choosing between a bonus and correction payment.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.OffCycleReasonSelection companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

#### Events

| Event type              | Description                      | Data                                                  |
| ----------------------- | -------------------------------- | ----------------------------------------------------- |
| OFF_CYCLE_SELECT_REASON | Fired when user selects a reason | { reason: 'bonus' \| 'correction', defaults: object } |

The `defaults` object contains `{ skipDeductions: boolean, withholdingType: 'supplemental' | 'regular' }`.

---

## Deductions setting

Allows users to choose whether to include or skip regular deductions and contributions for the off-cycle payroll. Taxes are always included regardless of the selection.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.OffCycleDeductionsSetting skipRegularDeductions={true} onEvent={() => {}} />
}
```

#### Props

| Name                           | Type     | Description                                             |
| ------------------------------ | -------- | ------------------------------------------------------- |
| skipRegularDeductions Required | boolean  | Whether regular deductions are currently being skipped. |
| onEvent Required               | function | See events table for available events.                  |
| dictionary                     | object   | Optional translations for component text.               |

#### Events

| Event type                  | Description                             | Data                               |
| --------------------------- | --------------------------------------- | ---------------------------------- |
| OFF_CYCLE_DEDUCTIONS_CHANGE | Fired when deduction preference changes | { skipRegularDeductions: boolean } |

#### Deduction options

- **Include**: Make all the regular deductions and contributions
- **Skip**: Block all deductions and contributions, except 401(k). Taxes will be included.
