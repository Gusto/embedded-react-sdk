# Contractor Payment Flow Specification

## Overview

The Contractor Payment flow enables companies to create, manage, and track payments to contractors.
This flow handles different payment methods (Direct Deposit, Check, Historical Payment), supports
both hourly and fixed wage types, and provides comprehensive payment tracking and receipt
generation.

## Core Functionality

### What it does

- Creates payments for onboarded and active contractors
- Supports multiple payment methods and wage types
- Generates payment previews with bank account debiting details
- Tracks payment history and status
- Provides payment receipts for funded direct deposits
- Handles payment cancellations
- Integrates with company bank accounts for direct deposits

## Screen Flow & Navigation

### 1. Contractor Payments Index (`/company/contractor_payments`)

**Purpose**: View payment history and access payment creation

**Fields Displayed**:

- Date filter dropdown (Last 3 months, Last 6 months, Last 12 months)
- Payment history table with:
  - Payment date (clickable link to detail view)
  - Reimbursement total
  - Wage total
  - Number of contractors paid

**Actions**:

- Filter by date range
- Navigate to "Create contractor payment"
- Click payment date to view by-check-date details

**Navigation**:

- Primary action: "Create contractor payment" → `/new`
- Date links → `/by_check_date/:date`

### 2. Create New Contractor Payment (`/company/contractor_payments/new`)

**Purpose**: Create new contractor payments

**Required Fields**:

- **Check Date**: Date when contractors will be paid (prepopulated with 4 business days from current
  date)

**Contractor Payment Table Fields** (per contractor):

- **Contractor Name** (read-only, display name)
- **Wage Type** (read-only: "Hourly" with rate or "Fixed")
- **Payment Method** (read-only: Direct Deposit, Check, or Historical Payment)
- **Hours** (editable for hourly contractors, decimal format)
- **Wage** (editable for fixed wage contractors, currency format)
- **Bonus** (editable, currency format)
- **Reimbursement** (editable, currency format)
- **Total** (calculated, currency format)

**Edit Modal Fields** (accessible via edit button):

- **Hours**: Input with "hrs" unit, supports decimal values
- **Fixed Pay**: Currency input for fixed wage amounts
- **Bonus**: Currency input for additional earnings
- **Reimbursements**: Currency input for expense reimbursements
- **Payment Method**: Radio buttons (Check, Direct Deposit, Historical Payment)
- **Total Pay**: Calculated display showing sum of all components

**Table Footer**:

- Displays column totals for wages, bonus, reimbursement, and grand total

**Actions**:

- Edit individual contractor payments via kebab menu
- Continue to preview
- Back to index

**Validation Rules**:

- At least one payment field (hours, wage, bonus, reimbursement) must be non-zero
- Check date must be valid date format
- Hours must be decimal format for hourly contractors
- All monetary amounts must be valid currency format

**Navigation**:

- Continue → Preview (Ajax call to `/preview`)
- Back → Index (`/company/contractor_payments`)

### 3. Payment Preview (Ajax Modal/Inline)

**Purpose**: Review payment details before submission

**Fields Displayed**:

- **Total Amount**: Sum of all contractor payments
- **Total Debit Amount**: Amount to be debited from company account
- **Debit Account**: Company bank account details (hidden account number)
- **Debit Date**: When funds will be debited (for direct deposit)
- **Pay Date**: When contractors receive payment

**Actions**:

- Submit payment (creates actual payments)
- Edit payments (returns to edit mode)

**Validation**:

- All payment validations re-run
- Bank account validation for direct deposits
- Date validation for payment timing

### 4. Payment History by Date (`/company/contractor_payments/by_check_date/:date`)

**Purpose**: View all payments made on a specific date

**Fields Displayed**:

- Payment date header
- Table of payments with:
  - Contractor name
  - Payment method
  - Hours (for hourly)
  - Wage amount
  - Bonus amount
  - Reimbursement amount
  - Total amount

**Actions**:

- View individual payment details
- Cancel individual payments (with confirmation)
- Return to main index

**Navigation**:

- View → Payment detail (`/show/:id`)
- Back → Index

### 5. Individual Payment Detail (`/company/contractor_payments/:id`)

**Purpose**: View detailed payment information and receipt

**Fields Displayed**:

- Contractor name
- Payment date
- Payment method (Direct Deposit or Check)
- Detailed breakdown:
  - Hourly rate (for hourly contractors)
  - Hours worked (for hourly contractors)
  - Fixed wage amount (for fixed contractors)
  - Reimbursement amount
  - Bonus amount
  - Total amount

**Payment Receipt** (for funded direct deposits):

- From/To information
- Debit date details
- Total company debit amount
- Legal disclaimers and licensing information

**Navigation**:

- Back → By check date view

## Data Models & Field Requirements

### ContractorPayment Record

- `uuid`: Unique payment identifier
- `contractor_uuid`: Reference to contractor
- `payment_method`: "Direct Deposit", "Check", or "Historical Payment"
- `wage_type`: "Hourly" or "Fixed" (inherited from contractor)
- `status`: Payment status ("Funded", etc.)
- `date`: Payment date
- `bonus`: Decimal, bonus amount
- `hours`: Decimal, hours worked
- `reimbursement`: Decimal, reimbursement amount
- `hourly_rate`: Decimal, contractor's hourly rate
- `wage`: Decimal, wage amount
- `wage_total`: Decimal, calculated wage total
- `may_cancel`: Boolean, whether payment can be canceled
- `excluded`: Boolean, whether contractor is excluded from payment
- `disable_payment_change`: Boolean, restricts payment method changes

### ContractorPaymentGroup

- `check_date`: Date when payments are issued
- `contractor_payments`: Array of ContractorPayment records
- `creation_token`: Unique token for duplicate prevention
- `totals`: Summary amounts for the group

## Business Rules & Validation

### Contractor Eligibility

- Contractor must be onboarded (`onboarded: true`)
- Contractor must be active (`is_active: true`)
- Contractor must have valid payment method setup

### Payment Validation

- At least one payment field must have non-zero value
- Check date must be valid and in acceptable range
- Hours must be decimal format (for hourly contractors)
- Monetary amounts must be valid currency format
- Payment method changes restricted for contractors with "Check" payment method

### Payment Timing

- Direct deposit payments: 4 business days default lead time
- Payments submitted before 4pm PT on business day process within specified timeframe
- Different payment speeds available based on company configuration

### Bank Account Requirements

- Company must have valid bank account for direct deposits
- Account verification required for new accounts

## Payment Methods

### Direct Deposit

- Requires verified company bank account
- Provides payment receipts when funded
- Debits company account on specified debit date
- Faster processing option available

### Check

- Requires manual check writing by company
- No automatic fund transfer
- Payment method cannot be changed if contractor setup as check-only

### Historical Payment

- For recording payments made outside the system
- No actual fund transfer
- Used for record-keeping purposes

## Integration Points

### External APIs

- Company bank account validation
- Payment processing and status updates
- Receipt generation for funded payments

### Flow Navigation

- Integrates with company onboarding flow
- Links to contractor management features
- Connects to company bank account setup

## Error Handling

### Common Error Scenarios

- No eligible contractors (all excluded or inactive)
- Invalid payment amounts or dates
- Bank account verification issues
- Payment processing failures
- Network timeouts during submission

### Error Display

- Form validation errors shown inline
- API errors displayed as flash messages
- Modal validation errors prevent submission
- Date-specific errors highlighted separately

## Success States

### Payment Creation

- Success message with count of payments created
- Redirect to payment history index
- Flash notification of successful submission

### Payment Cancellation

- Confirmation dialog required
- Success/error flash messages
- Return to by-check-date view

## Accessibility & UX Features

### Keyboard Navigation

- Full keyboard accessibility for forms
- Tab navigation through payment table
- Modal form keyboard support

### Screen Reader Support

- Proper table headers and structure
- ARIA labels for complex interactions
- Hidden content properly marked

### Visual Design

- Responsive table design
- Clear visual hierarchy
- Status indicators and payment method badges
- Currency formatting and alignment

## Performance Considerations

### Async Operations

- Payment creation uses async processing
- Preview generation runs in background
- Bank account validation cached
- Contractor data loaded in parallel

### Data Loading

- Pagination for large payment histories
- Date-range filtering for performance
- Optimized database queries for reporting views
