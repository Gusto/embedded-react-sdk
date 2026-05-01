---
title: Employee.EmployeeDocuments
sidebar_position: 12
---

## Description

Used during admin onboarding to configure which documents are included in the employee's self-onboarding experience. When the employee has been invited to self-onboard, this step allows the admin to enable or disable the I-9 (Employment Eligibility Verification) form. When the employee is not self-onboarding, this step displays a read-only summary of the documents that will be part of the onboarding process.

This component is conditionally shown in `Employee.OnboardingFlow` when `withEmployeeI9` is set to `true`.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle document configuration events
  }

  return <Employee.EmployeeDocuments employeeId={employeeId} onEvent={handleEvent} />
}
```

## Props

| Name           | Type                                          | Default | Required | Description                               |
| -------------- | --------------------------------------------- | ------- | -------- | ----------------------------------------- |
| **employeeId** | `string`                                      |         | Yes      | The associated employee identifier.       |
| **onEvent**    | `(eventType: string, data?: unknown) => void` |         | Yes      | Callback invoked when events are emitted. |

## Events

| Event                                          | Description                                                                               | Data                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `EMPLOYEE_ONBOARDING_DOCUMENTS_CONFIG_UPDATED` | Fired after the admin toggles I-9 inclusion and the configuration is successfully updated | Response from the Update an employee's onboarding documents config endpoint |
| `EMPLOYEE_DOCUMENTS_DONE`                      | Fired when the admin clicks continue and is ready to advance                              | None                                                                        |
