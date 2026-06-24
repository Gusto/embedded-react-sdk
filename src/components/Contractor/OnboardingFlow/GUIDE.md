<!-- Partner-facing guide content, published to the SDK docs site. -->

# OnboardingFlow

## Step flow <!-- slot: appendix -->

`OnboardingFlow` begins on the contractor list and steps through the per-step screens once "Add contractor" or a row's "Edit"/"Continue" action is invoked. After the profile step, the path branches on whether the contractor self-onboards:

- **Admin onboarding** (`selfOnboarding = false`) — the admin completes every step, including address and payment method.
- **Self-onboarding** (`selfOnboarding = true`) — the admin sets up the basics and the contractor completes their own address and payment method later, so those two steps are skipped here.

The progress bar's secondary button emits `CANCEL` from any step, returning to the list.

```mermaid
flowchart
  start@{ shape: sm-circ } --> ContractorList
  ContractorList -->|"contractor/create, contractor/update"| ContractorProfile
  ContractorProfile -->|"contractor/profile/done"| selfOnboarding{{"selfOnboarding?"}}
  selfOnboarding -.->|false| Address
  Address -->|"contractor/address/done"| PaymentMethod
  PaymentMethod -->|"contractor/paymentMethod/done"| NewHireReport
  selfOnboarding -.->|true| NewHireReport
  NewHireReport -->|"contractor/newHireReport/done"| ContractorSubmit
  ContractorSubmit -->|"contractor/submit/done"| done@{ shape: fr-circ, label: " " }

  class ContractorList,ContractorProfile,Address,PaymentMethod,NewHireReport,ContractorSubmit component
  class selfOnboarding branch
```
