/**
 * Observability hook types for error tracking and performance metrics
 */
import type { SDKError } from './sdkError'

export type ObservabilityMetricUnit = 'ms' | 'count' | 'bytes' | 'percent'

/**
 * An `SDKError` enriched with internal component context for observability telemetry.
 *
 * Partners receive this type through `ObservabilityHook.onError`. It extends the
 * core `SDKError` with `timestamp`, `componentName`, and `componentStack` so that
 * error-tracking tools (e.g. Sentry) can correlate and group errors.
 *
 * The base `SDKError` (without these fields) is the type used in partner-facing
 * hooks like `useEmployeeForm`, keeping the public API clean.
 */
export interface ObservabilityError extends SDKError {
  /** When the error occurred (Unix timestamp in milliseconds) */
  timestamp: number

  /** SDK component where the error occurred (e.g. "Employee.Profile") */
  componentName?: string

  /** React component stack trace (present only for errors caught by ErrorBoundary) */
  componentStack?: string
}

export interface ObservabilityMetric {
  /** Metric name (e.g., 'sdk.form.submit_duration', 'sdk.component.loading_duration') */
  name: string

  /** Metric value */
  value: number

  /** Metric unit */
  unit?: ObservabilityMetricUnit

  /** Tags for filtering/grouping */
  tags?: Record<string, string>

  /** When the metric was recorded (Unix timestamp in milliseconds) */
  timestamp: number
}

/**
 * Configuration for data sanitization in observability hooks
 */
export interface SanitizationConfig {
  /**
   * Whether to sanitize error data. Default: true
   */
  enabled?: boolean

  /**
   * Whether to include the raw error object on SDKError. Default: false
   * WARNING: Raw errors may contain sensitive data from form inputs or API responses
   */
  includeRawError?: boolean

  /**
   * Custom sanitization function for errors
   */
  customErrorSanitizer?: (error: ObservabilityError) => ObservabilityError

  /**
   * Custom sanitization function for metrics
   */
  customMetricSanitizer?: (metric: ObservabilityMetric) => ObservabilityMetric

  /**
   * Additional field names to treat as sensitive (case-insensitive)
   */
  additionalSensitiveFields?: string[]
}

/**
 * Observability hook interface for SDK consumers to implement
 *
 * @example
 * ```tsx
 * import * as Sentry from '@sentry/react'
 * import { GustoProvider } from '@gusto/embedded-react-sdk'
 *
 * <GustoProvider
 *   config={{
 *     baseUrl: '/api/',
 *     observability: {
 *       onError: (error: ObservabilityError) => {
 *         Sentry.captureException(error.raw, {
 *           level: error.category === 'validation_error' ? 'warning' : 'error',
 *           tags: {
 *             error_category: error.category,
 *             component: error.componentName ?? 'unknown',
 *             http_status: String(error.httpStatus ?? ''),
 *           },
 *         })
 *       },
 *       onMetric: (metric) => {
 *         console.log(`[Metric] ${metric.name}: ${metric.value}${metric.unit}`)
 *       },
 *       sanitization: {
 *         enabled: true,
 *         includeRawError: false,
 *       }
 *     }
 *   }}
 * >
 *   <YourApp />
 * </GustoProvider>
 * ```
 */
export interface ObservabilityHook {
  /**
   * Called when an error is caught by error boundaries or form submission fails.
   * Receives an `ObservabilityError` — an `SDKError` enriched with `componentName`
   * and (for boundary errors) `componentStack`.
   */
  onError?: (error: ObservabilityError) => void

  /**
   * Called to track performance metrics for component operations.
   */
  onMetric?: (metric: ObservabilityMetric) => void

  /**
   * Configuration for sanitizing data before sending to observability tools.
   * Default: { enabled: true, includeRawError: false }
   */
  sanitization?: SanitizationConfig
}
