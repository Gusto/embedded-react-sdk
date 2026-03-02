import { describe, expect, it } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { NotFoundErrorObject } from '@gusto/embedded-api/models/errors/notfounderrorobject'
import { APIError } from '@gusto/embedded-api/models/errors/apierror'
import { UnprocessableEntityErrorObject } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject'
import { GustoEmbeddedError } from '@gusto/embedded-api/models/errors/gustoembeddederror'
import { useBaseSubmit } from './useBaseSubmit'

const createMockHttpMeta = () => ({
  response: new Response('', { status: 404 }),
  request: new Request('https://api.gusto.com/test'),
  body: '{}',
})

describe('useBaseSubmit', () => {
  describe('baseSubmitHandler error handling', () => {
    it('catches APIError and sets error state', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const apiError = new APIError('API error occurred', createMockHttpMeta())

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw apiError
        })
      })

      expect(result.current.error).toBe(apiError)
    })

    it('catches UnprocessableEntityErrorObject and sets error state', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const unprocessableError = new UnprocessableEntityErrorObject(
        {
          errors: [
            {
              errorKey: 'payroll',
              category: 'invalid_operation',
              message: 'Payroll cannot be submitted due to RFI blockers',
            },
          ],
        },
        createMockHttpMeta(),
      )

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw unprocessableError
        })
      })

      expect(result.current.error).toBe(unprocessableError)
      expect(result.current.fieldErrors).toHaveLength(1)
    })

    it('catches NotFoundErrorObject and sets error state instead of throwing to error boundary', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const notFoundError = new NotFoundErrorObject(
        {
          errors: [
            {
              errorKey: 'payroll',
              category: 'not_found',
              message: 'Payroll not found or no longer submittable',
            },
          ],
        },
        createMockHttpMeta(),
      )

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw notFoundError
        })
      })

      expect(result.current.error).toBe(notFoundError)
    })

    it('catches GustoEmbeddedError and sets error state instead of throwing to error boundary', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const gustoError = new GustoEmbeddedError('Unexpected API error', createMockHttpMeta())

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw gustoError
        })
      })

      expect(result.current.error).toBe(gustoError)
    })

    it('clears error and fieldErrors before each submission', async () => {
      const { result } = renderHook(() => useBaseSubmit())

      const apiError = new APIError('First error', createMockHttpMeta())

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => {
          throw apiError
        })
      })

      expect(result.current.error).toBe(apiError)

      await act(async () => {
        await result.current.baseSubmitHandler({}, () => Promise.resolve())
      })

      expect(result.current.error).toBeNull()
      expect(result.current.fieldErrors).toBeNull()
    })
  })
})
