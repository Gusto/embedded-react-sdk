import { useCallback } from 'react'
import { sanitizeError, sanitizeMetric } from './sanitization'
import type {
  ObservabilityError,
  ObservabilityMetric,
  ObservabilityHook,
} from '@/types/observability'

/**
 * Wraps an ObservabilityHook to apply sanitization before calling the callbacks
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
