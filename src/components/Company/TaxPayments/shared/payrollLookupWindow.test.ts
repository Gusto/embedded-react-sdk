import { describe, expect, it } from 'vitest'
import { buildPayrollLookupWindow } from './payrollLookupWindow'

const TODAY = '2026-10-19'

const spanInDays = ({ startDate, endDate }: { startDate: string; endDate: string }) =>
  (Date.parse(endDate) - Date.parse(startDate)) / 86_400_000

const daysFromToday = (date: string) => (Date.parse(date) - Date.parse(TODAY)) / 86_400_000

describe('buildPayrollLookupWindow', () => {
  it('pads a monthly period on both ends', () => {
    expect(buildPayrollLookupWindow('2026-09-01', '2026-09-30', TODAY)).toEqual({
      startDate: '2026-07-18',
      endDate: '2026-11-14',
    })
  })

  // An annual FUTA period padded by 45 days each side spans ~15 months, which the payrolls
  // endpoint rejects with "Date range too long, max 1 year" plus a future-end-date error.
  it('clamps an annual period to the span and future-date limits the API enforces', () => {
    const window = buildPayrollLookupWindow('2026-01-01', '2026-12-31', TODAY)!

    expect(spanInDays(window)).toBeLessThanOrEqual(367)
    expect(daysFromToday(window.endDate)).toBeLessThanOrEqual(93)
    // Still covers the bulk of the tax year, so most liabilities resolve from this one request.
    expect(window.startDate).toBe('2026-01-17')
    expect(window.endDate).toBe('2027-01-17')
  })

  it('falls back to the period end when the start is null for a legacy payment', () => {
    expect(buildPayrollLookupWindow(undefined, '2026-09-30', TODAY)).toEqual({
      startDate: '2026-08-16',
      endDate: '2026-11-14',
    })
  })

  it('collapses rather than inverting when the period is far in the future', () => {
    const window = buildPayrollLookupWindow('2027-06-01', '2027-06-30', TODAY)!

    expect(window.startDate).toBe(window.endDate)
    expect(daysFromToday(window.endDate)).toBeLessThanOrEqual(93)
  })

  it('returns undefined when the period end cannot be parsed', () => {
    expect(buildPayrollLookupWindow('2026-01-01', undefined, TODAY)).toBeUndefined()
  })
})
