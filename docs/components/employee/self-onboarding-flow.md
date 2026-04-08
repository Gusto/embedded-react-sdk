---
title: Employee.SelfOnboardingFlow
sidebar_position: 3
---

## Description

Employee-facing onboarding flow. When an admin enables self-onboarding for an employee, the employee can be provided with this workflow to complete their own onboarding information. Many subcomponents are shared with the admin onboarding flow but are configured for the employee context (hiding admin-only fields).

### Steps

1. **Landing** — Welcome page with guidance on what information is needed
2. **Profile** — Collect name, email, SSN, DOB, and home address
3. **FederalTaxes** — Federal tax withholding configuration
4. **StateTaxes** — State tax withholding configuration
5. **PaymentMethod** — Bank account setup for direct deposit
6. **DocumentSigner** — Read and sign employment documents (with optional I-9)
7. **OnboardingSummary** — Onboarding completion status

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId, employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle events from all subcomponents
  }

  return (
    <Employee.SelfOnboardingFlow
      companyId={companyId}
      employeeId={employeeId}
      onEvent={handleEvent}
      withEmployeeI9
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **companyId** | `string` | | Yes | The associated company identifier. |
| **employeeId** | `string` | | Yes | The associated employee identifier. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted from any subcomponent. |
| **withEmployeeI9** | `boolean` | `false` | No | When true, the Document Signer step checks if the employee has I-9 enabled and routes to the Employment Eligibility and I-9 signature form steps. |

## Events

Emits events from all subcomponents in the flow. See individual block documentation for the complete list of events:

- [Landing events](./landing.md#events)
- [Profile events](./profile.md#events)
- [FederalTaxes events](./federal-taxes.md#events)
- [StateTaxes events](./state-taxes.md#events)
- [PaymentMethod events](./payment-method.md#events)
- [DocumentSigner events](./document-signer.md#events)
- [OnboardingSummary events](./onboarding-summary.md#events)
