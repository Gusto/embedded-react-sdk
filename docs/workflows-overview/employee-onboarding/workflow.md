---
title: Workflow
description: Drop-in EmployeeOnboarding.OnboardingFlow component that renders the entire admin-driven employee onboarding experience.
order: 1
---

# Employee Onboarding workflow

The Employee Onboarding workflow renders the full admin-driven onboarding experience as a single component. Drop it into your app and it walks the admin through every step required to add an employee to payroll.

---

## Implementation

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <EmployeeOnboarding.OnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      withEmployeeI9
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                    | Type    | Default | Description                                                                                                                                                          |
| ----------------------- | ------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId              | string  |         | The associated employee identifier.                                                                                                                                  |
| companyId Required      | string  |         | The associated company identifier.                                                                                                                                   |
| defaultValues           | object  |         | Default values for individual flow step components                                                                                                                   |
| onEvent Required        |         |         | See events table for each subcomponent to see available events.                                                                                                      |
| isSelfOnboardingEnabled | boolean | true    | When true, presents the self-onboarding toggle allowing the admin to opt the employee into self-onboarding. When false, the option to self-onboard is not available. |
| withEmployeeI9          | boolean | false   | When true, enables the Employee Documents step in the onboarding flow, allowing the admin to configure I-9 document requirements.                                    |
