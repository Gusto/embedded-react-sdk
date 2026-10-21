import { addDays, formatDateToStringDate, normalizeToDate } from '@/helpers/dateFormatting'

/**
 * Slack added to each end of the tax period. A liability's pay period can fall outside the deposit
 * period it was remitted in, so the window is padded rather than matched exactly.
 */
const PERIOD_PADDING_DAYS = 45

/**
 * `GET /v1/companies/{id}/payrolls` rejects a range wider than 367 days. Clamp below that rather
 * than at it, so a boundary rounding difference can't produce a 422.
 */
const MAX_SPAN_DAYS = 365

/**
 * The same endpoint rejects an `end_date` more than 93 days past today. Clamp below that too.
 */
const MAX_FUTURE_DAYS = 90

/**
 * A `start_date`/`end_date` pair for the payrolls list endpoint.
 *
 * @internal
 */
export interface PayrollLookupWindow {
  /** Inclusive lower bound, as `YYYY-MM-DD`. */
  startDate: string
  /** Inclusive upper bound, as `YYYY-MM-DD`. */
  endDate: string
}

/**
 * Builds the payroll-lookup window used to resolve a tax payment's liability pay periods.
 *
 * @remarks
 * Pads the tax period on both ends, then clamps to the payrolls endpoint's two documented limits —
 * a maximum 367-day span and an `end_date` no more than 93 days ahead of today. Annual tax periods
 * (FUTA, for example) exceed both once padded, so clamping is what keeps the request valid.
 *
 * Clamping can leave liabilities outside the window; the caller resolves those individually, so a
 * narrowed window costs extra requests rather than correctness.
 *
 * @param periodStart - Tax period start as `YYYY-MM-DD`. Falls back to `periodEnd` when absent.
 * @param periodEnd - Tax period end as `YYYY-MM-DD`.
 * @param today - Today's date as `YYYY-MM-DD`, used for the future-end-date clamp.
 * @returns The window, or `undefined` when the dates cannot be parsed.
 * @internal
 */
export function buildPayrollLookupWindow(
  periodStart: string | undefined,
  periodEnd: string | undefined,
  today: string,
): PayrollLookupWindow | undefined {
  const start = normalizeToDate(periodStart ?? periodEnd)
  const end = normalizeToDate(periodEnd)
  const todayDate = normalizeToDate(today)
  if (!start || !end || !todayDate) return undefined

  const latestAllowedEnd = addDays(todayDate, MAX_FUTURE_DAYS)
  const paddedEnd = addDays(end, PERIOD_PADDING_DAYS)
  const clampedEnd = paddedEnd < latestAllowedEnd ? paddedEnd : latestAllowedEnd

  const paddedStart = addDays(start, -PERIOD_PADDING_DAYS)
  const earliestAllowedStart = addDays(clampedEnd, -MAX_SPAN_DAYS)
  let clampedStart = paddedStart > earliestAllowedStart ? paddedStart : earliestAllowedStart
  // A period far enough in the future can push the start past the clamped end; collapse rather than
  // emit an inverted range the API would reject.
  if (clampedStart > clampedEnd) clampedStart = clampedEnd

  const startDate = formatDateToStringDate(clampedStart)
  const endDate = formatDateToStringDate(clampedEnd)
  if (!startDate || !endDate) return undefined

  return { startDate, endDate }
}
