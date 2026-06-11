---
title: Workflow
description: Drop-in EmployeeOnboarding.SelfOnboardingFlow component that renders the entire employee-driven self-onboarding experience.
order: 1
---

# Employee Self-Onboarding workflow

The Employee Self-Onboarding workflow renders the full employee-driven onboarding experience as a single component. Drop it into your app and the employee walks themselves through every required step.

---

## Implementation

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <EmployeeOnboarding.SelfOnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      withEmployeeI9
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type    | Default | Description                                                                                                                                       |
| ------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string  |         | The associated employee identifier.                                                                                                               |
| companyId Required  | string  |         | The associated company identifier.                                                                                                                |
| onEvent Required    |         |         | See events table for each subcomponent to see available events.                                                                                   |
| withEmployeeI9      | boolean | false   | When true, the Document Signer step checks if the employee has I-9 enabled and routes to the Employment Eligibility and I-9 signature form steps. |
