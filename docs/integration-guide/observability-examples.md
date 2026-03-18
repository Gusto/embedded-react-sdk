# Observability Hook Examples

Practical examples for integrating the observability hook with common monitoring services.

## Basic Console Logging (Development)

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
import type { ObservabilityHook } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    console.group(`[SDK Error] ${error.category}`)
    console.error('Message:', error.message)
    console.error('Component:', error.componentName)
    console.error('HTTP Status:', error.httpStatus)
    if (error.fieldErrors.length > 0) {
      console.error('Field Errors:', error.fieldErrors)
    }
    if (error.componentStack) {
      console.error('Component Stack:', error.componentStack)
    }
    console.groupEnd()
  },
  onMetric: metric => {
    console.log(`[Metric] ${metric.name}: ${metric.value}${metric.unit ?? ''}`, metric.tags)
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

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <YourApp />
    </GustoProvider>
  )
}
```

## Datadog RUM Integration

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

function App() {
  return (
    <GustoProvider config={{ baseUrl: '/api/', observability }} components={components}>
      <YourApp />
    </GustoProvider>
  )
}
```

## Custom Analytics Service

```tsx
import { GustoProvider } from '@gusto/embedded-react-sdk'
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
import type { ObservabilityHook, ObservabilityMetric } from '@gusto/embedded-react-sdk'

const observability: ObservabilityHook = {
  onError: error => {
    yourErrorTracker.captureError(error)
  },
  onMetric: (metric: ObservabilityMetric) => {
    const sampleRates: Record<string, number> = {
      'sdk.form.submit_duration': 0.1,
      'sdk.component.loading_duration': 0.05,
    }

    const sampleRate = sampleRates[metric.name] ?? 1.0

    if (Math.random() < sampleRate) {
      yourMetricsService.track(metric)
    }
  },
}
```

## Built-in PII Protection

The SDK automatically sanitizes error and metric data to prevent PII leakage. See the [main observability guide](./observability.md) for full details.

```tsx
const observability: ObservabilityHook = {
  onError: error => {
    // error.message and error.fieldErrors are already sanitized
    // error.raw is excluded by default
    yourErrorTracker.captureError(error)
  },
  sanitization: {
    enabled: true,
    includeRawError: false,
    additionalSensitiveFields: ['customField', 'internalId'],
  },
}
```

## TypeScript Types

All types are exported from the main SDK package:

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
