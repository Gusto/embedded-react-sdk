---
title: Workflow
description: Drop-in InformationRequests.InformationRequestsFlow component for viewing and responding to outstanding information requests.
order: 1
---

# Information Requests workflow

The Information Requests workflow renders the full list-and-respond experience as a single component. Drop it into your app and the user can view outstanding requests and submit responses without any additional wiring.

---

## Implementation

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

## Integration with Payroll Blockers

Information requests can also block payroll processing. When that happens they are surfaced inside [`Payroll.PayrollBlockerList`](../run-payroll/sub-components#blockers), which embeds `InformationRequests.InformationRequestsFlow` with `withAlert={false}` so the blocker list owns the success alert UX. If you build your own blocker resolution surface, you can use the same pattern.
