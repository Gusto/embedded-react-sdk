---
title: Employee.Compensation
sidebar_position: 7
---

## Description

Collects compensation details for an employee including job title, FLSA status (exempt/nonexempt), pay rate, and payment unit (hourly, salary, etc.). For hourly employees, the component supports configuring multiple roles with different pay rates.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle compensation events
  }

  return (
    <Employee.Compensation
      employeeId={employeeId}
      startDate="2025-01-15"
      onEvent={handleEvent}
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **employeeId** | `string` | | Yes | The associated employee identifier. |
| **startDate** | `string` | | Yes | The date the employee will start work. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |
| **defaultValues** | `object` | | No | Default values for the compensation form. If employee data is available via the API, these values are overwritten. |

### defaultValues shape

```typescript
{
  title?: string
  rate?: string
  paymentUnit?: string
  flsaStatus?: 'Exempt' | 'Nonexempt' | 'Salaried Nonexempt' | 'Commission Only Exempt' | 'Commission Only Nonexempt' | 'Owner'
}
```

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_JOB_CREATED` | Fired after compensation form is submitted if the job is new | Response from the Create a job endpoint |
| `EMPLOYEE_JOB_UPDATED` | Fired after compensation form is submitted if editing an existing job | Response from the Update a job endpoint |
| `EMPLOYEE_JOB_DELETED` | Fired after successfully deleting a job | Response from the Delete a job endpoint |
| `EMPLOYEE_COMPENSATION_UPDATED` | Fired after updating compensation details | Response from the Update a compensation endpoint |
| `EMPLOYEE_COMPENSATION_DONE` | Fired when compensation setup is complete and ready to advance | None |
