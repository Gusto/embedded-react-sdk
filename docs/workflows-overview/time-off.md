---
title: Time Off Policy Management
description: Workflow for creating and managing sick, vacation, and holiday policies — configure accruals, set limits, and assign employees from a unified policy list.
order: 6
---

The Time Off Policy Management workflow provides a complete experience for creating and managing time off policies for a company. It supports three policy types: **Sick**, **Vacation**, and **Holiday**. The flow guides users through selecting a policy type, configuring accrual rules, setting policy limits, and assigning employees.

Sick and vacation policies share a common creation flow — configure details, set accrual settings, then add employees. Holiday policies follow a separate path — select observed federal holidays, then assign employees. All policy types can be viewed, edited, and managed from the unified policy list.

## Implementation

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <TimeOff.TimeOffFlow companyId="your-company-id" onEvent={() => {}} />
}
```

### Props

| Name               | Type     | Description                                                     |
| ------------------ | -------- | --------------------------------------------------------------- |
| companyId Required | string   | The associated company identifier.                              |
| onEvent Required   | function | See events table for each subcomponent to see available events. |

### Events

The flow emits the following events as users navigate through the workflow:

| Event type                           | Description                                              | Data                                              |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------- |
| TIME_OFF_CREATE_POLICY               | Fired when user initiates policy creation                | None                                              |
| TIME_OFF_VIEW_POLICY                 | Fired when user selects a policy to view                 | { policyId: string, policyType: string }          |
| TIME_OFF_POLICY_TYPE_SELECTED        | Fired when user selects a policy type                    | { policyType: 'sick' \| 'vacation' \| 'holiday' } |
| TIME_OFF_POLICY_DETAILS_DONE         | Fired when policy details form is submitted              | { policyId: string, accrualMethod: string }       |
| TIME_OFF_POLICY_SETTINGS_DONE        | Fired when policy settings are saved                     | TimeOffPolicy response                            |
| TIME_OFF_POLICY_SETTINGS_BACK        | Fired when user navigates back from settings             | None                                              |
| TIME_OFF_ADD_EMPLOYEES_DONE          | Fired when employees are added to a sick/vacation policy | TimeOffPolicy response                            |
| TIME_OFF_HOLIDAY_SELECTION_DONE      | Fired when holiday selection is completed (create)       | None                                              |
| TIME_OFF_HOLIDAY_SELECTION_EDIT_DONE | Fired when holiday selection is completed (edit)         | None                                              |
| TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE  | Fired when employees are added to holiday policy         | HolidayPayPolicy response                         |
| TIME_OFF_BACK_TO_LIST                | Fired when user navigates back to the policy list        | None                                              |
| TIME_OFF_EDIT_POLICY                 | Fired when user edits a sick/vacation policy             | { policyId: string }                              |
| TIME_OFF_CHANGE_SETTINGS             | Fired when user edits policy settings                    | { policyId: string }                              |
| TIME_OFF_ADD_EMPLOYEES_TO_POLICY     | Fired when user adds employees from a policy detail      | { policyId: string }                              |
| TIME_OFF_HOLIDAY_ADD_EMPLOYEES       | Fired when user adds employees from holiday detail       | None                                              |
| TIME_OFF_EDIT_HOLIDAY_POLICY         | Fired when user edits the holiday policy                 | None                                              |
| TIME_OFF_DELETE_POLICY_DONE          | Fired when a policy is deactivated or deleted            | { policyId: string }                              |
| CANCEL                               | Fired when user cancels the current step                 | None                                              |

Error events are also emitted when API operations fail during creation or configuration:

| Event type                           | Description                                   | Data                                                             |
| ------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------- |
| TIME_OFF_POLICY_CREATE_ERROR         | Fired when policy creation fails              | { alert?: { type: string, title: string, content?: ReactNode } } |
| TIME_OFF_POLICY_SETTINGS_ERROR       | Fired when policy settings update fails       | { alert?: { type: string, title: string, content?: ReactNode } } |
| TIME_OFF_ADD_EMPLOYEES_ERROR         | Fired when adding employees to a policy fails | { alert?: { type: string, title: string, content?: ReactNode } } |
| TIME_OFF_HOLIDAY_CREATE_ERROR        | Fired when holiday policy creation fails      | { alert?: { type: string, title: string, content?: ReactNode } } |
| TIME_OFF_HOLIDAY_ADD_EMPLOYEES_ERROR | Fired when adding employees to holiday fails  | { alert?: { type: string, title: string, content?: ReactNode } } |

## Workflow Steps

The flow has two branches depending on the selected policy type:

### Sick / Vacation Branch

1. **Policy List**: View all existing policies with enrolled employee counts
2. **Policy Type Selector**: Choose between sick, vacation, or holiday
3. **Policy Configuration Form**: Set the policy name and accrual method
4. **Policy Settings**: Configure accrual caps, carry-over limits, waiting periods, and termination payout (skipped for unlimited accrual policies)
5. **Add Employees**: Select which employees to enroll, with optional starting balances
6. **Policy Detail**: View and manage the policy — edit details, change settings, add/remove employees, and edit individual balances

### Holiday Branch

1. **Policy List**: View all existing policies with enrolled employee counts
2. **Policy Type Selector**: Choose between sick, vacation, or holiday
3. **Holiday Selection Form**: Select which federal holidays to observe
4. **Add Employees (Holiday)**: Select which employees to enroll
5. **Holiday Policy Detail**: View and manage the policy with two tabs — an employees tab for managing enrollment and a schedule tab showing selected holidays with next observation dates

## Policy Types

| Type     | Description                                                   | API Family           |
| -------- | ------------------------------------------------------------- | -------------------- |
| Sick     | Sick leave policy with configurable accrual and balance rules | Time Off Policies    |
| Vacation | Vacation policy with configurable accrual and balance rules   | Time Off Policies    |
| Holiday  | Paid holiday policy based on US federal holidays              | Holiday Pay Policies |

> **Note**: Only one holiday policy can exist per company. The policy type selector disables the holiday option when a holiday policy already exists.

## Accrual Methods

Sick and vacation policies support the following accrual methods:

| Method               | Description                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Unlimited            | Employees have unlimited time off. No balance tracking or settings configuration required. |
| Per hour worked      | Accrues at a rate per hours worked. Optionally includes overtime and/or all paid hours.    |
| Per pay period       | Fixed amount accrues each pay period.                                                      |
| Per calendar year    | Fixed amount accrues once per year, resetting on a specified calendar date.                |
| Per anniversary year | Fixed amount accrues once per year, resetting on each employee's hire anniversary.         |

## Using Time Off Subcomponents

Time off components can be used to compose your own workflow, or can be rendered in isolation. For guidance on creating a custom workflow, see [docs on composition](../integration-guide/composition.md).

### Available Subcomponents

- [TimeOff.PolicyList](#timeoffpolicylist)
- [TimeOff.PolicyTypeSelector](#timeoffpolicytypeselector)
- [TimeOff.PolicyConfigurationForm](#timeoffpolicyconfigurationform)
- [TimeOff.PolicySettings](#timeoffpolicysettings)
- [TimeOff.AddEmployeesToPolicy](#timeoffaddemployeestopolicy)
- [TimeOff.HolidaySelectionForm](#timeoffholidayselectionform)
- [TimeOff.AddEmployeesHoliday](#timeoffaddemployeesholiday)
- [TimeOff.ViewHolidayEmployees](#timeoffviewholidayemployees)
- [TimeOff.ViewHolidaySchedule](#timeoffviewholidayschedule)
- [TimeOff.ViewHolidayPolicyDetails](#timeoffviewholidaypolicydetails)
- [TimeOff.TimeOffPolicyDetailPresentation](#timeofftimeoffpolicydetailpresentation)

### TimeOff.PolicyList

Displays all active time off policies (sick, vacation, and holiday) for a company. Each policy shows its name, type, and the number of enrolled employees. Users can create new policies, view/edit existing ones, or delete policies with a confirmation dialog.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <TimeOff.PolicyList companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

#### Events

| Event type                  | Description                                   | Data                                     |
| --------------------------- | --------------------------------------------- | ---------------------------------------- |
| TIME_OFF_CREATE_POLICY      | Fired when user clicks to create a new policy | None                                     |
| TIME_OFF_VIEW_POLICY        | Fired when user clicks on an existing policy  | { policyId: string, policyType: string } |
| TIME_OFF_DELETE_POLICY_DONE | Fired when a policy is successfully deleted   | { policyId: string }                     |

#### Features

- Lists all active sick and vacation policies from the time off policies API
- Merges the holiday pay policy (if one exists) into the same list
- Shows "All employees" or a count for each policy's enrollment
- Incomplete policies display a "Finish setup" action
- Deactivation (sick/vacation) and deletion (holiday) both require confirmation
- Success alerts are shown after deletion

### TimeOff.PolicyTypeSelector

Presents a selection UI for choosing between sick, vacation, and holiday policy types.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <TimeOff.PolicyTypeSelector companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type                                    | Description                               |
| ------------------ | --------------------------------------- | ----------------------------------------- |
| companyId Required | string                                  | The associated company identifier.        |
| onEvent Required   | function                                | See events table for available events.    |
| defaultPolicyType  | `'sick'` \| `'vacation'` \| `'holiday'` | Optional pre-selected policy type.        |
| dictionary         | object                                  | Optional translations for component text. |

#### Events

| Event type                    | Description                          | Data                                              |
| ----------------------------- | ------------------------------------ | ------------------------------------------------- |
| TIME_OFF_POLICY_TYPE_SELECTED | Fired when user confirms a selection | { policyType: 'sick' \| 'vacation' \| 'holiday' } |
| CANCEL                        | Fired when user cancels              | None                                              |

> **Note**: The holiday option is automatically disabled when a holiday policy already exists for the company.

### TimeOff.PolicyConfigurationForm

The main configuration form for creating or editing a sick or vacation policy. In create mode, it creates a new policy via the API. In edit mode (when `policyId` is provided), it loads the existing policy and updates it.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <TimeOff.PolicyConfigurationForm
      companyId="your-company-id"
      policyType="vacation"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                                   | Description                                                  |
| ------------------- | -------------------------------------- | ------------------------------------------------------------ |
| companyId Required  | string                                 | The associated company identifier.                           |
| policyType Required | `'sick'` \| `'vacation'`               | The type of policy to create or edit.                        |
| onEvent Required    | function                               | See events table for available events.                       |
| policyId            | string                                 | When provided, the form loads and edits the existing policy. |
| defaultValues       | Partial\<PolicyConfigurationFormData\> | Optional default values for form fields.                     |
| dictionary          | object                                 | Optional translations for component text.                    |

#### Events

| Event type                   | Description                                   | Data                                        |
| ---------------------------- | --------------------------------------------- | ------------------------------------------- |
| TIME_OFF_POLICY_DETAILS_DONE | Fired when the form is successfully submitted | { policyId: string, accrualMethod: string } |
| CANCEL                       | Fired when user cancels                       | None                                        |

#### Form Fields

- **Policy name**: Display name for the policy
- **Accrual method**: How time off accrues — one of:
  - **Unlimited**: No balance tracking
  - **Per hour worked**: Accrues based on hours worked, with options for overtime and all paid hours
  - **Fixed amount per year**: Accrues a fixed amount, distributed either all at once or per pay period
- **Accrual rate**: Number of hours accrued (per hour worked or per year, depending on method)
- **Accrual rate unit**: For hourly methods, the number of hours worked per unit of accrual (e.g. 1 hour per 30 hours worked)
- **Include overtime**: Whether overtime hours count toward accrual (hourly methods only)
- **All paid hours**: Whether all paid hours (vs. only worked hours) count toward accrual (hourly methods only)
- **Fixed distribution**: For fixed-amount methods, whether hours are granted all at once or distributed per pay period
- **Reset date type**: Whether the accrual resets on a calendar date or the employee's hire anniversary
- **Reset month / day**: The specific calendar date for annual resets (calendar year only)

### TimeOff.PolicySettings

Configures additional policy limits and rules for a sick or vacation policy. This step is skipped for policies with unlimited accrual.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <TimeOff.PolicySettings accrualMethod="hours_worked" onContinue={() => {}} onBack={() => {}} />
  )
}
```

#### Props

| Name                   | Type                                                                  | Description                                             |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| accrualMethod Required | `'hours_worked'` \| `'fixed_per_pay_period'` \| `'fixed_all_at_once'` | The accrual method category of the policy.              |
| onContinue Required    | function                                                              | Called with the form data when the user saves settings. |
| onBack Required        | function                                                              | Called when the user navigates back.                    |
| defaultValues          | Partial\<PolicySettingsFormData\>                                     | Optional default values for form fields.                |

> **Note**: `PolicySettings` is exported as a presentation component. When used inside the `TimeOffFlow`, the container component handles loading the policy and wiring up API calls. When used standalone, you provide the accrual method and handle submission yourself.

#### Form Fields

- **Accrual maximum**: Optional cap on how many hours can be accrued per year (not available for all-at-once distribution)
- **Balance maximum**: Optional cap on the total balance an employee can hold at any time
- **Carry-over limit**: Optional limit on how many hours carry over when the policy resets
- **Waiting period**: Optional number of days before a new employee begins accruing (not available for all-at-once distribution)
- **Paid out on termination**: Whether accrued balance is paid out when an employee is terminated

### TimeOff.AddEmployeesToPolicy

Employee selection screen for assigning employees to a sick or vacation policy. Supports search, pagination, and optional starting balances. When editing an existing policy's enrollment, removing employees requires confirmation.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <TimeOff.AddEmployeesToPolicy
      companyId="your-company-id"
      policyId="policy-uuid"
      policyType="vacation"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name                | Type                     | Description                               |
| ------------------- | ------------------------ | ----------------------------------------- |
| companyId Required  | string                   | The associated company identifier.        |
| policyId Required   | string                   | The time off policy identifier.           |
| policyType Required | `'sick'` \| `'vacation'` | The type of policy.                       |
| onEvent Required    | function                 | See events table for available events.    |
| dictionary          | object                   | Optional translations for component text. |

#### Events

| Event type                  | Description                            | Data                   |
| --------------------------- | -------------------------------------- | ---------------------- |
| TIME_OFF_ADD_EMPLOYEES_DONE | Fired when employee selection is saved | TimeOffPolicy response |
| CANCEL                      | Fired when user cancels                | None                   |

#### Features

- Displays all active employees with search filtering and pagination
- Pre-selects employees already enrolled in the policy (when editing)
- Carry-over balances are auto-populated from employees' existing paid time off data
- Users can manually set or override starting balances for each employee
- Shows a reassignment warning when employees are moved between policies
- Removing previously enrolled employees requires confirmation

### TimeOff.HolidaySelectionForm

Allows users to select which US federal holidays to include in the holiday pay policy. In create mode, it creates a new holiday policy. In edit mode, it updates the existing policy's holiday selections.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <TimeOff.HolidaySelectionForm companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type                   | Description                                                                 |
| ------------------ | ---------------------- | --------------------------------------------------------------------------- |
| companyId Required | string                 | The associated company identifier.                                          |
| onEvent Required   | function               | See events table for available events.                                      |
| mode               | `'create'` \| `'edit'` | Whether to create a new or edit an existing policy. Defaults to `'create'`. |
| dictionary         | object                 | Optional translations for component text.                                   |

#### Events

| Event type                           | Description                                 | Data |
| ------------------------------------ | ------------------------------------------- | ---- |
| TIME_OFF_HOLIDAY_SELECTION_DONE      | Fired when holidays are saved (create mode) | None |
| TIME_OFF_HOLIDAY_SELECTION_EDIT_DONE | Fired when holidays are saved (edit mode)   | None |
| CANCEL                               | Fired when user cancels                     | None |

#### Features

- Displays all 11 US federal holidays with their observed dates and next observation dates
- Select all / deselect all toggle
- In create mode, all federal holidays are selected by default
- In edit mode, the form is pre-populated with the policy's current selections

### TimeOff.AddEmployeesHoliday

Employee selection screen for assigning employees to the holiday pay policy. Functions similarly to `AddEmployeesToPolicy` but uses the holiday pay policy API.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <TimeOff.AddEmployeesHoliday companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

#### Events

| Event type                          | Description                            | Data                      |
| ----------------------------------- | -------------------------------------- | ------------------------- |
| TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE | Fired when employee selection is saved | HolidayPayPolicy response |
| CANCEL                              | Fired when user cancels                | None                      |

### TimeOff.ViewHolidayEmployees

Displays the holiday policy detail view with the employees tab selected. Shows enrolled employees with search filtering, and provides actions to add employees, edit the holiday selection, or remove employees.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <TimeOff.ViewHolidayEmployees companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

#### Events

| Event type                     | Description                                   | Data |
| ------------------------------ | --------------------------------------------- | ---- |
| TIME_OFF_HOLIDAY_ADD_EMPLOYEES | Fired when user clicks to add employees       | None |
| TIME_OFF_VIEW_HOLIDAY_SCHEDULE | Fired when user switches to the schedule tab  | None |
| TIME_OFF_EDIT_HOLIDAY_POLICY   | Fired when user clicks to edit holidays       | None |
| TIME_OFF_BACK_TO_LIST          | Fired when user navigates back to policy list | None |

### TimeOff.ViewHolidaySchedule

Displays the holiday policy detail view with the holidays tab selected. Shows the list of selected holidays with their next observation dates.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <TimeOff.ViewHolidaySchedule companyId="your-company-id" onEvent={() => {}} />
}
```

#### Props

| Name               | Type     | Description                               |
| ------------------ | -------- | ----------------------------------------- |
| companyId Required | string   | The associated company identifier.        |
| onEvent Required   | function | See events table for available events.    |
| dictionary         | object   | Optional translations for component text. |

#### Events

| Event type                      | Description                                   | Data |
| ------------------------------- | --------------------------------------------- | ---- |
| TIME_OFF_VIEW_HOLIDAY_EMPLOYEES | Fired when user switches to the employees tab | None |
| TIME_OFF_HOLIDAY_ADD_EMPLOYEES  | Fired when user clicks to add employees       | None |
| TIME_OFF_EDIT_HOLIDAY_POLICY    | Fired when user clicks to edit holidays       | None |
| TIME_OFF_BACK_TO_LIST           | Fired when user navigates back to policy list | None |

### TimeOff.ViewHolidayPolicyDetails

A convenience wrapper around the holiday policy detail view. Accepts an optional `defaultTab` to control which tab is initially displayed.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <TimeOff.ViewHolidayPolicyDetails
      companyId="your-company-id"
      defaultTab="employees"
      onEvent={() => {}}
    />
  )
}
```

#### Props

| Name               | Type                          | Description                                               |
| ------------------ | ----------------------------- | --------------------------------------------------------- |
| companyId Required | string                        | The associated company identifier.                        |
| onEvent Required   | function                      | See events table for available events.                    |
| defaultTab         | `'holidays'` \| `'employees'` | Which tab to display initially. Defaults to `'holidays'`. |
| dictionary         | object                        | Optional translations for component text.                 |

#### Events

See [ViewHolidayEmployees](#timeoffviewholidayemployees) and [ViewHolidaySchedule](#timeoffviewholidayschedule) for the full event tables — both sets of events are available depending on which tab is active.

### TimeOff.TimeOffPolicyDetailPresentation

The detail view for sick and vacation policies. Displays policy configuration, accrual settings, and a tabbed interface for viewing policy details and managing enrolled employees. Provides actions for editing the policy, changing settings, adding employees, removing employees, and editing individual employee balances.

```jsx
import { TimeOff } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return (
    <TimeOff.TimeOffPolicyDetailPresentation
      title="Vacation Policy"
      subtitle="Vacation"
      onBack={() => {}}
      backLabel="Back to policies"
      policyDetails={{ policyType: 'vacation', accrualMethod: 'unlimited' }}
      selectedTabId="details"
      onTabChange={() => {}}
      employees={{ data: [], searchValue: '', onSearchChange: () => {}, onSearchClear: () => {} }}
      removeDialog={{
        isOpen: false,
        employeeName: '',
        onConfirm: () => {},
        onClose: () => {},
        isPending: false,
      }}
    />
  )
}
```

#### Props

| Name                   | Type                  | Description                                                                                                                          |
| ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| title Required         | string                | The policy name displayed as the page heading.                                                                                       |
| subtitle               | string                | Secondary label (typically the policy type).                                                                                         |
| onBack Required        | function              | Called when user clicks the back navigation.                                                                                         |
| backLabel Required     | string                | Label for the back navigation link.                                                                                                  |
| actions                | ReactNode[]           | Optional action buttons displayed in the header (e.g. add employees, edit policy).                                                   |
| policyDetails Required | PolicyDetails         | Policy type and accrual configuration. See PolicyDetails type below.                                                                 |
| policySettings         | PolicySettingsDisplay | Accrual caps, carry-over, and termination settings. Required for non-unlimited policies.                                             |
| onChangeSettings       | function              | Called when user clicks to change settings. Only available for editable policies.                                                    |
| selectedTabId Required | string                | The currently active tab (`'details'` or `'employees'`).                                                                             |
| onTabChange Required   | function              | Called with the tab id when user switches tabs.                                                                                      |
| employees Required     | object                | Employee table data including `data`, `searchValue`, `onSearchChange`, `onSearchClear`, and optional `itemMenu` for per-row actions. |
| removeDialog Required  | RemoveDialogState     | State for the employee removal confirmation dialog.                                                                                  |
| successAlert           | string                | Optional success message displayed as a dismissible alert.                                                                           |
| onDismissAlert         | function              | Called when the success alert is dismissed.                                                                                          |

#### PolicyDetails Type

The `policyDetails` prop is a discriminated union:

- **Unlimited**: `{ policyType: 'vacation' | 'sick', accrualMethod: 'unlimited' }`
- **Rate-based**: `{ policyType: 'vacation' | 'sick', accrualMethod: string, accrualRate: number, accrualRateUnit?: number, resetDate?: string }`

When the accrual method is rate-based, the `policySettings` and `onChangeSettings` props become available.

#### PolicySettingsDisplay Type

| Field                    | Type           | Description                                 |
| ------------------------ | -------------- | ------------------------------------------- |
| maxAccrualHoursPerYear   | number \| null | Maximum hours that can accrue per year.     |
| maxHours                 | number \| null | Maximum balance an employee can hold.       |
| carryoverLimitHours      | number \| null | Maximum hours that carry over on reset.     |
| accrualWaitingPeriodDays | number \| null | Days before a new employee begins accruing. |
| paidOutOnTermination     | boolean        | Whether balance is paid out on termination. |

#### Features

- Tabbed interface with details and employees views
- Details tab shows accrual method, rate, reset date, and all policy settings
- Employees tab shows enrolled employees with search, per-row action menus, and balance display
- Edit balance modal for adjusting individual employee balances (non-unlimited policies only)
- Remove employee action with confirmation dialog
- Edit policy and change settings actions (for sick and vacation policies)

## Federal Holidays

The holiday selection form includes all 11 US federal holidays:

| Holiday          | Observed Date               |
| ---------------- | --------------------------- |
| New Year's Day   | January 1                   |
| MLK Day          | Third Monday in January     |
| Presidents' Day  | Third Monday in February    |
| Memorial Day     | Last Monday in May          |
| Juneteenth       | June 19                     |
| Independence Day | July 4                      |
| Labor Day        | First Monday in September   |
| Columbus Day     | Second Monday in October    |
| Veterans Day     | November 11                 |
| Thanksgiving     | Fourth Thursday in November |
| Christmas Day    | December 25                 |

## API Reference

The Time Off workflow uses two separate API families:

### Time Off Policies (Sick / Vacation)

- **List policies**: `GET /v1/companies/{company_uuid}/time_off_policies`
- **Create policy**: `POST /v1/companies/{company_uuid}/time_off_policies`
- **Get policy**: `GET /v1/time_off_policies/{time_off_policy_uuid}`
- **Update policy**: `PUT /v1/time_off_policies/{time_off_policy_uuid}`
- **Deactivate policy**: `PUT /v1/time_off_policies/{time_off_policy_uuid}/deactivate`
- **Add employees**: `PUT /v1/time_off_policies/{time_off_policy_uuid}/add_employees`
- **Remove employees**: `PUT /v1/time_off_policies/{time_off_policy_uuid}/remove_employees`
- **Update balance**: `PUT /v1/time_off_policies/{time_off_policy_uuid}/balance`

### Holiday Pay Policies

- **Get policy**: `GET /v1/companies/{company_uuid}/holiday_pay_policy`
- **Create policy**: `POST /v1/companies/{company_uuid}/holiday_pay_policy`
- **Update policy**: `PUT /v1/companies/{company_uuid}/holiday_pay_policy`
- **Delete policy**: `DELETE /v1/companies/{company_uuid}/holiday_pay_policy`
- **Add employees**: `PUT /v1/companies/{company_uuid}/holiday_pay_policy/add`
- **Remove employees**: `PUT /v1/companies/{company_uuid}/holiday_pay_policy/remove`
