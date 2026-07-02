<!-- Partner-facing guide content, published to the SDK docs site. -->

# SelfOnboardingFlow

## Step flow <!-- slot: appendix -->

The contractor completes their own onboarding, starting from the self-onboarding landing page.

```mermaid
flowchart
  start@{ shape: sm-circ } --> Landing
  Landing -->|"contractor/selfOnboarding/start"| Profile
  Profile -->|"contractor/profile/done"| Address
  Address -->|"contractor/address/done"| PaymentMethod
  PaymentMethod -->|"contractor/paymentMethod/done"| DocumentSigner
  DocumentSigner -->|"contractor/documents/done"| OnboardingSummary
  OnboardingSummary -->|"contractor/selfOnboarding/done"| done@{ shape: fr-circ, label: " " }
```
