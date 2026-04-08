---
title: Company.StateTaxesList
sidebar_position: 14
---

Displays the list of state tax requirements for a company. This is the lower-level building block used internally by `Company.StateTaxes` for its list view. Use this component directly when you need full control over navigation between the list and form views.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.StateTaxesList
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
| `COMPANY_STATE_TAX_EDIT` | Fired when a user chooses to edit requirements for a specific state. | `{ state: string }` |
| `COMPANY_STATE_TAX_DONE` | Fired when the user chooses to proceed to the next step. | None |
