---
title: Hooks
order: 1
---

# Hooks

Hooks give you full control over form rendering while the SDK manages data fetching, validation, submission, and error handling. Each hook returns pre-bound field components, metadata, and actions — you supply the layout and labels.

> Hooks are an experimental feature. APIs may change between minor versions during 0.x.x releases.

## Available Hooks

| Hook                     | Description                                                                                                  | Reference                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `useEmployeeDetailsForm` | Create or update employee profile fields (name, email, SSN, date of birth, self-onboarding)                  | [useEmployeeDetailsForm](./useEmployeeDetailsForm.md) |
| `useCompensationForm`    | Create or update job compensation (job title, FLSA status, pay rate, payment unit, minimum wage adjustments) | [useCompensationForm](./useCompensationForm.md)       |
| `useWorkAddressForm`     | Create or update an employee's work address (company location select, effective date)                        | [useWorkAddressForm](./useWorkAddressForm.md)         |

---

## Getting Started

All hooks are exported from the `@gusto/embedded-react-sdk/unstable` entry point. Your app must be wrapped in `GustoProvider`.

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import { useEmployeeDetailsForm, SDKFormProvider } from '@gusto/embedded-react-sdk/unstable'

function App() {
  return (
    <GustoProvider config={{ apiToken: '...' }}>
      <EmployeeForm companyId="company-uuid" />
    </GustoProvider>
  )
}

function EmployeeForm({ companyId }: { companyId: string }) {
  const employeeDetails = useEmployeeDetailsForm({ companyId })

  if (employeeDetails.isLoading) {
    return <div>Loading...</div>
  }

  const { Fields } = employeeDetails.form

  return (
    <SDKFormProvider formHookResult={employeeDetails}>
      <form
        onSubmit={async e => {
          e.preventDefault()
          await employeeDetails.actions.onSubmit()
        }}
      >
        <Fields.FirstName label="First name" />
        <Fields.LastName label="Last name" />
        <button type="submit">Save</button>
      </form>
    </SDKFormProvider>
  )
}
```

### Key concepts

1. **Call the hook** with the required identifiers (`companyId`, `employeeId`, etc.)
2. **Check `isLoading`** — the hook fetches server data before the form is ready
3. **Wrap with `SDKFormProvider`** — this connects react-hook-form, field metadata, and server error syncing
4. **Render `Fields`** — each field is a pre-bound component that handles validation, error display, and metadata automatically
5. **Call `onSubmit`** — the hook handles API mutations, error normalization, and returns the saved entity

---

## Field Rendering and Custom UI

### Component Adapter integration

By default, every field component renders through the SDK's [Component Adapter](../component-adapter/component-adapter.md). If you've configured a Component Adapter for your app (e.g., mapping to your own design system), hook fields will automatically render using your custom components. If no adapter is configured, fields render using the SDK's built-in React Aria-driven components.

This means hooks inherit whatever UI customization you've already set up at the `GustoProvider` level -- no extra configuration needed.

### Overriding a single field with `FieldComponent`

If you need a specific field to render differently without changing your global Component Adapter, most fields accept a `FieldComponent` prop. This lets you swap the UI for a single field by providing your own component that conforms to the expected props interface.

The `FieldComponent` receives the same props the underlying UI primitive expects (`TextInputProps`, `SelectProps`, `NumberInputProps`, etc.) -- including `value`, `onChange`, `onBlur`, error state, and accessibility attributes. You don't need any react-hook-form knowledge; the hook field handles all form binding and passes clean UI props to your component.

```tsx
import type { TextInputProps } from '@gusto/embedded-react-sdk/unstable'

function MyCustomTextInput(props: TextInputProps) {
  return (
    <div className="my-field-wrapper">
      <label>{props.label}</label>
      <input
        value={props.value}
        onChange={e => props.onChange?.(e.target.value)}
        onBlur={props.onBlur}
        disabled={props.isDisabled}
        required={props.isRequired}
      />
      {props.errorMessage && <span className="error">{props.errorMessage}</span>}
    </div>
  )
}

;<Fields.FirstName
  label="First name"
  FieldComponent={MyCustomTextInput}
  validationMessages={{ REQUIRED: 'First name is required' }}
/>
```

This is useful when you want to use a third-party input library for one field, add custom styling, or render a completely different control while still getting the hook's validation, error handling, and form binding for free.

---

## Loading States

Every hook returns a discriminated union on `isLoading`. While server data is being fetched, only `isLoading` and `errorHandling` are available:

```tsx
const employeeDetails = useEmployeeDetailsForm({ companyId, employeeId })

// Loading branch — no form data yet
if (employeeDetails.isLoading) {
  return <LoadingSpinner />
}

// Ready branch — TypeScript narrows to the full return type
const { data, form, actions, status, errorHandling } = employeeDetails
```

The loading state is also where you first encounter errors — if a data-fetching query fails, the hook stays in the loading branch but `errorHandling.errors` will be populated. See [Error Handling](#error-handling) below.

---

## Error Handling

All hooks return an `errorHandling` object in **both** loading and ready states. This ensures you can always display errors and offer recovery actions, even when data never loaded.

```typescript
interface HookErrorHandling {
  errors: SDKError[]
  retryQueries: () => void
  clearSubmitError: () => void
}
```

### SDKError shape

```typescript
interface SDKError {
  category: 'api_error' | 'validation_error' | 'network_error' | 'internal_error'
  message: string
  httpStatus?: number
  fieldErrors: SDKFieldError[]
  raw?: unknown
}

interface SDKFieldError {
  field: string
  category: string
  message: string
  metadata?: Record<string, unknown>
}
```

### Error categories and partner actions

| Category           | What happened                                                    | What you should do                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api_error`        | HTTP error from the Gusto API (422, 404, 409, etc.)              | Display `error.message`. For 422 responses, check `error.fieldErrors` for inline field-level messages. For 404/409, show a contextual message to the user. |
| `validation_error` | Client-side schema validation failed before the request was sent | This is likely an SDK bug. Display a generic error and report to Gusto.                                                                                    |
| `network_error`    | Network connectivity failure (timeout, connection refused)       | Show retry UI using `errorHandling.retryQueries()`. Suggest the user check their connection.                                                               |
| `internal_error`   | Unexpected SDK runtime error                                     | Display a generic error and report to Gusto.                                                                                                               |

### Recovery actions

- **`retryQueries()`** — Retries all failed data-fetching queries. Dependent queries automatically re-trigger when their dependencies resolve.
- **`clearSubmitError()`** — Clears the most recent form submission error from state.

### Example: error display with retry

```tsx
function EmployeeForm({ companyId }: { companyId: string }) {
  const employeeDetails = useEmployeeDetailsForm({ companyId })

  if (employeeDetails.isLoading) {
    const { errors, retryQueries } = employeeDetails.errorHandling

    if (errors.length > 0) {
      return (
        <div>
          <p>Failed to load employee data.</p>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
          <button onClick={retryQueries}>Retry</button>
        </div>
      )
    }

    return <LoadingSpinner />
  }

  // ... render form
}
```

### Handling submit errors

Submit errors (from API mutations) are also collected into `errorHandling.errors`. After a failed submission, you can display the error and let the user correct their input:

```tsx
const { errors, clearSubmitError } = employeeDetails.errorHandling

{
  errors.length > 0 && (
    <div role="alert">
      {errors.map((error, i) => (
        <p key={i}>{error.message}</p>
      ))}
    </div>
  )
}
```

Field-level API errors (e.g., 422 responses with `fieldErrors`) are automatically synced to the corresponding form fields by `SDKFormProvider`, so they appear inline alongside client-side validation errors.

For a deeper look at the SDK's error architecture, see [Error Handling in the React SDK](../integration-guide/error-handling.md) and [Observability](../integration-guide/observability.md).

---

## Submit Handler

Each hook's `actions.onSubmit` is an async function that validates the form, calls the appropriate API mutations, and returns the result.

```typescript
interface HookSubmitResult<T> {
  mode: 'create' | 'update'
  data: T
}
```

`onSubmit` accepts optional callbacks that fire after each mutation step. This is useful for telemetry logging or reacting to individual API call results:

```tsx
const result = await employeeDetails.actions.onSubmit({
  onEmployeeCreated: employee => {
    console.log('Created:', employee.uuid)
  },
  onEmployeeUpdated: employee => {
    console.log('Updated:', employee.uuid)
  },
})

if (result) {
  // result.mode is 'create' or 'update'
  // result.data is the saved Employee entity
  navigate(`/employees/${result.data.uuid}`)
}
```

If validation fails, `onSubmit` returns `undefined` and the form fields display their error messages. If a mutation fails, the error is captured in `errorHandling.errors`.

### Checking pending state

Use `status.isPending` to disable the submit button while mutations are in flight:

```tsx
<button type="submit" disabled={employeeDetails.status.isPending}>
  {employeeDetails.status.isPending ? 'Saving...' : 'Save'}
</button>
```

---

## Validation Messages

Each field component accepts a `validationMessages` prop that maps error codes to human-readable strings. Error codes are defined as typed constants, and TypeScript enforces that you provide a message for every code the field can produce.

```tsx
import { EmployeeDetailsErrorCodes } from '@gusto/embedded-react-sdk/unstable'
;<Fields.Email
  label="Email"
  validationMessages={{
    REQUIRED: 'Email is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    EMAIL_REQUIRED_FOR_SELF_ONBOARDING: 'Email is required when self-onboarding is enabled',
  }}
/>
```

If you omit `validationMessages`, validation still runs but no message is displayed — the field is marked as invalid without explanatory text.

Error codes for each hook are exported alongside the hook:

- `EmployeeDetailsErrorCodes` — see [useEmployeeDetailsForm field reference](./useEmployeeDetailsForm.md#fields-reference)
- `CompensationErrorCodes` — see [useCompensationForm field reference](./useCompensationForm.md#fields-reference)
- `WorkAddressErrorCodes` — see [useWorkAddressForm field reference](./useWorkAddressForm.md#fields-reference)

---

## Composing Multiple Hooks

When you need multiple forms on the same page (e.g., employee details and compensation side by side), use `composeSubmitHandler` to coordinate validation and submission across all forms.

`composeSubmitHandler` validates all forms simultaneously, then focuses the first invalid field across all forms (in array order). It only calls your submission logic when every form passes validation.

### Setup

Each hook must be initialized with `shouldFocusError: false` so that react-hook-form's per-form focus is disabled and `composeSubmitHandler` can manage cross-form focus instead.

```tsx
import {
  useEmployeeDetailsForm,
  useCompensationForm,
  composeSubmitHandler,
  SDKFormProvider,
} from '@gusto/embedded-react-sdk/unstable'

function OnboardingPage({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const employeeDetails = useEmployeeDetailsForm({
    companyId,
    employeeId,
    shouldFocusError: false,
  })

  const compensation = useCompensationForm({
    employeeId,
    shouldFocusError: false,
  })

  if (employeeDetails.isLoading || compensation.isLoading) {
    return <LoadingSpinner />
  }

  const DetailsFields = employeeDetails.form.Fields
  const CompFields = compensation.form.Fields

  const handleSubmit = composeSubmitHandler([employeeDetails, compensation], async () => {
    await employeeDetails.actions.onSubmit()
    await compensation.actions.onSubmit()
  })

  return (
    <form onSubmit={handleSubmit}>
      <SDKFormProvider formHookResult={employeeDetails}>
        <h2>Employee Details</h2>
        <DetailsFields.FirstName label="First name" />
        <DetailsFields.LastName label="Last name" />
      </SDKFormProvider>

      <SDKFormProvider formHookResult={compensation}>
        <h2>Compensation</h2>
        <CompFields.JobTitle label="Job title" />
        <CompFields.Rate label="Pay rate" />
      </SDKFormProvider>

      <button type="submit">Save All</button>
    </form>
  )
}
```

Each `SDKFormProvider` scopes field metadata and error syncing to its respective hook. The outer `<form>` element uses the composed submit handler to coordinate everything.

---

## Advanced: Fields Metadata

Each hook exposes `form.fieldsMetadata` — an object keyed by field name with metadata about each field's current state. The field components consume this automatically under the hood to determine required/disabled states and populate select options, so you typically don't need to interact with it directly.

If you're building fully custom field UI, you can read this metadata yourself:

```tsx
const { fieldsMetadata } = employeeDetails.form

if (fieldsMetadata.email.isRequired) {
  // Show a required indicator in your custom UI
}
```
