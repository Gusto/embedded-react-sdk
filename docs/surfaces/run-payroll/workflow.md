---
title: Workflow
description: Drop-in Payroll.PayrollFlow component that renders the entire payroll processing experience.
order: 1
---

# Payroll Processing workflow

The Payroll Processing workflow renders the full regular-payroll experience as a single component. Drop it into your app and the user walks through selecting a payroll, configuring employee compensation, reviewing details, confirming wire transfers, and submitting.

---

## Implementation

```jsx
import { Payroll } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <Payroll.PayrollFlow companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name                        | Type                                     | Description                                                                                                                             |
| --------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| companyId Required          | string                                   | The associated company identifier.                                                                                                      |
| onEvent Required            | function                                 | See events table for each subcomponent to see available events.                                                                         |
| withReimbursements          | boolean                                  | Optional flag to show/hide reimbursements fields. Defaults to true.                                                                     |
| defaultValues               | object                                   | Optional default values for the workflow.                                                                                               |
| dictionary                  | object                                   | Optional translations for component text.                                                                                               |
| ConfirmWireDetailsComponent | `ComponentType<ConfirmWireDetailsProps>` | Optional custom component to replace the default wire details confirmation UI. See [ConfirmWireDetailsProps](#confirmwiredetailsprops). |

#### ConfirmWireDetailsProps

| Prop      | Type                                   | Required | Description                                                                                                          |
| --------- | -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| companyId | string                                 | Yes      | The company identifier for fetching wire transfer information.                                                       |
| wireInId  | string                                 | No       | Specific wire-in request identifier. If not provided, your component should handle the first active wire-in request. |
| onEvent   | (type: string, data?: unknown) => void | No       | Optional callback to emit events back to the parent flow.                                                            |

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
