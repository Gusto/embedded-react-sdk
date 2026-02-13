---
title: Contractor Onboarding
order: 2
---

## Overview

The Contractor Onboarding workflow provides components for managing contractor-related onboarding tasks. These components can be used individually or composed into a complete workflow.

The onboarding flow supports two paths:

- **Full admin onboarding**: ContractorList → ContractorProfile → Address → PaymentMethod → NewHireReport → ContractorSubmit
- **Self-onboarding**: ContractorList → ContractorProfile → NewHireReport → ContractorSubmit (the contractor is invited to fill in their own address and payment details)

### Implementation

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <Contractor.OnboardingFlow
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type   | Description                                                                                           |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------- |
| companyId Required | string | The associated company identifier.                                                                    |
| defaultValues      | object | Default values containing `profile` and/or `address` sub-objects for individual flow step components. |
| onEvent Required   |        | See events table for each subcomponent to see available events.                                       |

Events from subcomponents bubble up through the `onEvent` handler.

## Using Contractor Subcomponents

Contractor onboarding components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- Contractor.ContractorList
- Contractor.ContractorProfile
- Contractor.Address
- Contractor.PaymentMethod
- Contractor.NewHireReport
- Contractor.ContractorSubmit

### Contractor.ContractorList

Displays a list of contractors for a company, allowing users to add new contractors, edit existing ones, delete contractors, and continue the onboarding process.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.ContractorList
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type   | Description                                                    |
| ------------------------ | ------ | -------------------------------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.                             |
| **successMessage**       | string | Optional success message to display after a contractor action. |
| **onEvent** (Required)   |        | See events table for available events.                         |

#### Events

| Event type                     | Description                                     | Data                     |
| ------------------------------ | ----------------------------------------------- | ------------------------ |
| CONTRACTOR_CREATE              | Fired when user chooses to add a new contractor | None                     |
| CONTRACTOR_UPDATE              | Fired when user selects a contractor to edit    | { contractorId: string } |
| CONTRACTOR_DELETED             | Fired when a contractor is deleted              | { contractorId: string } |
| CONTRACTOR_ONBOARDING_CONTINUE | Fired when user chooses to continue onboarding  | None                     |

### Contractor.ContractorProfile

A comprehensive form for creating and editing contractor profiles. Supports both individual and business contractor types, with different field sets for each. Includes options for wage type, self-onboarding invitations, and start date.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <Contractor.ContractorProfile
      companyId="a007e1ab-3595-43c2-ab4b-af7a5af2e365"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                     | Type   | Description                                                |
| ------------------------ | ------ | ---------------------------------------------------------- |
| **companyId** (Required) | string | The associated company identifier.                         |
| **contractorId**         | string | Optional contractor ID for editing an existing contractor. |
| **defaultValues**        | object | Default values for the contractor profile form fields.     |
| **onEvent** (Required)   |        | See events table for available events.                     |

#### Events

| Event type              | Description                                         | Data                                              |
| ----------------------- | --------------------------------------------------- | ------------------------------------------------- |
| CONTRACTOR_CREATED      | Fired when a new contractor is created successfully | Contractor object from the API response           |
| CONTRACTOR_UPDATED      | Fired when an existing contractor is updated        | Contractor object from the API response           |
| CONTRACTOR_PROFILE_DONE | Fired when the contractor profile step is complete  | { contractorId: string, selfOnboarding: boolean } |

### Contractor.Address

A form for collecting and updating a contractor's mailing address.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Contractor.Address contractorId="contractor-uuid" onEvent={() => {}} />
}
```

#### Props

| Name                        | Type   | Description                                                                      |
| --------------------------- | ------ | -------------------------------------------------------------------------------- |
| **contractorId** (Required) | string | The associated contractor identifier.                                            |
| **defaultValues**           | object | Default values for address fields: `street1`, `street2`, `city`, `state`, `zip`. |
| **onEvent** (Required)      |        | See events table for available events.                                           |

#### Events

| Event type                 | Description                                  | Data                                   |
| -------------------------- | -------------------------------------------- | -------------------------------------- |
| CONTRACTOR_ADDRESS_UPDATED | Fired when the contractor address is updated | Contractor address object from the API |
| CONTRACTOR_ADDRESS_DONE    | Fired when the address step is complete      | None                                   |

### Contractor.PaymentMethod

Manages the contractor's payment method, including adding a bank account for direct deposit or selecting check as the payment method.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Contractor.PaymentMethod contractorId="contractor-uuid" onEvent={() => {}} />
}
```

#### Props

| Name                        | Type   | Description                            |
| --------------------------- | ------ | -------------------------------------- |
| **contractorId** (Required) | string | The associated contractor identifier.  |
| **onEvent** (Required)      |        | See events table for available events. |

#### Events

| Event type                        | Description                                             | Data                                        |
| --------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| CONTRACTOR_BANK_ACCOUNT_CREATED   | Fired when a bank account is created for the contractor | Bank account object from the API response   |
| CONTRACTOR_PAYMENT_METHOD_UPDATED | Fired when the payment method is updated                | Payment method object from the API response |
| CONTRACTOR_PAYMENT_METHOD_DONE    | Fired when the payment method step is complete          | None                                        |

### Contractor.NewHireReport

Handles new hire reporting requirements for the contractor. Behavior varies based on whether the contractor is going through admin onboarding or self-onboarding.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Contractor.NewHireReport contractorId="contractor-uuid" onEvent={() => {}} />
}
```

#### Props

| Name                        | Type    | Description                                               |
| --------------------------- | ------- | --------------------------------------------------------- |
| **contractorId** (Required) | string  | The associated contractor identifier.                     |
| **selfOnboarding**          | boolean | When true, adjusts the form for the self-onboarding flow. |
| **onEvent** (Required)      |         | See events table for available events.                    |

#### Events

| Event type                         | Description                                     | Data                                    |
| ---------------------------------- | ----------------------------------------------- | --------------------------------------- |
| CONTRACTOR_NEW_HIRE_REPORT_UPDATED | Fired when the new hire report is updated       | Contractor object from the API response |
| CONTRACTOR_NEW_HIRE_REPORT_DONE    | Fired when the new hire report step is complete | None                                    |

### Contractor.ContractorSubmit

Finalizes the contractor onboarding process. Updates the onboarding status and, in the self-onboarding flow, can trigger an invitation to the contractor.

```jsx
import { Contractor } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Contractor.ContractorSubmit contractorId="contractor-uuid" onEvent={() => {}} />
}
```

#### Props

| Name                        | Type    | Description                                                     |
| --------------------------- | ------- | --------------------------------------------------------------- |
| **contractorId** (Required) | string  | The associated contractor identifier.                           |
| **selfOnboarding**          | boolean | When true, adjusts the submission for the self-onboarding flow. |
| **onEvent** (Required)      |         | See events table for available events.                          |

#### Events

| Event type                           | Description                                              | Data                                                         |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------ |
| CONTRACTOR_ONBOARDING_STATUS_UPDATED | Fired when the contractor's onboarding status is updated | Contractor onboarding status from the API                    |
| CONTRACTOR_SUBMIT_DONE               | Fired when the contractor submission is complete         | { message: string } or { onboardingStatus, message: string } |
| CONTRACTOR_INVITE_CONTRACTOR         | Fired when the contractor is invited for self-onboarding | { contractorId: string }                                     |
