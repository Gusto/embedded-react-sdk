import { useCallback } from 'react'
import { sanitizeError, sanitizeMetric } from './sanitization'
import type {
  ObservabilityError,
  ObservabilityMetric,
  ObservabilityHook,
} from '@/types/observability'

/**
 * Wraps an observability hook so its `onError` and `onMetric` callbacks receive sanitized payloads.
 *
 * @remarks
 * Returns `undefined` when no observability hook is configured. Otherwise returns an object with
 * memoized `onError` / `onMetric` callbacks that route through {@link sanitizeError} and
 * {@link sanitizeMetric} using the hook's `sanitization` config. Each wrapped callback is only
 * present when the underlying hook defines its counterpart, so partners can opt into error
 * tracking, metric tracking, or both independently.
 *
 * @param observability - The partner-supplied observability hook, if any.
 * @returns A wrapped hook with sanitizing callbacks, or `undefined` when no hook is supplied.
 * @internal
 */
export function useSanitizedObservability(observability?: ObservabilityHook) {
  const sanitizationConfig = observability?.sanitization

  const onError = useCallback(
    (error: ObservabilityError) => {
      if (!observability?.onError) return

      const sanitized = sanitizeError(error, sanitizationConfig)
      observability.onError(sanitized)
    },
    [observability, sanitizationConfig],
  )

  const onMetric = useCallback(
    (metric: ObservabilityMetric) => {
      if (!observability?.onMetric) return

      const sanitized = sanitizeMetric(metric, sanitizationConfig)
      observability.onMetric(sanitized)
    },
    [observability, sanitizationConfig],
  )

  if (!observability) {
    return undefined
  }

  return {
    onError: observability.onError ? onError : undefined,
    onMetric: observability.onMetric ? onMetric : undefined,
  }
}
