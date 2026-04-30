---
title: InformationRequests.InformationRequestForm
sidebar_position: 4
---

Form for responding to a specific information request. Displays the request details and provides input fields for the user to submit their response.

## Usage

```tsx
import { InformationRequests } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <InformationRequests.InformationRequestForm
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      requestId="req-123e456-7890-1234-abcd-ef5678901234"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name        | Type                                          | Required | Description                               |
| ----------- | --------------------------------------------- | -------- | ----------------------------------------- |
| `companyId` | `string`                                      | Yes      | The associated company identifier.        |
| `requestId` | `string`                                      | Yes      | The information request identifier.       |
| `onEvent`   | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |

## Events

| Event                             | Description                                                | Data |
| --------------------------------- | ---------------------------------------------------------- | ---- |
| `INFORMATION_REQUEST_FORM_DONE`   | Fired when the request response is successfully submitted. | None |
| `INFORMATION_REQUEST_FORM_CANCEL` | Fired when the user cancels responding to the request.     | None |
