---
title: Employee Management
order: 0
---

## Overview

The Employee Management namespace provides components for viewing and editing an employee's information after onboarding is complete. The headline entry point is the Employee Dashboard — a tabbed read/edit surface that covers basic details, job & pay, taxes, and documents — but every section of that dashboard is also exported individually so it can be composed into a custom layout, rendered in isolation, or replaced with a custom UI built on top of the same data hooks.

### Implementation

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <EmployeeManagement.DashboardFlow
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

> Legacy imports via `Employee.*` (e.g. `Employee.DashboardFlow`) continue to work.

## Using Employee Management Subcomponents

Employee management components can be used to compose your own workflow, or can be rendered in isolation. Each section of the dashboard is also exported as a self-contained block (e.g. `EmployeeManagement.Profile`) that wraps its read-only card surface, its edit form, and the transitions between them — drop it into any page and it works the same way that section works inside `DashboardFlow`. For guidance on creating a custom workflow, see [docs on composition](../../integration-guide/composition.md).

### Available Subcomponents

- [EmployeeManagement.DashboardFlow](#employeemanagementdashboardflow)
- [EmployeeManagement.PaymentMethod](#employeemanagementpaymentmethod)
  - [Composing from EmployeeManagement.PaymentMethodCard directly](#composing-from-employeemanagementpaymentmethodcard-directly)
- [EmployeeManagement.Deductions](#employeemanagementdeductions)
  - [Composing from EmployeeManagement.DeductionsCard and EmployeeManagement.DeductionsEditForm directly](#composing-from-employeemanagementdeductionscard-and-employeemanagementdeductionseditform-directly)
- [EmployeeManagement.Profile](#employeemanagementprofile)
  - [Composing from EmployeeManagement.ProfileCard and EmployeeManagement.ProfileEditForm directly](#composing-from-employeemanagementprofilecard-and-employeemanagementprofileeditform-directly)
- [EmployeeManagement.HomeAddress](#employeemanagementhomeaddress)
  - [Composing from EmployeeManagement.HomeAddressCard and EmployeeManagement.HomeAddressEditForm directly](#composing-from-employeemanagementhomeaddresscard-and-employeemanagementhomeaddresseditform-directly)
- [EmployeeManagement.WorkAddress](#employeemanagementworkaddress)
  - [Composing from EmployeeManagement.WorkAddressCard and EmployeeManagement.WorkAddressEditForm directly](#composing-from-employeemanagementworkaddresscard-and-employeemanagementworkaddresseditform-directly)
- [EmployeeManagement.PaystubsCard](#employeemanagementpaystubscard)
- [EmployeeManagement.FederalTaxes](#employeemanagementfederaltaxes)
  - [Composing from EmployeeManagement.FederalTaxesCard and EmployeeManagement.FederalTaxesEditForm directly](#composing-from-employeemanagementfederaltaxescard-and-employeemanagementfederaltaxeseditform-directly)
- [EmployeeManagement.StateTaxes](#employeemanagementstatetaxes)
  - [Composing from EmployeeManagement.StateTaxesCard and EmployeeManagement.StateTaxesEditForm directly](#composing-from-employeemanagementstatetaxescard-and-employeemanagementstatetaxeseditform-directly)

### EmployeeManagement.DashboardFlow

The main entry point for the employee dashboard. Renders a tabbed view of an employee's profile (Basic details, Job and pay, Taxes, Documents), wires the card surfaces to their corresponding edit screens via an internal state machine, and surfaces success alerts at the top of the dashboard after each successful edit. Wraps the dashboard in error and suspense boundaries via `BaseBoundaries`.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyApp() {
  return (
    <EmployeeManagement.DashboardFlow
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Description                                                                                                                |
| ------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                        |
| onEvent Required    | function            | See events table for the full event surface emitted by the dashboard and its inner card/edit components.                   |
| dictionary          | object              | Optional translations for component text. Keys are namespaced — see the source `Employee.Dashboard.json` for the full set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                    |
| LoaderComponent     | React.ComponentType | Optional custom loading indicator rendered while internal queries are pending.                                             |

#### Events

The dashboard forwards every event emitted by its card surfaces and edit screens to the partner via `onEvent`. The events below are the partner-visible surface; the dashboard's internal state machine also reacts to them to swap between card and edit views.

| Event type                                                   | Description                                                                                       | Data                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED                   | Fired when the "Edit" CTA is clicked on the Basic details card                                    | { employeeId: string }                                           |
| EMPLOYEE_PROFILE_MANAGEMENT_UPDATED                          | Fired after the basic-details edit form is successfully saved                                     | Updated `Employee` entity                                        |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED                   | Fired when the user clicks Cancel on the basic-details edit form                                  | None                                                             |
| EMPLOYEE_PROFILE_MANAGEMENT_ALERT_DISMISSED                  | Fired when the user dismisses the in-card "Profile updated" alert (standalone block path)         | None                                                             |
| EMPLOYEE_HOME_ADDRESS                                        | Fired when the "Manage" CTA is clicked on the Home address card                                   | { employeeId: string }                                           |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED              | Fired when the "Manage" CTA is clicked on the Work address card                                   | { employeeId: string }                                           |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_CREATED                     | Fired after a new work address is added on the work-address edit screen                           | Created `EmployeeWorkAddress` entity                             |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_UPDATED                     | Fired after a work address is updated on the work-address edit screen                             | Updated `EmployeeWorkAddress` entity                             |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_DELETED                     | Fired after a work address is deleted on the work-address edit screen                             | Deleted `EmployeeWorkAddress` entity                             |
| EMPLOYEE_COMPENSATION_CREATE                                 | Fired when the "Edit" CTA is clicked for an existing job (single- or multi-job views)             | { employeeId: string, job: Job }                                 |
| EMPLOYEE_JOB_ADD                                             | Fired when the "Add job" / "Add another job" CTA is clicked                                       | { employeeId: string }                                           |
| EMPLOYEE_JOB_ADD_ANOTHER                                     | Fired when "Add another job" is selected in the multi-job view                                    | { employeeId: string }                                           |
| EMPLOYEE_JOB_DELETED                                         | Fired after a non-primary job is deleted from the multi-job table                                 | Response from the Delete a job endpoint                          |
| EMPLOYEE_COMPENSATION_UPDATED                                | Fired after an Add / Add-another-job submission succeeds; surfaces the "Job added" alert          | Response from the Update a compensation endpoint                 |
| EMPLOYEE_COMPENSATION_DONE                                   | Fired after an Edit-compensation submission succeeds                                              | None                                                             |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED        | Fired when the "Add bank account" / "Add another bank account" CTA is clicked on the Payment card | None                                                             |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED       | Fired after a bank account is successfully created; surfaces the "Bank account added" alert       | Response from the Create a bank account endpoint                 |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED | Fired after a bank account is deleted; surfaces the "Bank account deleted" alert                  | Response from the Delete a bank account endpoint                 |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED      | Fired when the "Split paycheck" CTA is clicked on the Payment card                                | None                                                             |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED      | Fired after a split-paycheck save succeeds; surfaces the "Split updated" alert                    | Response from the Update payment method endpoint                 |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED            | Fired when the "Add deduction" CTA is clicked on the Deductions card                              | { employeeId: string }                                           |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED           | Fired when a row's "Edit" menu item is chosen on the Deductions card                              | The `Garnishment` row being edited                               |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED             | Fired after a new deduction is created; surfaces the "Deduction added" alert                      | The created `Garnishment`                                        |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED             | Fired after a deduction is updated; surfaces the "Deduction updated" alert                        | The updated `Garnishment`                                        |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED                  | Fired after the soft-delete dialog is confirmed; surfaces the "Deduction deleted" alert           | The now-inactive `Garnishment`                                   |
| EMPLOYEE_FEDERAL_TAXES_EDIT                                  | Fired when the "Edit" CTA is clicked on the Federal taxes card                                    | { employeeId: string, federalTaxes: EmployeeFederalTax }         |
| EMPLOYEE_FEDERAL_TAXES_DONE                                  | Fired after a federal-taxes save succeeds (from inside the dashboard's edit sub-flow)             | None                                                             |
| EMPLOYEE_STATE_TAXES_EDIT                                    | Fired when the "Edit" CTA is clicked on a per-state State taxes card                              | { employeeId: string, state: string }                            |
| EMPLOYEE_VIEW_FORM_TO_SIGN                                   | Fired when a document row's "View" CTA is clicked                                                 | { employeeId: string, formId: string }                           |
| EMPLOYEE_DASHBOARD_TAB_CHANGE                                | Fired when the user switches dashboard tabs                                                       | { tab: 'basicDetails' \| 'jobAndPay' \| 'taxes' \| 'documents' } |
| EMPLOYEE_DISMISS                                             | Fired when the user dismisses the top-of-dashboard success alert                                  | None                                                             |
| CANCEL                                                       | Fired when the user cancels an in-flight edit and returns to the card view                        | None                                                             |

### EmployeeManagement.PaymentMethod

A self-contained block for viewing and managing how an employee is paid — the same "Payment" experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome. Renders a read-only card listing the employee's direct-deposit bank accounts (nickname, routing number, and account type) along with "Add bank account", "Add another bank account", and "Split paycheck" actions. Choosing to add an account or split the paycheck swaps the card for the corresponding edit screen; saving returns to the card view with a dismissible success alert ("Bank account successfully added." or "Split payment successfully updated."), and cancelling returns without saving. Deleting a bank account from the card's row menu prompts for confirmation, then returns to the card with a "Bank account successfully deleted." alert.

This block is the canonical, most complete example of the standalone management-block pattern; the other Employee Management blocks follow the same structure.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeManagement.PaymentMethod
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Default | Description                                                                                                                                |
| ------------------- | ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| employeeId Required | string              |         | The associated employee identifier.                                                                                                        |
| onEvent Required    | function            |         | See events table for available events.                                                                                                     |
| isAdmin             | boolean             | true    | Whether the screens are presented in the admin context. When false, the experience is configured for employee self-service.                |
| dictionary          | object              |         | Optional translations for component text. Keys are namespaced under `Employee.Management.PaymentMethod` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType |         | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                    |

#### Events

| Event type                                                   | Description                                                                                                                         | Data                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED        | Fired when the user clicks "Add bank account" / "Add another bank account" on the card; the block opens the add-bank-account screen | None                                             |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED      | Fired when the user clicks "Split paycheck" on the card; the block opens the split-configuration screen                             | None                                             |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED       | Fired after a new bank account is saved; the block returns to the card view and surfaces the success alert                          | Response from the Create a bank account endpoint |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED      | Fired after the split configuration is saved; the block returns to the card view and surfaces the success alert                     | Response from the Update payment method endpoint |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED | Fired after the user confirms a bank-account deletion; the block returns to the card view and surfaces the success alert            | Response from the Delete a bank account endpoint |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_ALERT_DISMISSED           | Fired when the user dismisses a success alert above the card                                                                        | None                                             |
| CANCEL                                                       | Fired when the user clicks Cancel on the add-bank-account or split-configuration screen; the block returns to the card view         | None                                             |

#### Composing from EmployeeManagement.PaymentMethodCard directly

`EmployeeManagement.PaymentMethod` above is the recommended entry point for the payment-method experience — it bundles the card, the add-bank-account and split-paycheck edit screens, the swaps between them, and the success-alert wiring as a single drop-in. The read-only card is also exported individually, as `EmployeeManagement.PaymentMethodCard`, for cases where that orchestration is the wrong fit — for example, when the card needs to render read-only inside a custom layout, or when navigation to the add/split screens is driven by a router rather than an inline swap.

The add-bank-account and split-paycheck edit screens are also exported individually as `EmployeeManagement.PaymentMethodBankForm` and `EmployeeManagement.PaymentMethodSplitForm`, so the card and either edit screen can be rendered side-by-side on your own routes. Using the card directly means you own the response to its events: when the card emits `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED` or `EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED`, render the edit surface yourself (for example, by navigating to your own route and mounting the corresponding form export). To get the SDK's built-in add/split screens and the swap between them out of the box, use `EmployeeManagement.PaymentMethod` instead.

The card's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive your own behavior. The card emits one event when each header CTA is clicked and one after a bank account is deleted; it does not render success alerts (alert rendering is the orchestrator's responsibility).

```jsx
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyPaymentPanel({ employeeId, onAddBankAccount, onSplitPaycheck }) {
  return (
    <EmployeeManagement.PaymentMethodCard
      employeeId={employeeId}
      onEvent={(eventType, payload) => {
        if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED) {
          onAddBankAccount()
        } else if (
          eventType === componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED
        ) {
          onSplitPaycheck()
        } else if (
          eventType === componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED
        ) {
          // payload is the Delete a bank account endpoint response
        }
      }}
    />
  )
}
```

##### EmployeeManagement.PaymentMethodCard

**Props**

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

**Events**

| Event type                                                   | Description                                                                    | Data                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED        | Fired when the user clicks "Add bank account" / "Add another bank account"     | None                                             |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED      | Fired when the user clicks "Split paycheck"                                    | None                                             |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED | Fired after the user confirms a bank-account deletion from the card's row menu | Response from the Delete a bank account endpoint |

### EmployeeManagement.Deductions

A self-contained block for viewing and managing an employee's post-tax deductions. Renders a read-only card listing each deduction with its frequency and withholding amount; clicking "Add deduction" or a row's "Edit" menu item swaps the card for the add/edit form, saving returns to the card view with a dismissible success alert ("Deduction successfully added/updated"), and confirming the delete dialog removes a deduction and returns with a "Deduction successfully deleted" alert. Cancelling the form returns to the card view without saving. Wraps everything in error and suspense boundaries via `BaseBoundaries`.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeManagement.Deductions
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Description                                                                                                                             |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                     |
| onEvent Required    | function            | See events table for available events.                                                                                                  |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.Deductions` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                 |

#### Events

| Event type                                         | Description                                                                                        | Data                               |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED  | Fired when the "Add deduction" CTA is clicked on the card                                          | { employeeId: string }             |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED | Fired when a deduction's "Edit" menu item is chosen on the card                                    | The `Garnishment` row being edited |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED   | Fired after a new deduction is saved; the block returns to the card with the "added" alert         | The created `Garnishment`          |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED   | Fired after an existing deduction is saved; the block returns to the card with the "updated" alert | The updated `Garnishment`          |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED        | Fired after the delete dialog is confirmed; the block returns to the card with the "deleted" alert | The now-inactive `Garnishment`     |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED | Fired when the user clicks Cancel on the form; the block returns to the card view                  | None                               |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_ALERT_DISMISSED     | Fired when the user dismisses the success alert above the card                                     | null                               |

#### Composing from EmployeeManagement.DeductionsCard and EmployeeManagement.DeductionsEditForm directly

`EmployeeManagement.Deductions` above is the recommended entry point for the deductions experience — it bundles the card, the add/edit form, the swap between them, the delete dialog, and the success-alert wiring as a single drop-in. The card and edit form are also exported individually for cases where that orchestration is the wrong fit — for example, when the add/edit surface needs to render in a modal or drawer, when the card needs to appear read-only with no add/edit affordances, or when the swap is driven by a router. Using them directly means owning the swap, the alert, and any cross-component state yourself.

`EmployeeManagement.DeductionsCard` renders the read-only deductions card, self-fetches its rows, and emits events when "Add deduction" is clicked, a row's "Edit" item is chosen, or a deduction is deleted via its built-in confirm dialog. `EmployeeManagement.DeductionsEditForm` renders the add/edit form: omit `editingDeductionId` to open in add mode, or pass a deduction's `uuid` (e.g. from the `EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED` payload) to open in edit mode pre-populated with that garnishment. It emits one event on a successful create, another on a successful update, and another on cancel. Each piece's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive the swap. The per-piece events tables below list every event each piece emits.

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyDeductionsPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingDeduction, setEditingDeduction] = useState(null)

  if (isEditing) {
    return (
      <EmployeeManagement.DeductionsEditForm
        employeeId={employeeId}
        editingDeductionId={editingDeduction?.uuid}
        onEvent={eventType => {
          if (
            eventType === componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED ||
            eventType === componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED ||
            eventType === componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED
          ) {
            setEditingDeduction(null)
            setIsEditing(false)
          }
        }}
      />
    )
  }

  return (
    <EmployeeManagement.DeductionsCard
      employeeId={employeeId}
      onEvent={(eventType, payload) => {
        if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED) {
          setEditingDeduction(null)
          setIsEditing(true)
        } else if (
          eventType === componentEvents.EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED
        ) {
          setEditingDeduction(payload)
          setIsEditing(true)
        }
      }}
    />
  )
}
```

##### EmployeeManagement.DeductionsCard

**Props**

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

**Events**

| Event type                                         | Description                                         | Data                               |
| -------------------------------------------------- | --------------------------------------------------- | ---------------------------------- |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_ADD_REQUESTED  | Fired when the "Add deduction" CTA is clicked       | { employeeId: string }             |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_EDIT_REQUESTED | Fired when a deduction's "Edit" menu item is chosen | The `Garnishment` row being edited |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_CARD_DELETED        | Fired after the soft-delete dialog is confirmed     | The now-inactive `Garnishment`     |

##### EmployeeManagement.DeductionsEditForm

**Props**

| Name                | Type                | Description                                                                                                                             |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                     |
| onEvent Required    | function            | See events table for available events.                                                                                                  |
| editingDeductionId  | string              | When provided, opens the form in edit mode pre-populated with the matching deduction. Omit to open in add mode.                         |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.Deductions` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                 |

**Events**

| Event type                                         | Description                                                                         | Data                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CREATED   | Fired after a new deduction is saved                                                | The created `Garnishment` |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_UPDATED   | Fired after an existing deduction is saved                                          | The updated `Garnishment` |
| EMPLOYEE_MANAGEMENT_DEDUCTIONS_EDIT_FORM_CANCELLED | Fired when the user clicks Cancel and the orchestrator should swap back to the card | None                      |

### EmployeeManagement.Profile

A self-contained block for viewing and editing an employee's basic details — the same "Basic details" experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome. Renders a read-only card showing the employee's legal name, start date, masked social security number, date of birth, and personal email. Clicking the card's "Edit" CTA swaps the card view for an inline edit form; saving the form returns to the card view with a dismissible "Profile updated" success alert; cancelling returns to the card view without saving.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeManagement.Profile
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Description                                                                                                                          |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| employeeId Required | string              | The associated employee identifier.                                                                                                  |
| onEvent Required    | function            | See events table for available events.                                                                                               |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Profile.Management` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                              |

#### Events

| Event type                                  | Description                                                                             | Data                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED  | Fired when the user clicks the "Edit" CTA on the card                                   | { employeeId: string }    |
| EMPLOYEE_PROFILE_MANAGEMENT_UPDATED         | Fired after the edit form is successfully submitted; the block returns to the card view | Updated `Employee` entity |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED  | Fired when the user clicks Cancel on the edit form; the block returns to the card view  | None                      |
| EMPLOYEE_PROFILE_MANAGEMENT_ALERT_DISMISSED | Fired when the user dismisses the "Profile updated" success alert above the card        | None                      |

#### Composing from EmployeeManagement.ProfileCard and EmployeeManagement.ProfileEditForm directly

`EmployeeManagement.Profile` above is the recommended entry point for the basic-details experience — it bundles the card, the edit form, the swap between them, and the success-alert wiring as a single drop-in. The card and edit form are also exported individually for cases where that orchestration is the wrong fit — for example, when the edit surface needs to render in a modal or drawer, when the card needs to appear read-only with no edit affordance, or when the swap is driven by a router. Using them directly means owning the swap, the alert, and any cross-component state yourself.

`EmployeeManagement.ProfileCard` renders the read-only basic-details card and emits a single event when its "Edit" CTA is clicked. `EmployeeManagement.ProfileEditForm` renders the corresponding edit form and emits one event on a successful save and another on cancel. Each piece's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive the swap (and any of your own behavior, e.g. surfacing a success message after a save). The per-piece events tables below list every event each piece emits.

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyBasicDetailsPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EmployeeManagement.ProfileEditForm
        employeeId={employeeId}
        onEvent={eventType => {
          if (
            eventType === componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_UPDATED ||
            eventType === componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED
          ) {
            setIsEditing(false)
          }
        }}
      />
    )
  }

  return (
    <EmployeeManagement.ProfileCard
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED) {
          setIsEditing(true)
        }
      }}
    />
  )
}
```

##### EmployeeManagement.ProfileCard

**Props**

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

**Events**

| Event type                                 | Description                                           | Data                   |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------- |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED | Fired when the user clicks the "Edit" CTA on the card | { employeeId: string } |

##### EmployeeManagement.ProfileEditForm

**Props**

| Name                | Type                | Description                                                                                                               |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                       |
| onEvent Required    | function            | See events table for available events.                                                                                    |
| className           | string              | Optional class applied to the form's root section element.                                                                |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Profile` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                   |

**Events**

| Event type                                 | Description                                         | Data                      |
| ------------------------------------------ | --------------------------------------------------- | ------------------------- |
| EMPLOYEE_PROFILE_MANAGEMENT_UPDATED        | Fired after the edit form is successfully submitted | Updated `Employee` entity |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED | Fired when the user clicks Cancel on the edit form  | None                      |

### EmployeeManagement.HomeAddress

A self-contained block for viewing and managing an employee's home address — the same "Home address" experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome. Renders a read-only card showing the employee's current home address. Clicking the card's "Manage" CTA swaps the card view for an inline manage screen that surfaces the current address, the address history, and forms for editing the current address, adding a new one, or deleting a non-active one. Clicking Back returns to the card view; creates, updates, and deletes happen in place on the manage screen and do not navigate away.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeManagement.HomeAddress
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Description                                                                                                                              |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                      |
| onEvent Required    | function            | See events table for available events.                                                                                                   |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.HomeAddress.Management` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                  |

#### Events

| Event type                                      | Description                                                                                   | Data                             |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------- |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED | Fired when the user clicks the "Manage" CTA on the card; the block swaps to the manage screen | { employeeId: string }           |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_CANCELLED | Fired when the user clicks Back on the manage screen; the block returns to the card view      | None                             |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_CREATED        | Fired after a new home address is successfully created from the manage screen                 | Created `EmployeeAddress` entity |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_UPDATED        | Fired after an existing home address is successfully updated from the manage screen           | Updated `EmployeeAddress` entity |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_DELETED        | Fired after a non-active home address is successfully deleted from the manage screen          | Deleted `EmployeeAddress` entity |

#### Composing from EmployeeManagement.HomeAddressCard and EmployeeManagement.HomeAddressEditForm directly

`EmployeeManagement.HomeAddress` above is the recommended entry point for the home-address experience — it bundles the card, the manage screen, and the swap between them as a single drop-in. The card and edit form are also exported individually for cases where that orchestration is the wrong fit — for example, when the manage screen needs to render in a modal or drawer, when the card needs to appear read-only with no manage affordance, or when the swap is driven by a router. Using them directly means owning the swap and any cross-component state yourself.

`EmployeeManagement.HomeAddressCard` renders the read-only home-address card and emits a single event when its "Manage" CTA is clicked. `EmployeeManagement.HomeAddressEditForm` renders the corresponding manage screen and emits events on create, update, delete, and cancel. Each piece's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive the swap (and any of your own behavior, e.g. surfacing a success message after a save). The per-piece events tables below list every event each piece emits.

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyHomeAddressPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EmployeeManagement.HomeAddressEditForm
        employeeId={employeeId}
        onEvent={eventType => {
          if (eventType === componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_CANCELLED) {
            setIsEditing(false)
          }
        }}
      />
    )
  }

  return (
    <EmployeeManagement.HomeAddressCard
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED) {
          setIsEditing(true)
        }
      }}
    />
  )
}
```

##### EmployeeManagement.HomeAddressCard

**Props**

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

**Events**

| Event type                                      | Description                                             | Data                   |
| ----------------------------------------------- | ------------------------------------------------------- | ---------------------- |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED | Fired when the user clicks the "Manage" CTA on the card | { employeeId: string } |

##### EmployeeManagement.HomeAddressEditForm

**Props**

| Name                | Type                | Description                                                                                                                              |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                      |
| onEvent Required    | function            | See events table for available events.                                                                                                   |
| className           | string              | Optional class applied to the form's root section element.                                                                               |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.HomeAddress.Management` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                  |

**Events**

| Event type                                      | Description                                                   | Data                             |
| ----------------------------------------------- | ------------------------------------------------------------- | -------------------------------- |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_CREATED        | Fired after a new home address is successfully created        | Created `EmployeeAddress` entity |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_UPDATED        | Fired after an existing home address is successfully updated  | Updated `EmployeeAddress` entity |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_DELETED        | Fired after a non-active home address is successfully deleted | Deleted `EmployeeAddress` entity |
| EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_CANCELLED | Fired when the user clicks Back on the manage screen          | None                             |

### EmployeeManagement.WorkAddress

A self-contained block for viewing and managing an employee's work addresses — the same "Work address" experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome. Renders a read-only card showing the employee's current work address. Clicking the card's "Manage" CTA swaps the card view for an edit screen where the current address can be edited, a new address added, or an existing address deleted. The edit screen is modal-style: editing, changing, or deleting a row closes the modal but keeps the user on the edit screen so additional addresses can be managed in one sitting. Clicking Back returns to the card view.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeManagement.WorkAddress
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Description                                                                                                                              |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                      |
| onEvent Required    | function            | See events table for available events.                                                                                                   |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.WorkAddress` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                  |

#### Events

| Event type                                      | Description                                                                                 | Data                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED | Fired when the user clicks the "Manage" CTA on the card; the block swaps to the edit screen | { employeeId: string }               |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_CREATED        | Fired after a new work address is added; the block stays on the edit screen                 | Created `EmployeeWorkAddress` entity |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_UPDATED        | Fired after a work address is updated; the block stays on the edit screen                   | Updated `EmployeeWorkAddress` entity |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_DELETED        | Fired after a work address is deleted; the block stays on the edit screen                   | Deleted `EmployeeWorkAddress` entity |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED | Fired when the user clicks Back on the edit screen; the block returns to the card view      | None                                 |

#### Composing from EmployeeManagement.WorkAddressCard and EmployeeManagement.WorkAddressEditForm directly

`EmployeeManagement.WorkAddress` above is the recommended entry point for the work-address experience — it bundles the card, the edit screen, and the swap between them as a single drop-in. The card and edit form are also exported individually for cases where that orchestration is the wrong fit — for example, when the edit surface needs to render in a modal or drawer, when the card needs to appear read-only with no manage affordance, or when the swap is driven by a router. Using them directly means owning the swap and any cross-component state yourself.

`EmployeeManagement.WorkAddressCard` renders the read-only work-address card and emits a single event when its "Manage" CTA is clicked. `EmployeeManagement.WorkAddressEditForm` renders the corresponding edit screen and emits an event on each create, update, and delete, plus one on Back. Only the Back event (`EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED`) is meant to return to the card — the create/update/delete events keep the user on the edit screen so additional addresses can be managed, and are surfaced for your own use (e.g. a confirmation message). Each piece's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive the swap. The per-piece events tables below list every event each piece emits.

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyWorkAddressPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EmployeeManagement.WorkAddressEditForm
        employeeId={employeeId}
        onEvent={(eventType, data) => {
          if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED) {
            setIsEditing(false)
          } else if (
            eventType === componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_CREATED ||
            eventType === componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_UPDATED ||
            eventType === componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_DELETED
          ) {
            // These keep the user on the edit screen so additional addresses
            // can be managed; handle them here to surface your own confirmation.
          }
        }}
      />
    )
  }

  return (
    <EmployeeManagement.WorkAddressCard
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED) {
          setIsEditing(true)
        }
      }}
    />
  )
}
```

##### EmployeeManagement.WorkAddressCard

**Props**

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

**Events**

| Event type                                      | Description                                             | Data                   |
| ----------------------------------------------- | ------------------------------------------------------- | ---------------------- |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED | Fired when the user clicks the "Manage" CTA on the card | { employeeId: string } |

##### EmployeeManagement.WorkAddressEditForm

**Props**

| Name                | Type                | Description                                                                                                                              |
| ------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                      |
| onEvent Required    | function            | See events table for available events.                                                                                                   |
| className           | string              | Optional class applied to the form's root section element.                                                                               |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.WorkAddress` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                  |

**Events**

| Event type                                      | Description                                        | Data                                 |
| ----------------------------------------------- | -------------------------------------------------- | ------------------------------------ |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_CREATED        | Fired after a new work address is added            | Created `EmployeeWorkAddress` entity |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_UPDATED        | Fired after a work address is updated              | Updated `EmployeeWorkAddress` entity |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_DELETED        | Fired after a work address is deleted              | Deleted `EmployeeWorkAddress` entity |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED | Fired when the user clicks Back on the edit screen | None                                 |

### EmployeeManagement.PaystubsCard

A self-contained, read-only card for viewing an employee's paystubs — the same "Paystubs" surface the dashboard renders, drop-in usable anywhere. Renders a paginated table showing each payday, check amount, gross pay, and payment method, with a per-row download button. Clicking a row's download button fetches that paystub's PDF and opens it in a new browser tab — there is no edit surface or view to swap into; the card's only action is the download side effect.

Unlike most other `EmployeeManagement.*` components, the paystubs surface is exported only as a card and not as a block: there is no edit form to orchestrate transitions with, so the card is the entire feature. Render it inline anywhere a `<div>` would go; wrap it in your own error and suspense boundaries if you want fallback UI for those scenarios.

```jsx
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyPaystubsPanel({ employeeId }) {
  return (
    <EmployeeManagement.PaystubsCard
      employeeId={employeeId}
      onEvent={(eventType, payload) => {
        if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOADED) {
          // payload is { employeeId, payrollUuid }
        }
      }}
    />
  )
}
```

The card populates its "Payment method" column from the employee's payment method, which it fetches internally alongside the paystubs list — the per-paystub event payload does not carry the payment method itself.

#### Props

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

#### Events

| Event type                                           | Description                                                                   | Data                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOAD_REQUESTED | Fired when the user clicks a row's download button, before the PDF is fetched | { employeeId: string, payrollUuid: string } |
| EMPLOYEE_MANAGEMENT_PAYSTUBS_CARD_DOWNLOADED         | Fired after the paystub PDF is successfully fetched and opened in a new tab   | { employeeId: string, payrollUuid: string } |

### EmployeeManagement.FederalTaxes

A self-contained block for viewing and editing an employee's federal tax withholding settings — the same "Federal taxes" experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome. Renders a read-only card summarizing the employee's filing status, multiple-jobs election, dependents and other credits, other income, deductions, and extra withholding. Clicking the card's "Edit" CTA swaps the card view for an inline edit form; saving the form returns to the card view; cancelling returns to the card view without saving.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeManagement.FederalTaxes
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Description                                                                                                                               |
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                       |
| onEvent Required    | function            | See events table for available events.                                                                                                    |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.FederalTaxes` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                   |

#### Events

| Event type                                            | Description                                                                             | Data                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------- |
| EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED | Fired when the user clicks the "Edit" CTA on the card; the block swaps to the edit form | { employeeId: string }              |
| EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED | Fired after the edit form is successfully submitted; the block returns to the card view | Updated `EmployeeFederalTax` entity |
| EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED | Fired when the user clicks Cancel on the edit form; the block returns to the card view  | None                                |

#### Composing from EmployeeManagement.FederalTaxesCard and EmployeeManagement.FederalTaxesEditForm directly

`EmployeeManagement.FederalTaxes` above is the recommended entry point for the federal-taxes experience — it bundles the card, the edit form, and the swap between them as a single drop-in. The card and edit form are also exported individually for cases where that orchestration is the wrong fit — for example, when the edit surface needs to render in a modal or drawer, when the card needs to appear read-only with no edit affordance, or when the swap is driven by a router. Using them directly means owning the swap and any cross-component state yourself.

`EmployeeManagement.FederalTaxesCard` renders the read-only federal-taxes card and emits a single event when its "Edit" CTA is clicked. `EmployeeManagement.FederalTaxesEditForm` renders the corresponding edit form, emits one event on a successful save and another on cancel, and renders its own dismissible success alert above the form after a save (the card has no alert surface of its own). Each piece's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive the swap (and any of your own behavior). The per-piece events tables below list every event each piece emits.

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyFederalTaxesPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EmployeeManagement.FederalTaxesEditForm
        employeeId={employeeId}
        onEvent={(eventType, data) => {
          if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED) {
            // data is the updated EmployeeFederalTax entity
            setIsEditing(false)
          } else if (
            eventType === componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED
          ) {
            setIsEditing(false)
          }
        }}
      />
    )
  }

  return (
    <EmployeeManagement.FederalTaxesCard
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED) {
          setIsEditing(true)
        }
      }}
    />
  )
}
```

##### EmployeeManagement.FederalTaxesCard

**Props**

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

**Events**

| Event type                                            | Description                                           | Data                   |
| ----------------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED | Fired when the user clicks the "Edit" CTA on the card | { employeeId: string } |

##### EmployeeManagement.FederalTaxesEditForm

**Props**

| Name                | Type                | Description                                                                                                                               |
| ------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                       |
| onEvent Required    | function            | See events table for available events.                                                                                                    |
| defaultValues       | object              | Optional default values for the federal-taxes form fields. If employee data is available via the API, defaultValues will be overwritten.  |
| className           | string              | Optional class applied to the form's root section element.                                                                                |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.FederalTaxes` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                   |

**Events**

| Event type                                            | Description                                         | Data                                |
| ----------------------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED | Fired after the edit form is successfully submitted | Updated `EmployeeFederalTax` entity |
| EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED | Fired when the user clicks Cancel on the edit form  | None                                |

### EmployeeManagement.StateTaxes

A self-contained block for viewing and editing an employee's state tax withholding settings — the same "State taxes" experience the dashboard surfaces, but as a drop-in component that doesn't require the surrounding dashboard chrome. Renders a read-only card listing each work state's tax-withholding questions and the employee's current answers. Clicking the card's "Edit" CTA swaps the card view for an inline edit form; saving keeps the user on the form and surfaces a dismissible "Successfully updated state tax settings." alert; cancelling returns to the card view without saving. The "Edit" CTA is hidden when none of the employee's states have any withholding questions (e.g. a state with no income tax has nothing to edit).

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <EmployeeManagement.StateTaxes
      employeeId="4b3f930f-82cd-48a8-b797-798686e12e5e"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                | Description                                                                                                                             |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                     |
| onEvent Required    | function            | See events table for available events.                                                                                                  |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.StateTaxes` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                 |

#### Events

| Event type                                     | Description                                                                                                          | Data                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED | Fired when the user clicks the "Edit" CTA on the card; the block swaps to the edit form                              | { employeeId: string }                               |
| EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED        | Fired after the edit form is successfully saved; the block keeps the user on the form and surfaces the success alert | { employeeStateTaxesList: EmployeeStateTaxesList[] } |
| EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED | Fired when the user clicks Cancel on the edit form; the block returns to the card view                               | None                                                 |

#### Composing from EmployeeManagement.StateTaxesCard and EmployeeManagement.StateTaxesEditForm directly

`EmployeeManagement.StateTaxes` above is the recommended entry point for the state-taxes experience — it bundles the card, the edit form, the swap between them, and the success-alert wiring as a single drop-in. The card and edit form are also exported individually for cases where that orchestration is the wrong fit — for example, when the edit surface needs to render in a modal or drawer, when the card needs to appear read-only with no edit affordance, or when the swap is driven by a router. Using them directly means owning the swap and any cross-component state yourself.

`EmployeeManagement.StateTaxesCard` renders the read-only state-taxes card and emits a single event when its "Edit" CTA is clicked. `EmployeeManagement.StateTaxesEditForm` renders the corresponding edit form and emits one event on a successful save and another on cancel. A successful save does not navigate away — the edit form surfaces its own inline success alert and stays put, so only the cancel event (`EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED`) is meant to return to the card. Each piece's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive the swap (and any of your own behavior, e.g. surfacing a confirmation after a save). The per-piece events tables below list every event each piece emits.

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyStateTaxesPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EmployeeManagement.StateTaxesEditForm
        employeeId={employeeId}
        onEvent={(eventType, data) => {
          if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED) {
            setIsEditing(false)
          } else if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED) {
            // The form stays open after a save; handle this here to surface
            // your own confirmation or refresh related data.
          }
        }}
      />
    )
  }

  return (
    <EmployeeManagement.StateTaxesCard
      employeeId={employeeId}
      onEvent={eventType => {
        if (eventType === componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED) {
          setIsEditing(true)
        }
      }}
    />
  )
}
```

##### EmployeeManagement.StateTaxesCard

**Props**

| Name                | Type     | Description                            |
| ------------------- | -------- | -------------------------------------- |
| employeeId Required | string   | The associated employee identifier.    |
| onEvent Required    | function | See events table for available events. |

**Events**

| Event type                                     | Description                                           | Data                   |
| ---------------------------------------------- | ----------------------------------------------------- | ---------------------- |
| EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED | Fired when the user clicks the "Edit" CTA on the card | { employeeId: string } |

##### EmployeeManagement.StateTaxesEditForm

**Props**

| Name                | Type                | Description                                                                                                                             |
| ------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| employeeId Required | string              | The associated employee identifier.                                                                                                     |
| onEvent Required    | function            | See events table for available events.                                                                                                  |
| className           | string              | Optional class applied to the form's root section element.                                                                              |
| dictionary          | object              | Optional translations for component text. Keys are namespaced under `Employee.Management.StateTaxes` — see the source JSON for the set. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component used by the internal `BaseBoundaries` wrapper.                                                 |

**Events**

| Event type                                     | Description                                        | Data                                                 |
| ---------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------- |
| EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED        | Fired after the edit form is successfully saved    | { employeeStateTaxesList: EmployeeStateTaxesList[] } |
| EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED | Fired when the user clicks Cancel on the edit form | None                                                 |
