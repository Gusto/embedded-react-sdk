# Contractor Payment Screen Flow Inventory

## Flow Overview

```
Index → New Payment → Preview → Submit → Back to Index
  ↓         ↓           ↓         ↓
By Date → Payment → (Cancel) → By Date
         Detail
```

---

## Screen 1: Payment History Index

**Route**: `/company/contractor_payments`  
**Entry Points**: Direct navigation, flow completion

### Fields & Components

#### Date Filter Section

- **Start Date Dropdown**
  - Type: Select
  - Options: "Last 3 months", "Last 6 months", "Last 12 months"
  - Default: "Last 3 months"
  - Required: Yes

#### Payment History Table

- **Payment Date Column**
  - Type: Link
  - Format: Date (YYYY-MM-DD)
  - Action: Navigate to by-check-date view
- **Reimbursement Total Column**
  - Type: Display
  - Format: Currency ($X,XXX.XX)
- **Wage Total Column**
  - Type: Display
  - Format: Currency ($X,XXX.XX)
- **Contractors Count Column**
  - Type: Display
  - Format: Number

#### Empty State

- **Message**: "No payments found"
- **Condition**: When no payments exist for date range

### Actions

- **Primary**: "Create contractor payment" → Navigate to `/new`
- **Filter**: "Apply date" → Reload with filtered results
- **Row Click**: Navigate to `/by_check_date/:date`

### Navigation Options

- **Forward**: New Payment (`/new`)
- **Down**: By Check Date (`/by_check_date/:date`)

---

## Screen 2: Create New Payment

**Route**: `/company/contractor_payments/new`  
**Entry Points**: From payment history index

### Fields & Components

#### RFI Warning (Conditional)

- **Warning Message** (if pending RFIs exist)
  - Type: Alert banner
  - Content: RFI warning details

#### Payment Date Section

- **Check Date Field**
  - Type: Date input (HTML5)
  - Default: 4 business days from current date
  - Max: System-defined max date
  - Required: Yes
  - Validation: Must be valid future date

#### Time Requirements Info

- **Payment Speed Notice**
  - Type: Information text
  - Content: "Direct deposit payments submitted before 4pm PT on a business day will take [X]
    business days to complete"
  - Dynamic: Payment speed varies by company config

#### Contractor Payments Table

##### Table Headers

- Contractor (Name)
- Wage Type
- Payment Method
- Hours
- Wage
- Bonus
- Reimbursement
- Total
- Actions (Edit button)

##### Per-Contractor Row Fields

- **Contractor Name**
  - Type: Display only
  - Source: Contractor.display_name

- **Wage Type**
  - Type: Display only
  - Values: "Hourly" (with rate) or "Fixed"
  - Format: "Hourly $XX.XX/hr" or "Fixed"

- **Payment Method**
  - Type: Display only
  - Values: "Direct Deposit", "Check", "Historical Payment"

- **Hours**
  - Type: Display (editable via modal)
  - Format: Decimal (X.X)
  - Default: 0.0
  - Validation: Must be decimal, ≥ 0

- **Wage**
  - Type: Display (editable via modal)
  - Format: Currency ($X,XXX.XX)
  - Default: $0.00
  - Validation: Must be valid currency, ≥ 0

- **Bonus**
  - Type: Display (editable via modal)
  - Format: Currency ($X,XXX.XX)
  - Default: $0.00
  - Validation: Must be valid currency, ≥ 0

- **Reimbursement**
  - Type: Display (editable via modal)
  - Format: Currency ($X,XXX.XX)
  - Default: $0.00
  - Validation: Must be valid currency, ≥ 0

- **Total**
  - Type: Calculated display
  - Format: Currency ($X,XXX.XX)
  - Calculation: Sum of applicable wage components

##### Table Footer (Totals Row)

- **Total Wages**: Sum of all wage amounts
- **Total Bonus**: Sum of all bonus amounts
- **Total Reimbursements**: Sum of all reimbursement amounts
- **Grand Total**: Sum of all totals

#### Hidden Form Fields

- **Contractor Payments Data**
  - Type: Hidden JSON input
  - Contains: Complete contractor payment data array
- **Creation Token**
  - Type: Hidden input
  - Purpose: Prevent duplicate submissions

### Edit Compensation Modal

#### Modal Header

- **Title**: "Edit [Contractor Name]'s pay"
- **Close Button**: Standard modal close

#### Hours Section

- **Regular Hours Field**
  - Type: Number input
  - Label: "Hours"
  - Suffix: "hrs"
  - Mask: Hours format (decimal)
  - Validation: Must be valid decimal ≥ 0

#### Fixed Pay Section

- **Fixed Wage Field**
  - Type: Currency input
  - Label: "Fixed pay"
  - Prefix: "$"
  - Mask: Currency format
  - Validation: Must be valid currency ≥ 0

#### Additional Earnings Section

- **Bonus Field**
  - Type: Currency input
  - Label: "Bonus"
  - Prefix: "$"
  - Mask: Currency format
  - Validation: Must be valid currency ≥ 0

- **Reimbursements Field**
  - Type: Currency input
  - Label: "Reimbursements"
  - Prefix: "$"
  - Mask: Currency format
  - Validation: Must be valid currency ≥ 0

#### Payment Method Section

- **Payment Method Radio Group**
  - Type: Radio buttons
  - Options:
    - "Check"
    - "Direct Deposit"
    - "Historical Payment"
  - Default: Contractor's current payment method
  - Validation: One selection required

#### Modal Footer

- **Total Pay Display**
  - Type: Calculated display
  - Format: "Total pay: $X,XXX.XX"
  - Updates: Real-time as fields change
- **OK Button**: Save changes and close modal
- **Cancel Button**: Discard changes and close modal

### Actions

- **Continue**: Navigate to preview (AJAX call to `/preview`)
- **Back**: Return to payment history index
- **Edit Contractor**: Open edit modal for specific contractor

### Navigation Options

- **Forward**: Payment Preview (AJAX)
- **Back**: Payment History Index (`/`)

---

## Screen 3: Payment Preview (AJAX Modal/Section)

**Route**: `/company/contractor_payments/preview` (AJAX endpoint)  
**Entry Points**: From new payment form via "Continue"

### Fields & Components

#### Preview Header

- **Title**: "Review and submit"
- **Subtitle**: "Here's a quick summary to review - we'll debit funds on the debit date listed
  below"

#### Summary Table

- **Total Amount**
  - Type: Display
  - Format: Currency ($X,XXX.XX)
  - Source: Sum of all contractor payments

- **Total Debit Amount**
  - Type: Display
  - Format: Currency ($X,XXX.XX)
  - Note: May include processing fees

- **Debit Account**
  - Type: Display
  - Format: Masked account number (\*\*\*\*1234)
  - Source: Company's primary bank account

- **Debit Date**
  - Type: Display
  - Format: Date (Month DD, YYYY)
  - Condition: Only for direct deposit payments

- **Pay Date**
  - Type: Display
  - Format: Date (Month DD, YYYY)
  - Source: Selected check date

#### Error Handling

- **Alert Errors Section**
  - Type: Alert banner (danger)
  - Content: Validation or processing errors
  - Condition: When preview fails

- **Date Errors**
  - Type: Inline error
  - Content: Date-specific validation messages
  - Condition: When check date is invalid

### Actions

- **Submit**: Create actual payments and redirect to index
- **Edit**: Return to payment editing mode

### Navigation Options

- **Forward**: Payment History Index (after successful submission)
- **Back**: Edit Payment Form

---

## Screen 4: Payment History by Date

**Route**: `/company/contractor_payments/by_check_date/:date`  
**Entry Points**: From payment history index date links

### Fields & Components

#### Header Section

- **Title**: "Contractor payment history"
- **Date Display**: Selected payment date

#### Payment Table

- **Contractor Column**
  - Type: Display
  - Source: Contractor.display_name

- **Payment Method Column**
  - Type: Display
  - Values: "Direct Deposit", "Check", "Historical Payment"

- **Hours Column**
  - Type: Display
  - Format: Decimal (X.X hrs)
  - Condition: Only for hourly contractors

- **Wage Column**
  - Type: Display
  - Format: Currency ($X,XXX.XX)

- **Bonus Column**
  - Type: Display
  - Format: Currency ($X,XXX.XX)

- **Reimbursement Column**
  - Type: Display
  - Format: Currency ($X,XXX.XX)

- **Total Column**
  - Type: Display
  - Format: Currency ($X,XXX.XX)

- **Actions Column**
  - **View Button**: Navigate to payment detail
  - **Cancel Button**: Cancel payment (with confirmation)
    - Confirmation: "Canceling a contractor payment cannot be undone. A new payment will have to be
      created if you want to pay this contractor. Are you sure?"

#### Empty State

- **Message**: "No payments found"
- **Condition**: When no payments exist for selected date

### Actions

- **View Payment**: Navigate to individual payment detail
- **Cancel Payment**: Cancel specific payment with confirmation
- **Back**: Return to payment history index

### Navigation Options

- **Forward**: Payment Detail (`/show/:id`)
- **Back**: Payment History Index (`/`)

---

## Screen 5: Individual Payment Detail

**Route**: `/company/contractor_payments/:id`  
**Entry Points**: From payment history by date view

### Fields & Components

#### Payment Receipt Section (Conditional)

**Condition**: Only for funded direct deposit payments

##### Receipt Header

- **Title**: "Payment receipt for [Date]"
- **Visual**: Perforated receipt design

##### Receipt Details

- **From Field**
  - Label: "From"
  - Value: Company name (payment sender)

- **To Field**
  - Label: "To"
  - Value: Contractor name (payment recipient)

- **Debit Notice**
  - Content: "Funds debited on [Date]"
  - Format: Full date format

- **Total Amount**
  - Label: "Total"
  - Value: Company debit amount
  - Format: Large currency display

##### Legal Information

- **Disclaimer Text**
  - Content: Payment processing disclaimer

- **License Information**
  - Content: Money transmitter licensing details
  - Link: License page URL

- **Company Address**
  - Content: Payment processor address and phone

#### Basic Payment Info (No Receipt)

**Condition**: For check payments or non-funded payments

- **Contractor Name**
  - Type: Header display (H2)
- **Payment Date**
  - Type: Subheader display (H3)

#### Payment Breakdown Table

##### Table Structure

- **Item Column**: Description of payment component
- **Amount Column**: Currency amount (right-aligned)

##### Payment Components

- **Payment Method Row**
  - Item: "Direct deposits" or "Check"
  - Amount: Total payment amount

- **Wage Information** (Conditional on wage type)
  - For Hourly:
    - **Hourly Rate Row**
      - Item: "Hourly rate"
      - Amount: Rate per hour
    - **Hours Row**
      - Item: "Hours"
      - Amount: Number of hours worked
  - For Fixed:
    - **Wage Row**
      - Item: "Wage"
      - Amount: Fixed wage amount

- **Reimbursement Row**
  - Item: "Reimbursement"
  - Amount: Reimbursement total

- **Bonus Row**
  - Item: "Bonus"
  - Amount: Bonus total

### Actions

- **Back**: Return to payment history by date view

### Navigation Options

- **Back**: Payment History by Date (`/by_check_date/:date`)

---

## Global Form Validation Rules

### Date Validation

- Must be valid date format
- Cannot be in the past (for new payments)
- Must be within acceptable business date range
- Check date must allow for processing time requirements

### Currency Validation

- Must be valid decimal format
- Cannot be negative
- Maximum precision: 2 decimal places
- Must be reasonable amount (system-defined limits)

### Hours Validation

- Must be valid decimal format
- Cannot be negative
- Maximum precision: 2 decimal places
- Must be reasonable hours (0-99.99)

### Payment Validation

- At least one payment field (hours, wage, bonus, reimbursement) must be > 0
- Payment method must match contractor's allowed methods
- Total payment amount must be within system limits

---

## Error States & Messages

### Form Errors

- **Invalid Date**: "Please enter a valid date"
- **Date Too Early**: "Payment date must be at least [X] business days in the future"
- **Invalid Amount**: "Please enter a valid amount"
- **Negative Amount**: "Amount cannot be negative"
- **No Payment**: "At least one payment amount must be greater than zero"

### System Errors

- **No Contractors**: "No available contractors to pay"
- **Bank Account Error**: "Company bank account verification required for direct deposits"
- **Processing Error**: "Unable to process payment. Please try again"
- **Network Error**: "Connection error. Please check your internet and try again"

### Success Messages

- **Payment Created**: "[X] contractor payments created successfully"
- **Payment Canceled**: "Contractor payment canceled successfully"
- **Preview Generated**: Preview data loaded successfully (implicit)

---

## Responsive Behavior

### Desktop (≥1200px)

- Full table display with all columns visible
- Modal dialogs at standard sizes
- Side-by-side form layouts in modals

### Tablet (768px-1199px)

- Horizontal scrolling for wide tables
- Full-width modals
- Stacked form layouts in modals

### Mobile (≤767px)

- Card-based display instead of tables
- Full-screen modals
- Single-column form layouts
- Simplified navigation patterns
