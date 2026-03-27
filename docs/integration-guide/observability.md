---
title: Observability and Error Tracking
order: 8
---

The Gusto Embedded React SDK provides built-in hooks for error tracking and performance monitoring. These hooks allow you to integrate with observability tools like Sentry, Datadog, New Relic, or your own custom monitoring solution.

---

## Overview

The observability system captures:

- **Errors** caught by error boundaries, validation failures, and API errors
- **Performance metrics** for form submissions and component operations

This is separate from the existing event system (`onEvent`) and request hooks (`beforeRequest`, `afterSuccess`, etc.), which remain available for business-level event tracking and request/response interception.

---

## Configuration

Configure observability by passing an `observability` object to the `GustoProvider` config:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    console.error('[SDK Error]', error.category, error.message)
  },
  onMetric: metric => {
    console.log('[SDK Metric]', metric.name, metric.value, metric.unit)
  },
}

function App() {
  return (
    <GustoProvider
      config={{
        baseUrl: '/api/',
        observability,
      }}
      components={yourComponents}
    >
      <YourApp />
    </GustoProvider>
  )
}
```

---

## Error Types

The SDK uses two error types:

### `SDKError` — Partner-facing error

The core error type exposed through partner-facing hooks (e.g. `useEmployeeForm`). Contains only actionable information about what happened.

```typescript
interface SDKError {
  category: 'api_error' | 'validation_error' | 'network_error' | 'internal_error'
  message: string
  httpStatus?: number
  fieldErrors: SDKFieldError[]
  raw?: unknown
}
```

### `ObservabilityError` — Telemetry-enriched error

Extends `SDKError` with context for error-tracking tools. This is the type received by `onError`.

```typescript
interface ObservabilityError extends SDKError {
  timestamp: number
  componentName?: string
  componentStack?: string
}
```

### Error Categories

| Category           | Description                       | When It Occurs                                              |
| ------------------ | --------------------------------- | ----------------------------------------------------------- |
| `api_error`        | HTTP error from the Gusto API     | API returns 4xx or 5xx status codes                         |
| `validation_error` | Client-side Zod schema validation | Request/response fails Zod validation before being sent     |
| `network_error`    | Network connectivity failure      | Connection refused, timeout, or request aborted             |
| `internal_error`   | Unexpected runtime error          | Unhandled exceptions caught by error boundaries or provider |

### Field Errors

For `api_error` responses with structured validation errors (e.g. 422), the SDK extracts and flattens field-level errors:

```typescript
interface SDKFieldError {
  field: string // Dot-separated path, e.g. "firstName" or "states.CA.filingStatus.value"
  category: string // API error category, e.g. "invalid_attribute_value"
  message: string // Human-readable message from the API
  metadata?: Record<string, unknown>
}
```

---

## Component Identification

SDK components report their name in error reports and metrics when available:

- Error context (`error.componentName`) — e.g. `"Employee.Profile"`
- Metric tags (`metric.tags.component`) — e.g. `"Employee.Compensation"`

For errors caught by React ErrorBoundaries, `error.componentStack` provides the full React component hierarchy.

---

## Error Tracking

### Integration Example: Sentry

```tsx
import * as Sentry from '@sentry/react'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    Sentry.captureException(error.raw ?? new Error(error.message), {
      level: error.category === 'validation_error' ? 'warning' : 'error',
      tags: {
        error_category: error.category,
        component: error.componentName ?? 'unknown',
        http_status: String(error.httpStatus ?? ''),
      },
      contexts: {
        sdk_error: {
          category: error.category,
          message: error.message,
          http_status: error.httpStatus,
          field_error_count: error.fieldErrors.length,
        },
      },
      fingerprint: ['gusto-sdk', error.category, error.componentName ?? 'unknown'],
    })
  },
  onMetric: metric => {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}${metric.unit ?? ''}`,
      level: 'info',
      data: metric.tags,
    })
  },
}
```

**Including the raw error object (use with caution):**

By default, `error.raw` is stripped by sanitization to prevent PII leakage. To include it:

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    // error.raw is available when includeRawError is true
    Sentry.captureException(error.raw ?? new Error(error.message), {
      tags: { error_category: error.category },
    })
  },
  sanitization: {
    includeRawError: true, // ⚠️ WARNING: raw errors may contain PII
  },
}
```

### Integration Example: Datadog

```tsx
import { datadogRum } from '@datadog/browser-rum'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    const datadogError = new Error(error.message)
    datadogError.name = error.category

    datadogRum.addError(datadogError, {
      category: error.category,
      component: error.componentName,
      httpStatus: error.httpStatus,
    })
  },
  onMetric: metric => {
    if (metric.unit === 'ms') {
      datadogRum.addTiming(metric.name, metric.value)
    }
  },
}
```

---

## Performance Metrics

### Metric Types

| Metric Name                      | Description                          | Unit | Tags                                                   |
| -------------------------------- | ------------------------------------ | ---- | ------------------------------------------------------ |
| `sdk.form.submit_duration`       | Form submission time                 | ms   | `status` (success/error), `component` (when available) |
| `sdk.component.loading_duration` | Time spent in loading/suspense state | ms   | `component` (when available)                           |

### Metric Structure

```typescript
interface ObservabilityMetric {
  name: string
  value: number
  unit?: 'ms' | 'count' | 'bytes' | 'percent'
  tags?: Record<string, string>
  timestamp: number
}
```

---

## PII Data Protection

### Automatic Sanitization

By default, the SDK sanitizes all error and metric data before sending it to your observability hooks:

**Pattern-based Redaction:**

- Social Security Numbers (SSN)
- Email addresses
- Phone numbers
- Credit card numbers
- API keys and tokens

**Field-based Removal:**

- Fields named `password`, `token`, `apiKey`, `secret`, `ssn`, `creditCard`, `cvv`, `pin`, `bankAccount`, `routingNumber`, `accountNumber`, etc.

### Configuration

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    yourErrorTracker.captureError(error)
  },
  sanitization: {
    enabled: true, // Default: true
    includeRawError: false, // Default: false — excludes raw error to prevent PII leakage
    additionalSensitiveFields: ['customerId', 'employeeId'],
    customErrorSanitizer: error => ({
      ...error,
      message: 'Custom sanitized message',
    }),
  },
}
```

### What Gets Sanitized

**Errors:**

- `message` — PII patterns replaced with `[TYPE-REDACTED]` placeholders
- `fieldErrors[].message` — same PII redaction
- `fieldErrors[].metadata` — sensitive field names replaced with `[REDACTED]`
- `raw` — excluded by default (opt in with `includeRawError: true`)

**Metrics:**

- `tags` — sensitive field names and PII patterns are sanitized

### Best Practices

1. **Keep sanitization enabled** — the default configuration is recommended for production
2. **Never include raw errors in production** — the `raw` field may contain form data, API responses, or other sensitive information
3. **Add application-specific sensitive fields** — use `additionalSensitiveFields` for your custom data
4. **Test in development** — verify PII is properly redacted before deploying

---

## TypeScript Types

All observability types are exported from the main SDK package:

```typescript
import type {
  ObservabilityHook,
  ObservabilityError,
  ObservabilityMetric,
  ObservabilityMetricUnit,
  SanitizationConfig,
  SDKError,
  SDKErrorCategory,
  SDKFieldError,
} from '@gusto/embedded-react-sdk'
```

---

## Comparison with Other Tracking Mechanisms

| Mechanism                       | Purpose                       | Use Case                                            |
| ------------------------------- | ----------------------------- | --------------------------------------------------- |
| **`observability.onError`**     | Error tracking                | Send errors to Sentry, Datadog, etc.                |
| **`observability.onMetric`**    | Performance metrics           | Track form submission times, component render times |
| **`onEvent`** (component prop)  | Business events               | Track user actions, flow completions, API responses |
| **`hooks.afterError`** (config) | Request/response interception | Modify requests, add auth tokens, log all API calls |

---

## Debugging

During development, use a console-based implementation:

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    console.group(`[SDK Error] ${error.category}`)
    console.error('Message:', error.message)
    console.error('Component:', error.componentName)
    console.error('HTTP Status:', error.httpStatus)
    console.error('Field Errors:', error.fieldErrors)
    if (error.componentStack) console.error('Component Stack:', error.componentStack)
    console.groupEnd()
  },
  onMetric: metric => {
    console.log(`[SDK Metric] ${metric.name}: ${metric.value}${metric.unit ?? ''}`, metric.tags)
  },
}
```
