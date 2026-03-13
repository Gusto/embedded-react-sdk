/**
 * Observability hook types for error tracking and performance metrics
 */

export type ObservabilityErrorType =
  | 'boundary_error'
  | 'validation_error'
  | 'internal_error'
  | 'api_error'

export type ObservabilityMetricUnit = 'ms' | 'count' | 'bytes' | 'percent'

export interface ObservabilityErrorContext {
  /** Name of the component where error occurred */
  componentName?: string

  /** Props passed to the component (sanitized, no sensitive data) */
  componentProps?: Record<string, unknown>

  /** For validation errors, the schema that failed */
  validationSchema?: string

  /** React component stack trace */
  componentStack?: string

  /** Operation ID for API-related errors */
  operationId?: string

  /** HTTP status code for API errors */
  statusCode?: number

  /** Request details for API errors */
  request?: {
    url: string
    method: string
  }

  /** Any additional context */
  metadata?: Record<string, unknown>
}

export interface ObservabilityError {
  /** Type of error that occurred */
  type: ObservabilityErrorType

  /** Human-readable error message */
  message: string

  /** Error stack trace if available */
  stack?: string

  /** Context about where/how the error occurred */
  context: ObservabilityErrorContext

  /**
   * The original error object (may be undefined when sanitization.includeOriginalError is false)
   * Default sanitization removes this to prevent PII leakage
   */
  originalError?: unknown

  /** When the error occurred (Unix timestamp in milliseconds) */
  timestamp: number
}

export interface ObservabilityMetric {
  /** Metric name (e.g., 'sdk.component.mount', 'sdk.form.submit_duration') */
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
   * Whether to include the original error object. Default: false
   * WARNING: Original errors may contain sensitive data from form inputs or API responses
   */
  includeOriginalError?: boolean

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
 * This hook enables error tracking and performance monitoring for the SDK.
 * Errors caught by error boundaries and validation failures will be reported through onError.
 * Performance metrics for forms, components, and flows will be reported through onMetric.
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
 *       onError: (error) => {
 *         // Create Error from sanitized data (originalError is undefined by default)
 *         const sentryError = new Error(error.message)
 *         sentryError.name = error.type
 *         if (error.stack) {
 *           sentryError.stack = error.stack
 *         }
 *
 *         Sentry.captureException(sentryError, {
 *           level: error.type === 'validation_error' ? 'warning' : 'error',
 *           tags: {
 *             error_type: error.type,
 *             component: error.context.componentName,
 *           },
 *         })
 *       },
 *       onMetric: (metric) => {
 *         // Send to your metrics service
 *         console.log(`[Metric] ${metric.name}: ${metric.value}${metric.unit}`)
 *       },
 *       sanitization: {
 *         enabled: true,
 *         includeOriginalError: false, // Default: originalError will be undefined
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
   * Called when an error is caught by error boundaries or validation fails
   * These are errors that prevent a component from rendering or operating correctly
   */
  onError?: (error: ObservabilityError) => void

  /**
   * Called to track performance metrics for component operations
   * Optional - can be used for tracking render times, flow completions, etc.
   */
  onMetric?: (metric: ObservabilityMetric) => void

  /**
   * Configuration for sanitizing data before sending to observability tools
   * Default: { enabled: true, includeOriginalError: false }
   */
  sanitization?: SanitizationConfig
}
