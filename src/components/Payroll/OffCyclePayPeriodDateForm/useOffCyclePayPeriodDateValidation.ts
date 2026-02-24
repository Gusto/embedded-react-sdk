import { useMemo } from 'react'
import { addBusinessDays } from '@/helpers/dateFormatting'

const ACH_LEAD_TIME_BUSINESS_DAYS = 2

export function useOffCyclePayPeriodDateValidation() {
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  const minCheckDate = useMemo(() => {
    return addBusinessDays(today, ACH_LEAD_TIME_BUSINESS_DAYS)
  }, [today])

  return {
    today,
    minCheckDate,
    achLeadTimeBusinessDays: ACH_LEAD_TIME_BUSINESS_DAYS,
  }
}
