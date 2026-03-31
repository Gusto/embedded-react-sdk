import { useMemo } from 'react'
import { addBusinessDays } from '@/helpers/dateFormatting'

export const DEFAULT_ACH_LEAD_TIME_BUSINESS_DAYS = 2

function parsePaymentSpeedDays(paymentSpeed?: string): number {
  if (!paymentSpeed) return DEFAULT_ACH_LEAD_TIME_BUSINESS_DAYS
  const parsed = Number(paymentSpeed.split('-')[0])
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ACH_LEAD_TIME_BUSINESS_DAYS
}

export function useOffCyclePayPeriodDateValidation(paymentSpeed?: string) {
  const achLeadTimeBusinessDays = parsePaymentSpeedDays(paymentSpeed)

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
