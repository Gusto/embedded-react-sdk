import { useMemo } from 'react'
import { addBusinessDays, addYears } from '@/helpers/dateFormatting'

const DEFAULT_ACH_LEAD_TIME_BUSINESS_DAYS = 2

// Legacy (app/views/off_cycle_payrolls/_pay_period.erb) bounds start date, end date, and check
// date to a rolling window of 1 year in the past through 1 year in the future, identically for
// every off-cycle reason. `minPayPeriodDate` applies only to start/end date -- check date's lower
// bound is the ACH-lead-time-aware `minCheckDate`/`minCheckOnlyDate` below, which is already
// tighter than 1 year ago in every case.
const PAY_PERIOD_WINDOW_YEARS = 1

/** @internal */
export function useOffCyclePayPeriodDateValidation(
  paymentSpeedDays = DEFAULT_ACH_LEAD_TIME_BUSINESS_DAYS,
) {
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const minCheckDate = useMemo(() => {
    return addBusinessDays(today, paymentSpeedDays)
  }, [today, paymentSpeedDays])

  const maxDate = useMemo(() => addYears(today, PAY_PERIOD_WINDOW_YEARS), [today])
  const minPayPeriodDate = useMemo(() => addYears(today, -PAY_PERIOD_WINDOW_YEARS), [today])

  return {
    today,
    minCheckDate,
    maxDate,
    minPayPeriodDate,
    paymentSpeedDays,
  }
}
