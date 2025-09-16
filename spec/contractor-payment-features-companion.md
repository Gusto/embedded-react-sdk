## Contractor Payment Features – Companion Doc

This companion doc explains how to use and interpret the items in the Features Table. See: [Features Table](./contractor-payment-features.md).

### Purpose

- Provide a concise, implementation-oriented view of scope and behavior across creation, history, compliance, and recovery.
- Clarify inputs/outputs, validation, and success criteria for teams building and testing the flow.

### Scope and Outcomes

- Finance teams can create contractor payment batches, preview financial impact, submit with confidence, and view history and receipts.
- The system enforces compliance (RFI blocks, bank verification, audit logging) and provides recovery workflows for failed ACH.

### Core Flows

- Create → Preview → Submit → Index
  - New payment form with editable per-contractor values via modal; real-time totals; creation token for idempotency.
  - Preview returns totals, debit account, debit and pay dates; re-validates before submission.
- History & Drill-down
  - Index lists payment dates with totals and contractor counts. Click a date to see all payments by check date; open an individual payment for full breakdown and (if funded DD) a receipt.
- Recovery Management
  - Recovery dashboard lists failed ACH recovery cases, supports redebit where eligible, and surfaces status/notifications.
- RFI Blocking
  - Payment creation checks pending information requests; critical RFIs block submission and display guidance.

### Feature Group Highlights

- Functional
  - Batch creation (hourly/fixed, bonus, reimbursements), per-row and aggregate totals, cancellation of eligible payments.
  - Payment methods: Direct Deposit, Check, Historical Payment (with method constraints, e.g., check-only).
- Compliance/Security
  - Bank account verification for ACH; masked display; role-based access control; audit logging; rate limiting and sanitization.
- Recovery
  - Track recovery cases, initiate redebit for eligible cases, and reflect state transitions in UI.
- Quality/Performance/Observability
  - WCAG 2.1 AA accessibility, responsive layouts, query/pagination optimizations, async batch processing, monitoring/alerting, comprehensive tests.

### API Touchpoints

- History and details
  - `GET /api/contractor_payments` (index with date filtering)
  - `GET /api/contractor_payments/by_date/:date` (by check date)
  - `GET /api/contractor_payments/:id` (individual payment detail)
  - `DELETE /api/contractor_payments/:id` (cancel eligible payment)
- Creation and preview
  - `GET /api/contractor_payments/new` (form data: contractors/configs)
  - `POST /api/contractor_payments/preview` (preview totals, validation)
  - `POST /api/contractor_payments` (create payments; idempotent via creation token)
- Compliance & recovery
  - `GET /api/information_requests` (detect RFIs; enforce blocks)
  - `GET /api/recovery_cases` (list recovery cases)
  - `PUT /api/recovery_cases/:id/redebit` (initiate redebit)

### Guardrails and Validation

- Amounts: currency format, ≥ 0, 2-decimal precision; hours decimal ≥ 0.
- At least one payment field per contractor must be > 0.
- Dates: future date, business-day constraints; pay/debit timing reflected in preview.
- Method constraints: respect contractor/payment configuration (e.g., check-only).
- Idempotency: `creation_token` prevents duplicate submissions.
- Bank verification required for ACH; receipts available after funds are funded.
- Cancellation only when eligible (`may_cancel`).

### UX and Accessibility

- Table-first editing with an edit modal for precision inputs; totals update in real time.
- Clear error messages for invalid dates/amounts; blocking banners for RFIs.
- Keyboard navigation and screen reader semantics for tables, modals, and actions.

### Non-Functional Commitments

- Performance: history <3s; preview <5s; batch creation <30s for ~100 contractors.
- Reliability: resilient error handling, retries where appropriate.
- Security: encryption in transit/at rest; RBAC; rate limiting and sanitization.
- Observability: metrics and alerts on slow queries, failed submissions, ACH failures.

### Testing Strategy (High-Level)

- Unit: validation logic, totals calculations, component states (form, modal, preview).
- Integration: API flows for preview, creation, history, cancellation, RFIs, recovery.
- E2E: end-to-end batch creation to receipt; recovery case redebit; RFI block paths.

### Out of Scope (Initial Release)

- Non-listed payment methods (e.g., wires, wallets) beyond Direct Deposit/Check/Historical.
- Employee payroll flows; this scope is contractor-only.

### Success Criteria (Abbrev.)

- <30s batch creation for 100 contractors; <3s history queries; 99.9% processing success.
- 95% automated recovery rate for failed ACH; 100% RFI blocking for critical requests.
- Accessibility conformance and high user satisfaction for finance workflows.
