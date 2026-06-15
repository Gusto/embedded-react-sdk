---
title: Sub-components
description: Standalone sub-components for employee-driven self-onboarding — render in isolation or compose into a custom workflow.
order: 2
---

# Employee Self-Onboarding sub-components

Like the admin-driven employee onboarding, self-onboarding components can be used to compose your own workflow or be rendered in isolation. Many of these components are the same as the ones used for general employee onboarding; some fields are hidden or shown based on the current user type. For guidance on creating a custom workflow, see [docs on composition](../../integration-guide/composition.md).

> Legacy imports via `Employee.*` (e.g. `EmployeeOnboarding.Landing`) continue to work.

---

## Welcome screen

Displays guidance on what to expect from the workflow and what information the employee will be required to have on hand and provide.

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <EmployeeOnboarding.Landing
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

---

## Profile

_See [Profile in Employee Onboarding sub-components](../employee-onboarding/sub-components#profile) for a complete list of props and events — this component is used in both employee onboarding and employee self-onboarding._

When used in self-onboarding, this component collects basic information about the employee:

- First and last name
- Email address
- Social security number
- Date of birth
- And home address

For self-onboarding, set the `employeeId` property and leave `isAdmin` out (or set it to `false`, the default). The example below has the Profile component configured for self-onboarding:

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <EmployeeOnboarding.Profile
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

---

## Federal taxes

_See [Federal taxes in Employee Onboarding sub-components](../employee-onboarding/sub-components#federal-taxes) for a complete list of props and events — this component is used in both employee onboarding and employee self-onboarding._

Provides required form inputs for employee federal tax configuration.

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeOnboarding.FederalTaxes
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

---

## State taxes

_See [State taxes in Employee Onboarding sub-components](../employee-onboarding/sub-components#state-taxes) for a complete list of props and events — this component is used in both employee onboarding and employee self-onboarding._

Provides required form inputs for employee state tax configuration.

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeOnboarding.StateTaxes
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

---

## Payment method

_See [Payment method in Employee Onboarding sub-components](../employee-onboarding/sub-components#payment-method) for a complete list of props and events — this component is used in both employee onboarding and employee self-onboarding._

Used for configuring employee bank account(s). Bank accounts created with this component will be used to pay the employee when payroll is run. Payments can be split across multiple accounts.

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeOnboarding.PaymentMethod
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

---

## Sign documents

Provides the employee with an interface to read and sign required employment documents. When `withEmployeeI9` is enabled and the employee has I-9 configured, the Document Signer will first route the employee through the Employment Eligibility step and then present the I-9 form for signature alongside other required documents.

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeOnboarding.DocumentSigner
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      withEmployeeI9
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type    | Default | Description                                                                                                                                       |
| ------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string  |         | The associated employee identifier.                                                                                                               |
| onEvent Required    |         |         | See events table for available events.                                                                                                            |
| withEmployeeI9      | boolean | false   | When true, checks if the employee has I-9 enabled and whether they have already signed. If I-9 is needed, routes to Employment Eligibility first. |

#### Events

| Event type                           | Description                                                                                    | Data                                                                                                                                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE | Fired when the employee completes the employment eligibility form                              | Response from the [Create or update an employee's I-9 authorization](https://docs.gusto.com/embedded-payroll/reference/put-v1-employees-employee_id-i9_authorization) endpoint                                                 |
| EMPLOYEE_VIEW_FORM_TO_SIGN           | Fired when the sign form CTA is selected for a given form                                      | Response from the [Get the employee form pdf](https://docs.gusto.com/embedded-payroll/reference/get-v1-employees-employee_id-forms-form_id-pdf) endpoint aggregated with the pdf URL { ...getEmployeeFormPdfResponse, pdfUrl } |
| EMPLOYEE_SIGN_FORM                   | Fired when the user submits the form to sign                                                   | Response from the [Sign an employee form](https://docs.gusto.com/embedded-payroll/reference/put-v1-employees-employee_id-forms-form_id-sign) endpoint                                                                          |
| EMPLOYEE_FORMS_DONE                  | Fired when the user is done signing forms and is ready to advance to the next step in the flow | None                                                                                                                                                                                                                           |

---

## Employment eligibility

A standalone form for collecting an employee's I-9 employment eligibility (Section 1) details, including authorization status (citizen, non-citizen national, permanent resident, alien) and supporting document information when applicable. This is the lower-level building block used internally by `EmployeeOnboarding.DocumentSigner` when `withEmployeeI9` is enabled. Use this component directly when you want to collect I-9 details outside of the document-signing flow or compose a custom routing experience.

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeOnboarding.EmploymentEligibility
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type   | Description                            |
| ------------------- | ------ | -------------------------------------- |
| employeeId Required | string | The associated employee identifier.    |
| onEvent Required    |        | See events table for available events. |

#### Events

| Event type                           | Description                                                       | Data                                                                                                                                                                           |
| ------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE | Fired when the employee completes the employment eligibility form | Response from the [Create or update an employee's I-9 authorization](https://docs.gusto.com/embedded-payroll/reference/put-v1-employees-employee_id-i9_authorization) endpoint |

---

## Onboarding summary

_See [Onboarding summary in Employee Onboarding sub-components](../employee-onboarding/sub-components#onboarding-summary) for a complete list of props and events — this component is used in both employee onboarding and employee self-onboarding._

Displays the current state of employee onboarding.

For self-onboarding, leave `isAdmin` out (or set it to `false`, the default). The example below has the OnboardingSummary component configured for self-onboarding:

```jsx
import { EmployeeOnboarding } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeOnboarding.OnboardingSummary
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```
