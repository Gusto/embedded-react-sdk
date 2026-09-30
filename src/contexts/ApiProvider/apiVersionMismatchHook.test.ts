import { describe, test, expect, vi, afterEach } from 'vitest'
import { apiVersionMismatchHook } from './apiVersionMismatchHook'

describe('apiVersionMismatchHook', () => {
  const mockContext = { operationID: 'getPayroll' } as Parameters<
    typeof apiVersionMismatchHook.afterSuccess
  >[0]

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('warns when the response API version differs from the requested version', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const response = new Response(null, {
      headers: { 'X-Gusto-API-Version': '2026-02-01' },
    })

    const result = apiVersionMismatchHook.afterSuccess(mockContext, response)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain('2026-02-01')
    expect(result).toBe(response)
  })

  test('does not warn when the response API version matches the requested version', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const response = new Response(null, {
      headers: { 'X-Gusto-API-Version': '2026-06-15' },
    })

    apiVersionMismatchHook.afterSuccess(mockContext, response)

    expect(warnSpy).not.toHaveBeenCalled()
  })

  test('does not warn when the response has no X-Gusto-API-Version header', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const response = new Response(null)

    apiVersionMismatchHook.afterSuccess(mockContext, response)

    expect(warnSpy).not.toHaveBeenCalled()
  })

  test('warns on error responses with a mismatched version and preserves response/error', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const response = new Response(null, {
      status: 422,
      headers: { 'X-Gusto-API-Version': '2026-02-01' },
    })
    const error = new Error('boom')

    const result = apiVersionMismatchHook.afterError(mockContext, response, error)

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ response, error })
  })

  test('does not warn on a null response (network failure)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const error = new Error('network error')

    apiVersionMismatchHook.afterError(mockContext, null, error)

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
