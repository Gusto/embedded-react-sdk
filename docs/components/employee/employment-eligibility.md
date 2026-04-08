---
title: Employee.EmploymentEligibility
sidebar_position: 14
---

## Description

I-9 employment eligibility verification form. Collects the employee's citizenship or immigration status and work authorization details required for the I-9 Employment Eligibility Verification process. This component is typically rendered as part of the `Employee.DocumentSigner` flow when `withEmployeeI9` is enabled.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle employment eligibility events
  }

  return (
    <Employee.EmploymentEligibility
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
| `EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE` | Fired when the employee completes the employment eligibility form | Response from the Create or update an employee's I-9 authorization endpoint |
| `EMPLOYEE_CHANGE_ELIGIBILITY_STATUS` | Fired when the employee changes their eligibility status (e.g. citizenship or immigration status) | None |
