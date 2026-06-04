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

/**
 * Returns a set of locale-aware date formatting helpers bound to the current SDK locale.
 *
 * @remarks
 * Each helper accepts a `string | Date | null | undefined` and renders an empty string for nullish
 * input. The locale is read from {@link useLocale} and the returned object is memoized so consumers
 * can safely depend on its identity.
 *
 * Available formatters:
 * - `formatShortWithWeekday` / `formatShortWithWeekdayAndYear` — short numeric date with weekday.
 * - `formatShort` / `formatShortWithYear` — short numeric date.
 * - `formatLong` / `formatLongWithYear` — long month name with day.
 * - `formatWithTime` — date plus time.
 * - `formatPayPeriod` — single pay period label.
 * - `formatPayPeriodRange` — pay period range with an optional `useShortMonth` option.
 *
 * @returns A memoized object of formatter functions.
 * @internal
 */
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
