import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SDKValidationError } from '@gusto/embedded-api/models/errors/sdkvalidationerror'
import {
  usePollingTask,
  isNonRetryablePollError,
  type PollTickResult,
  type UsePollingTaskOptions,
} from './usePollingTask'

const INTERVAL_MS = 5_000
const DEADLINE_MS = 30_000

const setup = (overrides: Partial<UsePollingTaskOptions<string, string>> = {}) => {
  const onDone = vi.fn()
  const onError = vi.fn()
  const onDeadline = vi.fn()
  const options: UsePollingTaskOptions<string, string> = {
    fetch: vi.fn(() => Promise.resolve('pending')),
    evaluate: (outcome): PollTickResult<string> =>
      outcome.success && outcome.data === 'ready'
        ? { status: 'done', value: outcome.data }
        : { status: 'polling' },
    onDone,
    onError,
    onDeadline,
    intervalMs: INTERVAL_MS,
    deadlineMs: DEADLINE_MS,
    ...overrides,
  }
  const rendered = renderHook(() => usePollingTask(options))
  return { ...rendered, options, onDone, onError, onDeadline }
}

describe('usePollingTask', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reads immediately on start and reports a terminal result', async () => {
    const read = vi.fn(() => Promise.resolve('ready'))
    const { result, onDone } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })

    expect(read).toHaveBeenCalledTimes(1)
    expect(onDone).toHaveBeenCalledWith('ready')
    expect(result.current.isPolling).toBe(false)
  })

  it('keeps reading on the interval until the result is terminal', async () => {
    let serverState = 'pending'
    const read = vi.fn(() => Promise.resolve(serverState))
    const { result, onDone } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })
    expect(result.current.isPolling).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVAL_MS)
    })
    expect(read).toHaveBeenCalledTimes(2)
    expect(onDone).not.toHaveBeenCalled()

    serverState = 'ready'
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVAL_MS)
    })

    expect(read).toHaveBeenCalledTimes(3)
    expect(onDone).toHaveBeenCalledWith('ready')
    expect(result.current.isPolling).toBe(false)
  })

  it('treats a rejected read as a skipped tick when evaluate tolerates it, not a failed task', async () => {
    const read = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValue('ready')
    const { result, onDone, onDeadline } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })
    expect(onDone).not.toHaveBeenCalled()
    expect(result.current.isPolling).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVAL_MS)
    })

    expect(onDone).toHaveBeenCalledWith('ready')
    expect(onDeadline).not.toHaveBeenCalled()
  })

  it('passes a rejected read to evaluate as a failure outcome instead of throwing', async () => {
    const readError = new Error('network blip')
    const read = vi.fn<() => Promise<string>>().mockRejectedValue(readError)
    const evaluate = vi.fn((): PollTickResult<string> => ({ status: 'polling' }))
    const { result } = setup({ fetch: read, evaluate })

    await act(async () => {
      result.current.start()
    })

    expect(evaluate).toHaveBeenCalledWith({ success: false, error: readError, lastData: null })
  })

  it('includes the last successfully-read data alongside a later rejection', async () => {
    const readError = new Error('network blip')
    const read = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('pending')
      .mockRejectedValue(readError)
    const evaluate = vi.fn((): PollTickResult<string> => ({ status: 'polling' }))
    const { result } = setup({ fetch: read, evaluate })

    await act(async () => {
      result.current.start()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVAL_MS)
    })

    expect(evaluate).toHaveBeenLastCalledWith({
      success: false,
      error: readError,
      lastData: 'pending',
    })
  })

  it('calls onError, not onDone, when evaluate reports a rejected read as an error', async () => {
    const readError = new SDKValidationError('bad shape', new Error('cause'), {})
    const read = vi.fn<() => Promise<string>>().mockRejectedValue(readError)
    const evaluate = vi.fn((outcome): PollTickResult<string> =>
      !outcome.success && isNonRetryablePollError(outcome.error)
        ? { status: 'error', error: outcome.error }
        : { status: 'polling' },
    )
    const { result, onDone, onError, onDeadline } = setup({ fetch: read, evaluate })

    await act(async () => {
      result.current.start()
    })

    expect(read).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(readError)
    expect(onDone).not.toHaveBeenCalled()
    expect(onDeadline).not.toHaveBeenCalled()
    expect(result.current.isPolling).toBe(false)
  })

  it('calls onDeadline with the last data it read', async () => {
    const read = vi.fn(() => Promise.resolve('pending'))
    const { result, onDeadline, onDone } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEADLINE_MS)
    })

    expect(onDeadline).toHaveBeenCalledWith('pending')
    expect(onDone).not.toHaveBeenCalled()
    expect(result.current.isPolling).toBe(false)
  })

  it('passes null to onDeadline when no read ever succeeded', async () => {
    const read = vi.fn(() => Promise.reject(new Error('always down')))
    const { result, onDeadline } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEADLINE_MS)
    })

    expect(onDeadline).toHaveBeenCalledWith(null)
  })

  it('prefers a terminal result over the deadline on the same tick', async () => {
    let serverState = 'pending'
    const read = vi.fn(() => Promise.resolve(serverState))
    const { result, onDone, onDeadline } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEADLINE_MS - INTERVAL_MS)
    })
    expect(onDeadline).not.toHaveBeenCalled()

    serverState = 'ready'
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVAL_MS)
    })

    expect(onDone).toHaveBeenCalledWith('ready')
    expect(onDeadline).not.toHaveBeenCalled()
  })

  it('stops reading and reports nothing after stop', async () => {
    const read = vi.fn(() => Promise.resolve('pending'))
    const { result, onDone, onDeadline } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })
    act(() => {
      result.current.stop()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEADLINE_MS * 2)
    })

    expect(read).toHaveBeenCalledTimes(1)
    expect(onDone).not.toHaveBeenCalled()
    expect(onDeadline).not.toHaveBeenCalled()
    expect(result.current.isPolling).toBe(false)
  })

  it('reports nothing after unmount', async () => {
    const read = vi.fn(() => Promise.resolve('pending'))
    const { result, unmount, onDone, onDeadline } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
    })
    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(DEADLINE_MS * 2)
    })

    expect(read).toHaveBeenCalledTimes(1)
    expect(onDone).not.toHaveBeenCalled()
    expect(onDeadline).not.toHaveBeenCalled()
  })

  it('runs a single loop when start is called twice', async () => {
    const read = vi.fn(() => Promise.resolve('ready'))
    const { result, onDone } = setup({ fetch: read })

    await act(async () => {
      result.current.start()
      result.current.start()
    })

    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('uses the latest callbacks without restarting the loop', async () => {
    let serverState = 'pending'
    const read = vi.fn(() => Promise.resolve(serverState))
    const firstOnDone = vi.fn()
    const secondOnDone = vi.fn()

    const { result, rerender } = renderHook(
      ({ onDone }: { onDone: (value: string) => void }) =>
        usePollingTask<string, string>({
          fetch: read,
          evaluate: outcome =>
            outcome.success && outcome.data === 'ready'
              ? { status: 'done', value: outcome.data }
              : { status: 'polling' },
          onDone,
          onError: vi.fn(),
          onDeadline: vi.fn(),
          intervalMs: INTERVAL_MS,
          deadlineMs: DEADLINE_MS,
        }),
      { initialProps: { onDone: firstOnDone } },
    )

    await act(async () => {
      result.current.start()
    })
    rerender({ onDone: secondOnDone })

    serverState = 'ready'
    await act(async () => {
      await vi.advanceTimersByTimeAsync(INTERVAL_MS)
    })

    expect(secondOnDone).toHaveBeenCalledWith('ready')
    expect(firstOnDone).not.toHaveBeenCalled()
    expect(read).toHaveBeenCalledTimes(2)
  })
})

describe('isNonRetryablePollError', () => {
  it('is true for an SDKValidationError', () => {
    expect(
      isNonRetryablePollError(new SDKValidationError('bad shape', new Error('cause'), {})),
    ).toBe(true)
  })

  it('is false for a generic error', () => {
    expect(isNonRetryablePollError(new Error('network blip'))).toBe(false)
  })
})
