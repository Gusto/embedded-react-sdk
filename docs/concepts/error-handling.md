---
title: Error Handling
sidebar_position: 7
---

The SDK handles errors at multiple layers: form submissions, component rendering, and top-level provider boundaries. All errors are normalized into a unified `SDKError` type.

## SDKError

Every error surfaces as an `SDKError`:

```typescript
interface SDKError {
  category: 'api_error' | 'validation_error' | 'network_error' | 'internal_error'
  message: string
  httpStatus?: number
  fieldErrors: SDKFieldError[]
  raw?: unknown
}
```

| Category | Description | Examples |
| --- | --- | --- |
| `api_error` | HTTP error from the Gusto API | 422 validation errors, 404 not found, 409 conflict |
| `validation_error` | Client-side Zod schema failure | Request or response failed Zod validation |
| `network_error` | Network connectivity failure | Connection refused, timeout, request aborted |
| `internal_error` | Unexpected runtime error | Unhandled exceptions, initialization failures |

### Field errors

For `api_error` responses with structured validation errors (e.g., 422), the SDK extracts field-level errors:

```typescript
interface SDKFieldError {
  field: string
  category: string
  message: string
  metadata?: Record<string, unknown>
}
```

Components that use `react-hook-form` automatically map these field errors to inline form validation.

## Error boundaries

### Component-level

Each SDK component is wrapped in a React `ErrorBoundary`. Unexpected rendering errors are caught and displayed as a recoverable error screen with a "Try again" button.

### Top-level

Errors that escape component-level boundaries are caught by a top-level `ErrorBoundary` in `GustoProvider`. This prevents SDK errors from crashing your application.

## Error display

The SDK renders errors based on their shape:

- **Field errors** — displayed as an unordered list of individual field messages
- **Validation errors** — displayed as preformatted Zod output
- **All other errors** — displayed as a generic "An error occurred" message

## Observability hooks

To track errors in production, configure the `observability` option on `GustoProvider`:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: (error) => {
    Sentry.captureException(error.raw ?? new Error(error.message), {
      tags: {
        error_category: error.category,
        component: error.componentName ?? 'unknown',
        http_status: String(error.httpStatus ?? ''),
      },
    })
  },
  onMetric: (metric) => {
    if (metric.unit === 'ms') {
      datadogRum.addTiming(metric.name, metric.value)
    }
  },
}

function App({ children }) {
  return (
    <GustoProvider
      config={{
        baseUrl: '/api/gusto/',
        observability,
      }}
    >
      {children}
    </GustoProvider>
  )
}
```

The `onError` callback receives an `ObservabilityError`, which extends `SDKError` with:

- `timestamp` — when the error occurred
- `componentName` — the SDK component that errored (e.g., `"Employee.Profile"`)
- `componentStack` — the React component hierarchy (for rendering errors)

The `onMetric` callback receives performance metrics like form submission duration and component loading time.

## PII sanitization

By default, the SDK sanitizes all error and metric data before passing it to your observability hooks:

- SSNs, email addresses, phone numbers, credit card numbers, and API keys are pattern-redacted
- Sensitive field names (`password`, `token`, `ssn`, `bankAccount`, etc.) are removed
- The `raw` error field is excluded by default to prevent PII leakage

Configure sanitization behavior:

```tsx
const observability: ObservabilityHook = {
  onError: (error) => errorTracker.capture(error),
  sanitization: {
    enabled: true,
    includeRawError: false,
    additionalSensitiveFields: ['customerId'],
  },
}
```

For detailed integration examples (Sentry, Datadog) and the full metric/error type reference, see the [observability documentation](../guides/observability.md).
