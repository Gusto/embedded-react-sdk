import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { sanitizeError, sanitizeMetric } from './sanitization'
import { useSanitizedObservability } from './useSanitizedObservability'
import type { ObservabilityError, ObservabilityMetric } from '@/types/observability'

const error: ObservabilityError = {
  category: 'api_error',
  message: 'Failed for user@example.com',
  timestamp: 1,
  raw: { request: { ssn: '123-45-6789' } },
  fieldErrors: [
    {
      field: 'ssn',
      category: 'invalid_attribute_value',
      message: 'Invalid 123-45-6789',
      metadata: { first_name: 'Jane', reference: 'private' },
    },
  ],
}

const metric: ObservabilityMetric = {
  name: 'sdk.form.submit_duration',
  value: 10,
  timestamp: 1,
  tags: { component: 'Employee.Profile', phone: 'private', reference: 'private' },
}

describe('custom sanitizer composition', () => {
  it('delivers redacted errors and metrics to custom functions and observability callbacks', () => {
    const customErrorSanitizer = vi.fn((value: ObservabilityError) => ({ ...value }))
    const customMetricSanitizer = vi.fn((value: ObservabilityMetric) => ({ ...value }))
    const onError = vi.fn()
    const onMetric = vi.fn()
    const { result } = renderHook(() =>
      useSanitizedObservability({
        onError,
        onMetric,
        sanitization: {
          additionalSensitiveFields: ['reference'],
          customErrorSanitizer,
          customMetricSanitizer,
        },
      }),
    )

    result.current?.onError?.(error)
    result.current?.onMetric?.(metric)

    const expectedError = {
      ...error,
      raw: undefined,
      message: 'Failed for [EMAIL-REDACTED]',
      fieldErrors: [
        {
          ...error.fieldErrors[0],
          message: 'Invalid [SSN-REDACTED]',
          metadata: { first_name: '[REDACTED]', reference: '[REDACTED]' },
        },
      ],
    }
    const expectedMetric = {
      ...metric,
      tags: { component: 'Employee.Profile', phone: '[REDACTED]', reference: '[REDACTED]' },
    }
    expect(customErrorSanitizer).toHaveBeenCalledExactlyOnceWith(expectedError)
    expect(onError).toHaveBeenCalledExactlyOnceWith(expectedError)
    expect(customMetricSanitizer).toHaveBeenCalledExactlyOnceWith(expectedMetric)
    expect(onMetric).toHaveBeenCalledExactlyOnceWith(expectedMetric)
    expect(error.fieldErrors[0]?.metadata).toEqual({ first_name: 'Jane', reference: 'private' })
    expect(metric.tags?.phone).toBe('private')
  })

  it('redacts content added by custom functions before delivering callbacks', () => {
    const onError = vi.fn()
    const onMetric = vi.fn()
    const { result } = renderHook(() =>
      useSanitizedObservability({
        onError,
        onMetric,
        sanitization: {
          additionalSensitiveFields: ['reference'],
          customErrorSanitizer: value => ({
            ...value,
            message: 'Contact user@example.com',
            raw: error.raw,
            fieldErrors: [
              {
                ...error.fieldErrors[0]!,
                metadata: { ein: '12-3456789', reference: 'private', note: 'user@example.com' },
              },
            ],
          }),
          customMetricSanitizer: value => ({
            ...value,
            tags: { dateOfBirth: '1990-01-01', reference: 'private', note: 'user@example.com' },
          }),
        },
      }),
    )

    result.current?.onError?.(error)
    result.current?.onMetric?.(metric)

    expect(onError).toHaveBeenCalledExactlyOnceWith({
      ...error,
      raw: undefined,
      message: 'Contact [EMAIL-REDACTED]',
      fieldErrors: [
        {
          ...error.fieldErrors[0],
          message: 'Invalid [SSN-REDACTED]',
          metadata: { ein: '[REDACTED]', reference: '[REDACTED]', note: '[EMAIL-REDACTED]' },
        },
      ],
    })
    expect(onMetric).toHaveBeenCalledExactlyOnceWith({
      ...metric,
      tags: { dateOfBirth: '[REDACTED]', reference: '[REDACTED]', note: '[EMAIL-REDACTED]' },
    })
  })

  it.each([true, false])('keeps raw inclusion independent of enabled: %s', enabled => {
    for (const includeRawError of [true, false]) {
      const customErrorSanitizer = vi.fn((value: ObservabilityError) => ({
        ...value,
        message: error.message,
        fieldErrors: error.fieldErrors,
        raw: error.raw,
      }))
      const sanitized = sanitizeError(error, { enabled, includeRawError, customErrorSanitizer })
      expect(customErrorSanitizer.mock.calls[0]?.[0].raw).toBe(
        includeRawError ? error.raw : undefined,
      )
      expect(sanitized.raw).toBe(includeRawError ? error.raw : undefined)
      expect(sanitized.message).toBe(enabled ? 'Failed for [EMAIL-REDACTED]' : error.message)
      expect(sanitized.fieldErrors[0]?.metadata?.first_name).toBe(enabled ? '[REDACTED]' : 'Jane')
    }
  })

  it('runs metric custom functions with redaction disabled', () => {
    const customMetricSanitizer = vi.fn((value: ObservabilityMetric) => ({
      ...value,
      tags: { note: 'user@example.com' },
    }))
    expect(sanitizeMetric(metric, { enabled: false, customMetricSanitizer }).tags).toEqual({
      note: 'user@example.com',
    })
    expect(customMetricSanitizer).toHaveBeenCalledExactlyOnceWith(metric)
  })
})
