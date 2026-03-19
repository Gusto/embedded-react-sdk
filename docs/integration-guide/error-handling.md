---
title: Error Handling in the React SDK
order: 7
---

# Error Handling in the React SDK

Error handling in the React SDK occurs across multiple layers:

1. **Top-Level Error Boundary** — in `GustoProviderCustomUIAdapter.tsx`
2. **Component-Level Error Boundary** — in `Base.tsx`
3. **Form Submission Error Processing** — in `useBaseSubmit.ts`
4. **Observability Hooks** — for error tracking (see [Observability](./observability.md))

---

## Error Types

The SDK uses a unified `SDKError` type for all error scenarios:

```typescript
interface SDKError {
  category: 'api_error' | 'validation_error' | 'network_error' | 'internal_error'
  message: string
  httpStatus?: number
  fieldErrors: SDKFieldError[]
  raw?: unknown
}
```

| Category           | Description                    | Examples                                                 |
| ------------------ | ------------------------------ | -------------------------------------------------------- |
| `api_error`        | HTTP error from the Gusto API  | 422 validation errors, 404 not found, 409 conflict       |
| `validation_error` | Client-side Zod schema failure | Request/response failed Zod validation before being sent |
| `network_error`    | Network connectivity failure   | Connection refused, timeout, request aborted             |
| `internal_error`   | Unexpected runtime error       | Unhandled exceptions, initialization failures            |

---

## How Errors Flow

### Form Submission Errors (Handled)

When a form submission fails, `useBaseSubmit` catches the error and normalizes it into an `SDKError` via `normalizeToSDKError`. This error is:

1. Set as component state (`error`) for UI rendering
2. Emitted to `observability.onError` as an `ObservabilityError` (with `timestamp` and `componentName`)

For API errors with structured field errors (e.g. 422), the SDK extracts field-level errors into `error.fieldErrors`. Components like `FederalTaxes`, `StateTaxes`, and `PaySchedule` map these to inline form validation via `react-hook-form`.

### Error Boundary Errors (Unhandled)

Unexpected errors thrown during rendering are caught by the React ErrorBoundary in `Base.tsx`. These are:

1. Rendered using the `InternalError` component (or a custom `FallbackComponent`)
2. Emitted to `observability.onError` with `componentName` and `componentStack`

A **"Try again"** button is shown, allowing users to attempt a re-render.

### Top-Level Errors

Errors that escape component-level boundaries are caught by the top-level ErrorBoundary in `GustoProviderCustomUIAdapter`. These are emitted to `observability.onError` with a `componentStack` for debugging.

---

## Error Display

The `BaseLayout` component renders errors based on their shape:

- **Field errors** — displayed as an unordered list of individual field messages
- **Validation errors** — displayed as preformatted Zod output
- **All other errors** — displayed as a generic "An error occurred" message

---

## Error Tracking

To track and monitor errors in production, use the observability hooks. These allow you to send errors to services like Sentry, Datadog, or your own monitoring solution.

See the [Observability documentation](./observability.md) for detailed information on error tracking, PII sanitization, and integration examples.
