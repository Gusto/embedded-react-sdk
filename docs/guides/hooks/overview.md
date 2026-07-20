---
title: Hooks overview
description: Headless form and data hooks that handle data fetching, validation, submission, and error handling — you supply the layout and presentation.
order: 3
---

# Hooks

Hooks let you own the layout while the SDK manages data fetching, validation, submission, and error handling. **Form hooks** return pre-bound field components, metadata, and actions for rendering a form — you supply the layout and labels. **Data hooks** return fetched, decorated data plus the actions valid for it — you supply the presentation. Both share the same loading/error/`HookErrorHandling` conventions.

## Getting Started

All hooks are exported from `@gusto/embedded-react-sdk`. Your app must be wrapped in `GustoProvider`.

```tsx
import { GustoProvider, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'

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
    <form
      onSubmit={async e => {
        e.preventDefault()
        await employeeDetails.actions.onSubmit()
      }}
    >
      <Fields.FirstName label="First name" formHookResult={employeeDetails} />
      <Fields.LastName label="Last name" formHookResult={employeeDetails} />
      <button type="submit">Save</button>
    </form>
  )
}
```

### Key concepts

1. **Call the hook** with the required identifiers (`companyId`, `employeeId`, etc.)
2. **Check `isLoading`** — the hook fetches server data before the form is ready
3. **Connect fields** — pass `formHookResult` as a prop to each field, or wrap fields in `SDKFormProvider` for context-based connection (see [Connecting Fields to the Form](#connecting-fields-to-the-form))
4. **Render `Fields`** — each field is a pre-bound component that handles validation, error display, and metadata automatically
5. **Call `onSubmit`** — the hook handles API mutations, error normalization, and returns the saved entity

---

## Connecting Fields to the Form

Every Field component needs access to form state — react-hook-form's control, field metadata (required/disabled), and error messages. There are two ways to provide this connection:

### Option A: `formHookResult` prop (explicit)

Pass the hook result directly to each field. No wrapper component needed.

```tsx
const { Fields } = employeeDetails.form

<Fields.FirstName label="First name" formHookResult={employeeDetails} />
<Fields.LastName label="Last name" formHookResult={employeeDetails} />
<Fields.Email label="Email" formHookResult={employeeDetails} />
```

Each field reads metadata, form control, and error state directly from the prop. This is the most flexible approach — fields can be placed anywhere in your component tree and interleaved freely with fields from other hooks.

### Option B: `SDKFormProvider` (context)

Wrap fields in `SDKFormProvider` and they pick up form state from context automatically.

```tsx
import { SDKFormProvider } from '@gusto/embedded-react-sdk'

function EmployeeFormSection() {
  // ...employeeDetails from useEmployeeDetailsForm

  const { Fields } = employeeDetails.form

  return (
    <SDKFormProvider formHookResult={employeeDetails}>
      <Fields.FirstName label="First name" />
      <Fields.LastName label="Last name" />
      <Fields.Email label="Email" />
    </SDKFormProvider>
  )
}
```

Fields inside an `SDKFormProvider` don't need the `formHookResult` prop — the provider injects form state via React context. This is convenient when all fields from a single hook are grouped together.

### Choosing an approach

Both approaches produce identical validation, API payloads, and behavior. The difference is purely in how fields discover their form state.

| Aspect                | `formHookResult` prop                                               | `SDKFormProvider`                               |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------- |
| **Best for**          | Interleaving fields from multiple hooks; maximum layout flexibility | Grouping fields from a single hook together     |
| **Boilerplate**       | Each field receives the prop                                        | One wrapper, fields are clean                   |
| **Interleaving**      | Fields from different hooks can be placed in any order              | Fields must stay within their provider boundary |
| **API error syncing** | Handled automatically per-field                                     | Handled automatically via the provider          |

#### Side-by-side: two hooks on one screen

The same `employeeDetails` + `compensation` form, written each way:

```tsx
// Option A: formHookResult prop — fields can be interleaved freely
const EmployeeDetailsFields = employeeDetails.form.Fields
const CompensationFields = compensation.form.Fields

<EmployeeDetailsFields.FirstName label="First name" formHookResult={employeeDetails} />
<EmployeeDetailsFields.LastName label="Last name" formHookResult={employeeDetails} />
<CompensationFields.JobTitle label="Job title" formHookResult={compensation} />
<CompensationFields.Rate label="Pay rate" formHookResult={compensation} />
```

```tsx
// Option B: SDKFormProvider — one wrapper per hook, fields stay grouped
<SDKFormProvider formHookResult={employeeDetails}>
  <EmployeeDetailsFields.FirstName label="First name" />
  <EmployeeDetailsFields.LastName label="Last name" />
</SDKFormProvider>

<SDKFormProvider formHookResult={compensation}>
  <CompensationFields.JobTitle label="Job title" />
  <CompensationFields.Rate label="Pay rate" />
</SDKFormProvider>
```

You can also mix approaches on the same page — for example, `SDKFormProvider` for one hook's fields that are grouped together, and `formHookResult` props for another hook's fields that are scattered. See [Composing multiple hooks](./composing-multiple-hooks.md) for the full submit-handler wiring around either layout.

> **Avoid passing `formHookResult` to fields via props that are already inside an `SDKFormProvider`.** When both are present on the same field, the prop takes precedence and the provider's context is ignored, which may lead to unexpected behavior.

---

## Field Rendering and Custom UI

### Component Adapter integration

By default, every field component renders through the SDK's [Component Adapter](../component-adapter/component-adapter.md). If you've configured a Component Adapter for your app (e.g., mapping to your own design system), hook fields will automatically render using your custom components. If no adapter is configured, fields render using the SDK's built-in React Aria-driven components.

This means hooks inherit whatever UI customization you've already set up at the `GustoProvider` level -- no extra configuration needed.

### Overriding a single field with `FieldComponent`

If you need a specific field to render differently without changing your global Component Adapter, most fields accept a `FieldComponent` prop. This lets you swap the UI for a single field by providing your own component that conforms to the expected props interface.

The `FieldComponent` receives the same props the underlying UI primitive expects (`TextInputProps`, `SelectProps`, `NumberInputProps`, etc.) -- including `value`, `onChange`, `onBlur`, error state, and accessibility attributes. You don't need any react-hook-form knowledge; the hook field handles all form binding and passes clean UI props to your component.

```tsx
import type { TextInputProps } from '@gusto/embedded-react-sdk'

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

// Then in your form:
;<Fields.FirstName
  label="First name"
  FieldComponent={MyCustomTextInput}
  validationMessages={{ REQUIRED: 'First name is required' }}
/>
```

This is useful when you want to use a third-party input library for one field, add custom styling, or render a completely different control while still getting the hook's validation, error handling, and form binding for free.

The `FieldComponent` prop is available on all field types: `TextInputProps`, `SelectProps`, `NumberInputProps`, `CheckboxProps`, `DatePickerProps`, `RadioGroupProps`, and `SwitchProps`. Import the corresponding prop type from `@gusto/embedded-react-sdk` for type-safe implementations.

---

## Data

Every form hook returns a `data` object when ready. This contains the entities fetched by the hook — the primary entity being edited plus any supporting data needed for the form.

```tsx
if (!employeeDetails.isLoading) {
  const { employee } = employeeDetails.data
  // employee is the loaded Employee entity (or null in create mode)
}
```

The shape of `data` varies by hook — see each hook's reference page for details:

- `useEmployeeDetailsForm` — `{ employee }`
- `useJobForm` — `{ currentJob, jobs, employee, currentWorkAddress, showTwoPercentShareholder, showStateWc }`
- `useCompensationForm` — `{ compensation, currentJob, minimumWages, minimumEffectiveDate, maximumEffectiveDate, hasPendingFutureCompensation }` (plus `status.willDeleteSecondaryJobs` for the reactive carve-out flag)
- `useWorkAddressForm` — `{ workAddress, workAddresses, companyLocations }`
- `usePayScheduleForm` — `{ paySchedule, payPeriodPreview, payPreviewLoading, paymentSpeedDays }`
- `useSignCompanyForm` — `{ companyForm, pdfUrl }`

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

The loading state is also where you first encounter errors — if a data-fetching query fails, the hook stays in the loading branch but `errorHandling.errors` will be populated. See [Handling hook errors](./handling-hook-errors.md).

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

### Checking pending state and mode

Use `status.isPending` to disable the submit button while mutations are in flight, and `status.mode` to adapt your UI based on whether the hook is creating or updating:

```tsx
<h2>{employeeDetails.status.mode === 'create' ? 'Add Employee' : 'Edit Employee'}</h2>

<button type="submit" disabled={employeeDetails.status.isPending}>
  {employeeDetails.status.isPending ? 'Saving...' : 'Save'}
</button>
```

`status.mode` is `'create'` when no existing entity was loaded (e.g., no `employeeId` was provided) and `'update'` when editing an existing record.

---

## Reading Form Values

Each hook exposes `form.getFormSubmissionValues()` — a synchronous function that returns the current form values parsed through the hook's Zod validation schema. The returned object matches exactly what `onSubmit` would receive: all preprocessing transforms (e.g., string-to-number coercion) are applied.

Returns `undefined` when the current form state is invalid (empty required fields, failed cross-field rules, etc.). It never throws.

```tsx
const values = employeeDetails.form.getFormSubmissionValues()

if (values) {
  console.log(values.firstName, values.lastName)
}
```

This is particularly useful when you need to share values across form submissions. For example, when the work address form captures an effective date that the compensation form needs as its start date, you can read the value from one form and pass it to the other's submit options:

```tsx
const workAddress = useWorkAddressForm({ companyId, shouldFocusError: false })
const compensation = useCompensationForm({
  withStartDateField: false,
  shouldFocusError: false,
})

// ...loading checks...

const { handleSubmit } = composeSubmitHandler(
  [employeeDetails, workAddress, compensation],
  async () => {
    const employeeResult = await employeeDetails.actions.onSubmit()
    if (!employeeResult) return

    const newEmployeeId = employeeResult.data.uuid
    const workAddressValues = workAddress.form.getFormSubmissionValues()

    await workAddress.actions.onSubmit(undefined, { employeeId: newEmployeeId })
    await compensation.actions.onSubmit({
      employeeId: newEmployeeId,
      startDate: workAddressValues?.effectiveDate,
    })
  },
)
```

`getFormSubmissionValues` has no side effects — it doesn't trigger re-renders, mutate form state, or update validation errors. It's a pure read from react-hook-form's internal store followed by Zod schema parsing.

---

## Advanced: Hook Form Internals

Each hook exposes `form.hookFormInternals` which provides direct access to the underlying react-hook-form `formMethods` (`UseFormReturn`). This is an escape hatch for advanced use cases that aren't covered by the hook's built-in API.

```tsx
const { formMethods } = employeeDetails.form.hookFormInternals

formMethods.watch('email')
formMethods.setValue('firstName', 'Jane')
formMethods.trigger('ssn')
```

Use this when you need to:

- Watch specific fields for reactive UI updates outside of the SDK fields
- Programmatically set or reset field values
- Trigger validation on specific fields manually
- Access form state like `isDirty`, `isValid`, or `dirtyFields`

In most cases the built-in Fields, `onSubmit`, and `getFormSubmissionValues` are sufficient. Reach for `hookFormInternals` only when you need fine-grained form control that the hook doesn't expose directly.

---

## Further reading

- [Hooks reference](../../reference/hooks.md) — all available hooks with full API signatures
- [Configuring form fields](./configuring-form-fields.md) — required fields, default values, and validation messages
- [Handling hook errors](./handling-hook-errors.md) — the `HookErrorHandling` surface, retries, and submit errors
- [Composing multiple hooks](./composing-multiple-hooks.md) — coordinating several hooks on one screen with `composeSubmitHandler` / `composeErrorHandler`
- [Working with jobs and compensations](./jobs-and-compensations.md) — onboarding stub-fill and steady-state edit patterns
