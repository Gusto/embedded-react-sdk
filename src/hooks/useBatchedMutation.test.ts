import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBatchedMutation } from './useBatchedMutation'

interface TestItem {
  id: string
  value: number
}

describe('useBatchedMutation', () => {
  const mockMutationFn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('integrates with processBatches to batch items correctly', async () => {
    const items: TestItem[] = Array.from({ length: 150 }, (_, i) => ({
      id: `item-${i}`,
      value: i,
    }))
    mockMutationFn
      .mockResolvedValueOnce({ success: true, processedCount: 100 })
      .mockResolvedValueOnce({ success: true, processedCount: 50 })

    const { result } = renderHook(() =>
      useBatchedMutation((batch: TestItem[]) => mockMutationFn(batch)),
    )

    let response: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined
    await act(async () => {
      response = await result.current.mutateAsync(items)
    })

    expect(mockMutationFn).toHaveBeenCalledTimes(2)
    expect(response).toHaveLength(2)
    expect(response?.[0]).toEqual({ success: true, processedCount: 100 })
    expect(response?.[1]).toEqual({ success: true, processedCount: 50 })
  })

  it('sets isPending to true during mutation and false after completion', async () => {
    const items: TestItem[] = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      value: i,
    }))

    let resolveMutation: (value: unknown) => void
    const mutationPromise = new Promise(resolve => {
      resolveMutation = resolve
    })
    mockMutationFn.mockReturnValue(mutationPromise)

    const { result } = renderHook(() =>
      useBatchedMutation((batch: TestItem[]) => mockMutationFn(batch)),
    )

    expect(result.current.isPending).toBe(false)

    let mutatePromise: Promise<unknown>
    act(() => {
      mutatePromise = result.current.mutateAsync(items)
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(true)
    })

    await act(async () => {
      resolveMutation!({ success: true })
      await mutatePromise
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })

  it('sets isPending to false after mutation error', async () => {
    const items: TestItem[] = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      value: i,
    }))
    mockMutationFn.mockRejectedValue(new Error('API error'))

    const { result } = renderHook(() =>
      useBatchedMutation((batch: TestItem[]) => mockMutationFn(batch)),
    )

    await act(async () => {
      await expect(result.current.mutateAsync(items)).rejects.toThrow('API error')
    })

    expect(result.current.isPending).toBe(false)
  })

  it('propagates errors from mutation function', async () => {
    const items: TestItem[] = Array.from({ length: 50 }, (_, i) => ({
      id: `item-${i}`,
      value: i,
    }))
    mockMutationFn.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() =>
      useBatchedMutation((batch: TestItem[]) => mockMutationFn(batch)),
    )

    await act(async () => {
      await expect(result.current.mutateAsync(items)).rejects.toThrow('Network error')
    })
  })

  it('handles empty items array', async () => {
    const { result } = renderHook(() =>
      useBatchedMutation((batch: TestItem[]) => mockMutationFn(batch)),
    )

    let response: Awaited<ReturnType<typeof result.current.mutateAsync>> | undefined
    await act(async () => {
      response = await result.current.mutateAsync([])
    })

    expect(mockMutationFn).not.toHaveBeenCalled()
    expect(response).toEqual([])
  })
})
