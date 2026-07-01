import { useMemo } from 'react'
import { usePaySchedulesGetPayPeriodsSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/paySchedulesGetPayPeriods'
import { PayrollTypes } from '@gusto/embedded-api-v-2026-02-01/models/operations/getv1companiescompanyidpayperiods'
import type { PayPeriod } from '@gusto/embedded-api-v-2026-02-01/models/components/payperiod'
import { RFCDate } from '@gusto/embedded-api-v-2026-02-01/types/rfcdate'

const LOOK_AHEAD_DAYS = 90

interface UseUnprocessedTransitionPayPeriodsResult {
  unprocessedPayPeriods: PayPeriod[]
  hasUnprocessedTransitions: boolean
}

/**
 * Returns the company's unprocessed transition pay periods within the next 90 days.
 *
 * @param companyId - The company whose transition pay periods to fetch.
 * @returns The unprocessed transition pay periods and a flag indicating whether any exist.
 * @internal
 */
export function useUnprocessedTransitionPayPeriods(
  companyId: string,
): UseUnprocessedTransitionPayPeriodsResult {
  const lookAheadEndDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + LOOK_AHEAD_DAYS)
    return new RFCDate(date)
  }, [])

  const { data } = usePaySchedulesGetPayPeriodsSuspense({
    companyId,
    payrollTypes: PayrollTypes.Transition,
    endDate: lookAheadEndDate,
  })

  const unprocessedPayPeriods = useMemo<PayPeriod[]>(
    () => (data.payPeriods ?? []).filter((pp: PayPeriod) => !pp.payroll?.processed),
    [data],
  )

  return {
    unprocessedPayPeriods,
    hasUnprocessedTransitions: unprocessedPayPeriods.length > 0,
  }
}
