## Overview

The Contractor Onboarding workflow provides a complete experience for onboarding a contractor to a company. It is used to collect all required information for a contractor to be added to the system.

## Using Contractor Subcomponents

### Available Subcomponents

- Contractor.ContractorList
- Contractor.Address
- Contractor.PaymentMethod
- Contractor.NewHireReport

### Contractor.List

Displays a list of contractors containing their full name and their current onboarding status. This list also contains actions that allow for the editing or removal of a contractor.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <Contractor.List companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365" onEvent={() => {}} />
}
```

#### Props

| Name               | Type   | Description                                  |
| ------------------ | ------ | -------------------------------------------- |
| companyId Required | string | The associated company identifier.           |
| onEvent Required   |        | See events table below for available events. |

#### Events

| Event type         | Description                                                                                                     | Data                                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| CONTRACTOR_CREATE  | Fired when user clicks "Add contractor" button                                                                  | Undefined                                                                                                                                  |
| CONTRACTOR_UPDATE  | Fired when user selects "Edit" from contractor actions menu                                                     | { contractorId: string }                                                                                                                   |
| CONTRACTOR_DELETED | Fired after selecting delete from the contractor actions menu and the deleting a contractor operation completes | Response data from [Delete a contractor](https://docs.gusto.com/embedded-payroll/reference/delete-v1-contractors-contractor_uuid) endpoint |

### Contractor.Address

Used to collect address information about the contractor:

- Street address (line 1 and line 2)
- City
- State
- ZIP code

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.Address
      defaultValues={{
        street1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
      }}
      contractorId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                  | Type                                                                            | Default   | Description                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| contractorId Required | string                                                                          |           | The associated contractor identifier.                                                                                                  |
| onEvent Required      |                                                                                 |           | See events table for available events.                                                                                                 |
| defaultValues         | { street1?: string street2?: string city?: string state?: string zip?: string } | undefined | Default values for the contractor address form inputs. If contractor data is available via the API, defaultValues will be overwritten. |

#### Events

| Event type                 | Description                                                                                              | Data                                                                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| CONTRACTOR_ADDRESS_UPDATED | Fired after form is submitted when updating contractor address                                           | Response from the [Update contractor address](https://docs.gusto.com/embedded-payroll/reference/put-v1-contractors-contractor_uuid-address) endpoint |
| CONTRACTOR_ADDRESS_DONE    | Fired after form submission and all api calls have finished and we are ready to advance to the next step | None                                                                                                                                                 |
| CANCEL                     | Fired when user clicks cancel button                                                                     | None                                                                                                                                                 |

### Contractor.PaymentMethod

Used for configuring contractor payment method and bank account(s). Bank accounts created with this component will be used to pay the contractor when payments are processed.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.PaymentMethod
      contractorId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                  | Type   | Description                            |
| --------------------- | ------ | -------------------------------------- |
| contractorId Required | string | The associated contractor identifier.  |
| onEvent Required      |        | See events table for available events. |

#### Events

| Event type                        | Description                                                                                                       | Data                                                                                                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CONTRACTOR_BANK_ACCOUNT_CREATED   | Fired after add bank account form is submitted and new account is created                                         | Response from the [Create a contractor bank account](https://docs.gusto.com/embedded-payroll/reference/post-v1-contractors-contractor_uuid-bank_accounts) endpoint |
| CONTRACTOR_PAYMENT_METHOD_UPDATED | Fired when the contractor updates the payment method                                                              | Response from the [Update contractor payment method](https://docs.gusto.com/embedded-payroll/reference/put-v1-contractors-contractor_id-payment_method) endpoint   |
| CONTRACTOR_PAYMENT_METHOD_DONE    | Fired when the continue CTA is selected, all API calls are finished, and we are ready to advance to the next step | None                                                                                                                                                               |

### Contractor.NewHireReport

Used for configuring new hire reporting requirements for the contractor. This component allows setting whether a new hire report should be filed and in which state.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.NewHireReport
      contractorId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                  | Type   | Description                            |
| --------------------- | ------ | -------------------------------------- |
| contractorId Required | string | The associated contractor identifier.  |
| onEvent Required      |        | See events table for available events. |

#### Events

| Event type                         | Description                                                                                 | Data                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| CONTRACTOR_NEW_HIRE_REPORT_UPDATED | Fired after the new hire report form is submitted and contractor is updated                 | Response from the [Update contractor](https://docs.gusto.com/embedded-payroll/reference/put-v1-contractors-contractor_uuid) endpoint |
| CONTRACTOR_NEW_HIRE_REPORT_DONE    | Fired when new hire report setup is complete and user is ready to navigate to the next step | None                                                                                                                                 |
