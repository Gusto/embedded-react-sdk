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
- [EmployeeManagement.Profile](#employeemanagementprofile)
  - [Composing from EmployeeManagement.ProfileCard and EmployeeManagement.EditProfile directly](#composing-from-employeemanagementprofilecard-and-employeemanagementeditprofile-directly)

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

| Event type                                  | Description                                                                                 | Data                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_REQUESTED  | Fired when the "Edit" CTA is clicked on the Basic details card                              | { employeeId: string }                                           |
| EMPLOYEE_PROFILE_MANAGEMENT_UPDATED         | Fired after the basic-details edit form is successfully saved                               | Updated `Employee` entity                                        |
| EMPLOYEE_PROFILE_MANAGEMENT_EDIT_CANCELLED  | Fired when the user clicks Cancel on the basic-details edit form                            | None                                                             |
| EMPLOYEE_PROFILE_MANAGEMENT_ALERT_DISMISSED | Fired when the user dismisses the in-card "Profile updated" alert (standalone block path)   | None                                                             |
| EMPLOYEE_HOME_ADDRESS                       | Fired when the "Manage" CTA is clicked on the Home address card                             | { employeeId: string }                                           |
| EMPLOYEE_WORK_ADDRESS                       | Fired when the "Manage" CTA is clicked on the Work address card                             | { employeeId: string }                                           |
| EMPLOYEE_COMPENSATION_CREATE                | Fired when the "Edit" CTA is clicked for an existing job (single- or multi-job views)       | { employeeId: string, job: Job }                                 |
| EMPLOYEE_JOB_ADD                            | Fired when the "Add job" / "Add another job" CTA is clicked                                 | { employeeId: string }                                           |
| EMPLOYEE_JOB_ADD_ANOTHER                    | Fired when "Add another job" is selected in the multi-job view                              | { employeeId: string }                                           |
| EMPLOYEE_JOB_DELETED                        | Fired after a non-primary job is deleted from the multi-job table                           | Response from the Delete a job endpoint                          |
| EMPLOYEE_COMPENSATION_UPDATED               | Fired after an Add / Add-another-job submission succeeds; surfaces the "Job added" alert    | Response from the Update a compensation endpoint                 |
| EMPLOYEE_COMPENSATION_DONE                  | Fired after an Edit-compensation submission succeeds                                        | None                                                             |
| EMPLOYEE_BANK_ACCOUNT_CREATE                | Fired when the "Add bank account" CTA is clicked                                            | { employeeId: string }                                           |
| EMPLOYEE_BANK_ACCOUNT_CREATED               | Fired after a bank account is successfully created; surfaces the "Bank account added" alert | Response from the Create a bank account endpoint                 |
| EMPLOYEE_BANK_ACCOUNT_DELETED               | Fired after a bank account is deleted; surfaces the "Bank account deleted" alert            | Response from the Delete a bank account endpoint                 |
| EMPLOYEE_SPLIT_PAYCHECK                     | Fired when the "Split paycheck" CTA is clicked                                              | { employeeId: string }                                           |
| EMPLOYEE_PAYMENT_METHOD_UPDATED             | Fired after a split-paycheck save succeeds; surfaces the "Split updated" alert              | Response from the Update payment method endpoint                 |
| EMPLOYEE_DEDUCTION_ADD                      | Fired when the "Add deduction" CTA is clicked                                               | { employeeId: string }                                           |
| EMPLOYEE_DEDUCTION_EDIT                     | Fired when an existing deduction is selected for editing                                    | The `Garnishment` entity being edited                            |
| EMPLOYEE_DEDUCTION_CREATED                  | Fired after a new deduction is created; surfaces the "Deduction added" alert                | Response from the Create a garnishment endpoint                  |
| EMPLOYEE_DEDUCTION_UPDATED                  | Fired after a deduction is updated; surfaces the "Deduction updated" alert                  | Response from the Update a garnishment endpoint                  |
| EMPLOYEE_DEDUCTION_DELETED                  | Fired after a deduction is deleted; surfaces the "Deduction deleted" alert                  | Response from the Update a garnishment endpoint                  |
| EMPLOYEE_FEDERAL_TAXES_EDIT                 | Fired when the "Edit" CTA is clicked on the Federal taxes card                              | { employeeId: string, federalTaxes: EmployeeFederalTax }         |
| EMPLOYEE_FEDERAL_TAXES_DONE                 | Fired after a federal-taxes save succeeds (from inside the dashboard's edit sub-flow)       | None                                                             |
| EMPLOYEE_STATE_TAXES_EDIT                   | Fired when the "Edit" CTA is clicked on a per-state State taxes card                        | { employeeId: string, state: string }                            |
| EMPLOYEE_VIEW_FORM_TO_SIGN                  | Fired when a document row's "View" CTA is clicked                                           | { employeeId: string, formId: string }                           |
| EMPLOYEE_DASHBOARD_TAB_CHANGE               | Fired when the user switches dashboard tabs                                                 | { tab: 'basicDetails' \| 'jobAndPay' \| 'taxes' \| 'documents' } |
| EMPLOYEE_DISMISS                            | Fired when the user dismisses the top-of-dashboard success alert                            | None                                                             |
| CANCEL                                      | Fired when the user cancels an in-flight edit and returns to the card view                  | None                                                             |

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

#### Composing from EmployeeManagement.ProfileCard and EmployeeManagement.EditProfile directly

`EmployeeManagement.Profile` above is the recommended entry point for the basic-details experience — it bundles the card, the edit form, the swap between them, and the success-alert wiring as a single drop-in. The card and edit form are also exported individually for cases where that orchestration is the wrong fit — for example, when the edit surface needs to render in a modal or drawer, when the card needs to appear read-only with no edit affordance, or when the swap is driven by a router. Using them directly means owning the swap, the alert, and any cross-component state yourself.

`EmployeeManagement.ProfileCard` renders the read-only basic-details card and emits a single event when its "Edit" CTA is clicked. `EmployeeManagement.EditProfile` renders the corresponding edit form and emits one event on a successful save and another on cancel. Each piece's `onEvent` receives the event type as its first argument and any associated payload as its second — branch on the event type to drive the swap (and any of your own behavior, e.g. surfacing a success message after a save). The per-piece events tables below list every event each piece emits.

```jsx
import { useState } from 'react'
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyBasicDetailsPanel({ employeeId }) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <EmployeeManagement.EditProfile
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

##### EmployeeManagement.EditProfile

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
