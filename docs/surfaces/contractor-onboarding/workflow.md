---
title: Workflow
description: Drop-in ContractorOnboarding.OnboardingFlow component that renders the entire contractor onboarding experience.
order: 1
---

# Contractor Onboarding workflow

The Contractor Onboarding workflow renders the full onboarding experience as a single component. Drop it into your app and it walks the user through every step required to bring a contractor onto the company.

---

## Implementation

```jsx
import { ContractorOnboarding } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <ContractorOnboarding.OnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type   | Description                                                                                           |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------- |
| companyId Required | string | The associated company identifier.                                                                    |
| defaultValues      | object | Default values containing `profile` and/or `address` sub-objects for individual flow step components. |
| onEvent Required   |        | See events table for each subcomponent to see available events.                                       |

Events from subcomponents bubble up through the `onEvent` handler.
