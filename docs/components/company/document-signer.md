---
title: Company.DocumentSigner
sidebar_position: 6
---

Provides an interface for company representatives to read and sign required company documents. This orchestrated component handles document listing, signatory management, and the document signing workflow. For more granular control, use `Company.DocumentList` or `Company.SignatureForm` directly.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.DocumentSigner
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
| `signatoryId` | `string` | No | ID of the signatory. When set and matching the current signatory, the signature form pre-populates with their information and they can sign documents. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `COMPANY_VIEW_FORM_TO_SIGN` | Fired when a user selects a form to sign from the document list. | [Response from the get company form API](https://docs.gusto.com/embedded-payroll/reference/get-v1-company-form) |
| `COMPANY_FORM_EDIT_SIGNATORY` | Fired when user requests to change the document signatory. | [Response from the create signatory API](https://docs.gusto.com/embedded-payroll/reference/post-v1-company-signatories) |
| `COMPANY_FORMS_DONE` | Fired when user completes the document signing process. | None |
| `COMPANY_SIGN_FORM` | Fired when a form is successfully signed. | [Response from the sign company form API](https://docs.gusto.com/embedded-payroll/reference/put-v1-company-form-sign) |
| `COMPANY_SIGN_FORM_DONE` | Fired when the form signing process is complete. | None |
| `COMPANY_SIGN_FORM_BACK` | Fired when user navigates back from the signature form. | None |
| `COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED` | Fired when the signatory assignment mode changes. | Mode string (`'create_signatory'` or `'invite_signatory'`) |
| `COMPANY_ASSIGN_SIGNATORY_DONE` | Fired when the signatory assignment process is complete. | None |
| `COMPANY_SIGNATORY_CREATED` | Fired when a new signatory is created successfully. | [Response from the create signatory API](https://docs.gusto.com/embedded-payroll/reference/post-v1-company-signatories) |
| `COMPANY_SIGNATORY_UPDATED` | Fired when an existing signatory is updated successfully. | [Response from the update signatory API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_uuid-signatories-signatory_uuid) |
| `COMPANY_SIGNATORY_INVITED` | Fired when a signatory is successfully invited to the company. | [Response from the invite signatory API](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_uuid-signatories-invite) |
