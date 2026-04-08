---
title: Contractor.ContractorList
sidebar_position: 4
---

Displays a list of contractors for a company with options to create new contractors, edit existing ones, delete contractors, and continue onboarding.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.ContractorList
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
| `successMessage` | `string` | No | Optional success message to display at the top of the list. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `CONTRACTOR_CREATE` | Fired when the user initiates creating a new contractor. | None |
| `CONTRACTOR_UPDATE` | Fired when the user selects a contractor to edit. | `{ contractorId: string }` |
| `CONTRACTOR_DELETED` | Fired when a contractor is deleted. | `{ contractorId: string }` |
| `CONTRACTOR_ONBOARDING_CONTINUE` | Fired when the user continues onboarding for a contractor. | None |
