import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSanitizedObservability } from './useSanitizedObservability'
import type { ObservabilityError, ObservabilityMetric } from '@/types/observability'

const error: ObservabilityError = {
  category: 'api_error',
  message: 'Failed for john@example.com',
  fieldErrors: [],
  raw: new Error('Original'),
  timestamp: 0,
}

const metric: ObservabilityMetric = {
  name: 'sdk.form.submit_duration',
  value: 1,
  tags: { email: 'john@example.com' },
  timestamp: 0,
}

describe('useSanitizedObservability with custom sanitizers', () => {
  it('delivers policy-compliant errors to onError', () => {
    const onError = vi.fn()
    const { result } = renderHook(() =>
      useSanitizedObservability({
        onError,
        sanitization: { customErrorSanitizer: e => ({ ...e, raw: e.raw }) },
      }),
    )

    result.current?.onError?.(error)

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Failed for [EMAIL-REDACTED]', raw: undefined }),
    )
  })

  it('delivers policy-compliant metrics to onMetric', () => {
    const onMetric = vi.fn()
    const { result } = renderHook(() =>
      useSanitizedObservability({
        onMetric,
        sanitization: { customMetricSanitizer: m => ({ ...m }) },
      }),
    )

    result.current?.onMetric?.(metric)

    expect(onMetric).toHaveBeenCalledWith(
      expect.objectContaining({ tags: { email: '[EMAIL-REDACTED]' } }),
    )
  })
})
