---
title: Off-Cycle Payroll (Bonus & Correction)
order: 5
---

## Overview

The Off-Cycle Payroll workflow provides a complete experience for running payrolls outside of a company's regular pay schedule. It supports two off-cycle reasons: **Bonus** (paying a bonus, gift, or commission) and **Correction** (running a correction payment). The flow guides users through configuring pay period dates, selecting a reason, choosing employees, setting deduction and tax withholding preferences, and then executing the payroll.

After creation, the flow transitions into the standard payroll execution experience (configuration, overview, submission, and receipts).

### Implementation

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

Additional events are available when using the standalone subcomponents (`Payroll.OffCycleReasonSelection` and `Payroll.OffCycleDeductionsSetting`) — see their individual event tables below.

Once the payroll is created and the flow transitions to execution, all standard [run payroll events](./run-payroll.md) are emitted (e.g. `RUN_PAYROLL_CALCULATED`, `RUN_PAYROLL_SUBMITTED`, `RUN_PAYROLL_PROCESSED`).

## Workflow Steps

1. **Creation**: User configures pay period dates, selects a reason (bonus or correction), chooses employees, and sets deduction/withholding preferences
2. **Execution**: The standard payroll execution flow takes over — configure employee compensation, review, submit, and view receipts

## Off-Cycle Reasons

The creation form presents two reasons with different defaults:

| Reason     | Description                                        | Default Deductions         | Default Withholding |
| ---------- | -------------------------------------------------- | -------------------------- | ------------------- |
| Bonus      | Pay a bonus, gift, or commission                   | Skip regular deductions    | Supplemental rate   |
| Correction | Run a payroll outside of your regular pay schedule | Include regular deductions | Regular rate        |

When the user changes the reason, deduction and withholding defaults update automatically.

## Using Off-Cycle Subcomponents

Off-cycle components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- [Payroll.OffCycleCreation](#payrolloffcyclecreation)
- [Payroll.OffCycleReasonSelection](#payrolloffcyclereasonselection)
- [Payroll.OffCycleDeductionsSetting](#payrolloffcycledeductionssetting)

### Payroll.OffCycleCreation

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

#### Form Fields

- **Check-only payroll**: Toggle for check-only payments — when enabled, all employees will be paid by check (not direct deposit), the check date can be set to today or any future date, and start/end dates are not required
- **Start date**: Beginning of the pay period (required unless check-only; cannot be in the future for correction payrolls)
- **End date**: End of the pay period (required unless check-only; must be on or after start date)
- **Payment date (check date)**: The date employees will be paid (must be at least 2 business days from today for direct deposit, unless check-only)
- **Reason**: Bonus or Correction payment
- **Employee selection**: Include all employees or select specific employees
- **Deductions and contributions**: Include or skip regular deductions (see [OffCycleDeductionsSetting](#payrolloffcycledeductionssetting))
- **Tax withholding rates**: Configure withholding pay period and rate type (regular or supplemental)

### Payroll.OffCycleReasonSelection

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

### Payroll.OffCycleDeductionsSetting

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

#### Deduction Options

- **Include**: Make all the regular deductions and contributions
- **Skip**: Block all deductions and contributions, except 401(k). Taxes will be included.

## API Reference

The off-cycle payroll creation uses the [Create an off-cycle payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-payrolls). After creation, the standard payroll execution endpoints apply:

- **Calculate payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/calculate`
- **Submit payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/submit`
- **Cancel payroll**: `PUT /v1/companies/{company_id}/payrolls/{payroll_id}/cancel`
