<!-- Partner-facing guide content, published to the SDK docs site. -->

# OnboardingExecutionFlow

## Step flow <!-- slot: appendix -->

The execution steps differ by whether the employee self-onboards, so each path is shown on its own. (The documents step appears only when `withEmployeeI9` is set.)

### Without self-onboarding

The admin completes every step.

```mermaid
flowchart
  Profile -->|"employee/profile/done"| Compensation
  Compensation -->|"employee/compensations/done"| FederalTaxes
  FederalTaxes -->|"employee/federalTaxes/done"| StateTaxes
  StateTaxes -->|"employee/stateTaxes/done"| PaymentMethod
  PaymentMethod -->|"employee/paymentMethod/done"| Deductions
  Deductions -->|"employee/deductions/done"| i9{{"withEmployeeI9?"}}
  i9 -->|true| EmployeeDocuments
  i9 -->|false| OnboardingSummary
  EmployeeDocuments -->|"employee/documents/done"| OnboardingSummary
  OnboardingSummary -->|"employee/onboarding/done"| done(( ))
```

### With self-onboarding

The admin sets up the basics; the employee completes taxes and payment method themselves.

```mermaid
flowchart
  Profile -->|"employee/profile/done"| Compensation
  Compensation -->|"employee/compensations/done"| Deductions
  Deductions -->|"employee/deductions/done"| i9{{"withEmployeeI9?"}}
  i9 -->|true| EmployeeDocuments
  i9 -->|false| OnboardingSummary
  EmployeeDocuments -->|"employee/documents/done"| OnboardingSummary
  OnboardingSummary -->|"employee/onboarding/done"| done(( ))
```
