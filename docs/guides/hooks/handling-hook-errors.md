---
title: Handling hook errors
description: The error surface returned by every hook — surfacing query and submit errors, retries, and recovery actions.
order: 2
---

All hooks return an `errorHandling` object in **both** loading and ready states. This ensures you can always display errors and offer recovery actions, even when data never loaded.

```typescript
interface HookErrorHandling {
  errors: SDKError[]
  retryQueries: () => void
  clearSubmitError: () => void
}
```

## Multi-hook screens

When a screen pulls from more than one SDK hook (or mixes SDK hooks with additional `@gusto/embedded-api-v-2026-02-01` queries), combine their error state into one banner and one retry/dismiss flow using `composeErrorHandler` / `composeSubmitHandler`. See [Composing Multiple Hooks](./composing-multiple-hooks.md).

## SDKError shape

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

## Error categories and recommended actions

| Category           | What happened                                                    | What you should do                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api_error`        | HTTP error from the Gusto API (422, 404, 409, etc.)              | Display `error.message`. For 422 responses, check `error.fieldErrors` for inline field-level messages. For 404/409, show a contextual message to the user. |
| `validation_error` | Client-side schema validation failed before the request was sent | This is likely an SDK bug. Display a generic error and report to Gusto.                                                                                    |
| `network_error`    | Network connectivity failure (timeout, connection refused)       | Show retry UI using `errorHandling.retryQueries()`. Suggest the user check their connection.                                                               |
| `internal_error`   | Unexpected SDK runtime error                                     | Display a generic error and report to Gusto.                                                                                                               |

## Recovery actions

- **`retryQueries()`** — Retries all failed data-fetching queries. Dependent queries automatically re-trigger when their dependencies resolve.
- **`clearSubmitError()`** — Clears the most recent form submission error from state.

Explicit **`query` vs `submit` labels** on each `SDKError` are not part of the type today; infer recovery from **`retryQueries`** (fetch) vs **`clearSubmitError`** (submit). A future revision may add structured discrimination.

## Example: error display with retry

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

## Handling submit errors

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

Field-level API errors (e.g., 422 responses with `fieldErrors`) are automatically synced to the corresponding form fields so they appear inline alongside client-side validation errors. When using `SDKFormProvider`, the provider handles this syncing via context. When using the `formHookResult` prop, each field resolves errors directly from `formHookResult.errorHandling.errors` — no provider is needed.

For a deeper look at the SDK's error architecture, see [Error Handling in the React SDK](../integration-guide/error-handling.md) and [Observability](../integration-guide/observability.md).
