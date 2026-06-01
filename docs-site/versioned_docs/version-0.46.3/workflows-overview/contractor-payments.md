---
title: Contractor Payments
order: 3
---

## Overview

The Contractor Payments workflow provides components for creating, managing, and viewing contractor payment groups. These components can be used individually or composed into a complete payment workflow through the `Contractor.PaymentFlow` component.

### Implementation

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Contractor.PaymentFlow companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name               | Type   | Description                                                     |
| ------------------ | ------ | --------------------------------------------------------------- |
| companyId Required | string | The associated company identifier.                              |
| onEvent Required   |        | See events table for each subcomponent to see available events. |

Events from subcomponents bubble up through the `onEvent` handler.

## Using Contractor Payment Subcomponents

Contractor payment components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- Contractor.PaymentsList
- Contractor.CreatePayment
- Contractor.PaymentHistory
- Contractor.PaymentSummary
- Contractor.PaymentStatement

### Contractor.PaymentsList

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

### Contractor.CreatePayment

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

- **Payment Date Selection**: Choose the payment date with automatic validation
- **Contractor Payment Editing**: Edit hours (for hourly contractors), wages (for fixed contractors), bonuses, and reimbursements
- **Payment Method Selection**: Choose between Direct Deposit, Check, or Historical Payment per contractor
- **Real-time Totals**: View totals for wages, bonuses, reimbursements, and overall total
- **Preview Mode**: Review payment details, debit information, and submission deadlines before finalizing
- **Submission Blockers**: Handle Fast ACH thresholds with options to wire funds or switch to 4-day direct deposit
- **Wire Transfer Support**: Integrated wire transfer instructions when required

### Contractor.PaymentHistory

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

- **Payment Group Overview**: View debit date and overall payment group information
- **Detailed Payment Table**: Shows contractor name, wage type, payment method, hours, wages, bonuses, reimbursements, and totals
- **Payment Actions**: View individual payment details or cancel payments when allowed
- **Cancellation Support**: Cancel individual payments within a payment group when permitted

### Contractor.PaymentSummary

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

- **Success Confirmation**: Displays confirmation message with number of payments scheduled
- **Payment Summary**: Shows payment totals, debit information, and payment dates
- **Wire Transfer Details**: If wire transfer is required, displays wire instructions with confirmation workflow
- **Bank Account Information**: Shows the debit bank account details

### Contractor.PaymentStatement

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

## Payment Workflow

The contractor payments workflow follows these typical steps:

1. **View Payment List**: Start with `PaymentsList` to see existing payment groups and create new payments
2. **Create Payment**: Use `CreatePayment` to build a payment group:
   - Select payment date
   - Edit individual contractor payments (hours, wages, bonuses, reimbursements)
   - Preview payment details
   - Handle submission blockers (Fast ACH, wire transfers)
   - Submit payment group
3. **View Summary**: After creation, `PaymentSummary` shows confirmation and wire transfer instructions if needed
4. **View History**: Use `PaymentHistory` to see details of a payment group and manage individual payments
5. **View Statement**: Use `PaymentStatement` to see detailed information for an individual contractor payment

## Important Notes

### Payment Timing

- Direct deposit payments submitted before 4pm PT on a business day take 2 business days to complete
- Fast ACH (2-day) payments have threshold limits; exceeding the threshold requires wire transfer or switching to 4-day processing

### Payment Requirements

- Only active contractors with completed onboarding can receive payments
- At least one contractor payment must be included in a payment group
- Bank account must be set up for the company to process payments

### Submission Blockers

Payment submission may be blocked by:

- **Fast ACH Threshold Exceeded**: Payment amount exceeds the fast ACH limit
  - Options: Wire transfer (fastest) or switch to 4-day direct deposit
- **Needs Earned Access for Fast ACH**: Company hasn't earned access to faster payments yet
  - Must use standard 4-day processing

### Wire Transfers

When wire transfer is required:

- Instructions are provided in the payment flow
- Must be completed by specified deadline to ensure timely payment
- Confirmation workflow tracks wire transfer submission
