import { describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDateRangeFilter } from './useDateRangeFilter'

describe('useDateRangeFilter', () => {
  it('initializes with null dates and is not modified', () => {
    const { result } = renderHook(() => useDateRangeFilter())

    expect(result.current.startDate).toBeNull()
    expect(result.current.endDate).toBeNull()
    expect(result.current.isModified).toBe(false)
  })

  it('seeds start and end from initialStartDate and initialEndDate', () => {
    const initialStart = new Date('2025-01-01')
    const initialEnd = new Date('2025-06-30')

    const { result } = renderHook(() =>
      useDateRangeFilter({ initialStartDate: initialStart, initialEndDate: initialEnd }),
    )

    expect(result.current.startDate).toBe(initialStart)
    expect(result.current.endDate).toBe(initialEnd)
    expect(result.current.isModified).toBe(false)
  })

  it('becomes modified when start date is changed', () => {
    const { result } = renderHook(() => useDateRangeFilter())
    const date = new Date('2025-01-15')

    act(() => {
      result.current.handleStartDateChange(date)
    })

    expect(result.current.startDate).toEqual(date)
    expect(result.current.isModified).toBe(true)
  })

  it('becomes modified when end date is changed', () => {
    const { result } = renderHook(() => useDateRangeFilter())
    const date = new Date('2025-06-15')

    act(() => {
      result.current.handleEndDateChange(date)
    })

    expect(result.current.endDate).toEqual(date)
    expect(result.current.isModified).toBe(true)
  })

  it('restores initial dates when handleClearFilter is called', () => {
    const initialStart = new Date('2025-01-01')
    const initialEnd = new Date('2025-06-30')

    const { result } = renderHook(() =>
      useDateRangeFilter({ initialStartDate: initialStart, initialEndDate: initialEnd }),
    )

    act(() => {
      result.current.handleStartDateChange(new Date('2025-02-01'))
      result.current.handleEndDateChange(new Date('2025-07-01'))
    })

    expect(result.current.isModified).toBe(true)

    act(() => {
      result.current.handleClearFilter()
    })

    expect(result.current.startDate).toBe(initialStart)
    expect(result.current.endDate).toBe(initialEnd)
    expect(result.current.isModified).toBe(false)
  })

  it('clears to null when no initials are supplied', () => {
    const { result } = renderHook(() => useDateRangeFilter())

    act(() => {
      result.current.handleStartDateChange(new Date('2025-01-01'))
      result.current.handleEndDateChange(new Date('2025-06-01'))
    })

    act(() => {
      result.current.handleClearFilter()
    })

    expect(result.current.startDate).toBeNull()
    expect(result.current.endDate).toBeNull()
    expect(result.current.isModified).toBe(false)
  })

  it('calls onFilterChange when dates change', () => {
    const onFilterChange = vi.fn()
    const { result } = renderHook(() => useDateRangeFilter({ onFilterChange }))

    act(() => {
      result.current.handleStartDateChange(new Date('2025-01-01'))
    })
    expect(onFilterChange).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.handleEndDateChange(new Date('2025-06-01'))
    })
    expect(onFilterChange).toHaveBeenCalledTimes(2)

    act(() => {
      result.current.handleClearFilter()
    })
    expect(onFilterChange).toHaveBeenCalledTimes(3)
  })

  describe('getApiDateParams', () => {
    it('returns empty object when no dates are set', () => {
      const { result } = renderHook(() => useDateRangeFilter())

      expect(result.current.getApiDateParams()).toEqual({})
    })

    it('returns initial dates as ISO strings on first render', () => {
      const { result } = renderHook(() =>
        useDateRangeFilter({
          initialStartDate: new Date(2025, 0, 1),
          initialEndDate: new Date(2025, 5, 30),
        }),
      )

      const params = result.current.getApiDateParams()
      expect(params.startDate).toBe('2025-01-01')
      expect(params.endDate).toBe('2025-06-30')
    })

    it('returns startDate as ISO string when set', () => {
      const { result } = renderHook(() => useDateRangeFilter())

      act(() => {
        result.current.handleStartDateChange(new Date(2025, 2, 15))
      })

      const params = result.current.getApiDateParams()
      expect(params.startDate).toBe('2025-03-15')
      expect(params.endDate).toBeUndefined()
    })

    it('returns both dates as ISO strings when set', () => {
      const { result } = renderHook(() => useDateRangeFilter())

      act(() => {
        result.current.handleStartDateChange(new Date(2025, 0, 1))
        result.current.handleEndDateChange(new Date(2025, 5, 30))
      })

      const params = result.current.getApiDateParams()
      expect(params.startDate).toBe('2025-01-01')
      expect(params.endDate).toBe('2025-06-30')
    })
  })

  describe('max/min date constraints', () => {
    it('returns maxEndDate approximately 12 months after start date', () => {
      const { result } = renderHook(() => useDateRangeFilter())
      const startDate = new Date('2025-03-15')

      act(() => {
        result.current.handleStartDateChange(startDate)
      })

      const maxEnd = result.current.getMaxEndDate()
      expect(maxEnd).toBeDefined()

      const diffMs = maxEnd!.getTime() - startDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      expect(diffDays).toBeGreaterThanOrEqual(364)
      expect(diffDays).toBeLessThanOrEqual(367)
    })

    it('returns minStartDate approximately 12 months before end date', () => {
      const { result } = renderHook(() => useDateRangeFilter())
      const endDate = new Date('2025-12-15')

      act(() => {
        result.current.handleEndDateChange(endDate)
      })

      const minStart = result.current.getMinStartDate()
      expect(minStart).toBeDefined()

      const diffMs = endDate.getTime() - minStart!.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      expect(diffDays).toBeGreaterThanOrEqual(364)
      expect(diffDays).toBeLessThanOrEqual(367)
    })

    it('returns undefined for max/min when no dates are set', () => {
      const { result } = renderHook(() => useDateRangeFilter())

      expect(result.current.getMaxEndDate()).toBeUndefined()
      expect(result.current.getMinStartDate()).toBeUndefined()
    })
  })
})
