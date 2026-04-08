---
title: Company.PaySchedule
sidebar_position: 9
---

Manages company pay schedules including creating, editing, and viewing pay schedules with preview functionality.

## Usage

```tsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.PaySchedule
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
| `defaultValues` | `{ frequency?: string, anchorPayDate?: string, anchorEndOfPayPeriod?: string, day1?: number, day2?: number, customName?: string }` | No | Default values for the pay schedule form fields. `frequency` accepts `'Every Week'`, `'Every other week'`, `'Twice per month'`, or `'Monthly'`. If company data for these fields is available via the API, `defaultValues` will be overwritten. |
| `onEvent` | `(eventType: string, data?: unknown) => void` | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `PAY_SCHEDULE_CREATED` | Fired when a new pay schedule is successfully created. | [Response from the create pay schedule API](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-pay_schedules) |
| `PAY_SCHEDULE_UPDATED` | Fired when an existing pay schedule is successfully updated. | [Response from the update pay schedule API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-pay_schedules-pay_schedule_id) |
