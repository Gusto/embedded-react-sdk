---
title: InformationRequests.InformationRequestList
sidebar_position: 3
---

Displays a list of information requests for a company, showing their status and allowing the user to select one to respond to.

## Usage

```tsx
import { InformationRequests } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <InformationRequests.InformationRequestList
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
| `INFORMATION_REQUEST_RESPOND` | Fired when the user selects a request to respond to. | None |
