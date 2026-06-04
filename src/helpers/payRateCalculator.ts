import {
  HOURS_PER_PAY_PERIOD_ANNUALLY,
  HOURS_PER_PAY_PERIOD_MONTHLY,
  HOURS_PER_PAY_PERIOD_WEEKLY,
} from '@/shared/constants'

/**
 * Converts a pay rate expressed in the given unit into an equivalent hourly rate.
 *
 * @remarks
 * Uses the standard hours-per-pay-period constants for weekly, monthly, and annual conversions.
 * Returns `0` for `Paycheck` since the hours-per-paycheck value is not fixed.
 *
 * @param amount - The pay amount expressed in `paymentUnit`
 * @param paymentUnit - The unit the `amount` is expressed in
 * @returns The equivalent hourly rate, or `0` when `paymentUnit` is `Paycheck`
 * @internal
 */
const hourlyRate = (
  amount: number,
  paymentUnit: 'Hour' | 'Week' | 'Month' | 'Year' | 'Paycheck',
) => {
  switch (paymentUnit) {
    case 'Hour':
      return amount
    case 'Week':
      return amount / HOURS_PER_PAY_PERIOD_WEEKLY
    case 'Month':
      return amount / HOURS_PER_PAY_PERIOD_MONTHLY
    case 'Year':
      return amount / HOURS_PER_PAY_PERIOD_ANNUALLY
    default:
      return 0
  }
}
/**
 * Converts a pay rate expressed in the given unit into an equivalent annual rate.
 *
 * @param amount - The pay amount expressed in `paymentUnit`
 * @param paymentUnit - The unit the `amount` is expressed in
 * @returns The equivalent annual rate, or `0` when `paymentUnit` is `Paycheck`
 * @internal
 * @see {@link hourlyRate}
 */
export const yearlyRate = (
  amount: number,
  paymentUnit: 'Hour' | 'Week' | 'Month' | 'Year' | 'Paycheck',
) => {
  return hourlyRate(amount, paymentUnit) * HOURS_PER_PAY_PERIOD_ANNUALLY
}
