# Historical Contractor Payments SDK — AI Pilot Experiment

> **Status:** Draft / Experiment — not intended for production merge as-is.
> This is the output of an AI-assisted SDK component generation pilot. We're sharing it for eng commentary on pattern adherence, architectural decisions, and feasibility of this approach.

## Background

Historical Contractor Payments was explicitly descoped from the Contractor Payments SDK launch ([Launch Checklist](https://docs.google.com/document/d/1__Fr0XhVNLrg2cPTG8RkU0becFRz8c2lfduzx4jLbmI/edit)) because mixing historical and future-dated payments in a single flow caused UX confusion — date constraints, payment speed, and ACH validation that apply to future payments don't apply to historical ones.

This experiment builds a standalone `HistoricalPaymentFlow` component that provides a dedicated, simplified flow for recording past-dated contractor payments, using the same API endpoints (`contractor_payment_groups`) with `payment_method: "Historical Payment"`.

## What This Component Does

A 3-step journey:

1. **Select a past payment date** — Date picker constrained to past dates, defaulting to yesterday. No payment speed or ACH configuration.
2. **Select contractors and specify amounts** — Table of active, onboarded contractors. Edit modal for hours (hourly), wage (fixed), bonus, and reimbursement. Payment method is always "Historical Payment" (no selector).
3. **Review and submit** — Preview via `contractor_payment_groups/preview` API, then submit using the `creationToken` for idempotency. Success confirmation screen with payment summary.

## How It Was Built

This was generated through an AI-assisted workflow (Claude Code acting as CTO advisor):

1. **Pattern analysis** — Read the existing Contractor Payments SDK components (`CreatePayment`, `PaymentFlow`, `PaymentSummary`, `EditContractorPaymentPresentation`, etc.) to extract every architectural pattern: robot3 state machines, container/presentation split, BaseComponent wrapper, ComponentsContext, Zod form schemas with factory functions, i18n namespacing, event system, DataView tables, DOMPurify sanitization.

2. **Mini-PRD** — Created acceptance criteria (32 checkboxes) covering both structural requirements (must match existing patterns) and functional requirements (historical-specific behavior). See `PRDs/PRD-Historical-Contractor-Payments-SDK.md` in the workspace root.

3. **Implementation** — Generated all components following the extracted patterns, making intentional simplifications where the historical domain differs:
   - No payment method selector (always "Historical Payment")
   - No submission blocker UI (not applicable to historical payments)
   - No wire/bank account integration
   - No debit date/amount in summary tables
   - Simplified state machine (3 states vs 6+ in PaymentFlow)

4. **Verification** — TypeScript compilation, ESLint, Prettier all pass. Tested the full flow end-to-end in the SDK Dev App with live demo data via gws-flows.

## Files Created

```
src/components/Contractor/Payments/HistoricalPayments/
├── types.ts                              # Shared types (reuses InternalAlert from existing)
├── README.md                             # This file
├── CreateHistoricalPayment/
│   ├── CreateHistoricalPayment.tsx        # Container — data fetching, form setup, submit handlers
│   ├── CreateHistoricalPaymentPresentation.tsx  # Date picker + contractor table view
│   ├── EditHistoricalPaymentPresentation.tsx    # Modal for editing individual contractor pay
│   ├── EditHistoricalPaymentFormSchema.ts       # Zod schema (no paymentMethod field)
│   ├── HistoricalPreviewPresentation.tsx        # Review & submit view
│   ├── HistoricalPaymentSuccess.tsx             # Success container (fetches payment group)
│   ├── HistoricalPaymentSuccessPresentation.tsx # Success confirmation view
│   └── helpers.ts                               # Date helpers, contractor display name
└── HistoricalPaymentFlow/
    ├── HistoricalPaymentFlow.tsx          # Entry point — creates robot3 machine
    ├── HistoricalPaymentFlowComponents.tsx # Contextual wrappers (useFlow + ensureRequired)
    ├── historicalPaymentStateMachine.ts   # 3-state machine: create → success → done
    └── index.ts                          # Public exports
```

**Modified existing files:**

- `src/shared/constants.ts` — Added 7 `CONTRACTOR_HISTORICAL_PAYMENT_*` event constants
- `src/components/Contractor/index.ts` — Added exports for `HistoricalPaymentFlow` and `CreateHistoricalPayment`
- `src/i18n/en/` — Two new translation JSON files
- `src/types/i18next.d.ts` — Regenerated (auto-generated file)

## Current Status

### What works

- Full flow renders and functions in the SDK Dev App
- Live API calls succeed (preview + create) against gws-flows demo environment
- Date validation (past-only) enforced client-side and by API
- Contractor filtering, hourly/fixed wage handling, totals calculations all verified
- Success confirmation screen with payment summary after submission
- All events fire correctly (visible in SDK Dev App event log)
- TypeScript, ESLint, and Prettier all pass

### What's missing before this could be production-ready

- **Unit tests** — No Vitest test files. The existing `CreatePayment` has test coverage that should be mirrored.
- **Storybook stories** — Team convention is Storybook-first development. No stories exist for these components.
- **Accessibility audit** — Keyboard navigation, screen reader behavior, and ARIA attributes haven't been reviewed.
- **Design review** — Built from existing patterns + Figma references, but no dedicated design review of this specific flow.
- **Edge cases** — Behavior with 0 contractors, very long contractor lists, network errors mid-flow, etc.
- **Integration into PaymentFlow** — Currently standalone only. If we want it reachable from the existing PaymentFlow landing page, that's additional state machine wiring.

## How to Test

1. Check out this branch
2. `npm install`
3. `npm run sdk-app`
4. In the SDK Dev App, provision a demo company (or use an existing one)
5. Find **"Contractor.Payments.HistoricalPayments.HistoricalPaymentFlow"** in the sidebar
6. Walk through the flow: pick a past date → edit contractor amounts → continue to preview → submit

## What We're Looking For

This is shared for commentary, not merge approval. We'd appreciate feedback on:

- **Pattern adherence** — Does the code follow SDK conventions correctly? Anything that would need to change?
- **Architectural decisions** — Is the simplified 3-state machine the right call, or should preview be a separate state? Should the success screen be a standalone component (like PaymentSummary) rather than embedded in the flow?
- **Gaps** — What edge cases or requirements did the AI miss?
- **AI pilot viability** — Given this output, is AI-assisted component generation a viable accelerator for future SDK work? What would make it more useful?
