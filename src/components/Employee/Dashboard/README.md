# Employee Dashboard Component

A tabbed dashboard component for displaying employee information in the Embedded React SDK.

## Structure

```
src/components/Employee/Dashboard/
├── Dashboard.tsx                    # Main Flow component (entry point)
├── DashboardComponents.tsx          # Contextual components that connect to Flow context
├── DashboardView.tsx                # Main component with tabs UI and all data fetching
├── BasicDetailsView.tsx             # Basic details tab view (3 boxes)
├── JobAndPayView.tsx                # Job and pay tab view (4 boxes with DataView)
├── Dashboard.stories.tsx            # Storybook stories
├── dashboardStateMachine.ts         # FSM definition (currently just initial state)
├── README.md                        # This file
└── index.ts                         # Public exports
```

## Usage

```tsx
import { Dashboard } from '@/components/Employee/Dashboard'

<Dashboard 
  companyId="company-123" 
  employeeId="employee-456" 
  onEvent={(type, data) => console.log(type, data)} 
/>
```

## Architecture

### Flow Pattern

The Dashboard follows the SDK's Flow architecture pattern:

1. **Dashboard.tsx** - Creates and manages the state machine, wraps content in `<Flow>` component
2. **dashboardStateMachine.ts** - Defines FSM states and transitions using robot3
3. **DashboardComponents.tsx** - Provides contextual components that access Flow context via `useFlow()`
4. **DashboardView.tsx** - Main presentation component with tab-based UI and data fetching
5. **BasicDetailsView.tsx** - Extracted view component for Basic Details tab content

### Component Hierarchy

```
Dashboard (Flow wrapper)
  └─ DashboardView (tabs + all data fetching)
       ├─ BasicDetailsView (3 boxes: Basic details, Home address, Work address)
       └─ JobAndPayView (4 boxes: Compensation, Payment, Deductions, Paystubs)
```

### Tabs

The dashboard has 4 tabs:

- **Basic details** - Displays employee information in 3 boxes:
  1. **Basic details box**: Legal name, start date, SSN (masked), date of birth, personal email + "Edit" button
  2. **Home address box**: Current home address + "Manage" button
  3. **Work address box**: Current work address + "Manage" button

- **Job and pay** - Displays compensation and financial information in 4 boxes:
  1. **Compensation box**: Job title, type (salary/hourly), wage, start date + "Edit" button
  2. **Payment box**: List of bank accounts with routing number and account type + "Add bank account" button
  3. **Deductions box**: DataView table showing deduction name, frequency, and withhold amount + "Add deduction" button
  4. **Paystubs box**: DataView table showing payday, check amount, gross pay, and payment method

- **Taxes** - Federal and state tax withholdings (placeholder)
- **Documents** - Employee documents (placeholder)

Each tab currently shows placeholder content. The next step is to replace these with actual components.

## Data Fetching

The `DashboardView` component fetches data from six Gusto API endpoints:

### Basic Details Tab

1. **Employee data**: `useEmployeesGetSuspense({ employeeId })`  
   - Fetches basic employee information (name, email, date of birth, SSN status, jobs)
   
2. **Home addresses**: `useEmployeeAddressesGetSuspense({ employeeId })`  
   - Fetches all home addresses for the employee
   - Displays the active address
   
3. **Work addresses**: `useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })`  
   - Fetches all work addresses for the employee
   - Displays the active address

### Job and Pay Tab

4. **Payment method**: `useEmployeePaymentMethodGetSuspense({ employeeId })`  
   - Fetches employee payment method configuration

5. **Bank accounts**: `useEmployeePaymentMethodsGetBankAccountsSuspense({ employeeId })`  
   - Fetches list of employee bank accounts
   - Used in Payment box

6. **Garnishments/Deductions**: `useGarnishmentsListSuspense({ employeeId })`  
   - Fetches all deductions/garnishments for the employee
   - Displayed in DataView with pagination

7. **Paystubs**: `usePayrollsGetPayStubsSuspense({ employeeId })`  
   - Fetches paystub history for the employee
   - Displayed in DataView with pagination

All hooks use React Query with Suspense for automatic caching, refetching, and error handling. The parent Flow component handles loading states.

Currently, the FSM has only an initial state (`index`). As the dashboard functionality is built out, additional states and transitions can be added to handle:

- Loading states
- Navigation between different views within tabs
- Error states
- Async operations

## Translations

Translations are defined in `/src/i18n/en/Employee.Dashboard.json`:

```json
{
  "title": "Employee Dashboard",
  "tabsLabel": "Employee dashboard tabs",
  "tabs": {
    "basicDetails": "Basic details",
    "jobAndPay": "Job and pay",
    "taxes": "Taxes",
    "documents": "Documents"
  },
  "placeholders": { ... }
}
```

Run `npm run i18n:generate` after modifying translations to regenerate TypeScript types.

## Storybook

View component in isolation:
```bash
npm run storybook
```

Navigate to `Domain/Employee/Dashboard` in Storybook.

## Next Steps

1. Replace placeholder content with actual components for each tab
2. Add data fetching hooks for employee information
3. Extend FSM with additional states/transitions as needed
4. Add more comprehensive tests for each tab's functionality
5. Implement tab-specific actions and interactions
