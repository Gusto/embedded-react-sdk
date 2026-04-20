import { describe, expect, it, vi } from 'vitest'
import { composeErrorHandler } from './composeErrorHandler'
import type { HookErrorHandling } from './types'
import type { SDKError } from '@/types/sdkError'

function createQuery(error: Error | null = null) {
  return { error, refetch: vi.fn().mockResolvedValue({ data: null }) }
}

function createSubmitState(error: SDKError | null = null) {
  return { submitError: error, setSubmitError: vi.fn() }
}

const networkError = new Error('Network request failed')
const timeoutError = new Error('Request timed out')

const submitErrorFixture: SDKError = {
  category: 'api_error',
  message: '1 field has issues',
  httpStatus: 422,
  fieldErrors: [{ field: 'rate', category: 'invalid_attribute_value', message: 'is required' }],
}

describe('composeErrorHandler', () => {
  describe('errors', () => {
    it('returns empty errors when all queries succeed and no submit error', () => {
      const result = composeErrorHandler([createQuery(), createQuery()], {
        submitError: null,
        setSubmitError: vi.fn(),
      })

      expect(result.errors).toEqual([])
    })

    it('returns empty errors when no submit state and queries succeed', () => {
      const result = composeErrorHandler([createQuery(), createQuery()])

      expect(result.errors).toEqual([])
    })

    it('collects errors from failed queries', () => {
      const result = composeErrorHandler(
        [createQuery(networkError), createQuery(), createQuery(timeoutError)],
        { submitError: null, setSubmitError: vi.fn() },
      )

      expect(result.errors.map(e => e.message)).toEqual([
        'Network request failed',
        'Request timed out',
      ])
    })

    it('includes submit error alongside query errors', () => {
      const result = composeErrorHandler(
        [createQuery(networkError)],
        createSubmitState(submitErrorFixture),
      )

      expect(result.errors).toEqual([
        expect.objectContaining({ category: 'internal_error' }),
        expect.objectContaining({
          category: 'api_error',
          fieldErrors: [
            expect.objectContaining({
              field: 'rate',
              category: 'invalid_attribute_value',
              message: 'is required',
            }),
          ],
        }),
      ])
    })

    it('includes submit error when no queries have errors', () => {
      const result = composeErrorHandler([createQuery()], createSubmitState(submitErrorFixture))

      expect(result.errors).toEqual([submitErrorFixture])
    })
  })

  describe('retryQueries', () => {
    it('calls refetch only on queries that have errors', () => {
      const failedQuery = createQuery(networkError)
      const successQuery = createQuery()
      const anotherFailed = createQuery(timeoutError)

      const result = composeErrorHandler([failedQuery, successQuery, anotherFailed], {
        submitError: null,
        setSubmitError: vi.fn(),
      })

      result.retryQueries()

      expect(failedQuery.refetch).toHaveBeenCalledOnce()
      expect(successQuery.refetch).not.toHaveBeenCalled()
      expect(anotherFailed.refetch).toHaveBeenCalledOnce()
    })

    it('does nothing when no queries have errors', () => {
      const q1 = createQuery()
      const q2 = createQuery()

      const result = composeErrorHandler([q1, q2])

      result.retryQueries()

      expect(q1.refetch).not.toHaveBeenCalled()
      expect(q2.refetch).not.toHaveBeenCalled()
    })
  })

  describe('clearSubmitError', () => {
    it('calls setSubmitError with null', () => {
      const submitState = createSubmitState(submitErrorFixture)

      const result = composeErrorHandler([createQuery()], submitState)

      result.clearSubmitError()

      expect(submitState.setSubmitError).toHaveBeenCalledWith(null)
    })
  })

  describe('mixed sources (nested HookErrorHandling + queries)', () => {
    it('merges nested hook bags with standalone queries', () => {
      const nestedRetry = vi.fn()
      const nestedClear = vi.fn()
      const nested: HookErrorHandling = {
        errors: [submitErrorFixture],
        retryQueries: nestedRetry,
        clearSubmitError: nestedClear,
      }
      const failedQuery = createQuery(networkError)

      const result = composeErrorHandler([{ errorHandling: nested }, failedQuery])

      expect(result.errors).toHaveLength(2)
      result.retryQueries()
      expect(nestedRetry).toHaveBeenCalledOnce()
      expect(failedQuery.refetch).toHaveBeenCalledOnce()
      result.clearSubmitError()
      expect(nestedClear).toHaveBeenCalledOnce()
    })

    it('chains outer submit state with nested clearSubmitError', () => {
      const nested: HookErrorHandling = {
        errors: [],
        retryQueries: vi.fn(),
        clearSubmitError: vi.fn(),
      }
      const setSubmitError = vi.fn()

      const result = composeErrorHandler([{ errorHandling: nested }], {
        submitError: submitErrorFixture,
        setSubmitError,
      })

      expect(result.errors).toContain(submitErrorFixture)
      result.clearSubmitError()
      expect(nested.clearSubmitError).toHaveBeenCalled()
      expect(setSubmitError).toHaveBeenCalledWith(null)
    })
  })

  describe('nested composition (prior composeErrorHandler as a source)', () => {
    it('feeds one composeErrorHandler result into another with extra queries and outer submit', () => {
      const innerFailedQuery = createQuery(networkError)
      const inner = composeErrorHandler([innerFailedQuery])

      const outerFailedQuery = createQuery(timeoutError)
      const setSubmitError = vi.fn()
      const outer = composeErrorHandler([{ errorHandling: inner }, outerFailedQuery], {
        submitError: submitErrorFixture,
        setSubmitError,
      })

      expect(outer.errors.map(e => e.message)).toEqual([
        'Network request failed',
        'Request timed out',
        '1 field has issues',
      ])

      outer.retryQueries()
      expect(innerFailedQuery.refetch).toHaveBeenCalledOnce()
      expect(outerFailedQuery.refetch).toHaveBeenCalledOnce()

      outer.clearSubmitError()
      expect(setSubmitError).toHaveBeenCalledWith(null)
    })

    it('merges two nested composeErrorHandler results (sibling hooks on a screen)', () => {
      const q1 = createQuery(networkError)
      const q2 = createQuery(timeoutError)
      const left = composeErrorHandler([q1])
      const right = composeErrorHandler([q2])

      const screen = composeErrorHandler([{ errorHandling: left }, { errorHandling: right }])

      expect(screen.errors.map(e => e.message)).toEqual([
        'Network request failed',
        'Request timed out',
      ])

      screen.retryQueries()
      expect(q1.refetch).toHaveBeenCalledOnce()
      expect(q2.refetch).toHaveBeenCalledOnce()
    })

    it('runs nested clearSubmitError for each nested composeErrorHandler when clearing outer submit', () => {
      const clearLeft = vi.fn()
      const clearRight = vi.fn()
      const left: HookErrorHandling = {
        errors: [],
        retryQueries: vi.fn(),
        clearSubmitError: clearLeft,
      }
      const right: HookErrorHandling = {
        errors: [],
        retryQueries: vi.fn(),
        clearSubmitError: clearRight,
      }
      const setSubmitError = vi.fn()

      const screen = composeErrorHandler([{ errorHandling: left }, { errorHandling: right }], {
        submitError: submitErrorFixture,
        setSubmitError,
      })

      screen.clearSubmitError()
      expect(clearLeft).toHaveBeenCalledOnce()
      expect(clearRight).toHaveBeenCalledOnce()
      expect(setSubmitError).toHaveBeenCalledWith(null)
    })
  })
})
