<!-- Partner-facing guide content, published to the SDK docs site. -->

# PaymentFlow

## Payment Workflow <!-- slot: overview -->

The typical step sequence when composing the blocks manually:

1. [`PaymentsList`](./blocks.md#paymentslist) — browse existing payment groups and start a new one.
2. [`CreatePayment`](./blocks.md#createpayment) — select a date, edit per-contractor amounts, preview, and submit. Handles Fast ACH blockers and wire transfer requirements inline.
3. [`PaymentSummary`](./blocks.md#paymentsummary) — review the created group, debit details, and wire instructions when required.
4. [`PaymentHistory`](./blocks.md#paymenthistory) — inspect a payment group's details and cancel individual payments.
5. [`PaymentStatement`](./blocks.md#paymentstatement) — see the full breakdown for one contractor's payment.

## Step flow <!-- slot: appendix -->

The flow is a hub-and-spoke loop with no terminal state — the payments list is the landing screen, and every path returns to it:

- **Create a payment** — `PaymentsList` hands off to `CreatePaymentFlow`, which returns to the list once the flow completes.
- **View history** — `PaymentsList` hands off to `ViewHistoryFlow`, which returns to the list once the flow completes.
- **Respond to a request** — `PaymentsList` opens the embedded `InformationRequestsFlow`, returning to the list once the request is submitted or cancelled.

Breadcrumbs navigate back to the list from anywhere inside `CreatePaymentFlow` or `ViewHistoryFlow`, and submitting wire-transfer details surfaces a success alert on the list screen. The diagram below shows the topology; the event behind each transition is listed in the events table above.

```mermaid
flowchart LR
  start@{ shape: sm-circ } --> PaymentsList

  PaymentsList <--> CreatePaymentFlow
  PaymentsList <--> ViewHistoryFlow
  PaymentsList <--> InformationRequests["InformationRequests.<br/>InformationRequestsFlow"]

  class CreatePaymentFlow flow
  class ViewHistoryFlow flow
  class InformationRequests flow
```

## Important Notes <!-- slot: appendix -->

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
