---
title: Employee.PaymentMethod
sidebar_position: 10
---

## Description

Configures employee bank accounts for direct deposit. Bank accounts created with this component are used to pay the employee when payroll is run. Supports adding multiple accounts and splitting payments across them.

## Code example

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp({ employeeId }) {
  const handleEvent = (eventType, data) => {
    // Handle payment method events
  }

  return <Employee.PaymentMethod employeeId={employeeId} onEvent={handleEvent} />
}
```

## Props

| Name           | Type                                          | Default | Required | Description                                                                                      |
| -------------- | --------------------------------------------- | ------- | -------- | ------------------------------------------------------------------------------------------------ |
| **employeeId** | `string`                                      |         | Yes      | The associated employee identifier.                                                              |
| **onEvent**    | `(eventType: string, data?: unknown) => void` |         | Yes      | Callback invoked when events are emitted.                                                        |
| **isAdmin**    | `boolean`                                     | `false` | No       | When true, configures the form for admin onboarding. When false, configures for self-onboarding. |

## Events

| Event                             | Description                                                                                               | Data                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `EMPLOYEE_BANK_ACCOUNT_CREATED`   | Fired after the add bank account form is submitted and a new account is created                           | Response from the Create a bank account endpoint |
| `EMPLOYEE_BANK_ACCOUNT_DELETED`   | Fired after deleting a bank account                                                                       | Response from the Delete a bank account endpoint |
| `EMPLOYEE_PAYMENT_METHOD_UPDATED` | Fired when the employee updates the payment method by continuing or saving a split paycheck configuration | Response from the Update payment method endpoint |
| `EMPLOYEE_PAYMENT_METHOD_DONE`    | Fired when all API calls are finished and the step is ready to advance                                    | None                                             |
