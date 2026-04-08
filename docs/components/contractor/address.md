---
title: Contractor.Address
sidebar_position: 6
---

Form for entering or updating a contractor's mailing address.

## Usage

```tsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.Address
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
| `defaultValues` | `object` | No | Default values for address fields: `street1`, `street2`, `city`, `state`, `zip`. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `CONTRACTOR_ADDRESS_UPDATED` | Fired when the contractor's address is successfully updated. | None |
| `CONTRACTOR_ADDRESS_DONE` | Fired when the address step is complete. | None |
