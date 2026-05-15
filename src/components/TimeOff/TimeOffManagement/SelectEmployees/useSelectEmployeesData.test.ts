import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { isStartedByToday } from './useSelectEmployeesData'

describe('isStartedByToday', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Pin "today" to 2026-05-15 so tests don't drift over time.
    vi.setSystemTime(new Date('2026-05-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('returns false for undefined hire_date', () => {
    expect(isStartedByToday(undefined)).toBe(false)
  })

  test('returns false for an empty string hire_date', () => {
    expect(isStartedByToday('')).toBe(false)
  })

  test('returns true when hire_date is exactly today', () => {
    expect(isStartedByToday('2026-05-15')).toBe(true)
  })

  test('returns true for past hire_date', () => {
    expect(isStartedByToday('2024-01-01')).toBe(true)
  })

  test('returns false for a hire_date one day in the future', () => {
    expect(isStartedByToday('2026-05-16')).toBe(false)
  })

  test('returns false for a hire_date well in the future', () => {
    expect(isStartedByToday('2030-01-01')).toBe(false)
  })
})
