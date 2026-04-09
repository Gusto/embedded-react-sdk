---
title: Employee Dashboard
order: 5
---

## Overview

The Employee Dashboard provides a comprehensive view of employee information organized into four tabs: Basic details, Job and pay, Taxes, and Documents. This component serves as a central hub for viewing and managing employee data.

### Implementation

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyApp() {
  return <Employee.DashboardFlow employeeId="employee-id" onEvent={() => {}} />
}
```

#### Props

| Name                | Type                | Description                                                     |
| ------------------- | ------------------- | --------------------------------------------------------------- |
| employeeId Required | string              | The employee identifier.                                        |
| onEvent Required    | function            | See events table for each subcomponent to see available events. |
| dictionary          | object              | Optional translations for component text.                       |
| FallbackComponent   | React.ComponentType | Optional custom error fallback component.                       |

#### Events

| Event type                      | Description                      | Data                                                     |
| ------------------------------- | -------------------------------- | -------------------------------------------------------- |
| `employee/update`               | Fired when editing basic details | { employeeId: string }                                   |
| `employee/addresses/home`       | Fired when managing home address | { employeeId: string }                                   |
| `employee/addresses/work`       | Fired when managing work address | { employeeId: string }                                   |
| `employee/compensations/update` | Fired when editing compensation  | { employeeId: string, job: Job }                         |
| `employee/bankAccount/create`   | Fired when adding a bank account | { employeeId: string }                                   |
| `employee/deductions/add`       | Fired when adding a deduction    | { employeeId: string }                                   |
| `employee/federalTaxes/edit`    | Fired when editing federal taxes | { employeeId: string, federalTaxes: EmployeeFederalTax } |
| `employee/stateTaxes/edit`      | Fired when editing state taxes   | { employeeId: string, state: string }                    |
| `employee/forms/view`           | Fired when viewing a form        | { employeeId: string, formUuid: string }                 |

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

- Job title
- Employment type (Salaried, Hourly, etc.)
- Wage/salary
- Job start date
- "Edit" CTA to modify compensation

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

## Using Dashboard as a Standalone Component

The Dashboard component can be used directly without the Flow wrapper for embedding into custom layouts:

```jsx
import { Employee } from '@gusto/embedded-react-sdk'

function MyComponent() {
  return <Employee.Dashboard employeeId="employee-id" onEvent={() => {}} />
}
```

This renders the tabbed interface with all data fetching and state management handled automatically.

## Data Loading

The Dashboard uses React Query with Suspense for data fetching. All API calls happen automatically when the component mounts:

- **Basic Details**: 3 parallel API calls (employee, home address, work address)
- **Job and Pay**: 5 parallel API calls (employee jobs, payment method, bank accounts, garnishments, paystubs)
- **Taxes**: 2 parallel API calls (federal taxes, state taxes)
- **Documents**: 1 API call (employee forms)

Loading states are handled per-tab, showing a loading spinner while data is being fetched. Errors are caught by the error boundary and display an error message.

## Empty States

Each section gracefully handles missing data:

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

All interactive elements emit events through the `onEvent` callback. Use these events to navigate to editing flows or trigger other actions in your application:

```jsx
<Employee.DashboardFlow
  employeeId="employee-id"
  onEvent={(eventType, data) => {
    switch (eventType) {
      case 'employee/update':
        // Navigate to employee edit form
        break
      case 'employee/bankAccount/create':
        // Show bank account creation flow
        break
      case 'employee/forms/view':
        // Open form viewer/signer
        break
      // Handle other events...
    }
  }}
/>
```

Alternatively, you can import and use the `componentEvents` constants for type safety:

```jsx
import { componentEvents } from '@gusto/embedded-react-sdk'
;<Employee.DashboardFlow
  employeeId="employee-id"
  onEvent={(eventType, data) => {
    switch (eventType) {
      case componentEvents.EMPLOYEE_UPDATE:
        // Navigate to employee edit form
        break
      case componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE:
        // Show bank account creation flow
        break
      case componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN:
        // Open form viewer/signer
        break
      // Handle other events...
    }
  }}
/>
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
