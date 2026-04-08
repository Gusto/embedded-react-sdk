---
title: InformationRequests.InformationRequestsFlow
sidebar_position: 2
---

End-to-end workflow for viewing and responding to information requests. Orchestrates the list view and response form, with optional alert display for pending requests.

## Usage

```tsx
import { InformationRequests } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <InformationRequests.InformationRequestsFlow
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
| `onEvent` | `(eventType: string, data?: unknown) => void` | No | Callback invoked when events are emitted. Receives events from all subcomponents. |
| `withAlert` | `boolean` | No | Whether to display an alert banner for pending requests. Defaults to `true`. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `INFORMATION_REQUEST_RESPOND` | Fired when the user selects a request to respond to. | None |
| `INFORMATION_REQUEST_FORM_DONE` | Fired when a request response is successfully submitted. | None |
| `INFORMATION_REQUEST_FORM_CANCEL` | Fired when the user cancels responding to a request. | None |
