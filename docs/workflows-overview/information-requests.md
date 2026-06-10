---
title: Information Requests
order: 8
---

The Information Requests workflow surfaces outstanding information requests that Gusto has issued for a company (for example, a request for a missing tax document or identity verification artifact) and lets the user respond to them. Information requests can also block payroll processing, in which case they are surfaced inline within `Payroll.PayrollBlockerList`; this flow provides a dedicated, standalone surface for managing them.

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

| Name               | Type     | Default | Description                                                                                                                                                                               |
| ------------------ | -------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| companyId Required | string   |         | The associated company identifier.                                                                                                                                                        |
| onEvent            | function |         | See events table for each subcomponent to see available events.                                                                                                                           |
| withAlert          | boolean  | `true`  | When true, the submission success alert is rendered at the top of the flow. Set to false when embedding in a parent (e.g. `Payroll.PayrollBlockerList`) that renders the alert elsewhere. |
| dictionary         | object   |         | Optional translations for component text.                                                                                                                                                 |

#### Events

Events emitted by the flow (and by its subcomponents — they bubble up through `onEvent`):

| Event type                      | Description                                                                         | Data                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| INFORMATION_REQUEST_RESPOND     | Fired when the user clicks "Respond" on a request and the form modal opens          | { requestId: string }                                 |
| INFORMATION_REQUEST_FORM_DONE   | Fired when an information request is successfully submitted                         | Response from the Submit information request endpoint |
| INFORMATION_REQUEST_FORM_CANCEL | Fired when the user cancels the response form (closes the modal without submitting) | None                                                  |

## Workflow Steps

1. **List**: The user sees all open and submitted information requests for the company, with status badges and a "Respond" CTA on each open request.
2. **Respond**: Selecting "Respond" opens a modal with a dynamically rendered form built from the request's required questions (text, document upload). Persona-style questions and other unsupported response types fall back to a guidance message rather than rendering the form.
3. **Submit**: On successful submit, a dismissible success alert appears at the top of the list (when `withAlert` is true) and the modal closes.

## Using Information Requests Subcomponents

Information requests components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- [InformationRequests.InformationRequestList](#informationrequestsinformationrequestlist)
- [InformationRequests.InformationRequestForm](#informationrequestsinformationrequestform)

### InformationRequests.InformationRequestList

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

### InformationRequests.InformationRequestForm

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

## Integration with Payroll Blockers

Information requests can also block payroll processing. When that happens they are surfaced inside [`Payroll.PayrollBlockerList`](./run-payroll.md#payrollpayrollblockerlist), which embeds `InformationRequests.InformationRequestsFlow` with `withAlert={false}` so the blocker list owns the success alert UX. If you build your own blocker resolution surface, you can use the same pattern.

## API Reference

The information requests workflow uses these API endpoints:

- **List information requests**: `GET /v1/companies/{company_uuid}/information_requests`
- **Submit an information request**: `POST /v1/information_requests/{information_request_uuid}/submit`
