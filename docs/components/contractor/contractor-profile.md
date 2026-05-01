---
title: Contractor.ContractorProfile
sidebar_position: 5
---

Form for creating or editing a contractor profile. Supports both individual and business contractor types with appropriate fields for each.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.ContractorProfile
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                          | Required | Description                                                                 |
| --------------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| `companyId`     | `string`                                      | Yes      | The associated company identifier.                                          |
| `contractorId`  | `string`                                      | No       | ID of an existing contractor to edit. When omitted, renders in create mode. |
| `defaultValues` | `object`                                      | No       | Default values for the profile form fields.                                 |
| `onEvent`       | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                                   |

## Events

| Event                     | Description                                                | Data |
| ------------------------- | ---------------------------------------------------------- | ---- |
| `CONTRACTOR_CREATED`      | Fired when a new contractor is successfully created.       | None |
| `CONTRACTOR_UPDATED`      | Fired when an existing contractor is successfully updated. | None |
| `CONTRACTOR_PROFILE_DONE` | Fired when the profile step is complete.                   | None |
