/**
 * UTC offset (in hours) for Mountain Standard Time. Fixed for this rule's
 * purposes because the Jan 8 cutover always falls in winter, before Denver's
 * mid-March DST transition — so MST (UTC-7), not MDT, always applies.
 */
const MST_UTC_OFFSET_HOURS = 7
const CUTOVER_HOUR_MST = 15

/**
 * Computes the allowed `check_date` range for a historical contractor payment.
 *
 * @remarks The allowed tax-year window flips at Jan 8, 3:00 PM MST: strictly
 * before the cutover, both the prior year and the current year are allowed;
 * at or after it, only the current year is allowed. `maxDate` is always
 * today, since a historical payment can never be dated in the future.
 *
 * @param now - The instant to evaluate the cutover against. Defaults to the
 * current time; pass an explicit value in tests.
 * @returns `minDate` (Jan 1 of the earliest allowed year) and `maxDate`
 * (today), both at local midnight — ready to pass to `DatePicker`'s
 * `minDate`/`maxDate` props.
 * @internal
 */
export function getHistoricalPaymentCheckDateBounds(now: Date = new Date()): {
  minDate: Date
  maxDate: Date
} {
  const currentYear = now.getFullYear()
  const cutover = new Date(
    Date.UTC(currentYear, 0, 8, CUTOVER_HOUR_MST + MST_UTC_OFFSET_HOURS, 0, 0),
  )
  const earliestAllowedYear = now > cutover ? currentYear : currentYear - 1

  return {
    minDate: new Date(earliestAllowedYear, 0, 1),
    maxDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  }
}
