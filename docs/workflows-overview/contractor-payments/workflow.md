---
title: Workflow
description: Drop-in Contractor.PaymentFlow component that renders the entire contractor payments experience.
order: 1
---

# Contractor Payments workflow

The Contractor Payments workflow renders the full payments experience — view, create, preview, submit, and review payment groups — as a single component. Drop it into your app and the user walks through every step required to pay contractors.

---

## Implementation

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

---

## Payment workflow

The contractor payments workflow follows these typical steps:

1. **View payment list**: Start with `PaymentsList` to see existing payment groups and create new payments.
2. **Create payment**: Use `CreatePayment` to build a payment group:
   - Select payment date
   - Edit individual contractor payments (hours, wages, bonuses, reimbursements)
   - Preview payment details
   - Handle submission blockers (Fast ACH, wire transfers)
   - Submit payment group
3. **View summary**: After creation, `PaymentSummary` shows confirmation and wire transfer instructions if needed.
4. **View history**: Use `PaymentHistory` to see details of a payment group and manage individual payments.
5. **View statement**: Use `PaymentStatement` to see detailed information for an individual contractor payment.

---

## Important notes

### Payment timing

- Direct deposit payments submitted before 4pm PT on a business day take 2 business days to complete.
- Fast ACH (2-day) payments have threshold limits; exceeding the threshold requires wire transfer or switching to 4-day processing.

### Payment requirements

- Only active contractors with completed onboarding can receive payments.
- At least one contractor payment must be included in a payment group.
- A bank account must be set up for the company to process payments.

### Submission blockers

Payment submission may be blocked by:

- **Fast ACH threshold exceeded**: Payment amount exceeds the fast ACH limit
  - Options: Wire transfer (fastest) or switch to 4-day direct deposit
- **Needs earned access for Fast ACH**: Company hasn't earned access to faster payments yet
  - Must use standard 4-day processing

### Wire transfers

When wire transfer is required:

- Instructions are provided in the payment flow.
- Must be completed by specified deadline to ensure timely payment.
- Confirmation workflow tracks wire transfer submission.
