---
title: Workflows overview
description: Index of every pre-built workflow in the SDK—onboarding, payroll, contractors, time off, and more—each rendering a multi-step experience as one component.
order: 4
---

## Introduction to workflows

Workflows are pre-built UI experiences you can use to quickly and easily incorporate essential payroll functionality into your build, such as onboarding an employee or running payroll.

### Available workflows

| Workflow                                                                                       | Description                                                                |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [Company onboarding](../reference/company/onboarding/onboarding-flow.md)                       | Guided flow to onboard a company to Gusto.                                 |
| [Information requests](../reference/company/information-requests/information-requests-flow.md) | Hub for responding to outstanding requests from Gusto.                     |
| [Employee onboarding](../reference/employee/onboarding/onboarding-flow.md)                     | Guided flow to onboard multiple employees, one at a time.                  |
| [Employee self-onboarding](../reference/employee/onboarding/self-onboarding-flow.md)           | Guided flow for employee self-onboarding.                                  |
| [Employee dashboard](../reference/employee/management/dashboard-flow.md)                       | Hub for viewing and managing an employee's details.                        |
| [Employee list](../reference/employee/management/employee-list-flow.md)                        | Hub for viewing and managing all employees, including onboarding new ones. |
| [Employee termination](../reference/employee/management/termination-flow.md)                   | Guided flow to terminate an employee.                                      |
| [Contractor onboarding](../reference/contractor/onboarding/onboarding-flow.md)                 | Guided flow to onboard a contractor.                                       |
| [Contractor payments](../reference/contractor/management/payment-flow.md)                      | Hub for managing contractor payments.                                      |
| [Payroll processing](../reference/payroll/payroll-flow.md)                                     | Hub for running and managing payroll.                                      |
| [Payroll execution](../reference/payroll/payroll-execution-flow.md)                            | Guided flow for a single payroll run.                                      |
| [Off-cycle payroll](../reference/payroll/off-cycle-flow.md)                                    | Guided flow for off-cycle payroll.                                         |
| [Dismissal payroll](../reference/payroll/dismissal-flow.md)                                    | Guided flow for dismissal payroll.                                         |
| [Transition payroll](../reference/payroll/transition-flow.md)                                  | Guided flow for transition payroll.                                        |
| [Time off](../reference/time-off/time-off-flow.md)                                             | Hub for managing time off policies and schedules.                          |

### Why should I use a workflow?

Workflows are simple to add to your application. A single React component placed in your app can encapsulate an entire complex multi-step user experience.

### How to use workflows

In this example, we incorporate the entire employee onboarding flow in our application. This component represents multiple steps, including inputting profile details, taxes, and payment info. You can implement it as follows:

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

As you can see, workflow components let you implement complex flows in a simple way.

For detailed usage, props, events, and block references for each workflow, follow the links in the table above.
