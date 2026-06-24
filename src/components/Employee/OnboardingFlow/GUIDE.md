<!-- Partner-facing guide content, published to the SDK docs site. -->

# OnboardingFlow

## Onboarding Workflow <!-- slot: overview -->

`OnboardingFlow` opens on the employee list and runs the per-employee onboarding steps in order whenever "Add employee", "Edit", or "Review" is selected; completing or leaving a step sequence returns to the list.

The step sequence when composing the subcomponents manually:

1. [`EmployeeList`](./blocks.md#employeelist) — browse employees and their onboarding status, and start adding or editing one.
2. [`Profile`](./blocks.md#profile) — collect the employee's details, addresses, and start date, and optionally invite them to self-onboard.
3. [`Compensation`](./blocks.md#compensation) — set the job title, employee type, pay rate, and pay period, including multiple roles for hourly employees.
4. [`FederalTaxes`](./blocks.md#federaltaxes) — collect W-4 withholding details.
5. [`StateTaxes`](./blocks.md#statetaxes) — answer the per-state withholding questions driven by the employee's work and home states.
6. [`PaymentMethod`](./blocks.md#paymentmethod) — choose direct deposit or check and split pay across multiple bank accounts.
7. [`Deductions`](./blocks.md#deductions) — add post-tax deductions and court-ordered garnishments.
8. [`EmployeeDocuments`](./blocks.md#employeedocuments) — configure the employee's documents, including the I-9. Shown only when `withEmployeeI9` is set.
9. [`OnboardingSummary`](./blocks.md#onboardingsummary) — review the completed and outstanding steps for the employee.

When the employee is self-onboarding, the federal taxes, state taxes, and payment method steps are skipped so the employee completes them; the documents step is skipped unless `withEmployeeI9` is set and the I-9 has not yet been configured.
