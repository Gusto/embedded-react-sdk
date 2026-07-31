import { describe, expect, it } from 'vitest'
import { getHistoricalPaymentCheckDateBounds } from './historicalPaymentDateBounds'

describe('getHistoricalPaymentCheckDateBounds', () => {
  it('bounds to the current year only well after the Jan 8 cutover', () => {
    const { minDate, maxDate } = getHistoricalPaymentCheckDateBounds(
      new Date('2026-07-27T12:00:00-07:00'),
    )

    expect(minDate).toEqual(new Date(2026, 0, 1))
    expect(maxDate).toEqual(new Date(2026, 6, 27))
  })

  it('allows the prior year before Jan 8, 3PM MST', () => {
    const { minDate, maxDate } = getHistoricalPaymentCheckDateBounds(
      new Date('2026-01-03T12:00:00-07:00'),
    )

    expect(minDate).toEqual(new Date(2025, 0, 1))
    expect(maxDate).toEqual(new Date(2026, 0, 3))
  })

  it('still allows the prior year one minute before the Jan 8 cutover', () => {
    // Jan 8, 3:00 PM MST == Jan 8, 22:00 UTC
    const { minDate } = getHistoricalPaymentCheckDateBounds(new Date('2026-01-08T21:59:00Z'))

    expect(minDate).toEqual(new Date(2025, 0, 1))
  })

  it('flips to current-year-only one millisecond after the Jan 8 cutover', () => {
    const { minDate } = getHistoricalPaymentCheckDateBounds(new Date('2026-01-08T22:00:00.001Z'))

    expect(minDate).toEqual(new Date(2026, 0, 1))
  })

  it('is not sensitive to timezones behind MST for the same wall-clock date', () => {
    // 8:00 AM in Sydney (UTC+11) on Jan 4 is still Jan 3 in MST — the cutover
    // math runs on the absolute instant, not the caller's local wall clock.
    const { minDate } = getHistoricalPaymentCheckDateBounds(new Date('2026-01-04T08:00:00+11:00'))

    expect(minDate).toEqual(new Date(2025, 0, 1))
  })

  it('normalizes maxDate to local midnight, dropping any time-of-day component', () => {
    const { maxDate } = getHistoricalPaymentCheckDateBounds(new Date('2026-07-27T23:45:00-07:00'))

    expect(maxDate).toEqual(new Date(2026, 6, 27))
  })
})
