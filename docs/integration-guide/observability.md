---
title: Observability and Error Tracking
order: 8
---

# Observability and Error Tracking

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
    // Handle error tracking
    console.error('[SDK Error]', error)
  },
  onMetric: metric => {
    // Handle performance metrics
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

## Component Identification

SDK components report their name in error reports and metrics when available. Component names appear in:

- Error context (`error.context.componentName`) - e.g., `"Contractor.Payments.CreatePayment"`
- Metric tags (`metric.tags.component`) - e.g., `"Employee.Compensation"`

This allows you to track which specific SDK components are experiencing errors or performance issues.

**Note:** Not all SDK components currently report their names. The SDK is progressively adding component identification. When a component name is not available, you can still use the `componentStack` field to identify the component hierarchy.

**Example error with component identification:**

```tsx
{
  type: 'boundary_error',
  message: 'Cannot read property of undefined',
  context: {
    componentName: 'Employee.Compensation', // May be undefined if not yet implemented
    componentStack: '...'
  },
  timestamp: 1234567890
}
```

**Note:** The `componentStack` field provides React's full component hierarchy for debugging. It's automatically included for all boundary errors.

---

## Error Tracking

### Error Types

The SDK reports errors with the following types:

| Type               | Description                | When It Occurs                                              |
| ------------------ | -------------------------- | ----------------------------------------------------------- |
| `boundary_error`   | Component rendering errors | When a component crashes and is caught by an error boundary |
| `validation_error` | Schema validation failures | When API request/response fails Zod validation              |
| `api_error`        | HTTP errors from API       | When API returns 4xx or 5xx status codes                    |
| `internal_error`   | Unexpected SDK errors      | Critical errors in the SDK itself                           |

### Error Structure

```typescript
interface ObservabilityError {
  type: 'boundary_error' | 'validation_error' | 'api_error' | 'internal_error'
  message: string
  stack?: string
  context: {
    componentName?: string
    componentStack?: string
    validationSchema?: string
    statusCode?: number
    metadata?: Record<string, unknown>
  }
  originalError?: unknown // undefined when sanitization.includeOriginalError is false (default)
  timestamp: number // Unix timestamp in milliseconds
}
```

**Note:** `originalError` is `undefined` by default to prevent PII leakage. Set `sanitization.includeOriginalError: true` to include it.

### Integration Example: Sentry

**Option 1: Using sanitized error data (Recommended for production)**

```tsx
import * as Sentry from '@sentry/react'
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: (error) => {
    // Create a new Error from sanitized data since originalError is excluded by default
    const sentryError = new Error(error.message)
    sentryError.name = error.type
    if (error.stack) {
      sentryError.stack = error.stack
    }

    Sentry.captureException(sentryError, {
      level: error.type === 'validation_error' ? 'warning' : 'error',
      tags: {
        error_type: error.type,
        component: error.context.componentName,
      },
      contexts: {
        sdk_error: {
          type: error.type,
          component: error.context.componentName,
          status_code: error.context.statusCode,
        }
      },
      fingerprint: [
        error.type,
        error.context.componentName || 'unknown',
        error.message,
      ],
    })
  }
}

<GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
  <App />
</GustoProvider>
```

**Option 2: Include original error (Use with caution)**

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    // originalError will be available but may contain PII
    Sentry.captureException(error.originalError || new Error(error.message), {
      level: error.type === 'validation_error' ? 'warning' : 'error',
      tags: {
        error_type: error.type,
        component: error.context.componentName,
      },
    })
  },
  sanitization: {
    includeOriginalError: true, // ⚠️ WARNING: originalError may contain PII from form data/API responses
  },
}
```

### Integration Example: Datadog

**Option 1: Using sanitized error data (Recommended for production)**

```tsx
import { datadogRum } from '@datadog/browser-rum'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    // Create a new Error from sanitized data since originalError is excluded by default
    const datadogError = new Error(error.message)
    datadogError.name = error.type
    if (error.stack) {
      datadogError.stack = error.stack
    }

    datadogRum.addError(datadogError, {
      type: error.type,
      component: error.context.componentName,
      statusCode: error.context.statusCode,
    })
  },
}
```

**Option 2: Include original error (Use with caution)**

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    datadogRum.addError(error.originalError || new Error(error.message), {
      type: error.type,
      component: error.context.componentName,
      statusCode: error.context.statusCode,
      message: error.message,
    })
  },
  sanitization: {
    includeOriginalError: true, // ⚠️ WARNING: originalError may contain PII from form data/API responses
  },
}
```

---

## Performance Metrics

### Metric Types

The SDK tracks the following performance metrics:

| Metric Name                      | Description                          | Unit | Tags                                                   |
| -------------------------------- | ------------------------------------ | ---- | ------------------------------------------------------ |
| `sdk.form.submit_duration`       | Form submission time                 | ms   | `status` (success/error), `component` (when available) |
| `sdk.component.loading_duration` | Time spent in loading/suspense state | ms   | `component` (when available)                           |

Additional metrics can be added by the SDK as needed.

### Metric Structure

```typescript
interface ObservabilityMetric {
  name: string
  value: number
  unit?: 'ms' | 'count' | 'bytes' | 'percent'
  tags?: Record<string, string>
  timestamp: number // Unix timestamp in milliseconds
}
```

### Integration Example: Datadog

```tsx
import { datadogRum } from '@datadog/browser-rum'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onMetric: metric => {
    datadogRum.addTiming(metric.name, metric.value)

    // Or send as custom metric
    if (metric.unit === 'ms') {
      datadogRum.addAction(metric.name, {
        duration: metric.value,
        ...metric.tags,
      })
    }
  },
}
```

### Integration Example: Custom Analytics

```tsx
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onMetric: metric => {
    // Send to your analytics service
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags,
        timestamp: metric.timestamp,
      }),
    })
  },
}
```

---

## Best Practices

### 1. Filter Sensitive Data

Avoid logging sensitive information from error contexts:

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    // Filter out sensitive data from context
    const sanitizedContext = {
      ...error.context,
      componentProps: undefined, // Remove props that might contain PII
    }

    yourErrorTracker.captureError(error.originalError, {
      context: sanitizedContext,
    })
  },
}
```

### 2. Sample High-Volume Metrics

For high-traffic applications, consider sampling metrics:

```tsx
const observability: ObservabilityHook = {
  onMetric: metric => {
    // Sample 10% of form submission metrics
    if (metric.name === 'sdk.form.submit_duration' && Math.random() > 0.1) {
      return
    }

    yourMetricsService.track(metric)
  },
}
```

### 3. Set Error Budgets

Use error type to set appropriate alert thresholds:

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    const severity = {
      validation_error: 'warning',
      api_error: 'error',
      boundary_error: 'critical',
      internal_error: 'critical',
    }[error.type]

    yourMonitoring.logError(error, { severity })
  },
}
```

### 4. Correlate with Business Events

Combine observability with the existing `onEvent` callback for full context:

```tsx
let currentFlow: string | null = null

<Employee.Profile
  companyId={companyId}
  employeeId={employeeId}
  onEvent={(eventType, data) => {
    // Track business events
    if (eventType === componentEvents.EMPLOYEE_PROFILE_STARTED) {
      currentFlow = 'employee_profile'
    }
    analytics.track(eventType, data)
  }}
/>

// In observability config
const observability: ObservabilityHook = {
  onError: (error) => {
    Sentry.captureException(error.originalError, {
      tags: {
        current_flow: currentFlow,
        error_type: error.type,
      }
    })
  }
}
```

---

## PII Data Protection

The SDK includes built-in safeguards to prevent accidental exposure of Personally Identifiable Information (PII) in observability data.

### Automatic Sanitization

By default, the SDK automatically sanitizes all error and metric data before sending it to your observability hooks. This includes:

**Pattern-based Redaction:**

- Social Security Numbers (SSN)
- Email addresses
- Phone numbers
- Credit card numbers
- API keys and tokens

**Field-based Removal:**

- Fields named `password`, `token`, `apiKey`, `secret`, `ssn`, `creditCard`, `cvv`, `pin`, `bankAccount`, `routingNumber`, `accountNumber`, etc.

### Configuration

You can configure sanitization behavior when setting up the observability hook:

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: (error) => {
    // Error data is automatically sanitized
    yourErrorTracker.captureError(error)
  },
  onMetric: (metric) => {
    // Metric data is automatically sanitized
    yourMetricsService.track(metric)
  },
  sanitization: {
    // Enable/disable sanitization (default: true)
    enabled: true,

    // Include original error object (default: false)
    // WARNING: Original errors may contain sensitive data
    includeOriginalError: false,

    // Add custom sensitive field names
    additionalSensitiveFields: ['customerId', 'employeeId'],

    // Provide custom sanitization logic
    customErrorSanitizer: (error) => {
      // Your custom sanitization logic
      return {
        ...error,
        message: 'Custom sanitized message',
      }
    },
  }
}

<GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
  <App />
</GustoProvider>
```

### What Gets Sanitized

#### Errors

- **Message**: PII patterns are replaced with `[TYPE-REDACTED]` placeholders
- **Stack traces**: PII patterns are redacted
- **Context**: Sensitive field names are replaced with `[REDACTED]`
- **Original error**: Excluded by default (can be included with `includeOriginalError: true`)

#### Metrics

- **Tags**: Sensitive field names and PII patterns are sanitized
- **Name & Value**: Not sanitized (should not contain PII)

### Testing Your Sanitization

To verify your sanitization is working:

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    console.log('Sanitized error:', JSON.stringify(error, null, 2))

    // Verify no PII is present
    const errorStr = JSON.stringify(error)
    if (errorStr.includes('@') || /\d{3}-\d{2}-\d{4}/.test(errorStr)) {
      console.warn('⚠️ Possible PII detected in error data!')
    }
  },
  sanitization: {
    enabled: true,
    includeOriginalError: false,
  },
}
```

### Best Practices

1. **Keep sanitization enabled**: The default configuration (`enabled: true, includeOriginalError: false`) is recommended for production.

2. **Never include original errors in production**: The `originalError` field may contain form data, API responses, or other sensitive information.

3. **Add application-specific sensitive fields**: Use `additionalSensitiveFields` to protect your custom data:

   ```tsx
   sanitization: {
     additionalSensitiveFields: ['internalId', 'taxId', 'bankAccountToken']
   }
   ```

4. **Test in development**: Use the SDK in development with real data to verify that PII is properly redacted.

5. **Review your observability tool settings**: Ensure your error tracking service (Sentry, Datadog, etc.) also has PII scrubbing enabled as an additional layer of protection.

---

## TypeScript Types

All observability types are exported from the main SDK package:

```typescript
import type {
  ObservabilityHook,
  ObservabilityError,
  ObservabilityErrorType,
  ObservabilityErrorContext,
  ObservabilityMetric,
  ObservabilityMetricUnit,
  SanitizationConfig,
} from '@gusto/embedded-react-sdk'
```

---

## Comparison with Other Tracking Mechanisms

The SDK provides multiple ways to track different types of information:

| Mechanism                       | Purpose                       | Use Case                                            |
| ------------------------------- | ----------------------------- | --------------------------------------------------- |
| **`observability.onError`**     | Error tracking                | Send errors to Sentry, Datadog, etc.                |
| **`observability.onMetric`**    | Performance metrics           | Track form submission times, component render times |
| **`onEvent`** (component prop)  | Business events               | Track user actions, flow completions, API responses |
| **`hooks.afterError`** (config) | Request/response interception | Modify requests, add auth tokens, log all API calls |

These mechanisms work together and don't conflict with each other.

---

## Debugging

During development, you can use a simple console-based observability implementation:

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    console.group(`[SDK Error] ${error.type}`)
    console.error('Message:', error.message)
    console.error('Component:', error.context.componentName)
    console.error('Original:', error.originalError)
    if (error.stack) console.error('Stack:', error.stack)
    console.groupEnd()
  },
  onMetric: metric => {
    console.log(`[SDK Metric] ${metric.name}: ${metric.value}${metric.unit || ''}`, metric.tags)
  },
}
```
