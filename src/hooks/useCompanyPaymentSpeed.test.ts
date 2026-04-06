import { describe, it, expect } from 'vitest'
import { parsePaymentSpeedDays } from './useCompanyPaymentSpeed'

describe('parsePaymentSpeedDays', () => {
  it('should return 1 for "1-day"', () => {
    expect(parsePaymentSpeedDays('1-day')).toBe(1)
  })

  it('should return 2 for "2-day"', () => {
    expect(parsePaymentSpeedDays('2-day')).toBe(2)
  })

  it('should return 4 for "4-day"', () => {
    expect(parsePaymentSpeedDays('4-day')).toBe(4)
  })

  it('should return default of 2 when undefined', () => {
    expect(parsePaymentSpeedDays(undefined)).toBe(2)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  it('should return default for invalid format', () => {
    expect(parsePaymentSpeedDays('fast' as any)).toBe(2)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  it('should return default for negative value', () => {
    expect(parsePaymentSpeedDays('-1-day' as any)).toBe(2)
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  it('should return default for zero', () => {
    expect(parsePaymentSpeedDays('0-day' as any)).toBe(2)
  })
})
