/**
 * Observability hook types for error tracking and performance metrics
 */
import type { SDKError } from './sdkError'

/**
 * Unit of measure for an {@link ObservabilityMetric}.
 *
 * @public
 */
export type ObservabilityMetricUnit = 'ms' | 'count' | 'bytes' | 'percent'

/**
 * An {@link SDKError} enriched with component context for observability telemetry.
 *
 * @remarks
 * Delivered to {@link ObservabilityHook.onError}. Extends {@link SDKError} with
 * `timestamp`, `componentName`, and `componentStack` so error-tracking tools
 * (e.g. Sentry) can correlate and group errors. The base {@link SDKError}
 * (without these fields) is the shape exposed through form hooks.
 *
 * @public
 */
export interface ObservabilityError extends SDKError {
  /** When the error occurred (Unix timestamp in milliseconds) */
  timestamp: number

  /** SDK component where the error occurred (e.g. "Employee.Profile") */
  componentName?: string

  /** React component stack trace (present only for errors caught by ErrorBoundary) */
  componentStack?: string
}

/**
 * A performance metric emitted by the SDK to {@link ObservabilityHook.onMetric}.
 *
 * @remarks
 * Built-in metric names include `sdk.form.submit_duration` (form submission time)
 * and `sdk.component.loading_duration` (time spent in loading/suspense state).
 * Tags may include `status` (`success` or `error`) and `component` when known.
 *
 * @public
 */
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
 * Configuration for sanitizing error and metric data before it reaches observability hooks.
 *
 * @remarks
 * Sanitization runs by default to prevent PII leakage. When enabled, the SDK
 * pattern-redacts SSNs, emails, phone numbers, credit card numbers, and API
 * tokens from messages and tags, and removes values for fields with sensitive
 * names (`password`, `ssn`, `bankAccount`, etc.) from metadata. The `raw`
 * error object is excluded unless `includeRawError` is set to `true`.
 *
 * Custom sanitizers add a layer of redaction on top of these protections; they
 * do not replace them. The SDK applies its redaction to the data before your
 * function runs and again to the value it returns, so a custom sanitizer
 * receives already-redacted data and cannot restore redacted values or `raw`.
 * Properties your function adds beyond the standard error and metric fields are not redacted.
 * Pattern-based redaction cannot detect every possible PII value, so use
 * `additionalSensitiveFields` and your own sanitizer for application-specific data.
 *
 * @public
 */
export interface SanitizationConfig {
  /**
   * Whether to apply the SDK's built-in redaction of messages, metadata, and tags. Default: true
   *
   * @remarks
   * Setting this to `false` opts out of built-in redaction only. The `raw` error
   * is still removed unless `includeRawError` is `true`.
   */
  enabled?: boolean

  /**
   * Whether to include the raw error object on SDKError. Default: false
   *
   * @remarks
   * WARNING: Raw errors may contain sensitive data from form inputs or API responses.
   * When `false`, `raw` is removed from the error before and after `customErrorSanitizer`
   * runs, regardless of `enabled`. When `true`, `raw` is passed through without redaction.
   */
  includeRawError?: boolean

  /**
   * Additional sanitization function for errors, composed with the SDK's built-in redaction.
   *
   * @remarks
   * Runs after the SDK has redacted the error and removed `raw` (per `enabled` and
   * `includeRawError`). The SDK applies the same redaction to the returned `message`,
   * `fieldErrors`, and `raw`, so values your function puts there are redacted as well.
   * Other properties your function adds are passed through unchanged.
   */
  customErrorSanitizer?: (error: ObservabilityError) => ObservabilityError

  /**
   * Additional sanitization function for metrics, composed with the SDK's built-in redaction.
   *
   * @remarks
   * Runs after the SDK has redacted the metric's `tags` (per `enabled`). The SDK applies the
   * same redaction to the returned metric, so tags your function adds are redacted as well.
   */
  customMetricSanitizer?: (metric: ObservabilityMetric) => ObservabilityMetric

  /**
   * Additional field names to treat as sensitive (case-insensitive substring match).
   * Applied to error field metadata and metric tags, including values returned by custom sanitizers.
   */
  additionalSensitiveFields?: string[]
}

/**
 * Hooks for routing SDK errors and performance metrics into an external monitoring tool.
 *
 * @remarks
 * Pass an instance to {@link GustoProvider} via `config.observability` to forward
 * errors to services like Sentry or Datadog and to capture performance metrics
 * for form submissions and component loading. Sanitization is applied before
 * the hooks are invoked; see {@link SanitizationConfig}.
 *
 * @public
 * @group Observability
 *
 * @example
 * ```tsx
 * import * as Sentry from '@sentry/react'
 * import { GustoProvider, type ObservabilityHook } from '@gusto/embedded-react-sdk'
 *
 * const observability: ObservabilityHook = {
 *   onError: error => {
 *     Sentry.captureException(error.raw ?? new Error(error.message), {
 *       level: error.category === 'validation_error' ? 'warning' : 'error',
 *       tags: {
 *         error_category: error.category,
 *         component: error.componentName ?? 'unknown',
 *         http_status: String(error.httpStatus ?? ''),
 *       },
 *     })
 *   },
 *   onMetric: metric => {
 *     console.log(`[Metric] ${metric.name}: ${metric.value}${metric.unit ?? ''}`)
 *   },
 * }
 *
 * <GustoProvider config={{ baseUrl: '/api/', observability }}>
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
   * Default: `{ enabled: true, includeRawError: false }`
   */
  sanitization?: SanitizationConfig
}
