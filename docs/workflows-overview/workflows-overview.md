---
title: Workflows Overview
---

## Introduction to Workflows

Workflows are pre-built UI experiences you can use to quickly and easily incorporate essential payroll functionality into your build, such as onboarding an employee or running payroll.

### Available Workflows

- Employee Onboarding
- Employee Self Onboarding

### Why should I use a Workflow?

Workflows are incredibly simple to add to your application. A single React component placed in your app can encapsulate an entire complex multi step user experience.

### How to use Workflows

In this example we incorporate the entire employee onboarding flow in our application. This component represents multiple steps including inputting profile details, taxes, and payment info. It can be implemented as follows:

```jsx
import { EmployeeOnboardingFlow } from '@gusto/embedded-react-sdk';

function MyApp({ companyId }) {
  return(
    <GustoProvider
      config={{
        baseUrl: `/myapp/`,
      }}
    >
      <EmployeeOnboardingFlow companyId={companyId} onEvent={() => {...}} />
    </GustoProvider>
  );
}

```

This example renders a fully functional flow with the following steps:

![](https://files.readme.io/ef7be0a7bb31a99a6b2ac03f1fcb8fe85d6e0301b90aa8ced632e465d0b3dc99-image.png)

As can be seen, using workflow components can allow for implementing complex flows in a simple way.

The following documents in this section will provide more detailed usage examples and implementation guidelines for each flow.
