---
title: Contractor.NewHireReport
sidebar_position: 8
---

Handles new hire reporting requirements for a contractor. This step collects information needed to file a new hire report with the appropriate state agency.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.NewHireReport
      contractorId="c123e456-7890-1234-abcd-ef5678901234"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name             | Type                                          | Required | Description                                                               |
| ---------------- | --------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `contractorId`   | `string`                                      | Yes      | The contractor identifier.                                                |
| `selfOnboarding` | `boolean`                                     | No       | When `true`, indicates the contractor is completing their own onboarding. |
| `onEvent`        | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                                 |

## Events

| Event                                | Description                                            | Data |
| ------------------------------------ | ------------------------------------------------------ | ---- |
| `CONTRACTOR_NEW_HIRE_REPORT_UPDATED` | Fired when the new hire report information is updated. | None |
| `CONTRACTOR_NEW_HIRE_REPORT_DONE`    | Fired when the new hire report step is complete.       | None |
