import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDemoManager } from './useDemoManager'

const POLL_INTERVAL_MS = 60_000

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function validateTokenCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([url]) => url === '/sdk-app/api/validate-token').length
}

describe('useDemoManager token polling', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('__SDK_APP_PROXY_MODE__', 'flow-token')
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('keeps polling while the token is valid', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ valid: true })))

    const { result, unmount } = renderHook(() => useDemoManager())
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.tokenStatus).toBe('valid')

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3))
    expect(validateTokenCalls(fetchMock)).toBe(4)

    unmount()
  })

  it('stops polling once the token is reported expired', async () => {
    fetchMock
      .mockImplementationOnce(() => Promise.resolve(jsonResponse({ valid: true })))
      .mockImplementation(() => Promise.resolve(jsonResponse({ valid: false, status: 401 })))

    const { result, unmount } = renderHook(() => useDemoManager())
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.tokenStatus).toBe('valid')

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS))
    expect(result.current.tokenStatus).toBe('expired')
    expect(validateTokenCalls(fetchMock)).toBe(2)

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 10))
    expect(validateTokenCalls(fetchMock)).toBe(2)

    unmount()
  })

  it('resumes polling after a new demo is created', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse({ valid: false, status: 401 })))

    const { result, unmount } = renderHook(() => useDemoManager())
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.tokenStatus).toBe('expired')
    expect(validateTokenCalls(fetchMock)).toBe(1)

    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        url === '/sdk-app/api/create-demo'
          ? jsonResponse({ flowToken: 'token', companyId: 'company', entities: {}, demoType: 'x' })
          : jsonResponse({ valid: true }),
      ),
    )
    await act(() => result.current.createNewDemo())
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(result.current.tokenStatus).toBe('valid')
    expect(validateTokenCalls(fetchMock)).toBe(2)

    await act(() => vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS))
    expect(validateTokenCalls(fetchMock)).toBe(3)

    unmount()
  })
})
