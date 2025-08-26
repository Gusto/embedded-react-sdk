---
title: Employee Onboarding
order: 0
---

## Overview

The Employee Onboarding workflow provides a complete experience for onboarding an employee to a company. It is used to collect all required information for an employee to be added to payroll.

### Implementation

```jsx
import { EmployeeOnboardingFlow } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <EmployeeOnboardingFlow companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name               | Type   | Description                                                     |
| ------------------ | ------ | --------------------------------------------------------------- |
| employeeId         | string | The associated employee identifier.                             |
| companyId Required | string | The associated company identifier.                              |
| defaultValues      | object | Default values for individual flow step components              |
| onEvent Required   |        | See events table for each subcomponent to see available events. |

## Using Employee Subcomponents

Employee onboarding components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](a086lb248al).

### Available Subcomponents

- Employee.EmployeeList
- Employee.Profile
- Employee.Compensation
- Employee.FederalTaxes
- Employee.StateTaxes
- Employee.PaymentMethod
- Employee Deductions
- Employee.OnboardingSummary

### Employee.List

Displays a list of employees containing their full name, and their current onboarding status. An onboarding status. This list also contains actions that allow for the editing or removal of an employee.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Employee.EmployeeList companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name               | Type   | Description                                  |
| ------------------ | ------ | -------------------------------------------- |
| companyId Required | string | The associated company identifier.           |
| onEvent Required   |        | See events table below for available events. |

#### Events

| Event type       | Description                                                                                                  | Data                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| EMPLOYEE_CREATE  | Fired when user clicks "Add employee" button                                                                 | Undefined                                                 |
| EMPLOYEE_UPDATE  | Fired when user selects "Edit" from employee actions menu                                                    | { employeeId: string }                                    |
| EMPLOYEE_DELETED | Fired after selecting delete from the employee actions menu and the deleting an employee operation completes | Response data from Delete an onboarding employee endpoint |

### Employee.Profile

Used to collect basic information about the employee:

- First and last name
- Work address and start date
- Email address
- Social security number
- Date of birth
- And home address

This component also provides the option to invite the employee to enter some of their details themself. If selected, they can be sent an invitation to complete the form.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.Profile
      defaultValues={{ employee: { email: 'myown@data.com' } }}
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
      isAdmin // Set to true for admin onboarding
    />
  )
}
```

#### Props

| Name               | Type                                                                                                                                                                                                             | Default   | Description                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| companyId Required | string                                                                                                                                                                                                           |           | The associated company identifier.                                                                                                 |
| employeeId         | string                                                                                                                                                                                                           | false     | The associated employee identifier.                                                                                                |
| onEvent Required   |                                                                                                                                                                                                                  |           | See events table for available events.                                                                                             |
| isAdmin            | boolean                                                                                                                                                                                                          | false     | If the onboarding is being performed by an admin. When false it is configured to be self onboarding.                               |
| defaultValues      | { employee?: { firstName?: string middleInitial?: string lastName?: string email?: string dateOfBirth?: string } homeAddress?: { street1?: string street2?: string city?: string state?: string zip?: string } } | undefined | Default values for the employee profile form inputs. If employee data is available via the API, defaultValues will be overwritten. |

#### Events

| Event type                    | Description                                                                                              | Data                                                                                                                                                                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EMPLOYEE_CREATE               | Fired after form is submitted when creating a new employee                                               | Response from the Create an employee endpoint                                                                                                                                                                                                         |
| EMPLOYEE_UPDATED              | Fired after form is submitted when editing/updating an existing employee                                 | Response from the Update an employee endpoint                                                                                                                                                                                                         |
| EMPLOYEE_HOME_ADDRESS_CREATED | Fired after form is submitted when creating a new employee                                               | Response from the Create an employee's home address endpoint                                                                                                                                                                                          |
| EMPLOYEE_HOME_ADDRESS_UPDATED | Fired after form is submitted when editing/updating an existing employee                                 | Response from the Update an employee's home address endpoint                                                                                                                                                                                          |
| EMPLOYEE_WORK_ADDRESS_CREATED | Fired after form is submitted when creating a new employee                                               | Response from the Create a work address endpoint                                                                                                                                                                                                      |
| EMPLOYEE_WORK_ADDRESS_UPDATED | Fired after form is submitted when editing/updating an existing employe                                  | Response from the Update a work address endpoint                                                                                                                                                                                                      |
| EMPLOYEE_PROFILE_DONE         | Fired after form submission and all api calls have finished and we are ready to advance to the next step | Called with an object aggregated with the responses above. This either includes all of the responses for creating new entities (if it is creating a new employee) or all the responses for updating entities (if it is updating an existing employee) |
| CANCEL                        | Fired when user clicks cancel button                                                                     | None                                                                                                                                                                                                                                                  |

### Employee.Compensation

Collects details related to the role of the employee and their compensation:

- Job title
- Employee type (eg., Hourly, Salary)
- Compensation amount
- Pay period (e.g., hourly, daily, weekly, monthly, annually)

For hourly employees, the compensation component allows for the configuration of multiple roles.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.Compensation
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      startDate="01-01-2025"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                                                                                               | Description                            |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------- | -------- | ----------- | ------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string                                                                                             | The associated employee identifier.    |
| startDate Required  | string                                                                                             | The date the employee will start work. |
| onEvent Required    |                                                                                                    | See events table for available events. |
| defaultValues       | { title?: string \| null rate?: string paymentUnit?: string, flsaStatus?: 'Commission Only Exempt' | 'Commission Only Nonexempt'            | 'Exempt' | 'Nonexempt' | 'Owner' | 'Salaried Nonexempt' } | Default values for the employee profile form inputs. If employee data is available via the API, defaultValues will be overwritten. |

#### Events

| Event type                    | Description                                                                                    | Data                                             |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| EMPLOYEE_JOB_CREATED          | Fired after compensation form is submitted if compensation is new                              | Response from the Create a job endpoint          |
| EMPLOYEE_JOB_UPDATED          | Fired after compensation form is submitted if editing compensation and compensation is updated | Response from the Update a job endpoint          |
| EMPLOYEE_JOB_DELETED          | Fired after successfully deleting a job                                                        | Response from the Delete a job endpoint          |
| EMPLOYEE_COMPENSATION_UPDATED | Fired after updating compensation details                                                      | Response from the Update a compensation endpoint |
| EMPLOYEE_COMPENSATION_DONE    | Fired when compensation setup is complete and we are ready to advance to the next step         | None                                             |

### Employee.FederalTaxes

Provides required form inputs for employee federal tax configuration.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.FederalTaxes employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

#### Props

| Name                | Type   | Description                            |
| ------------------- | ------ | -------------------------------------- |
| employeeId Required | string | The associated employee identifier.    |
| onEvent Required    |        | See events table for available events. |

#### Events

| Event type                     | Description                                                                                                                                  | Data                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| EMPLOYEE_FEDERAL_TAXES_UPDATED | Fired when the employee federal taxes form is submitted and federal taxes are successfully updated                                           | Response from the Update federal taxes endpoint |
| EMPLOYEE_FEDERAL_TAXES_DONE    | Fired when the employee federal taxes form is successfully submitted, API request is completed, and we are ready to advance to the next step | None                                            |

### Employee.StateTaxes

Provides required form inputs for employee state tax configuration.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.StateTaxes employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

#### Props

| Name                | Type    | Default | Description                                                                                          |
| ------------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| employeeId Required | string  |         | The associated employee identifier.                                                                  |
| onEvent Required    |         |         | See events table for available events.                                                               |
| isAdmin             | boolean | false   | If the onboarding is being performed by an admin. When false it is configured to be self onboarding. |

#### Events

| Event type                   | Description                                                                                                                                | Data                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| EMPLOYEE_STATE_TAXES_UPDATED | Fired when the employee state taxes form is submitted and state taxes are successfully updated                                             | Response from the Update state taxes endpoint |
| EMPLOYEE_STATE_TAXES_DONE    | Fired when the employee state taxes form is successfully submitted, API request is completed, and we are ready to advance to the next step | None                                          |

### Employee.PaymentMethod

Used for configuring employee bank account(s). Bank accounts created with this component will be used to pay the employee when payroll is run. Payments can be split across multiple accounts.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.PaymentMethod employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

#### Props

| Name                | Type   | Description                            |
| ------------------- | ------ | -------------------------------------- |
| employeeId Required | string | The associated employee identifier.    |
| onEvent Required    |        | See events table for available events. |

#### Events

| Event type                      | Description                                                                                                                                         | Data                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| EMPLOYEE_BANK_ACCOUNT_CREATED   | Fired after add bank account form is submitted and new account is created                                                                           | Response from the Create a bank account endpoint |
| EMPLOYEE_BANK_ACCOUNT_DELETED   | Fired after deleting a bank account                                                                                                                 | Response from the Delete a bank account endpoint |
| EMPLOYEE_PAYMENT_METHOD_UPDATED | Fired when the employee updates the payment method by selecting the continue CTA or if they opt to split paychecks and save the split paycheck form | Response from the Update payment method endpoint |
| EMPLOYEE_PAYMENT_METHOD_DONE    | Fired when the continue CTA is selected on the payment details step, all API calls are finished, and we are ready to advance to the next step       | None                                             |

### Employee.Deductions

Used for configuring additional withholdings from employee pay. Deductions can be set by percentage or fixed amount, and can be either recurring or one-time.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.Deductions employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

#### Props

| Name                | Type   | Description                            |
| ------------------- | ------ | -------------------------------------- |
| employeeId Required | string | The associated employee identifier.    |
| onEvent Required    |        | See events table for available events. |

#### Events

| Event type                 | Description                                                                            | Data                                                              |
| -------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| EMPLOYEE_DEDUCTION_ADD     | Fired when user initially navigates to the deduction form                              | None                                                              |
| EMPLOYEE_DEDUCTION_CREATED | Fired after a new deduction is created                                                 | Response from the Create a garnishment endpoint                   |
| EMPLOYEE_DEDUCTION_UPDATED | Fired after a deduction is edited                                                      | Response from the Update a garnishment endpoint                   |
| EMPLOYEE_DEDUCTION_DELETED | Fired after deleting a deduction                                                       | Response from the Update a garnishment endpoint with active:false |
| EMPLOYEE_DEDUCTION_DONE    | Fired when deductions setup is complete and user is ready to navigate to the next step | None                                                              |

### Employee.OnboardingSummary

Displays the current state of employee onboarding.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.OnboardingSummary
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
      isAdmin // Set to true for admin onboarding
    />
  )
}
```

#### Props

| Name                | Type    | Default | Description                                                                                          |
| ------------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| employeeId Required | string  |         | The associated employee identifier.                                                                  |
| onEvent Required    |         |         | See events table for available events.                                                               |
| isAdmin             | boolean | false   | If the onboarding is being performed by an admin. When false it is configured to be self onboarding. |

#### Events

| Event type      | Description                                       | Data |
| --------------- | ------------------------------------------------- | ---- |
| EMPLOYEES_LIST  | Fired when user clicks to return to employee list | None |
| EMPLOYEE_CREATE | Fired when user clicks to add another employee    | None |
