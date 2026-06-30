---
title: Workflows Overview
description: Index of every pre-built workflow in the SDK — onboarding, payroll, contractors, time off, and more — each rendering a multi-step experience as one component.
order: 4
---

## Introduction to Workflows

Workflows are pre-built UI experiences you can use to quickly and easily incorporate essential payroll functionality into your build, such as onboarding an employee or running payroll.

### Available Workflows

| Workflow                                                                                       | Description                                                                |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Company Onboarding](../reference/company/onboarding/onboarding-flow.md)                       | Guided flow to onboard a company to Gusto.                                 |
| [Information Requests](../reference/company/information-requests/information-requests-flow.md) | Hub for responding to outstanding requests from Gusto.                     |
| [Employee Onboarding](../reference/employee/onboarding/onboarding-flow.md)                     | Guided flow to onboard multiple employees, one at a time.                  |
| [Employee Self-Onboarding](../reference/employee/onboarding/self-onboarding-flow.md)           | Guided flow for employee self-onboarding.                                  |
| [Employee Dashboard](../reference/employee/management/dashboard-flow.md)                       | Hub for viewing and managing an employee's details.                        |
| [Employee List](../reference/employee/management/employee-list-flow.md)                        | Hub for viewing and managing all employees, including onboarding new ones. |
| [Employee Termination](../reference/employee/management/termination-flow.md)                   | Guided flow to terminate an employee.                                      |
| [Contractor Onboarding](../reference/contractor/onboarding/onboarding-flow.md)                 | Guided flow to onboard a contractor.                                       |
| [Contractor Payments](../reference/contractor/management/payment-flow.md)                      | Hub for managing contractor payments.                                      |
| [Payroll Processing](../reference/payroll/payroll-flow.md)                                     | Hub for running and managing payroll.                                      |
| [Payroll Execution](../reference/payroll/payroll-execution-flow.md)                            | Guided flow for a single payroll run.                                      |
| [Off-Cycle Payroll](../reference/payroll/off-cycle-flow.md)                                    | Guided flow for off-cycle payroll.                                         |
| [Dismissal Payroll](../reference/payroll/dismissal-flow.md)                                    | Guided flow for dismissal payroll.                                         |
| [Transition Payroll](../reference/payroll/transition-flow.md)                                  | Guided flow for transition payroll.                                        |
| [Time Off](../reference/time-off/time-off-flow.md)                                             | Hub for managing time off policies and schedules.                          |

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
