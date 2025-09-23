---
title: Payroll Processing
order: 3
---

## Overview

The Run Payroll workflow provides a complete experience for running payroll for a company. It guides users through selecting a payroll, configuring employee compensation, reviewing payroll details, and submitting the payroll for processing.

### Implementation

```jsx
import { RunPayrollFlow } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <RunPayrollFlow companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
}
```

#### Props

| Name               | Type   | Description                                                     |
| ------------------ | ------ | --------------------------------------------------------------- |
| companyId Required | string | The associated company identifier.                              |
| onEvent Required   |        | See events table for each subcomponent to see available events. |

#### Events

| Event type                     | Description                                               | Data                                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RUN_PAYROLL_SELECTED           | Fired when user selects a payroll to run                  | { payrollId: string }                                                                                                                                                                    |
| RUN_PAYROLL_BACK               | Fired when user navigates back from payroll configuration | None                                                                                                                                                                                     |
| RUN_PAYROLL_CALCULATED         | Fired when payroll calculations are completed             | None                                                                                                                                                                                     |
| RUN_PAYROLL_EDITED             | Fired when user makes changes to payroll configuration    | None                                                                                                                                                                                     |
| RUN_PAYROLL_EMPLOYEE_EDITED    | Fired when user selects an employee to edit               | { employeeId: string }                                                                                                                                                                   |
| RUN_PAYROLL_EMPLOYEE_SAVED     | Fired when employee payroll changes are saved             | { payrollPrepared: object, employee: object }                                                                                                                                            |
| RUN_PAYROLL_EMPLOYEE_CANCELLED | Fired when user cancels employee payroll editing          | None                                                                                                                                                                                     |
| RUN_PAYROLL_SUBMITTED          | Fired when payroll is successfully submitted              | [Response from the Submit payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-payrolls-payroll_id-submit)                                    |
| RUN_PAYROLL_PROCESSED          | Fired when payroll processing is completed                | None                                                                                                                                                                                     |
| RUN_PAYROLL_PROCESSING_FAILED  | Fired when payroll processing fails                       | Error details                                                                                                                                                                            |
| RUN_PAYROLL_CANCELLED          | Fired when a payroll is cancelled                         | { payrollId: string, result: [Response from the Cancel payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/put-api-v1-companies-company_id-payrolls-payroll_id-cancel) } |
| RUN_PAYROLL_SUMMARY_VIEWED     | Fired when user views payroll summary                     | { payrollId: string }                                                                                                                                                                    |
| RUN_PAYROLL_RECEIPT_VIEWED     | Fired when user views payroll receipt                     | { payrollId: string }                                                                                                                                                                    |

## Using Payroll Subcomponents

Run payroll components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- [Payroll.PayrollLanding](#payrollpayrolllanding)
- [Payroll.PayrollList](#payrollpayrolllist)
- [Payroll.PayrollHistory](#payrollpayrollhistory)
- [Payroll.PayrollConfiguration](#payrollpayrollconfiguration)
- [Payroll.PayrollEditEmployee](#payrollpayrolleditemployee)
- [Payroll.PayrollOverview](#payrollpayrolloverview)

### Payroll.PayrollLanding

Provides the main landing page for payroll operations, including tabs for running payroll and viewing payroll history.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollLanding companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name               | Type   | Description                            |
| ------------------ | ------ | -------------------------------------- |
| companyId Required | string | The associated company identifier.     |
| onEvent Required   |        | See events table for available events. |

### Payroll.PayrollList

Displays a list of available payrolls that can be run, including pay period dates and status information.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.PayrollList companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
}
```

#### Props

| Name               | Type   | Description                            |
| ------------------ | ------ | -------------------------------------- |
| companyId Required | string | The associated company identifier.     |
| onEvent Required   |        | See events table for available events. |

#### Events

| Event type           | Description                       | Data                  |
| -------------------- | --------------------------------- | --------------------- |
| RUN_PAYROLL_SELECTED | Fired when user selects a payroll | { payrollId: string } |

### Payroll.PayrollHistory

Shows historical payroll records with options to view summaries, receipts, and cancel payrolls if applicable.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollHistory companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name               | Type   | Description                            |
| ------------------ | ------ | -------------------------------------- |
| companyId Required | string | The associated company identifier.     |
| onEvent Required   |        | See events table for available events. |

#### Events

| Event type                 | Description                           | Data                                                                                                                                                                                     |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RUN_PAYROLL_SUMMARY_VIEWED | Fired when user views payroll summary | { payrollId: string }                                                                                                                                                                    |
| RUN_PAYROLL_RECEIPT_VIEWED | Fired when user views payroll receipt | { payrollId: string }                                                                                                                                                                    |
| RUN_PAYROLL_CANCELLED      | Fired when a payroll is cancelled     | { payrollId: string, result: [Response from the Cancel payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/put-api-v1-companies-company_id-payrolls-payroll_id-cancel) } |

### Payroll.PayrollConfiguration

Handles the configuration phase of payroll processing, allowing users to review and modify employee compensation before calculating the payroll.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollConfiguration
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      payrollId="8f3d2c1b-9876-5432-1098-765432109876"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type      | Description                            |
| ------------------ | --------- | -------------------------------------- |
| companyId Required | string    | The associated company identifier.     |
| payrollId Required | string    | The associated payroll identifier.     |
| alerts             | ReactNode | Optional alert components to display.  |
| onEvent Required   |           | See events table for available events. |

#### Events

| Event type                  | Description                                   | Data                   |
| --------------------------- | --------------------------------------------- | ---------------------- |
| RUN_PAYROLL_BACK            | Fired when user navigates back                | None                   |
| RUN_PAYROLL_EMPLOYEE_EDITED | Fired when user selects an employee to edit   | { employeeId: string } |
| RUN_PAYROLL_CALCULATED      | Fired when payroll calculations are completed | None                   |

### Payroll.PayrollEditEmployee

Used for editing individual employee compensation details within a payroll. This component allows modification of employee pay rates, hours, bonuses, and other compensation elements.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollEditEmployee
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      payrollId="8f3d2c1b-9876-5432-1098-765432109876"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type   | Description                            |
| ------------------- | ------ | -------------------------------------- |
| employeeId Required | string | The associated employee identifier.    |
| companyId Required  | string | The associated company identifier.     |
| payrollId Required  | string | The associated payroll identifier.     |
| onEvent Required    |        | See events table for available events. |

#### Events

| Event type                     | Description                                                   | Data                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RUN_PAYROLL_EMPLOYEE_SAVED     | Fired when employee payroll compensation changes are saved    | { payrollPrepared: [Response from the Update payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-payrolls), employee: object } |
| RUN_PAYROLL_EMPLOYEE_CANCELLED | Fired when user cancels editing employee payroll compensation | None                                                                                                                                                                       |

### Payroll.PayrollOverview

Displays the final payroll overview before submission, including totals, employee details, and submission controls.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollOverview
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      payrollId="8f3d2c1b-9876-5432-1098-765432109876"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type   | Description                            |
| ------------------ | ------ | -------------------------------------- |
| companyId Required | string | The associated company identifier.     |
| payrollId Required | string | The associated payroll identifier.     |
| onEvent Required   |        | See events table for available events. |

#### Events

| Event type                    | Description                                  | Data                                                                                                                                                  |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RUN_PAYROLL_EDITED            | Fired when user chooses to edit payroll      | None                                                                                                                                                  |
| RUN_PAYROLL_SUBMITTED         | Fired when payroll is successfully submitted | [Response from the Submit payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-payrolls-payroll_id-submit) |
| RUN_PAYROLL_PROCESSED         | Fired when payroll processing is completed   | None                                                                                                                                                  |
| RUN_PAYROLL_PROCESSING_FAILED | Fired when payroll processing fails          | Error details                                                                                                                                         |
