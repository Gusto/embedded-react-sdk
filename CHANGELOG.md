# Changelog

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
