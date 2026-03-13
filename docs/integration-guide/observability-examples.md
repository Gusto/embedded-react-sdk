# Observability Hook Implementation Example

This example demonstrates how to integrate the observability hook with common monitoring services.

## Basic Console Logging (Development)

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    console.group(`[SDK Error] ${error.type}`)
    console.error('Message:', error.message)
    console.error('Component:', error.context.componentName)
    console.error('Stack:', error.stack)
    if (error.context.statusCode) {
      console.error('Status:', error.context.statusCode)
    }
    console.groupEnd()
  },
  onMetric: metric => {
    console.log(`[Metric] ${metric.name}: ${metric.value}${metric.unit || ''}`, metric.tags)
  },
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <Employee.Profile companyId={companyId} employeeId={employeeId} onEvent={handleEvent} />
    </GustoProvider>
  )
}
```

## Sentry Integration

**Recommended: Using sanitized error data**

```tsx
import * as Sentry from '@sentry/react'
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV,
})

const observability: ObservabilityHook = {
  onError: error => {
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
        component: error.context.componentName || 'unknown',
      },
      contexts: {
        sdk_error: {
          type: error.type,
          message: error.message,
          status_code: error.context.statusCode,
        },
      },
      fingerprint: ['gusto-sdk', error.type, error.context.componentName || 'unknown'],
    })
  },
  onMetric: metric => {
    // Send as breadcrumb to provide context for errors
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}${metric.unit || ''}`,
      level: 'info',
      data: metric.tags,
    })
  },
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <YourApp />
    </GustoProvider>
  )
}
```

**Alternative: Include original error (requires explicit opt-in)**

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    // originalError will be available but may contain PII
    Sentry.captureException(error.originalError || new Error(error.message), {
      level: error.type === 'validation_error' ? 'warning' : 'error',
      tags: {
        error_type: error.type,
        component: error.context.componentName || 'unknown',
      },
    })
  },
  onMetric: metric => {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${metric.name}: ${metric.value}${metric.unit || ''}`,
      level: 'info',
      data: metric.tags,
    })
  },
  sanitization: {
    includeOriginalError: true, // ⚠️ WARNING: originalError may contain PII from form data/API responses
  },
}
```

## Datadog RUM Integration

**Recommended: Using sanitized error data**

```tsx
import { datadogRum } from '@datadog/browser-rum'
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

datadogRum.init({
  applicationId: 'your-app-id',
  clientToken: 'your-client-token',
  site: 'datadoghq.com',
  service: 'your-service-name',
  env: process.env.NODE_ENV,
})

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
  onMetric: metric => {
    if (metric.unit === 'ms') {
      // Track timing metrics
      datadogRum.addTiming(metric.name, metric.value)
    } else {
      // Track other metrics as actions
      datadogRum.addAction(metric.name, {
        value: metric.value,
        unit: metric.unit,
        ...metric.tags,
      })
    }
  },
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <YourApp />
    </GustoProvider>
  )
}
```

**Alternative: Include original error (requires explicit opt-in)**

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
  sanitization: {
    includeOriginalError: true, // ⚠️ WARNING: originalError may contain PII from form data/API responses
  },
}
```

## Custom Analytics Service

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

class CustomAnalytics {
  async trackError(error: ObservabilityError) {
    await fetch('/api/analytics/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: error.type,
        message: error.message,
        component: error.context.componentName,
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

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <YourApp />
    </GustoProvider>
  )
}
```

## Sampling for High-Traffic Applications

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook, ObservabilityMetric } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    // Always track errors
    yourErrorTracker.captureError(error)
  },
  onMetric: (metric: ObservabilityMetric) => {
    // Sample metrics at different rates based on name
    const sampleRates: Record<string, number> = {
      'sdk.form.submit_duration': 0.1, // 10% of form submissions
      'sdk.component.mount': 0.01, // 1% of component mounts
    }

    const sampleRate = sampleRates[metric.name] || 1.0

    if (Math.random() < sampleRate) {
      yourMetricsService.track(metric)
    }
  },
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <YourApp />
    </GustoProvider>
  )
}
```

## Built-in PII Protection

The SDK automatically sanitizes error and metric data to prevent PII leakage. See the main observability guide for details on:

- What data is automatically sanitized
- How to configure sanitization options
- Custom sanitization hooks

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    // error.message, error.stack, and error.context are already sanitized
    yourErrorTracker.captureError(error)
  },
  sanitization: {
    enabled: true, // Default: true
    includeOriginalError: false, // Default: false - excludes originalError to prevent PII leakage
    additionalSensitiveFields: ['customField', 'internalId'], // Optional: add custom field names to redact
  },
}

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <YourApp />
    </GustoProvider>
  )
}
```

## TypeScript Types

All types are exported from the main SDK package:

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
