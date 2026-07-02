<!-- Partner-facing guide content, published to the SDK docs site. -->

# SelfOnboardingFlow

## Step flow <!-- slot: appendix -->

The employee completes their own onboarding, starting from the self-onboarding landing page.

```mermaid
flowchart
  start@{ shape: sm-circ } --> Landing
  Landing -->|"employee/selfOnboarding/start"| Profile
  Profile -->|"employee/profile/done"| FederalTaxes
  FederalTaxes -->|"employee/federalTaxes/done"| StateTaxes
  StateTaxes -->|"employee/stateTaxes/done"| PaymentMethod
  PaymentMethod -->|"employee/paymentMethod/done"| DocumentSigner
  DocumentSigner -->|"employee/forms/done"| OnboardingSummary
  OnboardingSummary -->|"employee/onboarding/done"| done@{ shape: fr-circ, label: " " }
```
