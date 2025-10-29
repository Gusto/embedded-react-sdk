import { useMemo } from 'react'
import {
  formatDateShortWithWeekday,
  formatDateShortWithWeekdayAndYear,
  formatDateShort,
  formatDateShortWithYear,
  formatDateLong,
  formatDateLongWithYear,
  formatDateWithTime,
  formatPayPeriod,
  formatPayPeriodRange,
} from '@/helpers/dateFormatting'
import { useLocale } from '@/contexts/LocaleProvider'

export const useDateFormatter = () => {
  const { locale } = useLocale()

  return useMemo(
    () => ({
      formatShortWithWeekday: (date?: string | Date | null) =>
        formatDateShortWithWeekday(date, locale),

      formatShortWithWeekdayAndYear: (date?: string | Date | null) =>
        formatDateShortWithWeekdayAndYear(date, locale),

      formatShort: (date?: string | Date | null) => formatDateShort(date, locale),

      formatShortWithYear: (date?: string | Date | null) => formatDateShortWithYear(date, locale),

      formatLong: (date?: string | Date | null) => formatDateLong(date, locale),

      formatLongWithYear: (date?: string | Date | null) => formatDateLongWithYear(date, locale),

      formatWithTime: (date?: string | Date | null) => formatDateWithTime(date, locale),

      formatPayPeriod: (startDate?: string | Date | null, endDate?: string | Date | null) =>
        formatPayPeriod(startDate, endDate, locale),

      formatPayPeriodRange: (
        startDate?: string | Date | null,
        endDate?: string | Date | null,
        options?: { useShortMonth?: boolean },
      ) => formatPayPeriodRange(startDate, endDate, locale, options),
    }),
    [locale],
  )
}
