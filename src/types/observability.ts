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
 * Configures redaction and raw-error inclusion for observability callbacks.
 *
 * @remarks
 * By default, the SDK redacts recognized string patterns in error `message` and
 * `fieldErrors[].message`, and recursively redacts sensitive keys and recognized string
 * patterns in `fieldErrors[].metadata` and metric `tags`. Sensitive keys include credentials,
 * financial identifiers, personal names, birth dates, addresses, and document identifiers.
 * Values are replaced with placeholders; keys are retained. Other properties are not redacted.
 *
 * Pattern and key matching do not detect every sensitive value. Free-text names and addresses,
 * for example, may remain in messages. Select which fields to forward in your callbacks and
 * use additional sensitive keys or custom sanitizers for further processing.
 *
 * Processing order is SDK redaction/raw exclusion, custom sanitizer, SDK redaction/raw
 * exclusion again, then the observability callback. Custom functions receive processed input
 * and their output follows the same configuration. `enabled` controls redaction independently
 * of `includeRawError`; opted-in raw errors pass through without redaction.
 *
 * This configuration applies only to observability callbacks. It does not sanitize form-hook
 * errors, component events, request hooks, or data added by your monitoring integration.
 *
 * @public
 */
export interface SanitizationConfig {
  /**
   * Whether to redact recognized sensitive values in messages, field-error metadata, and
   * metric tags. Default: true.
   *
   * @remarks
   * When `false`, built-in and additional-sensitive-key redaction is skipped before and after
   * custom sanitizers. Custom sanitizers still run. Raw errors remain excluded unless
   * `includeRawError` is `true`.
   */
  enabled?: boolean

  /**
   * Whether to include the original error as `raw` in observability errors. Default: false.
   *
   * @remarks
   * When `false`, `raw` is set to `undefined` before and after a custom error sanitizer,
   * regardless of `enabled`. When `true`, `raw` passes through without redaction and can
   * contain form inputs, API response bodies, and request headers, including credentials.
   */
  includeRawError?: boolean

  /**
   * Transforms an error between applications of the configured SDK processing.
   *
   * @remarks
   * Receives an error after configured redaction and raw exclusion. The SDK processes the
   * returned `message`, `fieldErrors[].message`, `fieldErrors[].metadata`, and `raw` again
   * according to `enabled`, `includeRawError`, and `additionalSensitiveFields`. Other properties
   * are preserved without redaction. Return an error of the same type; messages may be replaced
   * and metadata omitted for additional control over emitted data.
   */
  customErrorSanitizer?: (error: ObservabilityError) => ObservabilityError

  /**
   * Transforms a metric between applications of the configured SDK redaction.
   *
   * @remarks
   * Receives a metric after configured tag redaction. Returned `tags` are redacted again,
   * including keys added by your function. Both passes honor `enabled` and
   * `additionalSensitiveFields`. Other properties are preserved without redaction.
   */
  customMetricSanitizer?: (metric: ObservabilityMetric) => ObservabilityMetric

  /**
   * Additional sensitive keys in field-error metadata and metric tags.
   *
   * @remarks
   * Uses case-insensitive substring matching in nested objects and arrays, before and after
   * custom sanitizers when redaction is enabled. Matching values are replaced with `[REDACTED]`.
   * Does not match field-error paths, message text, or properties outside metadata and tags.
   */
  additionalSensitiveFields?: string[]
}

/**
 * Hooks for routing SDK errors and performance metrics into an external monitoring tool.
 *
 * @remarks
 * Pass an instance to {@link GustoProvider} via `config.observability` to forward
 * errors to services like Sentry or Datadog and to capture performance metrics
 * for form submissions and component loading. Recognized sensitive values are redacted and
 * raw errors excluded by default before callbacks run; see {@link SanitizationConfig}.
 * Select which payload fields to forward. This processing does not detect every PII value
 * or cover data independently collected by your monitoring tool.
 *
 * @public
 * @group Observability
 *
 * @example
 * ```tsx
 * import * as Sentry from '@sentry/react'
 * import type { ObservabilityHook } from '@gusto/embedded-react-sdk'
 *
 * export const observability: ObservabilityHook = {
 *   onError: error => {
 *     Sentry.captureException(new Error(error.message), {
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
 * // Pass observability to GustoProvider through config.observability.
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
