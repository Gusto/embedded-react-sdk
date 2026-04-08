---
title: Company.SignatureForm
sidebar_position: 16
---

Form for reviewing and signing an individual company document. This is the lower-level building block used internally by `Company.DocumentSigner` for the signing step. Use this component directly when you need full control over the document signing workflow.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.SignatureForm
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      formId="form-abc123"
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
| `formId` | `string` | Yes | The identifier of the form to sign. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `COMPANY_SIGN_FORM` | Fired when a form is successfully signed. | [Response from the sign company form API](https://docs.gusto.com/embedded-payroll/reference/put-v1-company-form-sign) |
| `COMPANY_SIGN_FORM_DONE` | Fired when the form signing process is complete. | None |
| `COMPANY_SIGN_FORM_BACK` | Fired when the user navigates back from the signature form. | None |
