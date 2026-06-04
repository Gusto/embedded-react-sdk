import { useMemo } from 'react'
import { usePaySchedulesGetPayPeriodsSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/paySchedulesGetPayPeriods'
import { PayrollTypes } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1companiescompanyidpayperiods'
import type { PayPeriod } from '@gusto/embedded-api-v-2025-11-15/models/components/payperiod'
import { RFCDate } from '@gusto/embedded-api-v-2025-11-15/types/rfcdate'

const LOOK_AHEAD_DAYS = 90

interface UseUnprocessedTransitionPayPeriodsResult {
  unprocessedPayPeriods: PayPeriod[]
  hasUnprocessedTransitions: boolean
}

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
