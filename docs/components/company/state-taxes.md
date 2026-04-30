---
title: Company.StateTaxes
sidebar_position: 12
---

Orchestrated component for managing company state taxes setup. Internally uses a state machine to switch between a list view and an edit form. For more granular control over navigation between views, use `Company.StateTaxesList` or `Company.StateTaxesForm` directly.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.StateTaxes
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={(eventType, data) => {
        console.log(eventType, data)
      }}
    />
  )
}
```

## Props

| Name        | Type                                          | Required | Description                               |
| ----------- | --------------------------------------------- | -------- | ----------------------------------------- |
| `companyId` | `string`                                      | Yes      | The associated company identifier.        |
| `onEvent`   | `(eventType: string, data?: unknown) => void` | Yes      | Callback invoked when events are emitted. |

## Events

| Event                       | Description                                                          | Data                                                                                                                                                          |
| --------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPANY_STATE_TAX_EDIT`    | Fired when a user chooses to edit requirements for a specific state. | `{ state: string }`                                                                                                                                           |
| `COMPANY_STATE_TAX_UPDATED` | Fired when a state tax setup has been successfully submitted.        | [Response from the update state tax requirements API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_uuid-tax_requirements-state) |
| `COMPANY_STATE_TAX_DONE`    | Fired when the user chooses to proceed to the next step.             | None                                                                                                                                                          |
