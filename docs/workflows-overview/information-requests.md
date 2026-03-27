---
title: Information Requests
order: 5
---

## Overview

The Information Requests workflow provides components for viewing and responding to information requests from Gusto. Information requests are questions that Gusto needs answered in order to process payroll or complete other operations. They may block payroll processing until resolved.

### Implementation

```jsx
import { InformationRequests } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <InformationRequests.InformationRequestsFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type     | Default | Description                                                                                                               |
| ------------------------ | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| **companyId** (Required) | string   |         | The associated company identifier.                                                                                        |
| **onEvent**              | function |         | Event handler for information request events.                                                                             |
| **withAlert**            | boolean  | true    | When true, displays a success alert at the top of the component after a request is submitted. Set to false when embedding in a parent that renders alerts elsewhere. |

#### Events

| Event type                       | Description                                              | Data                               |
| -------------------------------- | -------------------------------------------------------- | ---------------------------------- |
| INFORMATION_REQUEST_RESPOND      | Fired when user clicks to respond to a request           | { requestId: string }              |
| INFORMATION_REQUEST_FORM_DONE    | Fired when a request is successfully submitted           | The updated information request    |
| INFORMATION_REQUEST_FORM_CANCEL  | Fired when user cancels the response form                | None                               |

## Using Information Request Subcomponents

Information request components can be used individually or composed into a custom workflow. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- InformationRequests.InformationRequestList
- InformationRequests.InformationRequestForm

### InformationRequests.InformationRequestList

Displays a list of pending information requests for a company. Each request shows its type, status, and whether it is blocking payroll. Requests in a "Pending Response" state have a "Respond" action.

```jsx
import { InformationRequests } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <InformationRequests.InformationRequestList
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type     | Description                                    |
| ------------------------ | -------- | ---------------------------------------------- |
| **companyId** (Required) | string   | The associated company identifier.             |
| **onEvent** (Required)   | function | See events table for available events.         |

#### Events

| Event type                  | Description                                    | Data                  |
| --------------------------- | ---------------------------------------------- | --------------------- |
| INFORMATION_REQUEST_RESPOND | Fired when user clicks to respond to a request | { requestId: string } |

### InformationRequests.InformationRequestForm

Renders a form for responding to a specific information request. Supports text and document question types. Displays an alert if the request is blocking payroll processing.

```jsx
import { InformationRequests } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <InformationRequests.InformationRequestForm
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      requestId="request-uuid"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type     | Description                                       |
| ------------------------ | -------- | ------------------------------------------------- |
| **companyId** (Required) | string   | The associated company identifier.                |
| **requestId** (Required) | string   | The information request identifier to respond to. |
| **onEvent** (Required)   | function | See events table for available events.            |

#### Events

| Event type                      | Description                                    | Data                            |
| ------------------------------- | ---------------------------------------------- | ------------------------------- |
| INFORMATION_REQUEST_FORM_DONE   | Fired when the request is successfully submitted | The updated information request |
| INFORMATION_REQUEST_FORM_CANCEL | Fired when user cancels the response form       | None                            |
