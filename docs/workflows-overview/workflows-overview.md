---
title: Workflows Overview
description: Index of every pre-built workflow in the SDK — onboarding, payroll, contractors, time off, and more — each rendering a multi-step experience as one component.
order: 4
---

## Introduction to Workflows

Workflows are pre-built UI experiences you can use to quickly and easily incorporate essential payroll functionality into your build, such as onboarding an employee or running payroll.

### Available Workflows

- Company Onboarding
- Employee Onboarding
- Employee Self Onboarding
- Payroll Processing
- Off-Cycle Payroll (Bonus & Correction)
- Dismissal Payroll
- Transition Payroll
- Contractor Onboarding
- Contractor Payments
- Employee Termination
- Time Off Policy Management
- Information Requests

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

The following documents in this section will provide more detailed usage examples and implementation guidelines for each flow.
