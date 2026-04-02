import { describe, expect, it, vi } from 'vitest'
import { useErrorHandling } from './useErrorHandling'
import type { SDKError } from '@/types/sdkError'

function createQuery(error: Error | null = null) {
  return { error, refetch: vi.fn().mockResolvedValue({ data: null }) }
}

function createSubmitState(error: SDKError | null = null) {
  return { error, setError: vi.fn() }
}

const networkError = new Error('Network request failed')
const timeoutError = new Error('Request timed out')

const submitError: SDKError = {
  category: 'api_error',
  message: '1 field has issues',
  httpStatus: 422,
  fieldErrors: [{ field: 'rate', category: 'invalid_attribute_value', message: 'is required' }],
}

describe('useErrorHandling', () => {
  describe('errors', () => {
    it('returns empty errors when all queries succeed and no submit error', () => {
      const result = useErrorHandling([createQuery(), createQuery()], createSubmitState())

      expect(result.errors).toEqual([])
    })

    it('collects errors from failed queries', () => {
      const result = useErrorHandling(
        [createQuery(networkError), createQuery(), createQuery(timeoutError)],
        createSubmitState(),
      )

      expect(result.errors).toHaveLength(2)
      expect(result.errors[0]!.message).toBe('Network request failed')
      expect(result.errors[1]!.message).toBe('Request timed out')
    })

    it('includes submit error alongside query errors', () => {
      const result = useErrorHandling([createQuery(networkError)], createSubmitState(submitError))

      expect(result.errors).toHaveLength(2)
      expect(result.errors[0]!.category).toBe('internal_error')
      expect(result.errors[1]!.category).toBe('api_error')
      expect(result.errors[1]!.fieldErrors).toHaveLength(1)
    })

    it('includes submit error when no queries have errors', () => {
      const result = useErrorHandling([createQuery()], createSubmitState(submitError))

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBe(submitError)
    })
  })

  describe('retryQueries', () => {
    it('calls refetch only on queries that have errors', () => {
      const failedQuery = createQuery(networkError)
      const successQuery = createQuery()
      const anotherFailed = createQuery(timeoutError)

      const result = useErrorHandling(
        [failedQuery, successQuery, anotherFailed],
        createSubmitState(),
      )

      result.retryQueries()

      expect(failedQuery.refetch).toHaveBeenCalledOnce()
      expect(successQuery.refetch).not.toHaveBeenCalled()
      expect(anotherFailed.refetch).toHaveBeenCalledOnce()
    })

    it('does nothing when no queries have errors', () => {
      const q1 = createQuery()
      const q2 = createQuery()

      const result = useErrorHandling([q1, q2], createSubmitState())

      result.retryQueries()

      expect(q1.refetch).not.toHaveBeenCalled()
      expect(q2.refetch).not.toHaveBeenCalled()
    })
  })

  describe('clearSubmitError', () => {
    it('calls setError with null', () => {
      const submitState = createSubmitState(submitError)

      const result = useErrorHandling([createQuery()], submitState)

      result.clearSubmitError()

      expect(submitState.setError).toHaveBeenCalledWith(null)
    })
  })
})
