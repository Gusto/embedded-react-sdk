# Hooks Extraction — Status & Context

## Branch

`refactor/extract-hooks` — based off `main` at `c5be8ef9`

## Goal

Every exported block component gets a corresponding `useXxx` hook that extracts its business logic from the component's Root. The component becomes a thin rendering shell that calls the hook and renders JSX.

## Return Shape Standard

All hooks follow the grouped return shape defined in `src/types/hookStandard.ts`:

- `data` — Domain data the UI needs to render
- `actions` — All callable functions (submit, edit, cancel, etc.)
- `meta` — Status indicators (isPending, isLoading, machine, etc.)
- `pagination` — Optional, for blocks with paginated data
- `form` — Optional, for blocks with react-hook-form integration

## Current State: COMPLETE (52 hooks across 5 domains)

### Leaf block hooks (consumer-facing, genuinely useful as headless UI)

These extract data fetching, mutations, form state, and event handlers. A consumer can call the hook and wire it to their own custom UI.

| Domain              | Hooks                                                                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Company             | useCompanyIndustry, useCompanyFederalTaxes, useCompanyPaySchedule, useCompanyOnboardingOverview, useCompanyAssignSignatory, useCompanyCreateSignatory, useCompanyInviteSignatory, useCompanyDocumentList, useCompanySignatureForm                    |
| Contractor          | useContractorProfile, useContractorAddress, useContractorList, useContractorPaymentMethod, useContractorNewHireReport, useContractorSubmit                                                                                                           |
| Employee            | useEmployeeProfile, useEmployeeCompensation, useEmployeeFederalTaxes, useEmployeeStateTaxes, useEmployeePaymentMethod, useEmployeeEmployeeList, useEmployeeLanding, useEmployeeOnboardingSummary, useEmployeeEmploymentEligibility, useEmployeeTaxes |
| Payroll             | usePayrollConfiguration, usePayrollOverview, usePayrollEditEmployee, usePayrollList, usePayrollHistory, usePayrollReceipts, usePayPeriodDateForm, useOffCycleReasonSelection, usePayrollBlockerList                                                  |
| InformationRequests | useInformationRequestList, useInformationRequestForm                                                                                                                                                                                                 |

### Flow/state machine hooks (internal refactor only, not useful as headless UI)

These return `meta.machine` (a robot3 state machine instance) — an internal implementation detail. They exist for consistency and code separation, but a consumer can't use them standalone to build their own flow.

| Domain     | Hooks                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| Company    | useCompanyDocumentSigner, useCompanyLocations, useCompanyBankAccount, useCompanyStateTaxes, useCompanyOnboardingFlow |
| Contractor | useContractorOnboardingFlow, useContractorPaymentFlow                                                                |
| Employee   | useEmployeeDeductions, useEmployeeDocumentSigner, useEmployeeOnboardingFlow, useEmployeeSelfOnboardingFlow           |
| Payroll    | usePayrollLanding, usePayrollFlow                                                                                    |

### Modal + state machine hooks (internal refactor, partially useful)

These return modal state, event handlers, and the current machine component. More useful than pure flow hooks but still tightly coupled to internal rendering patterns.

| Domain              | Hooks                                   |
| ------------------- | --------------------------------------- |
| Payroll             | useConfirmWireDetails, useRecoveryCases |
| InformationRequests | useInformationRequestsFlow              |

## What's Next (potential follow-up work)

1. **Type exports** — The earlier batch of hooks (Payroll especially) export `UseXxxParams` / `UseXxxReturn` types. The newer hooks don't yet. Could standardize.
2. **Flow hooks uplift** — To make flow hooks genuinely consumer-facing, they'd need to return domain data + explicit actions instead of opaque machine instances. This is a bigger architectural change.
3. **Tests** — The existing 1,166 tests all pass. Could add dedicated hook tests (via renderHook) for the new hooks.
4. **PR** — Branch is ready for PR against `main`. The full diff is ~50 files changed.

## File Locations

- Hook standard types: `src/types/hookStandard.ts`
- Domain indexes: `src/components/{Company,Contractor,Employee,Payroll,InformationRequests}/index.ts`
- Each hook lives alongside its component: `src/components/{Domain}/{Block}/use{Domain}{Block}.ts`
