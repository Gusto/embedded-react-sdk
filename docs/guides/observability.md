---
title: Observability
sidebar_position: 5
---

The Gusto Embedded React SDK provides built-in hooks for error tracking and performance monitoring. These hooks allow you to integrate with observability tools like Sentry, Datadog, New Relic, or your own custom monitoring solution.

## Overview

The observability system captures:

- **Errors** — caught by error boundaries, validation failures, and API errors
- **Performance metrics** — form submission times and component loading durations

This is separate from the `onEvent` system (for business-level event tracking) and request hooks (for request/response interception).

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
    >
      <YourApp />
    </GustoProvider>
  )
}
```

## Error Types

### SDKError

The core error type exposed through partner-facing hooks. Contains actionable information about what happened.

```typescript
interface SDKError {
  category: 'api_error' | 'validation_error' | 'network_error' | 'internal_error'
  message: string
  httpStatus?: number
  fieldErrors: SDKFieldError[]
  raw?: unknown
}
```

### ObservabilityError

Extends `SDKError` with context for error-tracking tools. This is the type received by `onError`.

```typescript
interface ObservabilityError extends SDKError {
  timestamp: number
  componentName?: string
  componentStack?: string
}
```

### Error Categories

| Category | Description | When it occurs |
| --- | --- | --- |
| `api_error` | HTTP error from the Gusto API | API returns 4xx or 5xx status codes |
| `validation_error` | Client-side Zod schema validation | Request/response fails Zod validation |
| `network_error` | Network connectivity failure | Connection refused, timeout, or request aborted |
| `internal_error` | Unexpected runtime error | Unhandled exceptions caught by error boundaries or provider |

### Field Errors

For `api_error` responses with structured validation errors (e.g. 422), the SDK extracts and flattens field-level errors:

```typescript
interface SDKFieldError {
  field: string
  category: string
  message: string
  metadata?: Record<string, unknown>
}
```

## Component Identification

SDK components report their name in error reports and metrics:

- `error.componentName` — e.g. `"Employee.Profile"`
- `metric.tags.component` — e.g. `"Employee.Compensation"`

For errors caught by React ErrorBoundaries, `error.componentStack` provides the full React component hierarchy.

## Performance Metrics

| Metric Name | Description | Unit | Tags |
| --- | --- | --- | --- |
| `sdk.form.submit_duration` | Form submission time | ms | `status` (success/error), `component` |
| `sdk.component.loading_duration` | Time spent in loading/suspense state | ms | `component` |

```typescript
interface ObservabilityMetric {
  name: string
  value: number
  unit?: 'ms' | 'count' | 'bytes' | 'percent'
  tags?: Record<string, string>
  timestamp: number
}
```

## Integration Examples

### Console (Development)

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

### Sentry

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

### Datadog RUM

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
    } else {
      datadogRum.addAction(metric.name, {
        value: metric.value,
        unit: metric.unit,
        ...metric.tags,
      })
    }
  },
}
```

### Custom Analytics

```tsx
import type {
  ObservabilityHook,
  ObservabilityError,
  ObservabilityMetric,
} from '@gusto/embedded-react-sdk'

class CustomAnalytics {
  async trackError(error: ObservabilityError) {
    await fetch('/api/analytics/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: error.category,
        message: error.message,
        httpStatus: error.httpStatus,
        fieldErrors: error.fieldErrors,
        component: error.componentName,
        timestamp: error.timestamp,
      }),
    })
  }

  async trackMetric(metric: ObservabilityMetric) {
    await fetch('/api/analytics/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    })
  }
}

const analytics = new CustomAnalytics()

const observability: ObservabilityHook = {
  onError: error => analytics.trackError(error),
  onMetric: metric => analytics.trackMetric(metric),
}
```

## PII Sanitization

### Automatic Sanitization

By default, the SDK sanitizes all error and metric data before sending it to your observability hooks.

**Pattern-based redaction** covers SSNs, email addresses, phone numbers, credit card numbers, and API keys/tokens.

**Field-based removal** covers fields named `password`, `token`, `apiKey`, `secret`, `ssn`, `creditCard`, `cvv`, `pin`, `bankAccount`, `routingNumber`, `accountNumber`, and similar.

### Configuration

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    yourErrorTracker.captureError(error)
  },
  sanitization: {
    enabled: true,
    includeRawError: false,
    additionalSensitiveFields: ['customerId', 'employeeId'],
    customErrorSanitizer: error => ({
      ...error,
      message: 'Custom sanitized message',
    }),
  },
}
```

**What gets sanitized:**

- `message` — PII patterns replaced with `[TYPE-REDACTED]` placeholders
- `fieldErrors[].message` — same PII redaction
- `fieldErrors[].metadata` — sensitive field names replaced with `[REDACTED]`
- `raw` — excluded by default (opt in with `includeRawError: true`)
- `tags` (metrics) — sensitive field names and PII patterns are sanitized

## Comparison with Other Tracking Mechanisms

| Mechanism | Purpose | Use case |
| --- | --- | --- |
| `observability.onError` | Error tracking | Send errors to Sentry, Datadog, etc. |
| `observability.onMetric` | Performance metrics | Track form submission times, component render times |
| `onEvent` (component prop) | Business events | Track user actions, flow completions, API responses |
| `hooks.afterError` (config) | Request/response interception | Modify requests, add auth tokens, log all API calls |

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
