---
title: Company.CreateSignatory
sidebar_position: 4
---

Standalone form for creating a new signatory with full personal details including name, contact information, SSN, and home address. Use this component when you want to provide only the create signatory flow without the invite option.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.CreateSignatory
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                          | Required | Description                                                                                                                                                                                                                           |
| --------------- | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `companyId`     | `string`                                      | Yes      | The associated company identifier.                                                                                                                                                                                                    |
| `signatoryId`   | `string`                                      | No       | ID of the signatory. When set and matching an existing signatory, the form pre-populates with their information for editing.                                                                                                          |
| `defaultValues` | `object`                                      | No       | Default values for form fields: `firstName`, `lastName`, `email`, `title`, `phone`, `birthday`, `ssn`, `street1`, `street2`, `city`, `state`, `zip`. If signatory data is available via the API, `defaultValues` will be overwritten. |
| `onEvent`       | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                                                                                                                                                                                             |

## Events

| Event                           | Description                                               | Data                                                                                                                                                 |
| ------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPANY_SIGNATORY_CREATED`     | Fired when a new signatory is created successfully.       | [Response from the create signatory API](https://docs.gusto.com/embedded-payroll/reference/post-v1-company-signatories)                              |
| `COMPANY_SIGNATORY_UPDATED`     | Fired when an existing signatory is updated successfully. | [Response from the update signatory API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_uuid-signatories-signatory_uuid) |
| `COMPANY_CREATE_SIGNATORY_DONE` | Fired when the create signatory process is complete.      | None                                                                                                                                                 |
