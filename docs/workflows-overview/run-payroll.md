---
title: Payroll Processing
order: 3
---

## Overview

The Run Payroll workflow provides a complete experience for running payroll for a company. It guides users through selecting a payroll, configuring employee compensation, reviewing payroll details, and submitting the payroll for processing.

### Implementation

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <Payroll.PayrollFlow companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                                                         |
| ------------------ | -------- | ------------------------------------------------------------------- |
| companyId Required | string   | The associated company identifier.                                  |
| onEvent Required   | function | See events table for each subcomponent to see available events.     |
| withReimbursements | boolean  | Optional flag to show/hide reimbursements fields. Defaults to true. |
| defaultValues      | object   | Optional default values for the workflow.                           |
| dictionary         | object   | Optional translations for component text.                           |

#### Events

| Event type                     | Description                                               | Data                                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RUN_PAYROLL_SELECTED           | Fired when user selects a payroll to run                  | { payrollId: string }                                                                                                                                                                    |
| RUN_PAYROLL_BACK               | Fired when user navigates back from payroll configuration | None                                                                                                                                                                                     |
| RUN_PAYROLL_CALCULATED         | Fired when payroll calculations are completed             | None                                                                                                                                                                                     |
| RUN_PAYROLL_EDIT               | Fired when user makes changes to payroll configuration    | None                                                                                                                                                                                     |
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
- [Payroll.PayrollReceipts](#payrollpayrollreceipts)
- [Payroll.PayrollBlocker](#payrollpayrollblocker)
- [Payroll.ConfirmWireDetails](#payrollconfirmwiredetails)

### Payroll.PayrollLanding

Provides the main landing page for payroll operations, including tabs for running payroll and viewing payroll history.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.PayrollLanding companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                                                         |
| ------------------ | -------- | ------------------------------------------------------------------- |
| companyId Required | string   | The associated company identifier.                                  |
| onEvent Required   | function | See events table for available events.                              |
| withReimbursements | boolean  | Optional flag to show/hide reimbursements fields. Defaults to true. |
| dictionary         | object   | Optional translations for component text.                           |

#### Events

| Event type                 | Description                           | Data                  |
| -------------------------- | ------------------------------------- | --------------------- |
| RUN_PAYROLL_SUMMARY_VIEWED | Fired when user views payroll summary | { payrollId: string } |
| RUN_PAYROLL_RECEIPT_VIEWED | Fired when user views payroll receipt | { payrollId: string } |

### Payroll.PayrollList

Displays a list of available payrolls that can be run, including pay period dates and status information. Users can run payrolls, submit calculated payrolls, skip payrolls, and view any payroll blockers.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.PayrollList companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

#### Events

| Event type                    | Description                                  | Data                  |
| ----------------------------- | -------------------------------------------- | --------------------- |
| RUN_PAYROLL_SELECTED          | Fired when user selects a payroll to run     | { payrollId: string } |
| REVIEW_PAYROLL                | Fired when user selects to review a payroll  | { payrollId: string } |
| PAYROLL_SKIPPED               | Fired when a payroll is successfully skipped | { payrollId: string } |
| RUN_PAYROLL_BLOCKERS_VIEW_ALL | Fired when user views all payroll blockers   | None                  |

### Payroll.PayrollHistory

Displays historical payroll records with advanced filtering and management capabilities:

- Filter payrolls by time period (3 months, 6 months, or 1 year)
- View payroll summaries and receipts
- Cancel processed payrolls when applicable
- Each payroll entry shows the pay period, payroll type, pay date, status, and pay amount

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.PayrollHistory companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

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
      companyId="your-company-id"
      payrollId="your-payroll-id"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type      | Description                                                         |
| ------------------ | --------- | ------------------------------------------------------------------- |
| companyId Required | string    | The associated company identifier.                                  |
| payrollId Required | string    | The associated payroll identifier.                                  |
| alerts             | ReactNode | Optional alert components to display.                               |
| onEvent Required   | function  | See events table for available events.                              |
| withReimbursements | boolean   | Optional flag to show/hide reimbursements fields. Defaults to true. |
| dictionary         | object    | Optional translations for component text.                           |

#### Events

| Event type                    | Description                                   | Data                                 |
| ----------------------------- | --------------------------------------------- | ------------------------------------ |
| RUN_PAYROLL_BACK              | Fired when user navigates back                | None                                 |
| RUN_PAYROLL_EMPLOYEE_EDIT     | Fired when user selects an employee to edit   | { employeeId: string }               |
| RUN_PAYROLL_EMPLOYEE_SKIP     | Fired when user excludes an employee          | { employeeId: string }               |
| RUN_PAYROLL_EMPLOYEE_SAVED    | Fired when employee payroll changes are saved | { payrollPrepared: object }          |
| RUN_PAYROLL_CALCULATED        | Fired when payroll calculations are completed | { payrollId: string, alert: object } |
| RUN_PAYROLL_PROCESSING_FAILED | Fired when payroll processing fails           | Error details                        |
| RUN_PAYROLL_BLOCKERS_VIEW_ALL | Fired when user views all payroll blockers    | None                                 |

### Payroll.PayrollEditEmployee

Used for editing individual employee compensation details within a payroll. This component allows modification of employee pay rates, hours, bonuses, and other compensation elements.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollEditEmployee
      employeeId="your-employee-id"
      companyId="your-company-id"
      payrollId="your-payroll-id"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type     | Description                                                         |
| ------------------- | -------- | ------------------------------------------------------------------- |
| employeeId Required | string   | The associated employee identifier.                                 |
| companyId Required  | string   | The associated company identifier.                                  |
| payrollId Required  | string   | The associated payroll identifier.                                  |
| onEvent Required    | function | See events table for available events.                              |
| withReimbursements  | boolean  | Optional flag to show/hide reimbursements fields. Defaults to true. |
| dictionary          | object   | Optional translations for component text.                           |

#### Events

| Event type                     | Description                                                   | Data                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RUN_PAYROLL_EMPLOYEE_SAVED     | Fired when employee payroll compensation changes are saved    | { payrollPrepared: [Response from the Update payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-payrolls), employee: object } |
| RUN_PAYROLL_EMPLOYEE_CANCELLED | Fired when user cancels editing employee payroll compensation | None                                                                                                                                                                       |

### Payroll.PayrollOverview

Displays the final payroll overview before submission, including totals, employee details, and submission controls. Once submitted, it tracks the processing status and displays confirmation when complete.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.PayrollOverview
      companyId="your-company-id"
      payrollId="your-payroll-id"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type     | Description                                                         |
| ------------------ | -------- | ------------------------------------------------------------------- |
| companyId Required | string   | The associated company identifier.                                  |
| payrollId Required | string   | The associated payroll identifier.                                  |
| onEvent Required   | function | See events table for available events.                              |
| alerts             | array    | Optional array of alert objects to display.                         |
| showBackButton     | boolean  | Optional flag to show back button.                                  |
| withReimbursements | boolean  | Optional flag to show/hide reimbursements fields. Defaults to true. |
| dictionary         | object   | Optional translations for component text.                           |

#### Events

| Event type                     | Description                                  | Data                                                                                                                                                  |
| ------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| RUN_PAYROLL_EDIT               | Fired when user chooses to edit payroll      | None                                                                                                                                                  |
| RUN_PAYROLL_BACK               | Fired when user navigates back               | None                                                                                                                                                  |
| RUN_PAYROLL_SUBMITTED          | Fired when payroll is successfully submitted | [Response from the Submit payroll endpoint](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-payrolls-payroll_id-submit) |
| RUN_PAYROLL_PROCESSED          | Fired when payroll processing is completed   | None                                                                                                                                                  |
| RUN_PAYROLL_PROCESSING_FAILED  | Fired when payroll processing fails          | Error details                                                                                                                                         |
| RUN_PAYROLL_CANCELLED          | Fired when a payroll is cancelled            | Response from the Cancel payroll endpoint                                                                                                             |
| RUN_PAYROLL_RECEIPT_GET        | Fired when user requests payroll receipt     | { payrollId: string }                                                                                                                                 |
| RUN_PAYROLL_PDF_PAYSTUB_VIEWED | Fired when user views employee paystub PDF   | { employeeId: string }                                                                                                                                |

### Payroll.PayrollReceipts

Displays a detailed receipt for a completed payroll, including all payment information, deductions, taxes, and totals. This component provides a comprehensive view of a processed payroll for record-keeping and review purposes.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.PayrollReceipts payrollId="your-payroll-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                                                         |
| ------------------ | -------- | ------------------------------------------------------------------- |
| payrollId Required | string   | The associated payroll identifier.                                  |
| onEvent Required   | function | See events table for available events.                              |
| showBackButton     | boolean  | Optional flag to show back button. Defaults to true.                |
| withReimbursements | boolean  | Optional flag to show/hide reimbursements fields. Defaults to true. |
| dictionary         | object   | Optional translations for component text.                           |

#### Events

| Event type       | Description                    | Data |
| ---------------- | ------------------------------ | ---- |
| RUN_PAYROLL_BACK | Fired when user navigates back | None |

### Payroll.PayrollBlocker

Displays a list of blockers that prevent payroll from being processed. Blockers indicate issues that must be resolved before a payroll can be calculated or submitted, such as missing employee information, invalid tax setups, or incomplete company configuration.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Payroll.PayrollBlocker companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

#### Events

This component does not emit any events. It displays blockers fetched from the API and provides information to help users resolve issues.

### Payroll.ConfirmWireDetails

Provides the wire transfer confirmation workflow for payroll funding. This component displays a banner when wire transfers are awaiting funds and allows users to view wire instructions and confirm transfer details through a modal interface.

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Payroll.ConfirmWireDetails
      companyId="your-company-id"
      wireInId="your-wire-in-id"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type     | Description                                                                                  |
| ------------------ | -------- | -------------------------------------------------------------------------------------------- |
| companyId Required | string   | The associated company identifier.                                                           |
| wireInId           | string   | Optional wire-in request identifier. If not provided, uses the first active wire-in request. |
| onEvent Required   | function | See events table for available events.                                                       |
| dictionary         | object   | Optional translations for component text.                                                    |

#### Events

| Event type                       | Description                                         | Data                                                                                                                                                                |
| -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PAYROLL_WIRE_START_TRANSFER      | Fired when user initiates the wire transfer flow    | None                                                                                                                                                                |
| PAYROLL_WIRE_INSTRUCTIONS_DONE   | Fired when user completes viewing wire instructions | { selectedWireInId: string }                                                                                                                                        |
| PAYROLL_WIRE_INSTRUCTIONS_CANCEL | Fired when user cancels viewing wire instructions   | None                                                                                                                                                                |
| PAYROLL_WIRE_INSTRUCTIONS_SELECT | Fired when user selects a wire-in request           | { selectedWireInId: string }                                                                                                                                        |
| PAYROLL_WIRE_FORM_DONE           | Fired when user completes the wire confirmation     | { wireInRequest: [Response from the Submit wire-in request endpoint](https://docs.gusto.com/embedded-payroll/reference/put-wire_in_requests-wire_in_request_uuid) } |
| PAYROLL_WIRE_FORM_CANCEL         | Fired when user cancels the wire confirmation form  | None                                                                                                                                                                |
