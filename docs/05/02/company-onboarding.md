## Overview

The Company Onboarding workflow provides components for managing company-related onboarding tasks. These components can be used individually or composed into a complete workflow.

### Implementation

```jsx
import { Company } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Company.OnboardingFlow companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name               | Type   | Description                                                     |
| ------------------ | ------ | --------------------------------------------------------------- |
| companyId Required | string | The associated company identifier.                              |
| defaultValues      | object | Default values for individual flow step components              |
| onEvent Required   |        | See events table for each subcomponent to see available events. |

## Using Company Subcomponents

Employee onboarding components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](a086lb248al).

### Available Subcomponents

- Company.IndustrySelect
- Company.DocumentSigner
- Company.FederalTaxes
- Company.PaySchedule
- Company.LocationsFlow
- Company.BankAccountFlow
- Company.StateTaxesFlow
- Company.OnboardingOverview

### Company.DocumentSigner

Provides an interface for company representatives to read and sign required company documents. The component handles document listing, signatory management, and document signing workflow.

```jsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.DocumentSigner companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name                     | Type   | Description                                                                                                                                                                                                                                                           |
| ------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.                                                                                                                                                                                                                                    |
| **signatoryId**          | string | ID of the signatory. When this is set and it matches the signatory ID of the currently saved signatory it is assumed the user is the signatory. This means fields are pre populated in the signature form with their information and they are able to sign documents. |
| **onEvent** (Required)   |        | See events table for available events.                                                                                                                                                                                                                                |

#### Events

| Event type                            | Description                                                      | Data                                                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| COMPANY_VIEW_FORM_TO_SIGN             | Fired when a user selects a form to sign from the document list  | Called with [response from get company form endpoint](https://docs.gusto.com/embedded-payroll/reference/get-v1-company-form)                                 |
| COMPANY_FORM_EDIT_SIGNATORY           | Fired when user requests to change the document signatory        | Called with [response from create signatory endpoint](https://docs.gusto.com/embedded-payroll/reference/post-v1-company-signatories)                         |
| COMPANY_FORMS_DONE                    | Fired when user completes the document signing process           | None                                                                                                                                                         |
| COMPANY_SIGN_FORM                     | Fired when a form is successfully signed                         | [Response from the sign company form API request](https://docs.gusto.com/embedded-payroll/reference/put-v1-company-form-sign)                                |
| COMPANY_SIGN_FORM_DONE                | Fired when the form signing process is complete                  | None                                                                                                                                                         |
| COMPANY_SIGN_FORM_BACK                | Fired when user navigates back from the signature form           | None                                                                                                                                                         |
| COMPANY_ASSIGN_SIGNATORY_MODE_UPDATED | Fired when the signatory assignment mode changes (create/invite) | Mode string ('create_signatory' or 'invite_signatory')                                                                                                       |
| COMPANY_ASSIGN_SIGNATORY_DONE         | Fired when the signatory assignment process is complete          | None                                                                                                                                                         |
| COMPANY_SIGNATORY_CREATED             | Fired when a new signatory is created successfully               | [Response from the create signatory API request](https://docs.gusto.com/embedded-payroll/reference/post-v1-company-signatories)                              |
| COMPANY_SIGNATORY_UPDATED             | Fired when an existing signatory is updated successfully         | [Response from the update signatory API request](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_uuid-signatories-signatory_uuid) |
| COMPANY_SIGNATORY_INVITED             | Fired when a signatory is successfully invited to the company    | [Response from the invite signatory API request](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_uuid-signatories-invite)        |

### Company.FederalTaxes

A component for adding company federal tax information including EIN, tax payer type, filing form, and legal name.

```jsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.FederalTaxes companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name                     | Type                                                             | Description                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **companyId** (Required) | string                                                           | The associated company identifier.                                                                                                                      |
| **defaultValues**        | { legalName?: string taxPayerType?: string filingForm?: string } | Default values for the company federal taxes form fields. If company data for these fields is available via the API, defaultValues will be overwritten. |
| **onEvent** (Required)   |                                                                  | See events table for available events.                                                                                                                  |

#### Events

| Event type                    | Description                                             | Data                                                                                                                                                          |
| ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| COMPANY_FEDERAL_TAXES_UPDATED | Fired when federal tax details are successfully updated | [Response from the update federal tax details API request](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-federal_tax_details) |
| COMPANY_FEDERAL_TAXES_DONE    | Fired when the federal tax update process is complete   | None                                                                                                                                                          |

### Company.PaySchedule

A component for managing company pay schedules, including creating, editing, and viewing pay schedules with preview functionality.

```jsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Company.PaySchedule companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
}
```

#### Props

| Name                     | Type                                                                                                                                                                                                        | Description                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **companyId** (Required) | string                                                                                                                                                                                                      | The associated company identifier.                                                                                                             |
| **defaultValues**        | { frequency?: string (one of `Every Week`, `Every other week`, `Twice per month`, or `Monthly`), anchorPayDate?: string, anchorEndOfPayPeriod?: string, day1?: number, day2?: number, customName?: string } | Default values for the pay schedule form fields. If company data for these fields is available via the API, defaultValues will be overwritten. |
| **onEvent** (Required)   |                                                                                                                                                                                                             | See events table for available events.                                                                                                         |

#### Events

| Event type           | Description                                                 | Data                                                                                                                                                             |
| -------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PAY_SCHEDULE_CREATED | Fired when a new pay schedule is successfully created       | [Response from the create pay schedule API request](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-pay_schedules)                |
| PAY_SCHEDULE_UPDATED | Fired when an existing pay schedule is successfully updated | [Response from the update pay schedule API request](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-pay_schedules-pay_schedule_id) |

### Company.LocationsFlow

A component for managing company addresses, including mailing and filing address.

```jsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Company.Locations companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
}
```

#### Props

| Name                     | Type   | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.     |
| **defaultValues**        |        |                                        |
| **onEvent** (Required)   |        | See events table for available events. |

#### Events

| Event type               | Description                                             | Data                                                                                                                                                |
| ------------------------ | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| COMPANY_LOCATION_CREATE  | Fired when a user chooses to add new location           | None                                                                                                                                                |
| COMPANY_LOCATION_CREATED | Fired when a new location is created                    | [Response from the create a company location API request](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-locations) |
| COMPANY_LOCATION_EDIT    | Fired when a user selects existing location for editing | `{uuid:string}`                                                                                                                                     |
| COMPANY_LOCATION_UPDATED | Fired when locations has been successfully edited       | [Response from the update a location API request](https://docs.gusto.com/embedded-payroll/reference/put-v1-locations-location_id)                   |
| COMPANY_LOCATION_DONE    | Fired when user chooses to proceed to a next step       | None                                                                                                                                                |

### Company.BankAccountFlow

A component for managing company bank account

```jsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.BankAccountFlow companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name                     | Type   | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.     |
| **defaultValues**        |        |                                        |
| **onEvent** (Required)   |        | See events table for available events. |

#### Events

| Event type                    | Description                                                                      | Data                                                                                                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| COMPANY_BANK_ACCOUNT_CHANGE   | Fired when a user chooses to change existing bank account                        | None                                                                                                                                                              |
| COMPANY_BANK_ACCOUNT_CREATED  | Fired when a new bank account is created                                         | [Response from the create a company bank account API request](https://docs.gusto.com/embedded-payroll/reference/post-v1-companies-company_id-bank-accounts)       |
| COMPANY_BANK_ACCOUNT_VERIFY   | Fired when a user chooses to verify bank account (after micro-deposits are made) | None                                                                                                                                                              |
| COMPANY_BANK_ACCOUNT_VERIFIED | Fired when bank account has been successfully verifyed                           | [Response from the verify a company bank account API request](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_id-bank-accounts-verify) |
| COMPANY_BANK_ACCOUNT_DONE     | Fired when user chooses to proceed to a next step                                | None                                                                                                                                                              |

### Company.StateTaxesFlow

A component for managing company state taxes setup

```jsx
import { Company } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Company.StateTaxesFlow companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
  )
}
```

#### Props

| Name                     | Type   | Description                            |
| ------------------------ | ------ | -------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.     |
| **onEvent** (Required)   |        | See events table for available events. |

#### Events

| Event type                | Description                                                         | Data                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| COMPANY_STATE_TAX_EDIT    | Fired when a user chooses to edit requirements for a specific state | `{ state: string }`                                                                                                                                                            |
| COMPANY_STATE_TAX_UPDATED | Fired when a state tax setup has been successfully submitted        | [Response from the create a company update state tax requirements API](https://docs.gusto.com/embedded-payroll/reference/put-v1-companies-company_uuid-tax_requirements-state) |
| COMPANY_STATE_TAX_DONE    | Fired when user chooses to proceed to a next step                   | None                                                                                                                                                                           |
