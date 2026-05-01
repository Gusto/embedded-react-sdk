---
title: Company.DocumentList
sidebar_position: 17
---

Displays the list of company forms available for signing. This is the lower-level building block used internally by `Company.DocumentSigner` for the document list view. Use this component directly when you need full control over the document signing workflow.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.DocumentList
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name          | Type                                          | Required | Description                                                                                     |
| ------------- | --------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `companyId`   | `string`                                      | Yes      | The associated company identifier.                                                              |
| `signatoryId` | `string`                                      | No       | The signatory identifier. When provided, filters the document list to forms for this signatory. |
| `onEvent`     | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                                                       |

## Events

| Event                       | Description                                                      | Data                                                                                                            |
| --------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `COMPANY_VIEW_FORM_TO_SIGN` | Fired when a user selects a form to sign from the document list. | [Response from the get company form API](https://docs.gusto.com/embedded-payroll/reference/get-v1-company-form) |
