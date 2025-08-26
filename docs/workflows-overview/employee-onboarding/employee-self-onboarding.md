---
title: Employee Self-Onboarding
order: 0
---

## Overview

In the case an employer elects to allow the employee to self-onboard, they can be provided with the self-onboarding workflow. This workflow places the responsibility of submitting some required information on the employee.

### Implementation

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Employee.SelfOnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type   | Description                                                     |
| ------------------- | ------ | --------------------------------------------------------------- |
| employeeId Required | string | The associated employee identifier.                             |
| companyId Required  | string | The associated company identifier.                              |
| onEvent Required    |        | See events table for each subcomponent to see available events. |

## Using Self-Onboarding Subcomponents

Like Employee onboarding, self-onboarding components can be used to compose your own workflow, or be rendered in isolation. Many of these components are the same as the ones used for general employee onboarding, however some fields are hidden and shown based on the current user type. For guidance on creating a custom workflow, see [docs on composition](a086lb248al).

### Employee.Landing

Displays guidance on what to expect from the workflow and what information the employee will be required to have on hand and provide.

```jsx jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Employee.Landing
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type   | Description                                                     |
| ------------------- | ------ | --------------------------------------------------------------- |
| employeeId Required | string | The associated employee identifier.                             |
| companyId Required  | string | The associated company identifier.                              |
| onEvent Required    |        | See events table for each subcomponent to see available events. |

#### Events

| Event type                     | Description                                                                                   | Data |
| ------------------------------ | --------------------------------------------------------------------------------------------- | ---- |
| EMPLOYEE_SELF_ONBOARDING_START | Fired when the employee selects the get started CTA and is ready to navigate to the next step | None |

### Employee.Profile

_See component documentation in the Employee Onboarding section for a complete list of props and events since this component is used in both employee onboarding and employee self onboarding._

When used in self onboarding, used to collect basic information about the employee:

- First and last name
- Email address
- Social security number
- Date of birth
- And home address

For self onboarding, you need to be sure to set the `employeeId` property. The `isAdmin` property should be left out or set to false (which is the setting by default). The following example has the Profile component configured for self onboarding:

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Employee.Profile
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

### Employee.FederalTaxes

_See component documentation in the Employee Onboarding section for a complete list of props and events since this component is used in both employee onboarding and employee self onboarding._

Provides required form inputs for employee federal tax configuration.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.FederalTaxes employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

### Employee.StateTaxes

_See component documentation in the Employee Onboarding section for a complete list of props and events since this component is used in both employee onboarding and employee self onboarding._

Provides required form inputs for employee state tax configuration.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.StateTaxes employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

### Employee.PaymentMethod

_See component documentation in the Employee Onboarding section for a complete list of props and events since this component is used in both employee onboarding and employee self onboarding._

Used for configuring employee bank account(s). Bank accounts created with this component will be used to pay the employee when payroll is run. Payments can be split across multiple accounts.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.PaymentMethod employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

### Employee Document Signer

Provides the employee with an interface to read and sign required employment documents.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.DocumentSigner employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e" onEvent={() => {}} />
  )
}
```

#### Props

| Name                | Type   | Description                            |
| ------------------- | ------ | -------------------------------------- |
| employeeId Required | string | The associated employee identifier.    |
| onEvent Required    |        | See events table for available events. |

#### Events

| Event type                 | Description                                                                                    | Data                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| EMPLOYEE_VIEW_FORM_TO_SIGN | Fired when the sign form CTA is selected for a given form                                      | Response from the Get employee form PDF endpoint aggregated with the pdf URL{ …getEmployeePdfEndpointResponse, pdfUrl,} |
| EMPLOYEE_SIGN_FORM         | Fired when the user submits the form to sign                                                   | Response from the Sign and employee form endpoint                                                                       |
| EMPLOYEE_FORMS_DONE        | Fired when the user is done signing forms and is ready to advance to the next step in the flow | None                                                                                                                    |

### Employee Onboarding Summary

_See component documentation in the Employee Onboarding section for a complete list of props and events since this component is used in both employee onboarding and employee self onboarding._

Displays the current state of employee onboarding.

The `isAdmin` property should be left out or set to false (which is the setting by default). The following example has the OnboardingSummary component configured for self onboarding:

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Employee.OnboardingSummary
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```
