# Changelog

## 0.8.1

- Replaced Valibot with Zod for bundle size reduction. Also included zod as a dependency
- Updated package.json to fix an issue with types being unavailable for consumers
- Misc style corrections and consistency fixes

## 0.8.0

- Company Onboarding flow improvements and fixes:
  - Added comprehensive Company.OnboardingFlow component that guides users through the entire onboarding process
  - Introduced Company.OnboardingOverview component for tracking onboarding progress
  - Improved state management and context handling for onboarding components
  - Enhanced documentation for company onboarding workflow
- Added Company.StateTaxesFlow component for managing state tax requirements
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
