# Employee Dashboard Component

Flow component for viewing employee information across multiple tabs.

## Structure

- **`DashboardFlow.tsx`** - Main Flow component with FSM (Finite State Machine)
- **`dashboardStateMachine.ts`** - FSM configuration (currently has only 'index' state)
- **`DashboardComponents.tsx`** - Context provider wrappers for Flow components
- **`Dashboard.tsx`** - Main presentation component with tabs and data fetching
- **`BasicDetailsView.tsx`** - View component for "Basic details" tab
- **`JobAndPayView.tsx`** - View component for "Job and pay" tab
- **`TaxesView.tsx`** - View component for "Taxes" tab
- **`DocumentsView.tsx`** - View component for "Documents" tab

## Tabs

1. **Basic details** - Employee personal information, home address, and work address
2. **Job and pay** - Compensation, payment methods, deductions, and paystubs
3. **Taxes** - Federal and state tax information
4. **Documents** - Employee forms

## Data Fetching

All data fetching is performed in `Dashboard` using React Query hooks:

### Basic Details Tab
- `useEmployeesGetSuspense` - Employee details
- `useEmployeeAddressesGetSuspense` - Home addresses
- `useEmployeeAddressesGetWorkAddressesSuspense` - Work addresses

### Job and Pay Tab
- `useEmployeesGetSuspense` - Employee jobs
- `useEmployeePaymentMethodGetSuspense` - Payment method
- `useEmployeePaymentMethodsGetBankAccountsSuspense` - Bank accounts
- `useGarnishmentsListSuspense` - Deductions/garnishments
- `usePayrollsGetPayStubsSuspense` - Paystubs history

### Taxes Tab
- `useEmployeeTaxSetupGetFederalTaxesSuspense` - Federal tax information (W4 form data)
- `useEmployeeTaxSetupGetStateTaxesSuspense` - State tax information (can have multiple states)

### Documents Tab
- `useEmployeeFormsListSuspense` - Employee forms list

## Event Handlers

All CTAs emit events via `useBase().onEvent`:

- **Basic Details**: `EMPLOYEE_UPDATE`, `EMPLOYEE_HOME_ADDRESS`, `EMPLOYEE_WORK_ADDRESS`
- **Job and Pay**: `EMPLOYEE_COMPENSATION_CREATE`, `EMPLOYEE_BANK_ACCOUNT_CREATE`, `EMPLOYEE_DEDUCTION_ADD`
- **Taxes**: `EMPLOYEE_FEDERAL_TAXES_UPDATED`, `EMPLOYEE_STATE_TAXES_UPDATED`
- **Documents**: `EMPLOYEE_VIEW_FORM_TO_SIGN`

## Tax Information

The Taxes tab displays two types of tax information:

### Federal Taxes
Displays W4 form data including:
- Filing status
- Multiple jobs indicator
- Dependents and other credits amount
- Other income amount
- Deductions amount
- Extra withholding amount

Note: The federal tax response structure varies based on the W4 version (pre-2020 vs. rev-2020). The component handles both versions using type guards.

### State Taxes
Displays state-specific tax withholding information. An employee can have multiple state tax records (e.g., home state and work state). Each state shows:
- State name
- State-specific tax questions and answers
- File new hire report indicator

The state tax questions and answers are dynamic based on the state's requirements.

## Documents

The Documents tab displays employee forms in a DataView table showing:
- Form title
- Year (for tax forms)
- Status (Draft or Final)
- Whether the form requires signing
- View action button

Forms include tax documents (W2, W4), direct deposit authorizations, and other employment documents. The "View" CTA emits the `EMPLOYEE_VIEW_FORM_TO_SIGN` event with the form UUID.

## Usage

```tsx
import { Dashboard } from '@/components/Employee'

<Dashboard
  companyId="company-uuid"
  employeeId="employee-uuid"
  onEvent={(event, data) => {
    // Handle events
  }}
/>
```

## Translations

Translations are defined in `/src/i18n/en/Employee.Dashboard.json`. Run `npm run i18n:generate` after modifying translations to regenerate TypeScript types.

## Storybook

View component in isolation:

```bash
npm run storybook
```

Navigate to `Domain/Employee/Dashboard` in Storybook.
