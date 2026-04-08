---
title: Employee.Deductions
sidebar_position: 11
---

## Description

Configures additional withholdings from employee pay. Deductions can be set as a percentage or fixed amount, and can be either recurring or one-time.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle deduction events
  }

  return (
    <Employee.Deductions
      employeeId={employeeId}
      onEvent={handleEvent}
    />
  )
}
```

## Props

| Name | Type | Default | Required | Description |
| --- | --- | --- | --- | --- |
| **employeeId** | `string` | | Yes | The associated employee identifier. |
| **onEvent** | `(eventType: string, data?: unknown) => void` | | Yes | Callback invoked when events are emitted. |

## Events

| Event | Description | Data |
| --- | --- | --- |
| `EMPLOYEE_DEDUCTION_ADD` | Fired when user navigates to the deduction form | None |
| `EMPLOYEE_DEDUCTION_CREATED` | Fired after a new deduction is created | Response from the Create a garnishment endpoint |
| `EMPLOYEE_DEDUCTION_UPDATED` | Fired after a deduction is edited | Response from the Update a garnishment endpoint |
| `EMPLOYEE_DEDUCTION_DELETED` | Fired after deleting a deduction | Response from the Update a garnishment endpoint with `active: false` |
| `EMPLOYEE_DEDUCTION_EDIT` | Fired when user selects a deduction to edit | None |
| `EMPLOYEE_DEDUCTION_CANCEL` | Fired when user cancels deduction editing | None |
| `EMPLOYEE_DEDUCTION_INCLUDE_YES` | Fired when user opts to include deductions | None |
| `EMPLOYEE_DEDUCTION_INCLUDE_NO` | Fired when user opts out of deductions | None |
| `EMPLOYEE_DEDUCTION_DONE` | Fired when deductions setup is complete and the step is ready to advance | None |
