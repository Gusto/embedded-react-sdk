---
title: Contractor.ContractorSubmit
sidebar_position: 9
---

Final submission step for contractor onboarding. Allows the user to review and submit the contractor's onboarding information, with an option to invite the contractor to self-onboard.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.ContractorSubmit
      contractorId="c123e456-7890-1234-abcd-ef5678901234"
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
| `contractorId` | `string` | Yes | The contractor identifier. |
| `selfOnboarding` | `boolean` | No | When `true`, indicates the contractor is completing their own onboarding. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `CONTRACTOR_ONBOARDING_STATUS_UPDATED` | Fired when the contractor's onboarding status is updated. | None |
| `CONTRACTOR_SUBMIT_DONE` | Fired when the submission step is complete. | None |
| `CONTRACTOR_INVITE_CONTRACTOR` | Fired when the user chooses to invite the contractor to self-onboard. | `{ contractorId: string }` |
