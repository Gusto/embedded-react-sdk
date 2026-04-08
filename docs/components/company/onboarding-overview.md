---
title: Company.OnboardingOverview
sidebar_position: 15
---

Displays a summary of the company's onboarding progress and any outstanding requirements that need to be completed before payroll can be run.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.OnboardingOverview
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `companyId` | `string` | Yes | The associated company identifier. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `COMPANY_OVERVIEW_CONTINUE` | Fired when the user chooses to continue with a specific onboarding step. | None |
| `COMPANY_OVERVIEW_DONE` | Fired when all onboarding requirements are complete. | None |
