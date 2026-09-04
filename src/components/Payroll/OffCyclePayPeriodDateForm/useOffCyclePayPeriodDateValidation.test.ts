import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useOffCyclePayPeriodDateValidation } from './useOffCyclePayPeriodDateValidation'

describe('useOffCyclePayPeriodDateValidation', () => {
  const TODAY = new Date(2026, 8, 2)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(TODAY)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('bounds maxDate and minPayPeriodDate to 1 year from today, matching legacy', () => {
    const { result } = renderHook(() => useOffCyclePayPeriodDateValidation())

    expect(result.current.maxDate).toEqual(new Date(2027, 8, 2))
    expect(result.current.minPayPeriodDate).toEqual(new Date(2025, 8, 2))
  })

  it('recomputes maxDate and minPayPeriodDate from whatever today is', () => {
    vi.setSystemTime(new Date(2030, 0, 15))

    const { result } = renderHook(() => useOffCyclePayPeriodDateValidation())

    expect(result.current.maxDate).toEqual(new Date(2031, 0, 15))
    expect(result.current.minPayPeriodDate).toEqual(new Date(2029, 0, 15))
  })
})
