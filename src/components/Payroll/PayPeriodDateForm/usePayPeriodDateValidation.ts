import { useMemo } from 'react'

const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const addBusinessDays = (startDate: Date, businessDays: number): Date => {
  let currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)
  let daysAdded = 0

  while (daysAdded < businessDays) {
    currentDate = addDays(currentDate, 1)
    if (!isWeekend(currentDate)) {
      daysAdded++
    }
  }

  return currentDate
}

const ACH_LEAD_TIME_BUSINESS_DAYS = 2

export function usePayPeriodDateValidation() {
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
