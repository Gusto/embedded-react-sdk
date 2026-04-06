import { useMemo } from 'react'
import { addBusinessDays } from '@/helpers/dateFormatting'

export const DEFAULT_ACH_LEAD_TIME_BUSINESS_DAYS = 2

export function useOffCyclePayPeriodDateValidation(paymentSpeedDays = DEFAULT_ACH_LEAD_TIME_BUSINESS_DAYS) {
  const achLeadTimeBusinessDays = paymentSpeedDays

  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const minCheckDate = useMemo(() => {
    return addBusinessDays(today, achLeadTimeBusinessDays)
  }, [today, achLeadTimeBusinessDays])

  return {
    today,
    minCheckDate,
    achLeadTimeBusinessDays,
  }
}
