---
title: Employee
sidebar_position: 1
---

## Overview

The Employee domain provides components for managing the full employee lifecycle — onboarding, self-onboarding, tax configuration, payment setup, document signing, and termination. Components are accessible as properties on the `Employee` namespace import.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'
```

## Flows

Flows are multi-step workflow components that orchestrate several blocks into a guided experience.

| Flow                                                     | Description                                 |
| -------------------------------------------------------- | ------------------------------------------- |
| [Employee.OnboardingFlow](./onboarding-flow.md)          | Admin-driven multi-step employee onboarding |
| [Employee.SelfOnboardingFlow](./self-onboarding-flow.md) | Employee-facing self-onboarding experience  |
| [Employee.TerminationFlow](./termination-flow.md)        | Full employee termination workflow          |

## Blocks

Blocks are individual components that can be used standalone or composed into custom workflows. For guidance on composing your own workflows, see the [composition guide](../../concepts/composition.md).

| Block                                                         | Description                                          |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| [Employee.EmployeeList](./employee-list.md)                   | Displays employees with names and onboarding status  |
| [Employee.Profile](./profile.md)                              | Collects employee personal information and addresses |
| [Employee.Compensation](./compensation.md)                    | Job title, FLSA status, pay rate, and payment unit   |
| [Employee.FederalTaxes](./federal-taxes.md)                   | Federal tax form configuration                       |
| [Employee.StateTaxes](./state-taxes.md)                       | State tax form configuration                         |
| [Employee.PaymentMethod](./payment-method.md)                 | Bank accounts for direct deposit                     |
| [Employee.Deductions](./deductions.md)                        | Additional withholdings configuration                |
| [Employee.EmployeeDocuments](./employee-documents.md)         | Admin I-9 document configuration                     |
| [Employee.DocumentSigner](./document-signer.md)               | Read and sign employment documents                   |
| [Employee.EmploymentEligibility](./employment-eligibility.md) | I-9 employment eligibility verification              |
| [Employee.OnboardingSummary](./onboarding-summary.md)         | Onboarding completion status                         |
| [Employee.Landing](./landing.md)                              | Self-onboarding welcome page                         |
| [Employee.TerminateEmployee](./terminate-employee.md)         | Termination form                                     |
| [Employee.TerminationSummary](./termination-summary.md)       | Termination confirmation and offboarding checklist   |
| [Employee.Taxes](./taxes.md)                                  | Combined federal and state taxes (legacy)            |
