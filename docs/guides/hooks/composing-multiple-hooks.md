---
title: Composing multiple hooks
description: Coordinate several SDK hooks on one screen — combining error state with composeErrorHandler and ordered submits with composeSubmitHandler.
order: 3
---

A screen that combines multiple SDK hooks, or mixes SDK hooks with additional `@gusto/embedded-api-v-2026-02-01` queries, produces multiple `errorHandling` objects and (for form screens) multiple submit flows. Two small helpers stitch them together:

- **`composeErrorHandler([sources])`** — merges many error sources into a single `HookErrorHandling`.
- **`composeSubmitHandler([forms], onAllValid)`** — coordinates validation and ordered submits across forms, and returns `{ handleSubmit, errorHandling }` where `errorHandling` is built from those forms via `composeErrorHandler` under the hood.

## Combining data fetches with `composeErrorHandler`

Use `composeErrorHandler` to produce a single `errorHandling` bag for any screen that reads from multiple sources. It accepts any mix of:

- **SDK hook results** — objects with an `errorHandling` property (e.g., `useEmployeeDetailsForm`, `useCompensationForm`, or the return value of `composeSubmitHandler`).
- **`@gusto/embedded-api-v-2026-02-01` React Query results** — objects with `error` and `refetch` properties.

```tsx
import { composeErrorHandler, useEmployeeDetailsForm } from '@gusto/embedded-react-sdk'
import { useEmployeeFormsList } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeFormsList'

function EmployeeProfileView({ companyId, employeeId }: { companyId: string; employeeId: string }) {
  const employeeDetails = useEmployeeDetailsForm({ companyId, employeeId })
  const formsListQuery = useEmployeeFormsList({ employeeId })

  const errorHandling = composeErrorHandler([employeeDetails, formsListQuery])

  if (errorHandling.errors.length > 0) {
    return (
      <div role="alert">
        {errorHandling.errors.map((error, i) => (
          <p key={i}>{error.message}</p>
        ))}
        <button onClick={errorHandling.retryQueries}>Retry</button>
      </div>
    )
  }

  // ...render
}
```

`employeeDetails` is an SDK hook result (its `errorHandling` is delegated into), while `formsListQuery` is a raw `@gusto/embedded-api-v-2026-02-01` query (its `error` is normalized and its `refetch` is wired into `retryQueries`). The same call works for any combination of the two shapes.

The returned `errorHandling` has the same shape as any SDK hook's `errorHandling`:

- `errors: SDKError[]` — fetch errors from all sources.
- `retryQueries()` — refetches every failed query and delegates into nested hooks so their retries fire too.
- `clearSubmitError()` — clears submit errors across any nested hook results passed in.

## Combining forms with `composeSubmitHandler`

When multiple forms sit on the same page (e.g., employee details and compensation side by side), use `composeSubmitHandler` to coordinate validation, focus, and ordered submission across all of them. It returns both pieces you typically need:

- **`handleSubmit`** — a form event handler that validates every form in parallel, focuses the first invalid field across forms (in array order) if any fail, and calls your `onAllValid` callback only when every form passes.
- **`errorHandling`** — a combined `HookErrorHandling` built from the forms via `composeErrorHandler` internally. No need to call `composeErrorHandler` yourself for the common case.

```tsx
const { handleSubmit, errorHandling } = composeSubmitHandler(
  [employeeDetails, compensation],
  async () => {
    await employeeDetails.actions.onSubmit()
    await compensation.actions.onSubmit()
  },
)
```

If the same screen also has extra `@gusto/embedded-api-v-2026-02-01` queries that should feed the same error banner, pass the `composeSubmitHandler` result back into `composeErrorHandler` alongside those queries — the result already satisfies `composeErrorHandler`'s input shape:

```tsx
const submitResult = composeSubmitHandler([employeeDetails, compensation], onAllValid)

const errorHandling = composeErrorHandler([submitResult, extraQuery])
```

## Setup

Each form hook must be initialized with `shouldFocusError: false` so that react-hook-form's per-form focus is disabled and `composeSubmitHandler` can manage cross-form focus instead.

Both connection approaches work with composition. Choose the one that fits your layout.

### Grouped layout with `SDKFormProvider`

When fields from each hook are grouped into their own sections, `SDKFormProvider` keeps things clean:

```tsx
import {
  useEmployeeDetailsForm,
  useCompensationForm,
  composeSubmitHandler,
  SDKFormProvider,
} from '@gusto/embedded-react-sdk'

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

  const EmployeeDetailsFields = employeeDetails.form.Fields
  const CompensationFields = compensation.form.Fields

  const { handleSubmit, errorHandling } = composeSubmitHandler(
    [employeeDetails, compensation],
    async () => {
      await employeeDetails.actions.onSubmit()
      await compensation.actions.onSubmit()
    },
  )

  return (
    <form onSubmit={handleSubmit}>
      {errorHandling.errors.length > 0 && (
        <div role="alert">
          {errorHandling.errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
        </div>
      )}

      <SDKFormProvider formHookResult={employeeDetails}>
        <h2>Employee Details</h2>
        <EmployeeDetailsFields.FirstName label="First name" />
        <EmployeeDetailsFields.LastName label="Last name" />
      </SDKFormProvider>

      <SDKFormProvider formHookResult={compensation}>
        <h2>Compensation</h2>
        <CompensationFields.JobTitle label="Job title" />
        <CompensationFields.Rate label="Pay rate" />
      </SDKFormProvider>

      <button type="submit">Save All</button>
    </form>
  )
}
```

Each `SDKFormProvider` scopes field metadata and error syncing to its respective hook. The outer `<form>` element uses the composed submit handler, and the combined `errorHandling` drives a single banner covering fetch failures from either hook and submit failures from any of the `onSubmit` calls.

### Interleaved layout with `formHookResult` prop

When you want to mix fields from different hooks in any order — for example, placing job title next to first name, or grouping fields by theme rather than domain — use the `formHookResult` prop. There are no provider boundaries to manage, so fields can go anywhere:

```tsx
import {
  useEmployeeDetailsForm,
  useCompensationForm,
  useWorkAddressForm,
  composeSubmitHandler,
} from '@gusto/embedded-react-sdk'

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

  const workAddress = useWorkAddressForm({
    companyId,
    employeeId,
    shouldFocusError: false,
  })

  if (employeeDetails.isLoading || compensation.isLoading || workAddress.isLoading) {
    return <LoadingSpinner />
  }

  const EmployeeDetailsFields = employeeDetails.form.Fields
  const CompensationFields = compensation.form.Fields
  const WorkAddressFields = workAddress.form.Fields

  const { handleSubmit, errorHandling } = composeSubmitHandler(
    [employeeDetails, compensation, workAddress],
    async () => {
      await employeeDetails.actions.onSubmit()
      await compensation.actions.onSubmit()
      await workAddress.actions.onSubmit()
    },
  )

  return (
    <form onSubmit={handleSubmit}>
      {errorHandling.errors.length > 0 && (
        <div role="alert">
          {errorHandling.errors.map((error, i) => (
            <p key={i}>{error.message}</p>
          ))}
        </div>
      )}

      <section>
        <h2>Who</h2>
        <EmployeeDetailsFields.FirstName label="First name" formHookResult={employeeDetails} />
        <EmployeeDetailsFields.LastName label="Last name" formHookResult={employeeDetails} />
        <EmployeeDetailsFields.Email label="Email" formHookResult={employeeDetails} />
        <CompensationFields.StartDate label="Start date" formHookResult={compensation} />
      </section>

      <section>
        <h2>Role and Location</h2>
        <CompensationFields.JobTitle label="Job title" formHookResult={compensation} />
        <WorkAddressFields.Location label="Work address" formHookResult={workAddress} />
        <CompensationFields.Rate label="Pay rate" formHookResult={compensation} />
        <CompensationFields.PaymentUnit label="Pay frequency" formHookResult={compensation} />
      </section>

      <button type="submit">Save All</button>
    </form>
  )
}
```

Fields from `employeeDetails`, `compensation`, and `workAddress` are freely interleaved — each field knows which hook it belongs to via its `formHookResult` prop. Validation, error handling, and submission all work identically to the provider-based approach.

## Composing Job + Compensation

Jobs and compensations are separate entities in the Gusto API, and most product flows compose both hooks on the same screen. See [Working with Jobs and Compensations](./jobs-and-compensations.md) for the full onboarding stub-fill and steady-state-edit patterns; the sections below cover the essentials.

---

## Submit-time entity ID resolution

In a create flow, the employee doesn't exist yet — so `useCompensationForm` and `useWorkAddressForm` can't receive an `employeeId` at init time. Both hooks accept `employeeId` as optional in their props and allow it to be provided at submit time via the `options` parameter:

```tsx
function CreateOnboardingPage({ companyId }: { companyId: string }) {
  const employeeDetails = useEmployeeDetailsForm({
    companyId,
    shouldFocusError: false,
  })

  const compensation = useCompensationForm({
    shouldFocusError: false,
  })

  const workAddress = useWorkAddressForm({
    companyId,
    shouldFocusError: false,
  })

  // ...loading checks...

  const { handleSubmit } = composeSubmitHandler(
    [employeeDetails, compensation, workAddress],
    async () => {
      const employeeResult = await employeeDetails.actions.onSubmit()
      if (!employeeResult) return

      const newEmployeeId = employeeResult.data.uuid

      await compensation.actions.onSubmit({ employeeId: newEmployeeId })
      await workAddress.actions.onSubmit(undefined, { employeeId: newEmployeeId })
    },
  )

  // ...render forms...
}
```

When `employeeId` is omitted from props, the hooks skip data fetching and render in create mode with empty defaults. The ID is resolved at submit time, avoiding re-render cycles that would tear down the form UI.

## Handling submission failures

`composeSubmitHandler` takes care of client-side validation — your `onAllValid` callback only runs when every form passes. However, API mutations inside the callback can still fail. When they do, `onSubmit` returns `undefined` (it never throws) and the error is automatically captured in `errorHandling.errors` for display.

Early return when a subsequent call depends on data from a prior call:

```tsx
const { handleSubmit, errorHandling } = composeSubmitHandler(
  [employeeDetails, compensation, workAddress],
  async () => {
    const employeeResult = await employeeDetails.actions.onSubmit()
    if (!employeeResult) return

    const newEmployeeId = employeeResult.data.uuid

    await compensation.actions.onSubmit({ employeeId: newEmployeeId })
    await workAddress.actions.onSubmit(undefined, { employeeId: newEmployeeId })
  },
)
```

Here `compensation` and `workAddress` both need the employee ID, so if employee creation fails there's nothing to pass and no reason to continue. The user will see the error from `errorHandling.errors` and can retry.

For independent submissions where one doesn't depend on the other's result, continuing after a failure is a valid choice — it depends on your product requirements.
