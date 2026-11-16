import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { useCurrentCalendarDate } from './useCurrentCalendarDate'

describe('useCurrentCalendarDate', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('advances to the next day when the clock passes midnight', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 31, 23, 59, 30))

    const { result } = renderHook(() => useCurrentCalendarDate())
    expect(result.current).toEqual(new Date(2026, 0, 31))

    act(() => {
      vi.advanceTimersByTime(31_000)
    })

    expect(result.current).toEqual(new Date(2026, 1, 1))
  })

  it('re-reads the clock on focus, covering a machine that slept through the rollover', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 31, 12, 0, 0))

    const { result } = renderHook(() => useCurrentCalendarDate())
    expect(result.current).toEqual(new Date(2026, 0, 31))

    vi.setSystemTime(new Date(2026, 1, 2, 9, 0, 0))
    act(() => {
      window.dispatchEvent(new Event('focus'))
    })

    expect(result.current).toEqual(new Date(2026, 1, 2))
  })

  it('keeps a stable identity while the day is unchanged, so it is safe as a dependency', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 31, 9, 0, 0))

    const { result } = renderHook(() => useCurrentCalendarDate())
    const initial = result.current

    vi.setSystemTime(new Date(2026, 0, 31, 18, 30, 0))
    act(() => {
      window.dispatchEvent(new Event('focus'))
    })

    expect(result.current).toBe(initial)
  })
})
