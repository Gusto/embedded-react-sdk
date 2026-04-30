---
title: Company.AssignSignatory
sidebar_position: 3
---

Allows users to choose between creating a new signatory with full details or inviting someone else to become the signatory. For more granular control, use `Company.CreateSignatory` or `Company.InviteSignatory` directly.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.AssignSignatory
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name            | Type                                          | Required | Description                                                                                                                                                                                         |
| --------------- | --------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `companyId`     | `string`                                      | Yes      | The associated company identifier.                                                                                                                                                                  |
| `signatoryId`   | `string`                                      | No       | ID of the signatory. When set and matching the current signatory, the create form pre-populates with their information for editing.                                                                 |
| `defaultValues` | `object`                                      | No       | Default values containing `create` and/or `invite` objects for their respective forms. See [CreateSignatory](./create-signatory.md) and [InviteSignatory](./invite-signatory.md) for field details. |
| `onEvent`       | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted.                                                                                                                                                           |

## Events

| Event                                   | Description                                                   | Data                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED` | Fired when the user switches between create and invite modes. | Mode string (`'createSignatory'` or `'inviteSignatory'`)                                                                                             |
| `COMPANY_ASSIGN_SIGNATORY_DONE`         | Fired when the signatory assignment process is complete.      | None                                                                                                                                                 |
| `COMPANY_SIGNATORY_CREATED`             | Fired when a new signatory is created (create mode).          | [Response from the create signatory API](https://docs.gusto.com/embedded-payroll/reference/post-v1-company-signatories)                              |
| `COMPANY_SIGNATORY_UPDATED`             | Fired when an existing signatory is updated (create mode).    | [Response from the update signatory API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_uuid-signatories-signatory_uuid) |
| `COMPANY_SIGNATORY_INVITED`             | Fired when a signatory invitation is sent (invite mode).      | [Response from the invite signatory API](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_uuid-signatories-invite)        |
