---
title: Employee.OnboardingFlow
sidebar_position: 2
---

## Description

Multi-step admin-driven employee onboarding flow. Orchestrates the full sequence of steps required to onboard an employee to payroll: creating the employee record, collecting personal details, configuring compensation, taxes, payment method, deductions, documents, and displaying a summary.

### Steps

1. **EmployeeList** — Select or create an employee
2. **Profile** — Collect name, addresses, SSN, DOB, and start date
3. **Compensation** — Job title, FLSA status, pay rate, and payment unit
4. **FederalTaxes** — Federal tax withholding configuration
5. **StateTaxes** — State tax withholding configuration
6. **PaymentMethod** — Bank account setup for direct deposit
7. **Deductions** — Additional withholdings
8. **EmployeeDocuments** — I-9 document configuration (requires both `withEmployeeI9` to be `true` and the employee's onboarding status to not be in a completed state)
9. **OnboardingSummary** — Onboarding completion status

:::note Self-onboarding branch
When an employee is set up for self-onboarding, the flow skips **FederalTaxes**, **StateTaxes**, and **PaymentMethod** after the Compensation step. Those steps are instead handled by the employee themselves through the [SelfOnboardingFlow](./self-onboarding-flow.md).
:::

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId }) {
  const handleEvent = (eventType, data) => {
    // Handle events from all subcomponents
  }

  return (
    <Employee.OnboardingFlow
      companyId={companyId}
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
| **defaultValues** | `object` | | No | Default values for individual flow step components. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted from any subcomponent. |
| **isSelfOnboardingEnabled** | `boolean` | `true` | No | When true, presents the self-onboarding toggle allowing the admin to opt the employee into self-onboarding. |
| **withEmployeeI9** | `boolean` | `false` | No | When true, enables the Employee Documents step in the onboarding flow for I-9 configuration. |

## Events

Emits events from all subcomponents in the flow. See individual block documentation for the complete list of events:

- [EmployeeList events](./employee-list.md#events)
- [Profile events](./profile.md#events)
- [Compensation events](./compensation.md#events)
- [FederalTaxes events](./federal-taxes.md#events)
- [StateTaxes events](./state-taxes.md#events)
- [PaymentMethod events](./payment-method.md#events)
- [Deductions events](./deductions.md#events)
- [EmployeeDocuments events](./employee-documents.md#events)
- [OnboardingSummary events](./onboarding-summary.md#events)
