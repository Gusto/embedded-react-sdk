---
title: Contractor.OnboardingFlow
sidebar_position: 2
---

End-to-end contractor onboarding workflow that orchestrates all onboarding steps in sequence — contractor selection, profile creation, address entry, payment method setup, new hire reporting, and final submission.

### Steps

1. **ContractorList** — Select or create a contractor (initial step)
2. **ContractorProfile** — Contractor name, type, and business details
3. **Address** — Contractor mailing address
4. **PaymentMethod** — Payment method configuration
5. **NewHireReport** — State new hire reporting
6. **ContractorSubmit** — Review and submit contractor onboarding

:::note
In the self-onboarding path, the **Address** and **PaymentMethod** steps are skipped — those steps are handled by the contractor themselves via the self-onboarding experience.
:::

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Contractor.OnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                          | Required | Description                                                                                       |
| --------------- | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `companyId`     | `string`                                      | Yes      | The associated company identifier.                                                                |
| `defaultValues` | `object`                                      | No       | Default values for individual flow step components. Supports `profile` and `address` sub-objects. |
| `onEvent`       | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. Receives events from all subcomponents.                 |

## Events

This component emits events from all of its subcomponents. See the individual block documentation for the specific events each step produces:

- [ContractorList events](./contractor-list.md#events)
- [ContractorProfile events](./contractor-profile.md#events)
- [Address events](./address.md#events)
- [PaymentMethod events](./payment-method.md#events)
- [NewHireReport events](./new-hire-report.md#events)
- [ContractorSubmit events](./contractor-submit.md#events)
