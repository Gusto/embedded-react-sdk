---
title: Company.InviteSignatory
sidebar_position: 5
---

Standalone form for inviting someone else to become the company signatory. The invited person receives an email to complete their signatory information. Use this component when you want to provide only the invite flow without the create option.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.InviteSignatory
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                          | Required | Description                                                                                |
| --------------- | --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `companyId`     | `string`                                      | Yes      | The associated company identifier.                                                         |
| `defaultValues` | `object`                                      | No       | Default values for form fields: `firstName`, `lastName`, `email`, `confirmEmail`, `title`. |
| `onEvent`       | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                                                  |

## Events

| Event                           | Description                                                    | Data                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPANY_SIGNATORY_INVITED`     | Fired when a signatory is successfully invited to the company. | [Response from the invite signatory API](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_uuid-signatories-invite) |
| `COMPANY_INVITE_SIGNATORY_DONE` | Fired when the invite signatory process is complete.           | None                                                                                                                                          |
