---
title: Employee Dashboard
description: Tabbed employee dashboard surface — basic details, job and pay, taxes, and documents — for viewing and managing an employee's payroll information after onboarding.
order: 5
---

## Overview

The Employee Dashboard provides a comprehensive view of employee information organized into four tabs: Basic details, Job and pay, Taxes, and Documents. This component serves as a central hub for viewing and managing employee data.

### Implementation

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <EmployeeManagement.DashboardFlow employeeId="employee-id" onEvent={() => {}} />
}
```

> Legacy import via `Employee.DashboardFlow` continues to work.

#### Props

| Name                | Type                | Description                                                     |
| ------------------- | ------------------- | --------------------------------------------------------------- |
| employeeId Required | string              | The employee identifier.                                        |
| onEvent Required    | function            | See events table for each subcomponent to see available events. |
| dictionary          | object              | Optional translations for component text.                       |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component.                       |

#### Events

| Event type                                                   | Description                                                     | Data                                                     |
| ------------------------------------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------- |
| EMPLOYEE_UPDATE                                              | Fired when editing basic details                                | { employeeId: string }                                   |
| EMPLOYEE_HOME_ADDRESS                                        | Fired when managing home address                                | { employeeId: string }                                   |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED              | Fired when the "Manage" CTA is clicked on the Work address card | { employeeId: string }                                   |
| EMPLOYEE_COMPENSATION_CREATE                                 | Fired when editing compensation                                 | { employeeId: string, job: Job }                         |
| EMPLOYEE_JOB_ADD                                             | Fired when adding a job (empty state or multi-job view)         | { employeeId: string }                                   |
| EMPLOYEE_JOB_DELETED                                         | Fired after a non-primary job is deleted from the table         | { employeeId: string, jobId: string }                    |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED        | Fired when adding a bank account from the Payment card          | None                                                     |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED      | Fired when splitting the paycheck from the Payment card         | None                                                     |
| EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED | Fired after a bank account is deleted from the Payment card     | Response from the Delete a bank account endpoint         |
| EMPLOYEE_DEDUCTION_ADD                                       | Fired when adding a deduction                                   | { employeeId: string }                                   |
| EMPLOYEE_FEDERAL_TAXES_EDIT                                  | Fired when editing federal taxes                                | { employeeId: string, federalTaxes: EmployeeFederalTax } |
| EMPLOYEE_STATE_TAXES_EDIT                                    | Fired when editing state taxes                                  | { employeeId: string, state: string }                    |
| EMPLOYEE_VIEW_FORM_TO_SIGN                                   | Fired when viewing a form                                       | { employeeId: string, formUuid: string }                 |

## Using Dashboard Subcomponents

The Dashboard workflow can be used through the wrapping flow component or rendered directly without the flow wrapper. The `EmployeeManagement` namespace also exports related steady-state components that are typically rendered in response to events emitted from the Dashboard (for example, an "Edit work address" CTA emits `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED` and your application should render `EmployeeManagement.WorkAddress` in response). For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- [EmployeeManagement.DashboardFlow](#employeemanagementdashboardflow)
- [Employee.Dashboard](#employeedashboard)
- [EmployeeManagement.EmployeeList](#employeemanagementemployeelist)
- [EmployeeManagement.WorkAddress](#employeemanagementworkaddress)
- [EmployeeManagement.StateTaxes](#employeemanagementstatetaxes)

> Legacy import via `Employee.DashboardFlow` continues to work.

### EmployeeManagement.DashboardFlow

The main entry point for the Employee Dashboard workflow. Wraps the dashboard with error boundaries, suspense, and provides a consistent loading/error experience. See the [Implementation](#implementation) section above for full props and events.

### Employee.Dashboard

The Dashboard component renders the tabbed interface directly without the flow wrapper. Use this when you want to embed the dashboard into a custom layout that already provides its own error boundaries.

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Employee.Dashboard employeeId="employee-id" onEvent={() => {}} />
}
```

#### Props

| Name                | Type     | Description                                                    |
| ------------------- | -------- | -------------------------------------------------------------- |
| employeeId Required | string   | The employee identifier.                                       |
| onEvent Required    | function | See events table for available events (same as DashboardFlow). |
| dictionary          | object   | Optional translations for component text.                      |

#### Events

`Employee.Dashboard` emits the same events as `EmployeeManagement.DashboardFlow`. See the events table at the top of this page.

### EmployeeManagement.EmployeeList

Displays a directory of employees for a company organized into Active, Onboarding, and Dismissed tabs. Supports adding, editing, dismissing, deleting, and rehiring employees. Typically used as the entry point that navigates the user to a specific employee's `DashboardFlow`.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <EmployeeManagement.EmployeeList companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type                                          | Default    | Description                                           |
| ------------------ | --------------------------------------------- | ---------- | ----------------------------------------------------- |
| companyId Required | string                                        |            | The associated company identifier.                    |
| onEvent Required   | function                                      |            | See events table for available events.                |
| initialTab         | `'active'` \| `'onboarding'` \| `'dismissed'` | `'active'` | The tab that is selected when the list first renders. |
| dictionary         | object                                        |            | Optional translations for component text.             |
| FallbackComponent  | React.ComponentType                           |            | Optional custom error fallback component.             |

#### Events

| Event type       | Description                                                | Data                   |
| ---------------- | ---------------------------------------------------------- | ---------------------- |
| EMPLOYEE_CREATE  | Fired when user clicks "Add employee"                      | None                   |
| EMPLOYEE_UPDATE  | Fired when user selects an employee to edit                | { employeeId: string } |
| EMPLOYEE_DISMISS | Fired when user chooses to dismiss/terminate an employee   | { employeeId: string } |
| EMPLOYEE_REHIRE  | Fired when user chooses to rehire a dismissed employee     | { employeeId: string } |
| EMPLOYEE_DELETED | Fired after an onboarding employee is successfully deleted | { employeeId: string } |

### EmployeeManagement.WorkAddress

A self-contained block for viewing and managing an employee's work addresses. Renders a read-only card; clicking the card's "Manage" CTA swaps the card view for an edit screen that supports adding, switching the active address (with an effective date), editing existing addresses, and deleting addresses. Typically rendered in response to the `EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED` event emitted from the Dashboard. See [employee-management.md](./employee-management/employee-management.md#employeemanagementworkaddress) for the full props and events surface.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <EmployeeManagement.WorkAddress employeeId="employee-id" onEvent={() => {}} />
}
```

#### Props

| Name                | Type                | Description                               |
| ------------------- | ------------------- | ----------------------------------------- |
| employeeId Required | string              | The employee identifier.                  |
| onEvent Required    | function            | See events table for available events.    |
| dictionary          | object              | Optional translations for component text. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component. |

#### Events

| Event type                                      | Description                                                                            | Data                                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED | Fired when the "Manage" CTA is clicked on the card; the block swaps to the edit screen | { employeeId: string }                                                                                                                             |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_CREATED        | Fired when a new work address is created on the edit screen                            | [Response from the Create a work address endpoint](https://docs.gusto.com/embedded-payroll/reference/post-v1-employees-employee_id-work_addresses) |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_UPDATED        | Fired when an existing work address is updated on the edit screen                      | [Response from the Update a work address endpoint](https://docs.gusto.com/embedded-payroll/reference/put-v1-work_addresses-work_address_uuid)      |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_DELETED        | Fired when a work address is deleted on the edit screen                                | The deleted `EmployeeWorkAddress` snapshot                                                                                                         |
| EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED | Fired when the user clicks Back on the edit screen; the block returns to the card view | None                                                                                                                                               |

### EmployeeManagement.StateTaxes

A standalone management screen for viewing and editing an employee's state tax withholding answers. Renders **Cancel** + **Save** buttons; Save surfaces a dismissible success alert and keeps the user on the screen. Admin-only questions (e.g. `file_new_hire_report`) are not shown — new-hire reporting is an onboarding-only concept. Typically rendered in response to the `EMPLOYEE_STATE_TAXES_EDIT` event emitted from the Dashboard.

```jsx
import { EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <EmployeeManagement.StateTaxes employeeId="employee-id" onEvent={() => {}} />
}
```

#### Props

| Name                | Type                | Description                               |
| ------------------- | ------------------- | ----------------------------------------- |
| employeeId Required | string              | The employee identifier.                  |
| onEvent Required    | function            | See events table for available events.    |
| dictionary          | object              | Optional translations for component text. |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component. |

#### Events

| Event type                   | Description                                                 | Data                                                   |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| EMPLOYEE_STATE_TAXES_UPDATED | Fired when state taxes are successfully saved               | `{ employeeStateTaxesList: EmployeeStateTaxesList[] }` |
| CANCEL                       | Fired when the user clicks the Cancel button without saving | None                                                   |

## Dashboard Tabs

### Basic Details

Displays core employee information:

- **Legal name**: Employee's full legal name
- **Start date**: Employment start date
- **Social security number**: Masked SSN for security
- **Date of birth**: Employee's date of birth
- **Personal email**: Employee's personal email address

**Address Information:**

- **Home address**: Current home address with "Manage" action
- **Work address**: Current work location with "Manage" action

All fields are read-only with "Edit" or "Manage" CTAs to navigate to editing flows.

### Job and Pay

Displays employment and payment information organized into four sections:

**Compensation:**

- When the employee has a single job: job title, employment type (Salaried, Hourly, etc.), wage/salary, and job start date, with an "Edit" CTA in the card header that emits `EMPLOYEE_COMPENSATION_CREATE` with the job.
- When the employee has multiple jobs (only possible when the primary job is nonexempt): a table of all jobs with columns for job title (with the pay rate beneath), pay type, and start date. Each row has a menu containing **Edit** (always; emits `EMPLOYEE_COMPENSATION_CREATE` with the row's job) and, for non-primary jobs only, **Delete** (opens a confirmation dialog; on confirm, deletes the job and emits `EMPLOYEE_JOB_DELETED`). The card header has no top-level Edit CTA in this state.
- An "Add another job" CTA renders in the card footer whenever the primary job is nonexempt (regardless of whether the employee currently has one job or many) and emits `EMPLOYEE_JOB_ADD`.

**Payment:**

- Bank accounts list (if any)
- Routing number, account type, and nickname for each account
- "Add bank account" CTA
- Supports pagination for multiple accounts

**Deductions:**

- List of active garnishments and deductions
- Deduction name, amount to withhold, frequency, and recurring status
- "Add deduction" CTA
- Supports pagination for multiple deductions

**Paystubs:**

- Historical paystub records
- Pay date, check amount, and gross pay for each paystub
- Supports pagination for paystub history

### Taxes

Displays tax withholding information in two sections:

**Federal Taxes:**

- Filing status
- Multiple jobs indicator (Yes/No)
- Dependents and other credits amount
- Other income amount
- Deductions amount
- Extra withholding amount
- "Edit" CTA to modify federal tax withholding

> **Note**: The dashboard supports both pre-2020 and Rev 2020 W4 versions. Fields displayed vary based on the W4 version on file.

**State Taxes:**

- Multiple state tax records (if applicable)
- State-specific tax questions and answers
- Dynamic questions based on state requirements
- Individual "Edit" CTA for each state

### Documents

Displays employee forms in a table format:

- Form title
- Year (for tax forms)
- Status (Draft or Final)
- Requires signing indicator (Yes/No)
- "View" CTA to open the form

Forms include W2s, W4s, direct deposit authorizations, and other employment documents.

## Data Loading

The Dashboard uses React Query with Suspense for data fetching. All API calls happen automatically when the component mounts:

- **Basic Details**: 3 parallel API calls (employee, home address, work address)
- **Job and Pay**: 5 parallel API calls (employee jobs, payment method, bank accounts, garnishments, paystubs)
- **Taxes**: 2 parallel API calls (federal taxes, state taxes)
- **Documents**: 1 API call (employee forms)

Loading states are handled per-tab, showing a loading spinner while data is being fetched. Errors are caught by the error boundary and display an error message.

## Empty States

Each section gracefully handles missing data:

- **Compensation**: Empty state with description; the header CTA switches from "Edit" to "Add job" and emits `EMPLOYEE_JOB_ADD`
- **Payment methods**: "No payment method on file" message with "Add bank account" CTA
- **Deductions**: Empty state with description and "Add deduction" CTA
- **Paystubs**: Empty state indicating paystubs appear after payroll is run
- **State taxes**: "No state taxes on file" message
- **Documents**: "No forms" message when no forms are available

## API Reference

The Dashboard component uses the following Gusto API endpoints:

### Basic Details

- `GET /v1/employees/{employee_id}` - Employee information
- `GET /v1/employees/{employee_id}/home_addresses` - Home address
- `GET /v1/employees/{employee_id}/work_addresses` - Work address

### Job and Pay

- `GET /v1/employees/{employee_id}/jobs` - Job information
- `GET /v1/employees/{employee_id}/payment_method` - Payment method
- `GET /v1/employees/{employee_id}/bank_accounts` - Bank accounts
- `GET /v1/employees/{employee_id}/garnishments` - Garnishments/deductions
- `GET /v1/employees/{employeeUuid}/pay_stubs` - Paystubs

### Taxes

- `GET /v1/employees/{employeeUuid}/federal_taxes` - Federal tax withholding
- `GET /v1/employees/{employeeUuid}/state_taxes` - State tax withholding

### Documents

- `GET /v1/employees/{employee_id}/forms` - Employee forms

For detailed API documentation, see the [Gusto API Reference](https://docs.gusto.com/embedded-payroll/reference).

## Integration Notes

### Error Handling

The Dashboard component is wrapped with `BaseBoundaries` which provides:

- React Error Boundary for runtime errors
- Suspense boundary for async data loading
- Consistent error display with optional custom fallback

To provide a custom error fallback:

```jsx
<Employee.DashboardFlow
  employeeId="employee-id"
  onEvent={() => {}}
  FallbackComponent={MyCustomErrorComponent}
/>
```

### Event Handling

All interactive elements emit events through the `onEvent` callback. Use these events to navigate to editing flows or trigger other actions in your application. Import and use the `componentEvents` constants for type safety:

```jsx
import { componentEvents, EmployeeManagement } from '@gusto/embedded-react-sdk'

function MyDashboard() {
  return (
    <EmployeeManagement.DashboardFlow
      employeeId="employee-id"
      onEvent={(eventType, data) => {
        switch (eventType) {
          case componentEvents.EMPLOYEE_UPDATE:
            // Navigate to employee edit form
            break
          case componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED:
            // Show bank account creation flow
            break
          case componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN:
            // Open form viewer/signer
            break
          // Handle other events...
        }
      }}
    />
  )
}
```

### Internationalization

The Dashboard supports custom translations through the `dictionary` prop. Default translations are in English. To override:

```jsx
<Employee.DashboardFlow
  employeeId="employee-id"
  onEvent={() => {}}
  dictionary={{
    title: 'Tableau de bord des employés',
    'tabs.basicDetails': 'Détails de base',
    // ... other translations
  }}
/>
```

See `src/i18n/en/Employee.Dashboard.json` for all available translation keys.

## Styling and Customization

The Dashboard uses the `ComponentsContext` pattern, allowing partners to override UI primitives:

```jsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
;<GustoProvider
  config={config}
  components={{
    Heading: MyCustomHeading,
    Button: MyCustomButton,
    Text: MyCustomText,
    // ... other component overrides
  }}
>
  <Employee.DashboardFlow {...props} />
</GustoProvider>
```

This enables complete visual customization while maintaining functionality.
