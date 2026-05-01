---
title: Company.OnboardingFlow
sidebar_position: 2
---

End-to-end company onboarding workflow that orchestrates all onboarding steps in sequence. This flow component manages navigation between individual onboarding blocks automatically.

### Steps

1. **OnboardingOverview** — Company onboarding status overview
2. **Locations** — Company work addresses
3. **FederalTaxes** — Federal tax setup
4. **Industry** — Industry classification
5. **BankAccount** — Company bank account for payroll
6. **Employee.OnboardingFlow** — Nested employee onboarding flow (runs the full [Employee.OnboardingFlow](../employee/onboarding-flow.md) within the company onboarding)
7. **PaySchedule** — Pay frequency and schedule configuration
8. **StateTaxes** — State tax registration
9. **DocumentSigner** — Sign required documents

:::note
Step 6 is a nested `Employee.OnboardingFlow` — the company onboarding flow delegates to the employee onboarding flow to onboard the first employee before continuing with the remaining company steps.
:::

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Company.OnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                          | Required | Description                                                                       |
| --------------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------- |
| `companyId`     | `string`                                      | Yes      | The associated company identifier.                                                |
| `defaultValues` | `object`                                      | No       | Default values for individual flow step components.                               |
| `onEvent`       | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. Receives events from all subcomponents. |

## Events

This component emits events from all of its subcomponents. See the individual block documentation for the specific events each step produces:

- [OnboardingOverview events](./onboarding-overview.md#events)
- [Locations events](./locations.md#events)
- [FederalTaxes events](./federal-taxes.md#events)
- [Industry events](./industry.md#events)
- [BankAccount events](./bank-account.md#events)
- [Employee.OnboardingFlow events](../employee/onboarding-flow.md#events)
- [PaySchedule events](./pay-schedule.md#events)
- [StateTaxes events](./state-taxes.md#events)
- [DocumentSigner events](./document-signer.md#events)
