---
title: Workflow
description: Drop-in CompanyOnboarding.OnboardingFlow component that renders the entire company onboarding experience.
order: 1
---

# Company Onboarding workflow

The Company Onboarding workflow renders the entire onboarding experience as a single component. Drop it into your app and it walks the user through every required step.

---

## Implementation

```jsx title="App.tsx"
import { CompanyOnboarding } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <CompanyOnboarding.OnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type   | Description                                                     |
| ------------------ | ------ | --------------------------------------------------------------- |
| companyId Required | string | The associated company identifier.                              |
| defaultValues      | object | Default values for individual flow step components              |
| onEvent Required   |        | See events table for each subcomponent to see available events. |
