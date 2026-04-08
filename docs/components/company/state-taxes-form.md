---
title: Company.StateTaxesForm
sidebar_position: 13
---

Standalone form for editing state tax requirements for a specific state. This is the lower-level building block used internally by `Company.StateTaxes` for its edit view. Use this component directly when you need full control over navigation between the list and form views.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.StateTaxesForm
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      state="CA"
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
| `state` | `string` | Yes | The state abbreviation to edit tax requirements for (e.g. `"CA"`, `"NY"`). |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `COMPANY_STATE_TAX_UPDATED` | Fired when a state tax setup has been successfully submitted. | [Response from the update state tax requirements API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_uuid-tax_requirements-state) |
| `CANCEL` | Fired when the user cancels editing. | None |
