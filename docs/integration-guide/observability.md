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
  onError: (error) => {
    // Handle error tracking
    console.error('[SDK Error]', error)
  },
  onMetric: (metric) => {
    // Handle performance metrics
    console.log('[SDK Metric]', metric.name, metric.value, metric.unit)
  }
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

The SDK provides a `componentName` prop on all SDK components, allowing you to pass an identifier for more precise error tracking:

```tsx
<Employee.Profile
  companyId={companyId}
  employeeId={employeeId}
  componentName="EmployeeProfile"
  onEvent={(eventType, data) => {
    analytics.track(eventType, data)
  }}
/>
```

When provided, the `componentName` will be included in:
- Error context (`error.context.componentName`)
- Metric tags (`metric.tags.component`)

This allows you to track which specific component instances are experiencing errors or performance issues.

**Note:** The `componentStack` field in error context provides React's component hierarchy for debugging. It's automatically included for all boundary errors.

---

## Error Tracking

### Error Types

The SDK reports errors with the following types:

| Type | Description | When It Occurs |
|------|-------------|----------------|
| `boundary_error` | Component rendering errors | When a component crashes and is caught by an error boundary |
| `validation_error` | Schema validation failures | When API request/response fails Zod validation |
| `api_error` | HTTP errors from API | When API returns 4xx or 5xx status codes |
| `internal_error` | Unexpected SDK errors | Critical errors in the SDK itself |

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
  originalError: unknown
  timestamp: number // Unix timestamp in milliseconds
}
```

### Integration Example: Sentry

```tsx
import * as Sentry from '@sentry/react'
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: (error) => {
    Sentry.captureException(error.originalError, {
      level: error.type === 'validation_error' ? 'warning' : 'error',
      tags: {
        error_type: error.type,
        component: error.context.componentName,
      },
      contexts: {
        sdk_error: {
          type: error.type,
          message: error.message,
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

### Integration Example: Datadog

```tsx
import { datadogRum } from '@datadog/browser-rum'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: (error) => {
    datadogRum.addError(error.originalError, {
      type: error.type,
      component: error.context.componentName,
      statusCode: error.context.statusCode,
      message: error.message,
    })
  }
}
```

---

## Performance Metrics

### Metric Types

The SDK tracks the following performance metrics:

| Metric Name | Description | Unit | Tags |
|-------------|-------------|------|------|
| `sdk.form.submit_duration` | Form submission time | ms | `status` (success/error), `component` (if `componentName` provided) |
| `sdk.component.loading_duration` | Time spent in loading/suspense state | ms | `component` (if `componentName` provided) |

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
  onMetric: (metric) => {
    datadogRum.addTiming(metric.name, metric.value)
    
    // Or send as custom metric
    if (metric.unit === 'ms') {
      datadogRum.addAction(metric.name, {
        duration: metric.value,
        ...metric.tags,
      })
    }
  }
}
```

### Integration Example: Custom Analytics

```tsx
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onMetric: (metric) => {
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
      })
    })
  }
}
```

---

## Best Practices

### 1. Filter Sensitive Data

Avoid logging sensitive information from error contexts:

```tsx
const observability: ObservabilityHook = {
  onError: (error) => {
    // Filter out sensitive data from context
    const sanitizedContext = {
      ...error.context,
      componentProps: undefined, // Remove props that might contain PII
    }
    
    yourErrorTracker.captureError(error.originalError, {
      context: sanitizedContext,
    })
  }
}
```

### 2. Sample High-Volume Metrics

For high-traffic applications, consider sampling metrics:

```tsx
const observability: ObservabilityHook = {
  onMetric: (metric) => {
    // Sample 10% of form submission metrics
    if (metric.name === 'sdk.form.submit_duration' && Math.random() > 0.1) {
      return
    }
    
    yourMetricsService.track(metric)
  }
}
```

### 3. Set Error Budgets

Use error type to set appropriate alert thresholds:

```tsx
const observability: ObservabilityHook = {
  onError: (error) => {
    const severity = {
      validation_error: 'warning',
      api_error: 'error',
      boundary_error: 'critical',
      internal_error: 'critical',
    }[error.type]
    
    yourMonitoring.logError(error, { severity })
  }
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
} from '@gusto/embedded-react-sdk'
```

---

## Comparison with Other Tracking Mechanisms

The SDK provides multiple ways to track different types of information:

| Mechanism | Purpose | Use Case |
|-----------|---------|----------|
| **`observability.onError`** | Error tracking | Send errors to Sentry, Datadog, etc. |
| **`observability.onMetric`** | Performance metrics | Track form submission times, component render times |
| **`onEvent`** (component prop) | Business events | Track user actions, flow completions, API responses |
| **`hooks.afterError`** (config) | Request/response interception | Modify requests, add auth tokens, log all API calls |

These mechanisms work together and don't conflict with each other.

---

## Debugging

During development, you can use a simple console-based observability implementation:

```tsx
const observability: ObservabilityHook = {
  onError: (error) => {
    console.group(`[SDK Error] ${error.type}`)
    console.error('Message:', error.message)
    console.error('Component:', error.context.componentName)
    console.error('Original:', error.originalError)
    if (error.stack) console.error('Stack:', error.stack)
    console.groupEnd()
  },
  onMetric: (metric) => {
    console.log(
      `[SDK Metric] ${metric.name}: ${metric.value}${metric.unit || ''}`,
      metric.tags
    )
  }
}
```
