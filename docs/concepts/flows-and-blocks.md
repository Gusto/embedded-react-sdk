---
title: Flows and Blocks
sidebar_position: 1
---

The Gusto Embedded React SDK organizes its components into two levels of abstraction: **Flows** and **Blocks**.

## Flows (Workflows)

Flows are pre-built, multi-step components that handle an entire user journey. They manage internal navigation, data loading, form validation, and API calls across all steps. Rendering a single Flow component gives you a complete experience with minimal setup.

### Available Flows

| Flow                                          | Description                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `Company.OnboardingFlow`                      | Company setup: locations, tax info, bank account, signatory, pay schedule |
| `Employee.OnboardingFlow`                     | Admin-driven employee onboarding: profile, taxes, payment, documents      |
| `Employee.SelfOnboardingFlow`                 | Employee-facing self-service onboarding                                   |
| `Employee.TerminationFlow`                    | Employee termination and final pay                                        |
| `Contractor.OnboardingFlow`                   | Contractor profile and payment setup                                      |
| `Contractor.PaymentFlow`                      | Create and manage contractor payments                                     |
| `Payroll.PayrollFlow`                         | Full payroll run: configure, edit, review, submit                         |
| `Payroll.PayrollExecutionFlow`                | Payroll execution from an existing payroll                                |
| `Payroll.OffCycleFlow`                        | Off-cycle payroll creation and execution                                  |
| `Payroll.DismissalFlow`                       | Dismissal payroll processing                                              |
| `Payroll.TransitionFlow`                      | Payroll transition between providers                                      |
| `InformationRequests.InformationRequestsFlow` | Respond to information requests from Gusto                                |

### Using a Flow

```tsx
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ companyId }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Employee.OnboardingFlow
        companyId={companyId}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
```

## Blocks (Building Blocks)

Blocks are individual step-level components. Each Block handles one piece of a workflow — a single form, a single view, or a single action. Blocks can be used standalone or composed together into a custom flow.

Examples of Blocks include:

- `Employee.Profile` — employee personal details form
- `Employee.Compensation` — job and compensation setup
- `Employee.PaymentMethod` — direct deposit configuration
- `Company.BankAccount` — company bank account verification
- `Company.Locations` — manage company work locations
- `Payroll.PayrollOverview` — payroll review and submission

Each Block is independent: it loads its own data, validates its own forms, and saves through the API when the user submits.

### Using a Block

```tsx
import { Employee, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'

function App({ companyId, employeeId }) {
  return (
    <GustoProvider config={{ baseUrl: '/api/gusto/' }}>
      <Employee.Compensation
        employeeId={employeeId}
        startDate="2025-01-15"
        onEvent={(eventType, data) => {
          if (eventType === 'employee/compensations/done') {
            // Navigate to next step
          }
        }}
      />
    </GustoProvider>
  )
}
```

## When to use each

**Use a Flow when:**

- You want the full experience with minimal code
- The default step order and navigation work for your use case
- You want to ship quickly and iterate later

**Use Blocks when:**

- You need to reorder, skip, or add steps
- You want to embed individual steps within your existing page layouts
- You need to integrate with your own routing (React Router, Next.js, etc.)
- You want to mix SDK components with your own custom UI between steps

See [Composition](./composition.md) for details on building custom flows from Blocks.
