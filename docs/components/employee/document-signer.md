---
title: Employee.DocumentSigner
sidebar_position: 13
---

## Description

Provides the employee with an interface to read and sign required employment documents. When `withEmployeeI9` is enabled and the employee has I-9 configured, the Document Signer first routes the employee through the Employment Eligibility step and then presents the I-9 form for signature alongside other required documents.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle document signing events
  }

  return (
    <Employee.DocumentSigner
      employeeId={employeeId}
      onEvent={handleEvent}
      withEmployeeI9
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **employeeId** | `string` | | Yes | The associated employee identifier. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |
| **withEmployeeI9** | `boolean` | `false` | No | When true, checks if the employee has I-9 enabled. If I-9 is needed, routes to Employment Eligibility first, then presents the I-9 form for signature. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE` | Fired when the employee completes the employment eligibility form | Response from the Create or update an employee's I-9 authorization endpoint |
| `EMPLOYEE_VIEW_FORM_TO_SIGN` | Fired when the sign form CTA is selected for a given form | Response from the Get employee form PDF endpoint, aggregated with `{ pdfUrl }` |
| `EMPLOYEE_SIGN_FORM` | Fired when the user submits the form to sign | Response from the Sign an employee form endpoint |
| `EMPLOYEE_FORMS_DONE` | Fired when the user is done signing forms and is ready to advance | None |
