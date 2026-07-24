import { normalizeToDate, MS_PER_HOUR } from '@/helpers/dateFormatting'

const MS_PER_DAY = MS_PER_HOUR * 24

const MINIMUM_WAGE_ADJUSTMENT_NAME = 'minimum wage adjustment'

/**
 * A workweek date range, as returned by a future Embedded API field once
 * Regular Rate of Pay support ships (tracked as EMBPAY-705/EMBPAY-709 in
 * zenpayroll; not yet available in any released API version).
 *
 * @remarks Consumers must never derive these dates client-side. Workweek
 * boundary computation (pay-schedule transitions, off-cycle payrolls with
 * employees on divergent workweek start days) is entirely owned by the
 * backend — gusto-web's equivalent, `Workweek::WorkweekCalculator`, is
 * intentionally not ported here. Once the API ships, boundaries are expected
 * to arrive as `start_date`/`end_date` pairs on each compensation's
 * `breakdowns[]` rows (from `payrolls#prepare`/`#update`/`#create`), not as a
 * standalone workweeks list.
 *
 * @internal
 */
export interface Workweek {
  startDate: string
  endDate: string
}

/**
 * A value distributed across workweeks, keyed by `${startDate}/${endDate}`.
 *
 * @remarks The key format matches gusto-web's `evenlyDistributeValue` key
 * convention, preserved for parity with the reference implementation.
 *
 * @internal
 */
export type WorkweekDistribution = Record<string, number>

const round = (value: number, precision: number): number => parseFloat(value.toFixed(precision))

const calendarDaysInclusive = (startDate: string, endDate: string): number => {
  const start = normalizeToDate(startDate)
  const end = normalizeToDate(endDate)
  if (!start || !end) return 0

  // Diff via UTC calendar-date components (not raw millisecond subtraction on
  // the local-time Date objects normalizeToDate returns) so a Daylight Saving
  // Time transition falling inside the range never perturbs the day count.
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate())
  return Math.round((utcEnd - utcStart) / MS_PER_DAY) + 1
}

/**
 * Evenly distributes a pay-period total across workweeks, weighted by each
 * workweek's calendar-day span, then rounds each share and reconciles any
 * rounding remainder onto the first workweek.
 *
 * @remarks
 * Ported from gusto-web's `evenlyDistributeValue`
 * (`WorkweekBreakdownDrawerContent/utils/helpers.ts`). The distributed
 * VALUES are computed here; the regular-rate-of-pay / overtime-premium math
 * that consumes them happens server-side and is not part of this SDK.
 *
 * Two intentional deviations from gusto-web:
 * 1. **Empty array**: gusto-web accesses `workweeks[0]` before checking
 *    `workweeks.length === 0`, which throws on an empty array in production
 *    today. This port checks length first and returns `{}` instead of
 *    throwing — there is no well-defined distribution over zero workweeks.
 * 2. **Missing bounds**: if the first workweek's `startDate` or the last
 *    workweek's `endDate` is falsy, this returns `{}` rather than proceeding
 *    with invalid-date arithmetic.
 *
 * Everything else below is gusto-web's real, load-bearing behavior — not a
 * bug we're fixing:
 * - `totalDays` (the distribution denominator) spans from the first
 *   workweek's `startDate` to the last workweek's `endDate`, inclusive. For
 *   non-contiguous ("gappy") workweeks, gap days between them count toward
 *   this denominator without being individually attributed to any workweek.
 * - The rounding remainder (`valueToDistribute` minus the sum of each
 *   workweek's independently-rounded share) is always assigned entirely to
 *   `workweeks[0]` — the first workweek by array order, never the last,
 *   never spread proportionally. For gappy workweeks this means
 *   `workweeks[0]` can absorb a disproportionate share of the total.
 *
 * @param valueToDistribute - The pay-period total to spread across workweeks.
 * @param precision - Decimal places to round each workweek's share to.
 *   Caller-supplied; this SDK does not hardcode a convention, since
 *   gusto-web itself uses different precisions in different code paths
 *   (2 for earnings in its bulk auto-distribute flow, 6 for both hours and
 *   earnings in its per-employee drawer autosave flow).
 * @param workweeks - The workweek date ranges to distribute across, in
 *   chronological order. Must be supplied externally — never derived here.
 * @returns A map from `${startDate}/${endDate}` to the rounded share of
 *   `valueToDistribute` assigned to that workweek. Returns `{}` when
 *   `workweeks` is empty or the outer date bounds are missing.
 * @internal
 */
export const evenlyDistributeValue = (
  valueToDistribute: number,
  precision: number,
  workweeks: Workweek[],
): WorkweekDistribution => {
  if (workweeks.length === 0) return {}

  const firstStartDate = workweeks[0]!.startDate
  const lastEndDate = workweeks[workweeks.length - 1]!.endDate
  if (!firstStartDate || !lastEndDate) return {}

  const totalDays = calendarDaysInclusive(firstStartDate, lastEndDate)

  const valuesPerWorkweek = workweeks.map(workweek => {
    const daysInWorkweek =
      workweek.startDate && workweek.endDate
        ? calendarDaysInclusive(workweek.startDate, workweek.endDate)
        : 0
    const value = (valueToDistribute * daysInWorkweek) / totalDays
    return { value: round(value, precision), key: `${workweek.startDate}/${workweek.endDate}` }
  })

  const total = valuesPerWorkweek.reduce((acc, workweek) => acc + workweek.value, 0)
  const difference = valueToDistribute - total
  valuesPerWorkweek[0]!.value = round(valuesPerWorkweek[0]!.value + difference, precision)

  return valuesPerWorkweek.reduce<WorkweekDistribution>((acc, workweek) => {
    acc[workweek.key] = workweek.value
    return acc
  }, {})
}

/**
 * A single row of existing per-workweek breakdown data for one field (e.g.
 * one job's overtime hours, or one earning type), used only to decide
 * whether a breakdown has already been started — not to validate its
 * correctness.
 *
 * @internal
 */
export interface WorkweekBreakdownRow {
  startDate?: string
  endDate?: string
  value: number
}

/**
 * Decides whether a pay-period-total field needs to be broken down into
 * per-workweek values before it can be submitted.
 *
 * @remarks
 * Ported from gusto-web's `useEmployeesNeedWorkweekBreakdowns`, generalized
 * to a framework-agnostic predicate with no React/GraphQL dependency.
 *
 * This is an EXISTENCE check, not a correctness check, by deliberate
 * gusto-web design: "needs a breakdown" is `false` as soon as
 * `existingBreakdownRows` contains any row with `value > 0`, even if the
 * existing rows don't sum to `payPeriodTotal`. A breakdown that already
 * exists but is incomplete or wrong still counts as "already has one." This
 * is inherited from gusto-web, not something introduced here — flagging it
 * because it's worth reconsidering (sum-based validation instead) once this
 * is wired to a real UI, since it currently means a partial/incorrect
 * breakdown can never be automatically re-triggered.
 *
 * @param payPeriodTotal - The pay-period total for this job+field (e.g. total overtime hours).
 * @param existingBreakdownRows - Any already-entered per-workweek rows for the same job+field.
 * @returns `true` when the field needs a per-workweek breakdown; `false` otherwise.
 * @internal
 */
export const needsWorkweekBreakdown = (
  payPeriodTotal: number,
  existingBreakdownRows: WorkweekBreakdownRow[],
): boolean => {
  if (payPeriodTotal <= 0) return false
  return !existingBreakdownRows.some(row => row.value > 0)
}

/**
 * Decides whether an earning type needs a per-workweek breakdown, applying
 * the same existence check as {@link needsWorkweekBreakdown} plus two
 * earnings-specific gates gusto-web applies before considering an earning
 * for RROP breakdown at all.
 *
 * @remarks
 * `isIncludedInRegularRateOfPay` naming note: gusto-web's GraphQL schema
 * calls this field `includedInRegularRateOfPay` (a boolean on the
 * earning-type definition). An internal TSpec for the Embedded API instead
 * proposes `included_in_overtime_pay`. Whether these denote the same
 * concept is unconfirmed — "regular rate of pay" (the divisor used to
 * compute the overtime premium) and "overtime pay" (the premium itself) are
 * related but distinct legal concepts. This parameter is named generically
 * to avoid committing to either name before the real API field ships;
 * confirm the mapping at the call site once it does.
 *
 * "Minimum Wage Adjustment" is always structurally excluded from RROP
 * breakdown consideration in gusto-web, regardless of
 * `isIncludedInRegularRateOfPay` — matched case-insensitively here, mirroring
 * this SDK's existing case-insensitive earning-name comparisons in
 * `Payroll/helpers.ts`.
 *
 * @param payPeriodTotal - The pay-period total amount for this earning type.
 * @param existingBreakdownRows - Any already-entered per-workweek rows for this earning.
 * @param isIncludedInRegularRateOfPay - Whether this earning type counts toward the regular rate of pay.
 * @param earningTypeName - The earning type's display name, used only to detect "Minimum Wage Adjustment".
 * @returns `true` when the earning needs a per-workweek breakdown; `false` otherwise.
 * @internal
 */
export const needsWorkweekBreakdownForEarning = (
  payPeriodTotal: number,
  existingBreakdownRows: WorkweekBreakdownRow[],
  isIncludedInRegularRateOfPay: boolean,
  earningTypeName: string | undefined,
): boolean => {
  if (!isIncludedInRegularRateOfPay) return false
  if ((earningTypeName ?? '').toLowerCase() === MINIMUM_WAGE_ADJUSTMENT_NAME) return false
  return needsWorkweekBreakdown(payPeriodTotal, existingBreakdownRows)
}
