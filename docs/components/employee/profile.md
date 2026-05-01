---
title: Employee.Profile
sidebar_position: 6
---

## Description

Collects basic employee information including name, work address, start date, email, Social Security number, date of birth, and home address. Supports both admin onboarding and self-onboarding modes — in self-onboarding mode, admin-only fields (like work address and start date) are hidden.

This component also provides the option to invite the employee to self-onboard when used in admin mode.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ companyId, employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle profile events
  }

  return (
    <Employee.Profile
      companyId={companyId}
      employeeId={employeeId}
      onEvent={handleEvent}
      isAdmin
      defaultValues={{
        employee: { email: 'new.hire@company.com' },
      }}
    />
  )
}
```

## Props

| Name                        | Type                                          | Default | Required | Description                                                                                                                                                     |
| --------------------------- | --------------------------------------------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **companyId**               | `string`                                      |         | Yes      | The associated company identifier.                                                                                                                              |
| **employeeId**              | `string`                                      |         | No       | The associated employee identifier. When omitted, the form creates a new employee.                                                                              |
| **onEvent**                 | `(eventType: string, data?: unknown) => void` |         | Yes      | Callback invoked when events are emitted.                                                                                                                       |
| **isAdmin**                 | `boolean`                                     | `false` | No       | When true, configures the form for admin onboarding (shows work address, start date). When false, configures for self-onboarding.                               |
| **isSelfOnboardingEnabled** | `boolean`                                     |         | No       | When true, presents the self-onboarding toggle allowing the admin to invite the employee to self-onboard.                                                       |
| **defaultValues**           | `object`                                      |         | No       | Default values for the profile form. Accepts `employee` and `homeAddress` sub-objects. If employee data is available via the API, these values are overwritten. |

### defaultValues shape

```typescript
{
  employee?: {
    firstName?: string
    middleInitial?: string
    lastName?: string
    email?: string
    dateOfBirth?: string
  }
  homeAddress?: {
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }
}
```

## Events

| Event                                | Description                                                                   | Data                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `EMPLOYEE_CREATED`                   | Fired after form submission when creating a new employee                      | Response from the Create an employee endpoint                   |
| `EMPLOYEE_UPDATED`                   | Fired after form submission when updating an existing employee                | Response from the Update an employee endpoint                   |
| `EMPLOYEE_HOME_ADDRESS_CREATED`      | Fired after form submission when creating a new employee's home address       | Response from the Create an employee's home address endpoint    |
| `EMPLOYEE_HOME_ADDRESS_UPDATED`      | Fired after form submission when updating an existing employee's home address | Response from the Update an employee's home address endpoint    |
| `EMPLOYEE_WORK_ADDRESS_CREATED`      | Fired after form submission when creating a work address                      | Response from the Create a work address endpoint                |
| `EMPLOYEE_WORK_ADDRESS_UPDATED`      | Fired after form submission when updating a work address                      | Response from the Update a work address endpoint                |
| `EMPLOYEE_PROFILE_DONE`              | Fired after all API calls complete and the step is ready to advance           | Aggregated response object from all create or update operations |
| `EMPLOYEE_ONBOARDING_STATUS_UPDATED` | Fired when the employee's onboarding status is updated                        | API response                                                    |
| `CANCEL`                             | Fired when user clicks the cancel button                                      | None                                                            |
