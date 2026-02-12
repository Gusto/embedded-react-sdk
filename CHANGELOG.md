# Changelog

## 0.27.0

### Features & Enhancements

- Update top level RFI flow to show an alert on submission
- Add pay period configuration component
- Implement offcycle payroll selection component
- Deductions: only show county field when counties are selectable

### Fixes

- Add additional line heights and xs size to text component
- Deductions UI: remove back button, add cancel button, handle empty states, spacing, and county field visibility
- Update theme border colors and form component styles

### Chores & Maintenance

- Add PR template and create-pr command guidance
- Ignore ESLint 10 major version in dependabot
- Bump @types/react from 19.2.13 to 19.2.14
- Bump i18next from 25.8.4 to 25.8.5
- Bump msw from 2.12.8 to 2.12.10
- Bump @storybook/react-vite, addon-docs, addon-onboarding, addon-a11y from 10.2.7 to 10.2.8
- Bump eslint-plugin-storybook from 10.2.7 to 10.2.8
- Bump typescript-eslint from 8.54.0 to 8.55.0
- Bump @playwright/test from 1.58.1 to 1.58.2

### Breaking changes

#### Theme variable `fontLineHeight` removed

The theme variable `fontLineHeight` has been removed. Update your theme object to use the new line height variables:

```tsx
// Before
theme={{
  typography: {
    fontLineHeight: '24px',
  }
}}

// After
theme={{
  fontLineHeightRegular: '24px',
  // Optional: Add more specific line heights if needed
  fontLineHeightSmall: '20px',
  fontLineHeightLarge: '28px',
  fontLineHeightExtraSmall: '18px',
}}
```

#### Theme `colorBorder` replaced with `colorBorderPrimary` and `colorBorderSecondary`

The single `colorBorder` theme variable has been replaced with two variables for clearer border styling.

For a consistent experience, use the same color for both new variables:

```tsx
// Before
theme={{
  colorBorder: '#E0E0E0'
}}

// After
theme={{
  colorBorderPrimary: '#E0E0E0',
  colorBorderSecondary: '#E0E0E0'
}}
```

## 0.26.0

### Features & Enhancements

- Create generalized RFI component as top-level export
- Add employment eligibility presentation component
- Update PayrollBlockerAlerts component to include RFI and recovery cases
- Add Dismissable Payroll Cancelled Alert
- Add success alerts for recovery case and information request submissions
- Add recovery cases and RFIs to payroll blocker list
- Add recovery case table
- Implement recovery case redebit functionality
- Handle unsupported information request response types

### Fixes

- Replace custom fonts with system fonts
- Add placeholder for empty error code in recovery cases list
- Remove text components from payroll dataview
- Add extra padding to alert content
- Reduce unordered list spacing
- Only render alert content container when children are present
- Remove text components from dataview
- Fix modal overflow
- File upload UI updates

### Chores & Maintenance

- Add gh action to auto assign PR reviewers
- Add /wireframemode cursor command for designer prototyping
- Add starttechspec cursor command for tech spec workflow
- Upgrade @gusto/embedded-api to 0.11.8
- Optimize CI workflow with parallel jobs and caching
- Bump @storybook/react-vite from 10.2.0 to 10.2.7
- Bump @storybook/addon-a11y from 10.2.0 to 10.2.6
- Bump @storybook/addon-onboarding from 10.2.0 to 10.2.6
- Bump @storybook/addon-docs from 10.2.0 to 10.2.7
- Bump @types/react from 19.2.9 to 19.2.11
- Bump @gusto/embedded-api from 0.11.9 to 0.11.11
- Bump @commitlint/cli from 20.3.1 to 20.4.0
- Bump @commitlint/config-conventional from 20.3.1 to 20.4.1
- Bump eslint-plugin-storybook from 10.2.0 to 10.2.7
- Bump dotenv from 17.2.3 to 17.2.4
- Bump globals from 17.1.0 to 17.3.0
- Bump @playwright/test from 1.58.0 to 1.58.1
- Bump i18next from 25.8.0 to 25.8.4
- Bump msw from 2.12.7 to 2.12.8
- Bump react-i18next from 16.5.3 to 16.5.4

## 0.25.0

### Features & Enhancements

- Add functionality for information request form
- Add functionality to information request list
- Add FileInputField and adapter
- Add FileInput component
- Update payroll list to avoid wrapping text and improve button placement
- Update to display payroll blockers before submitting payroll
- Update to hide job titles in edit payroll
- Add payroll cancellation guards
- Add payment history view
- Add reusable usePagination hook
- Hide direct deposit for employees without account set up
- Add skeleton for recovery cases
- Add skeleton for information requests
- Add bank account number to preview

### Fixes

- Remove duplicate payroll alert on calculate payroll
- Update to show warning banner with correct dates for late payroll
- Show immediate loading state when Calculate payroll button is clicked
- Prevent double loading during PayrollConfiguration pagination
- Cancel payroll from overview causing error
- Update inputs to format currency correctly
- Add empty state to CreatePaymentPresentation for contractors
- Display correct amount on alert when payroll is submitted
- Change payroll deadline notice text to read "by" instead of "on"
- Fix pagination visibility based on totalCount
- Align payroll breadcrumbs with design
- Remove submission failed prefix from submission blockers
- Update copy on cancel payroll modal
- Fix alignment for pay stub text in table on payroll overview
- Prevent negative numbers in input fields
- Prevent duplicate loading state on payroll landing

### Chores & Maintenance

- Upgrade embedded api to 0.11.7
- Upgrade Storybook from 8.6.15 to 10.1.11
- Migrate from Ladle to Storybook
- FSM cleanup
- Bump @gusto/embedded-api from 0.11.5 to 0.11.6
- Bump typescript-eslint from 8.53.1 to 8.54.0
- Bump @storybook/addon-docs from 10.1.11 to 10.2.0
- Bump @storybook/addon-onboarding from 10.1.11 to 10.2.0
- Bump @playwright/test from 1.57.0 to 1.58.0
- Bump globals from 16.5.0 to 17.1.0
- Bump @storybook/react-vite from 10.1.11 to 10.2.0
- Bump eslint-plugin-storybook from 10.1.11 to 10.2.0
- Bump prettier from 3.7.4 to 3.8.1
- Bump sass-embedded from 1.97.1 to 1.97.3
- Bump lodash from 4.17.21 to 4.17.23
- Bump @storybook/addon-a11y from 10.1.11 to 10.2.0
- Bump i18next from 25.7.3 to 25.8.0
- Bump vite-plugin-stylelint from 6.0.2 to 6.0.4
- Bump @types/react from 19.2.7 to 19.2.9
- Bump react-error-boundary from 6.0.0 to 6.1.0
- Bump typescript-eslint from 8.51.0 to 8.54.0
- Bump @testing-library/react from 16.3.1 to 16.3.2
- Bump react-hook-form from 7.69.0 to 7.71.1
- Bump react-i18next from 16.5.1 to 16.5.3
- Bump @commitlint/cli from 20.2.0 to 20.3.1
- Bump @commitlint/config-conventional from 20.2.0 to 20.3.1
- Bump msw from 2.12.4 to 2.12.7
- Bump axe-core from 4.11.0 to 4.11.1

## 0.24.1

### Fixes

- Add DC to supported states list

### Chores & Maintenance

- Bump react-i18next from 16.5.0 to 16.5.1
- Bump typescript-eslint from 8.50.1 to 8.51.0

## 0.24.0

### Features & Enhancements

- Add ConfirmWireDetailsComponent prop for customization
- Add PayrollLoading component adapter
- Provide a withReimbursements flag to conditionally hide reimbursements

### Fixes

- Add currency format and min value to dependents amount field
- Correctly pass consumer query client

### Chores & Maintenance

- Update dependabot config to respect already ticketed upgrades
- Bump typescript-eslint from 8.50.0 to 8.50.1
- Bump react-hook-form from 7.68.0 to 7.69.0
- Bump sass-embedded from 1.97.0 to 1.97.1

## 0.23.1

### Chores & Maintenance

- Revert react aria components upgrade

## 0.23.0

### Features & Enhancements

- Add support for all garnishment types
- Update to include earned fast ach in submission blockers
- Add contractor payment progress and functionality

### Fixes

- Restore defaults to icon button
- Updated copy on payroll overview
- Updated payrollHistory to display complete instead of paid
- Prevent multiple progress saved alerts on payroll overview
- Updated the payroll state machine to get the payroll dates
- Updated icons in payroll history action menu

### Chores & Maintenance

- Fix tree shaking and add pagination to adapter docs
- Export signatory components and add docs
- Add docs for confirm wire details and export payroll blockers
- Remove ability for custom deduction to be court-ordered
- Bump react-aria-components from 1.13.0 to 1.14.0
- Bump typescript-eslint from 8.49.0 to 8.50.0
- Bump @gusto/embedded-api from 0.11.3 to 0.11.4
- Bump i18next from 25.7.2 to 25.7.3
- Bump react-i18next from 16.4.0 to 16.5.0
- Bump eslint from 9.39.1 to 9.39.2
- Bump sass-embedded from 1.93.3 to 1.96.0

## 0.22.0

### Features & Enhancements

- Add support for fed/state lien garnishments
- Add notification for wire payroll submitted
- Update employee federal taxes to support pre 2020 W4
- Implement payroll overview updates based on radio selection
- Add contractor payment walking skeleton with FSM scaffolding

### Fixes

- Clean up confirm wire details with correct selected wire in
- Add .md extensions to internal doc links for GitHub browsing
- Update readme to reference existing docs files

### Chores & Maintenance

- Upgrade embedded API to 0.11.2
- Bump embedded-api version to 0.11.1
- Bump typescript-eslint from 8.48.0 to 8.49.0
- Bump dompurify from 3.3.0 to 3.3.1
- Bump vite-plugin-checker from 0.11.0 to 0.12.0
- Bump i18next from 25.7.1 to 25.7.2
- Bump @commitlint/config-conventional from 20.0.0 to 20.2.0
- Bump react-i18next from 16.3.5 to 16.4.0
- Bump @commitlint/cli from 20.1.0 to 20.2.0
- Bump msw from 2.12.3 to 2.12.4
- Bump react-hook-form from 7.67.0 to 7.68.0
- Bump prettier from 3.6.2 to 3.7.3

## 0.21.0

### Features & Enhancements

- Update base submit to separate UI portions
- Implement advance payroll status badges
- Add wire transfer confirmation flow for payroll
- Add infrastructure for experimental payroll hooks
- Update wire in form to use selected wire in id
- Add Contractor Payment Create component
- Add Contractor Payment Detail component
- Add Contractor Payment Overview component
- Add Contractor Payment Edit component
- Add Contractor Payment History component

### Fixes

- Fixed modal button styling
- Update footer to right-align when single button

### Chores & Maintenance

- Swap in new deductions/child support form components
- Bump msw from 2.12.2 to 2.12.3
- Bump @types/react from 19.2.6 to 19.2.7
- Bump typescript-eslint from 8.47.0 to 8.48.0
- Bump react-hook-form from 7.66.1 to 7.67.0
- Bump i18next from 25.6.3 to 25.7.1
- Bump mdast-util-to-hast from 13.2.0 to 13.2.1
- Bump tsx from 4.20.6 to 4.21.0

## 0.20.0

### Features & Enhancements

- Update bank account to accept 1-17 digits

### Fixes

- Apply antialiasing globally

### Chores & Maintenance

- Bump react-i18next from 16.3.3 to 16.3.5
- Bump i18next from 25.6.2 to 25.6.3
- Bump lint-staged from 16.2.6 to 16.2.7
- Bump @types/react from 19.2.5 to 19.2.6

## 0.19.0

### Features & Enhancements

- Add Banner component for displaying important messages and alerts
- Update Badge component radius styling
- Remove ul from base.css and update components to use List component
- Restore spacing values to input groups
- Normalize translation keys and add translation guidelines

### Chores & Maintenance

- Upgrade to Gusto Embedded API v0.10.2
- Update custom deductions form to use latest input components
- Update documentation for Gusto API v2025-06-15 upgrade

### Breaking changes

#### Translation key normalization

Translation keys have been normalized to follow a consistent naming convention. If you have custom dictionary overrides, you may need to update your translation keys to match the new format. Going forward, all translation keys will maintain this normalized format for consistency across the SDK.

## 0.18.0

### Features & Enhancements

- Add Modal component
- Update Tabs to allow for responsive behavior
- Update to provide all profile fields on admin review
- Updates UI for deductions v2
- Update autogenerated component adapter props docs
- Add error handling for payroll processing

### Fixes

- Update to restore translations in federal taxes
- Fix responsive layouts in payroll components
- Fix clearing alerts when leaving overview step

### Refactoring

- Normalize date formatting and consolidate hooks into single location

### Chores & Maintenance

- Upgrade to Gusto Embedded API v2025-06-15
- Bump react-hook-form from 7.65.0 to 7.66.0
- Bump typescript-eslint from 8.46.2 to 8.46.3
- Bump @ladle/react from 5.1.0 to 5.1.1
- Bump react-i18next from 16.2.3 to 16.2.4
- Bump eslint from 9.39.0 to 9.39.1
- Bump @eslint/js from 9.39.0 to 9.39.1
- Bump eslint from 9.38.0 to 9.39.0
- Bump sass-embedded from 1.93.2 to 1.93.3
- Bump globals from 16.4.0 to 16.5.0
- Bump @eslint/js from 9.38.0 to 9.39.0
- Bump react-i18next from 16.2.1 to 16.2.3

## 0.17.0

### Features & Enhancements

- Add payroll deadline alert to payroll configuration
- Enable responsive breadcrumb behavior
- Add DescriptionList component with flexible term/description support
- Update payment method copy for self onboarding

### Fixes

- Remove base image styles in favor of emptydata styles
- Remove unused style from base.scss

### Chores & Maintenance

- Bump react-i18next from 16.1.0 to 16.2.1
- Bump lint-staged from 16.2.5 to 16.2.6

## 0.16.0

### Features & Enhancements

- Add breadcrumb navigation to payroll flow component
- Add CTA (Call to Action) functionality to payroll flow breadcrumbs
- Add translation support for pay schedule names
- Enable multiple resource file loading in useI18n hook

### Fixes

- Memoize employee UUID array and switch to API filtering for better performance

### Chores & Maintenance

- Add missing run payroll documentation
- Bump react-i18next from 16.0.1 to 16.1.0
- Bump eslint from 9.37.0 to 9.38.0
- Bump vite from 6.4.0 to 6.4.1
- Bump typescript-eslint from 8.46.1 to 8.46.2
- Bump lint-staged from 16.2.4 to 16.2.5
- Bump msw from 2.11.5 to 2.11.6

## 0.15.0

### Features & Enhancements

- Remove deprecated payroll flow and unstable prefix - Payroll components are now stable
- Implement pagination for payroll configuration
- Add logic to hide skip payroll functionality
- Add emptyState back to DataView component
- Sort payroll config by API instead of client for better performance

### Fixes

- Update PayrollHistory to include correct amount
- Fix twoPercentShareholder form integration and error handling

### Refactoring

- Refactor pagination control to uncontrolled component

### Chores & Maintenance

- Upgrade embedded client to latest 0.8.1
- Bump dompurify from 3.2.7 to 3.3.0
- Bump react-hook-form from 7.64.0 to 7.65.0
- Bump vite from 6.3.6 to 6.4.0
- Bump typescript-eslint from 8.46.0 to 8.46.1
- Bump eslint-plugin-react-refresh from 0.4.23 to 0.4.24

## 0.14.1

### Fixes

- Bug fixes and improvements

## 0.14.0

### Features & Enhancements

- Add LoadingSpinner component and normalize loading behavior across payroll components
- Implement payroll blockers for calculate payroll
- Add warning when employees are getting paid by check
- Add payroll receipt and summary navigation in PayrollHistory
- Add payroll totals for company pays
- Update FLSA minimum salary amount

### Fixes

- Update Text inside table cells to use span instead of div for proper HTML semantics

### Chores & Maintenance

- Upgrade embedded API client to latest version
- Upgrade various production and development dependencies for improved stability

## 0.13.4

### Fixes

- Patch release for bug fixes and improvements around finite state machines

## 0.13.3

### Fixes

- Apply system styles to alert UI for consistent styling
- Hide admin fields when self-onboarding and add form validation
- Update useField to correctly handle component props
- Replace self-onboarding checkbox with switchfield card component

### Chores & Maintenance

- Bump react-hook-form from 7.62.0 to 7.63.0
- Bump robot3 from 1.1.1 to 1.2.0
- Bump typescript-eslint from 8.44.0 to 8.44.1
- Bump eslint from 9.35.0 to 9.36.0
- Bump eslint-plugin-react-refresh from 0.4.20 to 0.4.21
- Bump tsx from 4.20.5 to 4.20.6
- Bump sass-embedded from 1.92.1 to 1.93.2
- Bump msw from 2.11.2 to 2.11.3
- Bump lint-staged from 16.1.6 to 16.2.0
- Bump @eslint/js from 9.35.0 to 9.36.0

## 0.13.2

### Features & Enhancements

- Add alert for edit payroll success
- Add payroll type and pay date to PayrollList
- Add comprehensive footer support to DataView components
- Implement PayrollHistory presentation layer
- Implement new deductions empty state UI

### Chores & Maintenance

- Upgrade embedded API to 0.6.11
- Bump dompurify from 3.2.6 to 3.2.7

## 0.13.1

### Fixes

- Patch release for bug fixes and improvements

## 0.13.0

### Features & Enhancements

- Infrastructural work to support eventual RunPayroll early access

## 0.12.3

### Features & Enhancements

- Separate `Employee.Taxes` into separate `Employee.StateTaxes` and `Employee.FederalTaxes` components and deprecate `Employee.Taxes` (See upgrade guide below)
- Add CTA (Call to Action) functionality to ProgressBar component
- Expose Payroll components as UNSTABLE for early access
- Add Payroll Submit API call functionality

### Fixes

- Fix documentation links ending with .md extension

### Chores & Maintenance

- Upgrade various development dependencies for improved stability
- Update embedded API to latest version

### Migrating `Employee.Taxes` to `Employee.StateTaxes` and `Employee.FederalTaxes`

We have split the `Employee.Taxes` component into dedicated `Employee.StateTaxes` and `Employee.FederalTaxes` components. The `Employee.Taxes` component is now deprecated and will be removed in a future version.

#### Component Usage

**Before (using combined Employee.Taxes):**

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

// In employee onboarding flow
<Employee.Taxes
  employeeId="employee-id"
  isAdmin
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
      // called when taxes is done
    }
  }}
/>

// In self-onboarding flow
<Employee.Taxes
  employeeId="employee-id"
  isAdmin={false}
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_TAXES_DONE) {
      // called when taxes is done
    }
  }}
/>
```

**After (using separate components):**

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

// In employee onboarding flow - Federal Taxes step
<Employee.FederalTaxes
  employeeId="employee-id"
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE) {
      // called when federal taxes is done
    }
  }}
/>

// In employee onboarding flow - State Taxes step
<Employee.StateTaxes
  employeeId="employee-id"
  isAdmin
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_STATE_TAXES_DONE) {
      // called when state taxes is done
    }
  }}
/>

// In self-onboarding flow - Federal Taxes step
<Employee.FederalTaxes
  employeeId="employee-id"
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_FEDERAL_TAXES_DONE) {
      // called when federal taxes is done
    }
  }}
/>

// In self-onboarding flow - State Taxes step
<Employee.StateTaxes
  employeeId="employee-id"
  isAdmin={false}
  onEvent={(eventType) => {
    if (eventType === componentEvents.EMPLOYEE_STATE_TAXES_DONE) {
      // called when state taxes is done
    }
  }}
/>
```

## 0.12.2

### Features & Enhancements

- Add CTA (Call to Action) functionality to ProgressBar component
- Expose Payroll components as UNSTABLE for early access
- Add Payroll Submit API call functionality

### Fixes

- Fix contractor payment details validation and display
- Fix contractor ID not being passed correctly from profile to submit
- Fix self onboarding switch with correct onboarding status

### Chores & Maintenance

- Upgrade react-i18next from 15.6.0 to 15.7.0
- Upgrade react-hook-form from 7.60.0 to 7.62.0
- Update embedded API to latest version

## 0.12.1

### Fixes

- Fix contractor payment details validation and display
- Fix contractor ID not being passed correctly from profile to submit

### Chores & Maintenance

- Upgrade react-i18next from 15.6.0 to 15.7.0
- Upgrade react-hook-form from 7.60.0 to 7.62.0
- Update embedded API to latest version

## 0.12.0

### Updated theming

We have updated our theming approach for the SDK which is a breaking change. See the breaking changes section for this release below for more information.

### Features & Enhancements

- Expose Speakeasy hooks to consumers of SDK for enhanced API interaction capabilities
- Navigate to add mode when payschedule list is empty
- Use virtualization to optimize comboboxes with long lists
- Update Button styling and variants

### Fixes

- Fix deductions state machine flow and auto-redirect behavior
- Fix deductions copy and export components
- Fix pay schedule preview component registration to react-hook-form
- Fix DatePicker timezone issue
- Fix react-aria select onChange behavior
- Fix vite CSS file name requirement on v6
- Fix console issues in readme publish and type issue in select
- Fix dependencies to satisfy dependabot
- Fix only update onboarding status for admin
- Fix eliminate flash between datacards and datatable
- Fix mark required fields as required to prevent optional label display

### Chores & Maintenance

- Update theming infrastructure and migrate all components to use new flat theme variables
- Change timeout for long running e2e test to 20s
- Add cursor rule files for AI assistance
- Fix docs publishing issues

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Legacy theming infrastructure has been removed in favor of simplified flat theme approach

The legacy theming system with nested objects and complex component-specific themes has been updated. The new system uses a flat theme object that is more straightforward and easier to use.

See the following docs for more context:

- [Theming overview](./docs/theming/theming.md)
- [Theme variables inventory](./docs/theming/theme-variables.md)

The following example provides a before and after with a mapping of the old theme object to the new equivalent.

**Before (nested structure):**

```tsx
<GustoProvider
  theme={{
    typography: {
      font: 'Geist', // Maps to fontFamily
      fontWeight: {
        regular: 400, // Maps to fontWeightRegular
        medium: 500, // Maps to fontWeightMedium
        semibold: 600, // Maps to fontWeightSemibold
        bold: 700, // Maps to fontWeightBold
      },
      fontSize: {
        small: '14px', // Maps to fontSizeSmall
        regular: '16px', // Maps to fontSizeRegular
        medium: '18px', // Maps to fontSizeLarge
      },
      headings: {
        1: '32px', // Maps to fontSizeHeading1
        2: '24px', // Maps to fontSizeHeading2
        3: '20px', // Maps to fontSizeHeading3
        4: '18px', // Maps to fontSizeHeading4
        5: '16px', // Maps to fontSizeHeading5
        6: '14px', // Maps to fontSizeHeading6
      },
      textColor: '#1C1C1C', // Maps to colorBodyContent
    },
    colors: {
      gray: {
        100: '#FFFFFF', // Maps to colorBody
        200: '#FBFAFA', // Maps to colorBodyAccent
        300: '#F4F4F3', // Maps to colorBodyAccent
        400: '#EAEAEA', // Maps to colorBorder
        500: '#DCDCDC', // Maps to inputBorderColor
        600: '#BABABC', // Maps to colorBodySubContent
        700: '#919197', // Maps to colorBodySubContent
        800: '#6C6C72', // Maps to colorBodySubContent
        900: '#525257', // Maps to colorPrimaryAccent
        1000: '#1C1C1C', // Maps to colorPrimary & colorBodyContent
      },
      error: {
        100: '#FFF7F5', // Maps to colorError
        500: '#D5351F', // Maps to colorErrorAccent
        800: '#B41D08', // Maps to colorErrorContent
      },
    },
    input: {
      fontSize: '14px', // Maps to inputLabelFontSize
      radius: '8px', // Maps to inputRadius
      textColor: '#1C1C1C', // Maps to inputContentColor
      borderColor: '#DCDCDC', // Maps to inputBorderColor
      background: '#FFFFFF', // Maps to inputBackgroundColor
    },
    button: {
      fontSize: '14px', // Maps to fontSizeSmall
      fontWeight: 500, // Maps to fontWeightMedium
      borderRadius: '6px', // Maps to buttonRadius
      primary: {
        color: '#FFFFFF', // Maps to colorPrimaryContent
        bg: '#1C1C1C', // Maps to colorPrimary
        borderColor: '#1C1C1C', // Maps to colorPrimary
      },
    },
    focus: {
      color: '#1C1C1C', // Maps to focusRingColor
      borderWidth: '2px', // Maps to focusRingWidth
    },
    shadow: {
      100: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)', // Maps to shadowResting
      200: '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)', // Maps to shadowTopmost
    },
    badge: {
      borderRadius: '16px', // Maps to badgeRadius
    },
    radius: '6px', // Maps to buttonRadius (default)
    transitionDuration: '200ms', // Maps to transitionDuration
  }}
>
  {children}
</GustoProvider>
```

**After (simplified flat structure):**

```tsx
<GustoProvider
  theme={{
    fontFamily: 'Geist',
    fontWeightRegular: '400',
    fontWeightMedium: '500',
    fontWeightSemibold: '600',
    fontWeightBold: '700',
    fontSizeSmall: '14px',
    fontSizeRegular: '16px',
    fontSizeLarge: '18px',
    fontSizeHeading1: '32px',
    fontSizeHeading2: '24px',
    fontSizeHeading3: '20px',
    fontSizeHeading4: '18px',
    fontSizeHeading5: '16px',
    fontSizeHeading6: '14px',
    colorBody: '#FFFFFF',
    colorBodyAccent: '#F4F4F3',
    colorBodyContent: '#1C1C1C',
    colorBodySubContent: '#6C6C72',
    colorBorder: '#EAEAEA',
    colorPrimary: '#1C1C1C',
    colorPrimaryAccent: '#525257',
    colorPrimaryContent: '#FFFFFF',
    colorError: '#FFF7F5',
    colorErrorAccent: '#D5351F',
    colorErrorContent: '#B41D08',
    inputRadius: '8px',
    inputBackgroundColor: '#FFFFFF',
    inputBorderColor: '#DCDCDC',
    inputContentColor: '#1C1C1C',
    inputLabelFontSize: '16px',
    buttonRadius: '8px',
    focusRingColor: '#1C1C1C',
    focusRingWidth: '2px',
    shadowResting: '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
    shadowTopmost:
      '0px 4px 6px 0px rgba(28, 28, 28, 0.05), 0px 10px 15px 0px rgba(28, 28, 28, 0.10)',
    badgeRadius: '16px',
    transitionDuration: '200ms',
  }}
>
  {children}
</GustoProvider>
```

## 0.11.3

- Minor release to assist in docs publishing

## 0.11.2

- Expose Speakeasy hooks to consumers of SDK for enhanced API interaction capabilities
- Update checkbox and checkboxgroup components to use new theme variables
- Update alert component to use new theme variables
- Update field components to use new theme variables
- Update input components to use new theme variables
- Update Button styling and variants
- Navigate to add mode when payschedule list is empty
- Use virtualization to optimize comboboxes with long lists
- Change timeout for long running e2e test to 20s
- Add cursor rule files for AI assistance

## 0.11.1

- Fix updating onboarding status for employee when self onboarding
- Fix eliminate flashing empty fields in compensation component
- Fix mark fields as required to match server validation
- Chore - Add github action to be utilized for readme deploy

## 0.11.0

- Update peer dependencies to support React 18
- Add contractor submit block
- Add contractor profile

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Remove exports for compound components

Previously we were exporting subcomponents such as `Employee.EmployeeList.Head` and `Employee.Compensation.Form` etc. We have removed those exports in favor of only exporting the blocks. Ex. only exporting `Employee.EmployeeList` and `Employee.Compensation` etc.

## 0.10.7

- Upgrade embedded api to fix state taxes validation issue
- Fix tax rate fields preventing form submission
- Remove unused docs tests
- Fix RC publish script to allow for branch selection

## 0.10.6

### Fixes

- Fixed company state taxes validation issue
- Fixed document signer state machine signatory issues

## 0.10.5

### Fixes

- Corrected an issue where Pay Schedule wasn't clearing errors on cancel navigation

## 0.10.4

### Fixes

- Fix pay preview functionality in PaySchedule component
- Fix translation type issues
- Restore missing EIN link

### Chores & Maintenance

- Polish contractor table component
- Add RC release and unpublish workflow
- Introduce frontmatter generator for docs
- Introduce preview environment for docs
- Remove inline styles in favor of CSS modules
- Remove axe tests from e2e to stabilize test runs

## 0.10.3

- Expose types for adapter and create a loading indicator provider
- Remove manual invalidation in favor of automatic invalidation after mutation
- Invalidate queryCache after running mutation API
- Produce lockfile for documentation to better organize frontmatter for Github Action
- Reorganize docs to match readme hierarchy

## 0.10.2

### Fixes

- Fix bank account not found error
- Fix ComboBox focus ring

### Chores & Maintenance

- Add reset to InternalError and clean up error handling
- Add initial contractor onboarding documentation
- Add contractor address tests

## 0.10.1

- Fixed work address being stale when editing an existing employee in employee onboarding

## 0.10.0

### Features & Enhancements

- Added contractor payment method with custom validation, including handling for masked account numbers
- Added `annualMaximum` field to DeductionForm with comprehensive tests
- Added PaymentMethod percentage validation tests

### Fixes

- Correctly set version for employee taxes
- Set correct mode on deductions cancel
- Skip state taxes for states that only have questions for admins
- Allow special characters in user name
- Fix split validation
- Fix withholding allowance of 0 causing error on state tax submission
- Restore proper SSN validation
- Update rate to not be labeled optional when it is required

### Chores & Maintenance

- Upgrade embedded API version to 0.6.4
- Update changelog with breaking changes and update docs

## 0.9.0

- Added new Contractor.Address form component for managing contractor address information
- Improved ComboBox accessibility and added comprehensive component tests
- Added accessibility testing infrastructure with foundational component coverage
- Added accessibility tests to complex interactive and data components
- Fixed state tax boolean validation issues
- Updated Gusto embedded-api version to the latest

### Breaking changes

Be sure to note the breaking change listed below for version 0.8.2 around component renaming and removal of the top level Flow component.

## 0.8.2

- Refactored employee flow components structure and improved organization within Employee namespace
- Added component-level dictionary override functionality for improved internationalization
- Updated state taxes component to support API-based validation messages
- Fixed commission Zod schema validation issues
- Fixed issue with headers not being passed properly through our API client

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Rename components to remove the "Flow" naming suffix

The following components have been updated to remove the "Flow" naming suffix.

| Old name                      | Updated name              |
| ----------------------------- | ------------------------- |
| `Employee.DocumentSignerFlow` | `Employee.DocumentSigner` |
| `Company.LocationsFlow`       | `Company.Locations`       |
| `Company.BankAccountFlow`     | `Company.BankAccount`     |
| `Company.StateTaxesFlow`      | `Company.StateTaxes`      |
| `Company.DocumentSignerFlow`  | `Company.DocumentSigner`  |

#### Removed top level Flow component and renamed flow subcomponents

We have removed the top level `Flow` component and have migrated the flow subcomponents to `Employee` and `Company` respectively.

| Old name                          | Updated name                  |
| --------------------------------- | ----------------------------- |
| `Flow.EmployeeOnboardingFlow`     | `Employee.OnboardingFlow`     |
| `Flow.EmployeeSelfOnboardingFlow` | `Employee.SelfOnboardingFlow` |

Some examples of before/after:

_Before_

```tsx
import { Flow } from '@gusto/embedded-react-sdk'

...

<Flow.EmployeeOnboardingFlow ... />
<Flow.EmployeeSelfOnboardingFlow ... />

```

_After_

```tsx
import { Employee } from '@gusto/embedded-react-sdk'

...

<Employee.OnboardingFlow ... />
<Employee.SelfOnboardingFlow ... />
```

## 0.8.1

- Replaced Valibot with Zod for bundle size reduction. Also included zod as a dependency
- Updated package.json to fix an issue with types being unavailable for consumers
- Misc style corrections and consistency fixes
- Updated component adapter documentation to include generated props
- bug: GWS-4966 headers not being set properly for requests when configured in GustoProvider
- moved APIProvider into `embedded-react-sdk` from `embedded-api` package

## 0.8.0

- Company Onboarding flow improvements and fixes:
  - Added comprehensive Company.OnboardingFlow component that guides users through the entire onboarding process
  - Introduced Company.OnboardingOverview component for tracking onboarding progress
  - Improved state management and context handling for onboarding components
  - Enhanced documentation for company onboarding workflow
- Added Company.StateTaxes component for managing state tax requirements
  - Support for state-specific tax forms and requirements
  - Ability to update state tax settings with validation
- Component Adapter initial implementation available with most components (Docs coming soon)
- Rework of exports to enable better tree shaking
- Breadcrumbs have been replaced with Progress Bar for improved user experience
- Common RequirementsList component added

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Deprecation of GustoApiProvider in favor of GustoProvider

`GustoApiProvider` has been deprecated and will be removed in a future version. Please update your code to use `GustoProvider` instead:

```tsx
// Before
<GustoApiProvider config={{ baseUrl: 'https://api.example.com' }}>
  {children}
</GustoApiProvider>

// After
<GustoProvider config={{ baseUrl: 'https://api.example.com' }}>
  {children}
</GustoProvider>
```

## 0.7.0

- Add company federal taxes component
- Refactor existing components to use generated speakeasy hooks and infrastructure
- Implement separation of form inputs from react hook form

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Update default values from snake case to camel case

For internal consistency in our codebase, we updated the `defaultValues` props for all Employee components from snake case values (ex. `first_name`) to be camel cased instead (ex. `firstName`). For example, where before you would do:

```tsx
<Employee.Profile
  defaultValues={{
    employee: {
      first_name: 'Angela',
      last_name: 'Martin'
    },
    homeAddress: {
      street_1: '123 Fake St'
    }
  }}
  ...
/>

// or

<Employee.Compensation
  defaultValues={{
    flsa_status: 'Exempt'
  }}
  ...
>
```

You would do the following instead::

```tsx
<Employee.Profile
  defaultValues={{
    employee: {
      firstName: 'Angela',
      lastName: 'Martin'
    },
    homeAddress: {
      street1: '123 Fake St'
    }
  }}
  ...
/>

// or

<Employee.Compensation
  defaultValues={{
    flsaStatus: 'Exempt'
  }}
  ...
>
```

#### DocumentSigner has been renamed to DocumentSignerFlow

> This was actually reverted in 0.8.2. If you have DocumentSigner as the component name, you can continue to use that if you are on 0.8.2 or later. Between 0.7.0 up until 0.8.2 the naming is DocumentSignerFlow

Where you would previously do

```tsx
<Employee.DocumentSigner employeeId="some-id" onEvent={() => {}} />
```

You should update the naming as follows:

```tsx
<Employee.DocumentSignerFlow employeeId="some-id" onEvent={() => {}} />
```

## 0.6.0

- Allow for default value for flsa_status (employment type field) in compensation
- The default font that ships with the SDK has been updated to 'Geist' so that will update if you do not have a default font specified in your theme
- Update company Industry component to use speakeasy
- Update Employee List component to use speakeasy
- Add a CalendarDisplay component and introduce it to Company PaySchedule component
- Add `isSelfOnboardingEnabled` prop to Employee profile components to disallow self onboarding
- Add company PaySchedule component
- Add styling to SDK internal error component

### Breaking changes

> Note: We are pre alpha and are regularly iterating on the SDK as we learn more about our consumers and their needs which sometimes involves breaking changes. [Read more about our current versioning strategy here](./docs/04/01/versioning.md).

#### Update GustoApiProvider `baseUrl` property to use an absolute URL

Ex. previously you could set a `baseUrl` to a relative URL as follows

```ts
<GustoApiProvider
  config={{
    baseUrl: `some/url/path/`,
  }}
  ...
>
...
</GustoApiProvider>
```

Moving forward, we require setting an absolute URL. Ex updating to be:

```ts
<GustoApiProvider
  config={{
    baseUrl: `https://api.example.com/some/url/path/`,
  }}
  ...
>
...
</GustoApiProvider>
```

#### fontWeight override for typography theme has been changed from `book` to `regular`

Ex. so if you were overriding the `fontWeight` property before using `book`

```ts
<GustoApiProvider
  theme={{
    typography: {
      fontWeight: {
        book: 400,
      },
    },
  }}
  ...
>
...
</GustoApiProvider>
```

You will want to update to use `regular` instead as follows

```ts
<GustoApiProvider
  theme={{
    typography: {
      fontWeight: {
        regular: 400,
      },
    },
  }}
  ...
>
...
</GustoApiProvider>
```

## 0.5.0

- Update to require proxy to add IP address via `x-gusto-client-ip` header
- Responsive table style updates
- Initial speakeasy integration
- Addition of company document signer

## 0.4.1

- Fix for self onboarding profile form validation

## 0.4.0

- Added responsive behavior to foundational components
- Tables now adapt to small viewports using a card-based UI
- Adjusted theme colors for a more neutral appearance
- Fixed layout inconsistencies in buttons and modals
- Add company assign signatory form
- Add company documents list

## 0.3.0

- Updated README to include more comprehensive documentation
- Pagination for EmployeeList
- Responsive theme updates
- Increased stability

## 0.2.0

- Upgraded React to v19
