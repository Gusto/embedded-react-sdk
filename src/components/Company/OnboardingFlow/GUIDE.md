<!-- Partner-facing guide content, published to the SDK docs site. -->

# OnboardingFlow

## Step flow <!-- slot: appendix -->

The flow opens on the overview, then runs the linear step sequence below before returning to the overview to finish. Every step is a `CompanyOnboarding` block except the Employees step, which embeds `EmployeeOnboarding.OnboardingFlow` and owns its own internal navigation.

```mermaid
flowchart
  start@{ shape: sm-circ } --> Overview
  Overview -->|"company/overview/continue"| Locations
  Locations -->|"company/location/done"| FederalTaxes
  FederalTaxes -->|"company/federalTaxes/done"| Industry
  Industry -->|"company/industry/selected"| BankAccount
  BankAccount -->|"company/bankAccount/done"| Employees["EmployeeOnboarding.OnboardingFlow"]
  Employees -->|"employee/onboarding/done"| PaySchedule
  PaySchedule -->|"paySchedule/done"| StateTaxes
  StateTaxes -->|"company/stateTaxes/done"| DocumentSigner
  DocumentSigner -->|"company/forms/done"| Overview
  Overview -->|"company/overview/done"| done@{ shape: fr-circ, label: " " }
  class Employees flow
```

Each step is also exported as a standalone block (see the Sub-components table) for composing a custom workflow when this orchestration is the wrong fit. See the [Composition guide](https://sdk.gusto.com/docs/integration-guide/composition) for how to recompose these blocks into your own flow.
