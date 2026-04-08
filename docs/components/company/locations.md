---
title: Company.Locations
sidebar_position: 10
---

Manages company addresses including mailing and filing locations. Provides a list view of existing locations with the ability to add new locations and edit existing ones.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.Locations
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
| `defaultValues` | `object` | No | Default values for location form fields. **Note:** This prop is accepted by the type definition but is not currently forwarded by the Locations orchestrator component. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `COMPANY_LOCATION_CREATE` | Fired when a user chooses to add a new location. | None |
| `COMPANY_LOCATION_CREATED` | Fired when a new location is created. | [Response from the create company location API](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-locations) |
| `COMPANY_LOCATION_EDIT` | Fired when a user selects an existing location for editing. | `{ uuid: string }` |
| `COMPANY_LOCATION_UPDATED` | Fired when a location has been successfully edited. | [Response from the update location API](https://docs.gusto.com/embedded-payroll/reference/put-v1-locations-location_id) |
| `COMPANY_LOCATION_DONE` | Fired when the user chooses to proceed to the next step. | None |
