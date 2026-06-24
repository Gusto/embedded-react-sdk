<!-- Partner-facing guide content, published to the SDK docs site. -->

# OnboardingExecutionFlow

## Step flow <!-- slot: appendix -->

`OnboardingExecutionFlow` runs the per-employee steps in order. After compensation, the path branches on the employee's self-onboarding status — set by the self-onboarding toggle the admin chooses on the Profile step, not by a flow prop:

- **Admin onboarding** — the admin completes every step, including federal taxes, state taxes, and payment method.
- **Self-onboarding** — the admin sets up the basics and the employee completes federal taxes, state taxes, and payment method themselves, so those three steps are skipped here.

The `isSelfOnboardingEnabled` prop only controls whether that toggle is offered: when `false`, the toggle is hidden and the flow always takes the admin path; when `true` (the default), the branch follows the admin's selection.

The documents step appears only when `withEmployeeI9` is set.

```mermaid
flowchart
  start@{ shape: sm-circ } --> Profile
  Profile -->|"employee/profile/done"| Compensation
  Compensation -->|"employee/compensations/done"| selfOnboarding{{"selfOnboarding?"}}
  selfOnboarding -.->|false| FederalTaxes
  FederalTaxes -->|"employee/federalTaxes/done"| StateTaxes
  StateTaxes -->|"employee/stateTaxes/done"| PaymentMethod
  PaymentMethod -->|"employee/paymentMethod/done"| Deductions
  selfOnboarding -.->|true| Deductions
  Deductions -->|"employee/deductions/done"| withEmployeeI9{{"withEmployeeI9?"}}
  withEmployeeI9 -.->|true| EmployeeDocuments
  EmployeeDocuments -->|"employee/documents/done"| OnboardingSummary
  withEmployeeI9 -.->|false| OnboardingSummary
  OnboardingSummary -->|"employee/onboarding/done"| done@{ shape: fr-circ, label: " " }

  class selfOnboarding branch
  class withEmployeeI9 branch
```
