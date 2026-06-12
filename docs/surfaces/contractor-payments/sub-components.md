---
title: Sub-components
description: Standalone sub-components for contractor payments — render in isolation or compose into a custom workflow.
order: 2
---

# Contractor Payments sub-components

Contractor payment components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../../integration-guide/composition.md).

---

## Payments list

Displays a list of contractor payment groups for a company, allowing users to view payment history, create new payments, and filter by date range. Includes alerts for pending information requests and wire transfer requirements.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentsList companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name                     | Type   | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.     |
| **alerts**               | array  | Optional array of alerts to display.   |
| **onEvent** (Required)   |        | See events table for available events. |

#### Events

| Event type                     | Description                                       | Data                  |
| ------------------------------ | ------------------------------------------------- | --------------------- |
| CONTRACTOR_PAYMENT_CREATE      | Fired when user chooses to create a new payment   | None                  |
| CONTRACTOR_PAYMENT_VIEW        | Fired when user selects a payment group to view   | { paymentId: string } |
| CONTRACTOR_PAYMENT_RFI_RESPOND | Fired when user clicks to respond to an RFI alert | None                  |

---

## Create payment

A comprehensive form for creating contractor payment groups. Allows selecting payment date, editing individual contractor payments with hours, wages, bonuses, and reimbursements. Supports preview before submission and handles submission blockers like Fast ACH thresholds.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.CreatePayment companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name                     | Type   | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.     |
| **onEvent** (Required)   |        | See events table for available events. |

#### Events

| Event type                      | Description                                        | Data                                                                                                                                                                               |
| ------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CONTRACTOR_PAYMENT_EDIT         | Fired when user opens the edit payment modal       | None                                                                                                                                                                               |
| CONTRACTOR_PAYMENT_UPDATE       | Fired when a contractor payment is updated         | EditContractorPaymentFormValues (hours, wage, bonus, reimbursement, paymentMethod, etc.)                                                                                           |
| CONTRACTOR_PAYMENT_PREVIEW      | Fired when user continues to preview               | [Response from the preview contractor payment group API request](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-contractor_payment_groups-preview) |
| CONTRACTOR_PAYMENT_BACK_TO_EDIT | Fired when user goes back to edit from preview     | None                                                                                                                                                                               |
| CONTRACTOR_PAYMENT_CREATED      | Fired when a payment group is successfully created | [Response from the create contractor payment group API request](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-contractor_payment_groups)          |

#### Features

- **Payment date selection**: Choose the payment date with automatic validation
- **Contractor payment editing**: Edit hours (for hourly contractors), wages (for fixed contractors), bonuses, and reimbursements
- **Payment method selection**: Choose between Direct Deposit, Check, or Historical Payment per contractor
- **Real-time totals**: View totals for wages, bonuses, reimbursements, and overall total
- **Preview mode**: Review payment details, debit information, and submission deadlines before finalizing
- **Submission blockers**: Handle Fast ACH thresholds with options to wire funds or switch to 4-day direct deposit
- **Wire transfer support**: Integrated wire transfer instructions when required

---

## Payment history

Displays detailed information about a specific contractor payment group, including all individual contractor payments. Allows viewing individual payment details and canceling payments when permitted.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Contractor.PaymentHistory paymentId="payment-group-uuid" onEvent={() => {}} />
}
```

#### Props

| Name                     | Type   | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| **paymentId** (Required) | string | The payment group identifier.          |
| **onEvent** (Required)   |        | See events table for available events. |

#### Events

| Event type                      | Description                                         | Data                                               |
| ------------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| CONTRACTOR_PAYMENT_VIEW_DETAILS | Fired when user views a specific contractor payment | { contractor: Contractor, paymentGroupId: string } |
| CONTRACTOR_PAYMENT_CANCEL       | Fired when a payment is canceled                    | { paymentId: string }                              |

#### Features

- **Payment group overview**: View debit date and overall payment group information
- **Detailed payment table**: Shows contractor name, wage type, payment method, hours, wages, bonuses, reimbursements, and totals
- **Payment actions**: View individual payment details or cancel payments when allowed
- **Cancellation support**: Cancel individual payments within a payment group when permitted

---

## Payment summary

Displays a summary of a created payment group, including payment details, contractor information, and wire transfer requirements if applicable. Used as a confirmation screen after payment creation.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentSummary
      paymentGroupId="payment-group-uuid"
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                          | Type   | Description                            |
| ----------------------------- | ------ | -------------------------------------- |
| **paymentGroupId** (Required) | string | The payment group identifier.          |
| **companyId** (Required)      | string | The associated company identifier.     |
| **onEvent** (Required)        |        | See events table for available events. |

#### Events

| Event type              | Description                                | Data |
| ----------------------- | ------------------------------------------ | ---- |
| CONTRACTOR_PAYMENT_EXIT | Fired when user completes the payment flow | None |

#### Features

- **Success confirmation**: Displays confirmation message with number of payments scheduled
- **Payment summary**: Shows payment totals, debit information, and payment dates
- **Wire transfer details**: If wire transfer is required, displays wire instructions with confirmation workflow
- **Bank account information**: Shows the debit bank account details

---

## Payment statement

Displays an individual contractor payment statement with detailed payment information and breakdown.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Contractor.PaymentStatement paymentId="contractor-payment-uuid" onEvent={() => {}} />
}
```

#### Props

| Name                     | Type   | Description                                   |
| ------------------------ | ------ | --------------------------------------------- |
| **paymentId** (Required) | string | The individual contractor payment identifier. |
| **onEvent** (Required)   |        | See events table for available events.        |
