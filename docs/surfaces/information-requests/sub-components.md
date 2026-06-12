---
title: Sub-components
description: Standalone sub-components for information requests — render the list or response form individually.
order: 2
---

# Information Requests sub-components

Information requests components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../../integration-guide/composition.md).

---

## Information requests list

Displays a list of information requests for a company, including status badges (Open / Submitted) and a "Respond" CTA for open requests. Used as the top-level surface of `InformationRequests.InformationRequestsFlow`, but can be rendered directly when you want to host the response form yourself (e.g. in a custom modal or page).

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

| Name                     | Type     | Description                               |
| ------------------------ | -------- | ----------------------------------------- |
| **companyId** (Required) | string   | The associated company identifier.        |
| **onEvent** (Required)   | function | See events table for available events.    |
| dictionary               | object   | Optional translations for component text. |

#### Events

| Event type                  | Description                                             | Data                  |
| --------------------------- | ------------------------------------------------------- | --------------------- |
| INFORMATION_REQUEST_RESPOND | Fired when the user clicks "Respond" on an open request | { requestId: string } |

---

## Information request form

The dynamic response form for a single information request. Renders supported question types (text and document upload) based on the request's `requiredQuestions` payload from the API and submits responses via the [Submit information request endpoint](https://docs.gusto.com/embedded-payroll/reference/post-information-requests-submit). Use this component directly when you have built your own list/routing surface and need to host the form (typically inside a modal or page you control).

```jsx
import { InformationRequests } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <InformationRequests.InformationRequestForm
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      requestId="information-request-uuid"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type     | Description                                              |
| ------------------------ | -------- | -------------------------------------------------------- |
| **companyId** (Required) | string   | The associated company identifier.                       |
| **requestId** (Required) | string   | The identifier of the information request to respond to. |
| **onEvent** (Required)   | function | See events table for available events.                   |
| dictionary               | object   | Optional translations for component text.                |

#### Events

| Event type                      | Description                                   | Data                                                  |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| INFORMATION_REQUEST_FORM_DONE   | Fired when the form is successfully submitted | Response from the Submit information request endpoint |
| INFORMATION_REQUEST_FORM_CANCEL | Fired when the user cancels the form          | None                                                  |

#### Supported Response Types

The form currently renders inputs for the following `responseType` values:

- **`text`** — single-line text input (max 5,000 characters)
- **`document`** — file upload restricted to JPEG, PNG, or PDF

Requests with unsupported response types (e.g. `persona`-driven identity verification) display a guidance message instead of the form. In those cases the user must complete the request through the partner's own integration with the underlying provider.

## API Reference

The information requests workflow uses these API endpoints:

- **List information requests**: `GET /v1/companies/{company_uuid}/information_requests`
- **Submit an information request**: `POST /v1/information_requests/{information_request_uuid}/submit`
