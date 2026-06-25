---
title: Workflows Overview
description: Index of every pre-built workflow in the SDK — onboarding, payroll, contractors, time off, and more — each rendering a multi-step experience as one component.
order: 4
---

## Introduction to Workflows

Workflows are pre-built UI experiences you can use to quickly and easily incorporate essential payroll functionality into your build, such as onboarding an employee or running payroll.

### Available Workflows

| Workflow                                                                                       | Description                                                             |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [Company Onboarding](../reference/company/onboarding/onboarding-flow.md)                       | Guide a company through the full onboarding sequence.                   |
| [Information Requests](../reference/company/information-requests/information-requests-flow.md) | Surface and respond to documents and inputs Gusto needs from employers. |
| [Employee Onboarding](../reference/employee/onboarding/onboarding-flow.md)                     | Add employees and complete their profile, tax, and payment setup.       |
| [Employee Self-Onboarding](../reference/employee/onboarding/self-onboarding-flow.md)           | Invite employees to complete their own taxes and payment method.        |
| [Employee Dashboard](../reference/employee/management/dashboard-flow.md)                       | View and manage an employee's details, compensation, and documents.     |
| [Employee List](../reference/employee/management/employee-list-flow.md)                        | Browse the employee roster and navigate to individual employee flows.   |
| [Employee Termination](../reference/employee/management/termination-flow.md)                   | Run dismissal payroll and complete the offboarding sequence.            |
| [Contractor Onboarding](../reference/contractor/onboarding/onboarding-flow.md)                 | Onboard a contractor with profile, tax, and payment details.            |
| [Contractor Payments](../reference/contractor/management/payment-flow.md)                      | Create and manage contractor payment groups.                            |
| [Payroll Processing](../reference/payroll/payroll-flow.md)                                     | Run regular payroll end-to-end.                                         |
| [Payroll Execution](../reference/payroll/payroll-execution-flow.md)                            | Run the payroll-execution steps as a standalone sub-flow.               |
| [Off-Cycle Payroll](../reference/payroll/off-cycle-flow.md)                                    | Run a bonus or correction payroll outside the normal schedule.          |
| [Dismissal Payroll](../reference/payroll/dismissal-flow.md)                                    | Run a final payroll for a terminated employee.                          |
| [Transition Payroll](../reference/payroll/transition-flow.md)                                  | Run a payroll that transitions an employee between pay schedules.       |
| [Time Off](../reference/time-off/time-off-flow.md)                                             | Manage time off policies, holiday schedules, and employee assignments.  |

### Why should I use a Workflow?

Workflows are incredibly simple to add to your application. A single React component placed in your app can encapsulate an entire complex multi step user experience.

### How to use Workflows

In this example we incorporate the entire employee onboarding flow in our application. This component represents multiple steps including inputting profile details, taxes, and payment info. It can be implemented as follows:

```jsx
import { EmployeeOnboarding, GustoProvider } from '@gusto/embedded-react-sdk'

function MyApp({ companyId }) {
  return (
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <EmployeeOnboarding.OnboardingFlow companyId={companyId} onEvent={() => {...}} />
    </GustoProvider>
  )
}
```

This example renders a fully functional flow with the following steps:

![Fully functional flow rendered with default workflow steps](https://files.readme.io/ef7be0a7bb31a99a6b2ac03f1fcb8fe85d6e0301b90aa8ced632e465d0b3dc99-image.png)

As can be seen, using workflow components can allow for implementing complex flows in a simple way.

For detailed usage, props, events, and sub-component references for each workflow, follow the links in the table above.
