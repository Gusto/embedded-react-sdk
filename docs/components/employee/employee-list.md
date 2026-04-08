---
title: Employee.EmployeeList
sidebar_position: 5
---

## Description

Displays a list of employees with their full names and current onboarding status. Provides actions for adding new employees, editing existing employees, and removing employees from the list.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId }) {
  const handleEvent = (eventType, data) => {
    // Handle employee list events
  }

  return (
    <Employee.EmployeeList
      companyId={companyId}
      onEvent={handleEvent}
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **companyId** | `string` | | Yes | The associated company identifier. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_CREATE` | Fired when user clicks the "Add employee" button | None |
| `EMPLOYEE_UPDATE` | Fired when user selects "Edit" from employee actions menu | `{ employeeId: string }` |
| `EMPLOYEE_DELETED` | Fired after selecting delete and the operation completes | API response from Delete an onboarding employee endpoint |
