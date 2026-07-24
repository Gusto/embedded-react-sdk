import { expect, describe, it } from 'vitest'
import {
  evenlyDistributeValue,
  needsWorkweekBreakdown,
  needsWorkweekBreakdownForEarning,
  type Workweek,
} from './rropHelpers'

describe('evenlyDistributeValue', () => {
  it('splits evenly across two equal 7-day workweeks', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-07' },
      { startDate: '2023-10-08', endDate: '2023-10-14' },
    ]

    expect(evenlyDistributeValue(40, 2, workweeks)).toEqual({
      '2023-10-01/2023-10-07': 20,
      '2023-10-08/2023-10-14': 20,
    })
  })

  it('splits proportionally across a 5-day and 7-day workweek', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-05' },
      { startDate: '2023-10-06', endDate: '2023-10-12' },
    ]

    const result = evenlyDistributeValue(40, 2, workweeks)

    expect(result).toEqual({
      '2023-10-01/2023-10-05': 16.67,
      '2023-10-06/2023-10-12': 23.33,
    })
    expect(Object.values(result).reduce((sum, v) => sum + v, 0)).toBeCloseTo(40, 2)
  })

  it('splits across three unequal workweeks', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-05' },
      { startDate: '2023-10-06', endDate: '2023-10-11' },
      { startDate: '2023-10-12', endDate: '2023-10-14' },
    ]

    expect(evenlyDistributeValue(40, 2, workweeks)).toEqual({
      '2023-10-01/2023-10-05': 14.29,
      '2023-10-06/2023-10-11': 17.14,
      '2023-10-12/2023-10-14': 8.57,
    })
  })

  it('assigns the entire gap-day shortfall to the first workweek for non-contiguous workweeks', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-01-01', endDate: '2023-01-02' }, // 2 days
      { startDate: '2023-01-05', endDate: '2023-01-07' }, // 3 days (gap: Jan 3-4)
    ]

    // totalDays spans Jan 1 - Jan 7 inclusive = 7, including the 2 gap days.
    // Naive proportional split would be 40.257 * 2/7 ≈ 11.50 and 40.257 * 3/7 ≈ 17.25,
    // summing to ~28.76 (5/7 of the total) — but the remainder-correction step forces
    // the two rounded shares to sum to the FULL value, with workweek 0 absorbing it all.
    expect(evenlyDistributeValue(40.257, 0, workweeks)).toEqual({
      '2023-01-01/2023-01-02': 23,
      '2023-01-05/2023-01-07': 17,
    })
  })

  it('returns {} for an empty workweeks array without throwing', () => {
    expect(() => evenlyDistributeValue(40, 2, [])).not.toThrow()
    expect(evenlyDistributeValue(40, 2, [])).toEqual({})
  })

  it('returns the whole rounded value for a single workweek', () => {
    const workweeks: Workweek[] = [{ startDate: '2023-10-01', endDate: '2023-10-07' }]

    expect(evenlyDistributeValue(100, 2, workweeks)).toEqual({
      '2023-10-01/2023-10-07': 100,
    })
  })

  it('generalizes to more than three workweeks', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-07' },
      { startDate: '2023-10-08', endDate: '2023-10-14' },
      { startDate: '2023-10-15', endDate: '2023-10-21' },
      { startDate: '2023-10-22', endDate: '2023-10-28' },
    ]

    const result = evenlyDistributeValue(100, 2, workweeks)

    expect(Object.keys(result)).toHaveLength(4)
    expect(Object.values(result).reduce((sum, v) => sum + v, 0)).toBeCloseTo(100, 2)
  })

  it.each([0, 1, 2, 3, 4, 5, 6])('sums back to the original value at precision %i', precision => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-05' },
      { startDate: '2023-10-06', endDate: '2023-10-11' },
      { startDate: '2023-10-12', endDate: '2023-10-14' },
    ]

    for (const valueToDistribute of [40.257, 42.253, 123.4567, 78.91234]) {
      const result = evenlyDistributeValue(valueToDistribute, precision, workweeks)
      const total = Object.values(result).reduce((sum, v) => sum + v, 0)
      expect(total).toBeCloseTo(valueToDistribute, precision)
    }
  })

  it('returns {} when the first workweek is missing a startDate', () => {
    const workweeks: Workweek[] = [
      { startDate: '', endDate: '2023-10-07' },
      { startDate: '2023-10-08', endDate: '2023-10-14' },
    ]

    expect(evenlyDistributeValue(40, 2, workweeks)).toEqual({})
  })

  it('returns {} when the last workweek is missing an endDate', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-07' },
      { startDate: '2023-10-08', endDate: '' },
    ]

    expect(evenlyDistributeValue(40, 2, workweeks)).toEqual({})
  })

  it('assigns the rounding remainder to the first workweek, never the last', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-01' },
      { startDate: '2023-10-02', endDate: '2023-10-02' },
      { startDate: '2023-10-03', endDate: '2023-10-03' },
    ]

    // 100 / 3 workweeks = 33.333... each; rounded independently that's 33/33/33
    // (summing to 99), so the 1-unit remainder must land on workweek 0.
    expect(evenlyDistributeValue(100, 0, workweeks)).toEqual({
      '2023-10-01/2023-10-01': 34,
      '2023-10-02/2023-10-02': 33,
      '2023-10-03/2023-10-03': 33,
    })
  })

  it('produces keys formatted as "startDate/endDate"', () => {
    const workweeks: Workweek[] = [
      { startDate: '2023-10-01', endDate: '2023-10-07' },
      { startDate: '2023-10-08', endDate: '2023-10-14' },
    ]

    expect(Object.keys(evenlyDistributeValue(40, 2, workweeks))).toEqual([
      '2023-10-01/2023-10-07',
      '2023-10-08/2023-10-14',
    ])
  })

  it('splits two equal 7-day workweeks evenly even when one spans a US Daylight Saving Time transition', () => {
    // 2024-03-10 is the US spring-forward transition (a 23-hour local day).
    const workweeks: Workweek[] = [
      { startDate: '2024-03-04', endDate: '2024-03-10' },
      { startDate: '2024-03-11', endDate: '2024-03-17' },
    ]

    expect(evenlyDistributeValue(40, 2, workweeks)).toEqual({
      '2024-03-04/2024-03-10': 20,
      '2024-03-11/2024-03-17': 20,
    })
  })
})

describe('needsWorkweekBreakdown', () => {
  it('returns false when payPeriodTotal is 0', () => {
    expect(needsWorkweekBreakdown(0, [])).toBe(false)
  })

  it('returns false when payPeriodTotal is negative', () => {
    expect(needsWorkweekBreakdown(-5, [])).toBe(false)
  })

  it('returns true when payPeriodTotal is positive and there are no existing rows', () => {
    expect(needsWorkweekBreakdown(10, [])).toBe(true)
  })

  it('returns false when an existing row has a positive value', () => {
    expect(needsWorkweekBreakdown(10, [{ value: 5 }])).toBe(false)
  })

  it('returns false even when existing rows sum to the wrong total, as long as one row is positive', () => {
    // Existence check, not a correctness check — 3 + 2 = 5, not 10, but this
    // still counts as "already has a breakdown" by gusto-web's own design.
    expect(needsWorkweekBreakdown(10, [{ value: 3 }, { value: 2 }])).toBe(false)
  })

  it('returns true when all existing rows are zero or negative', () => {
    expect(needsWorkweekBreakdown(10, [{ value: 0 }, { value: -3 }])).toBe(true)
  })

  it('returns true when existingBreakdownRows is empty', () => {
    expect(needsWorkweekBreakdown(10, [])).toBe(true)
  })
})

describe('needsWorkweekBreakdownForEarning', () => {
  it('returns false when isIncludedInRegularRateOfPay is false, even with a positive total and no existing rows', () => {
    expect(needsWorkweekBreakdownForEarning(10, [], false, 'Commission')).toBe(false)
  })

  it('returns false for "Minimum Wage Adjustment" regardless of isIncludedInRegularRateOfPay', () => {
    expect(needsWorkweekBreakdownForEarning(10, [], true, 'Minimum Wage Adjustment')).toBe(false)
  })

  it('returns false for a case-varied "minimum wage adjustment" name', () => {
    expect(needsWorkweekBreakdownForEarning(10, [], true, 'minimum WAGE Adjustment')).toBe(false)
  })

  it('returns true when included in RROP, positive total, and no existing breakdown rows', () => {
    expect(needsWorkweekBreakdownForEarning(10, [], true, 'Commission')).toBe(true)
  })

  it('returns false when included in RROP but an existing row already has a positive value', () => {
    expect(needsWorkweekBreakdownForEarning(10, [{ value: 5 }], true, 'Commission')).toBe(false)
  })

  it('returns false when payPeriodTotal is 0 even if included in RROP', () => {
    expect(needsWorkweekBreakdownForEarning(0, [], true, 'Commission')).toBe(false)
  })
})
