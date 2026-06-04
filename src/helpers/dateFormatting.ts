/**
 * Normalizes any date input (string, Date, or undefined) to a Date object.
 *
 * @remarks Handles `YYYY-MM-DD` strings by parsing them in local time to avoid
 * timezone drift. Also accepts ISO timestamp strings and existing `Date`
 * instances. Returns `null` for nullish, empty, or unparseable input.
 *
 * @param dateInput - The date value to normalize.
 * @returns A `Date` instance, or `null` if the input is missing or invalid.
 * @internal
 */
export const normalizeToDate = (dateInput?: string | Date | null): Date | null => {
  if (!dateInput) return null

  if (typeof dateInput === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const parts = dateInput.split('-')
      if (parts.length !== 3) return null

      const numbers = parts.map(Number)
      const year = numbers[0]
      const month = numbers[1]
      const day = numbers[2]
      if (year === undefined || month === undefined || day === undefined) {
        return null
      }

      if (
        isNaN(year) ||
        isNaN(month) ||
        isNaN(day) ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31
      ) {
        return null
      }

      return new Date(year, month - 1, day)
    }

    const parsedDate = new Date(dateInput)
    return isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput
  }

  return null
}

/**
 * Creates a date formatter function that handles both string and Date inputs.
 */
const createDateFormatter =
  (options: Intl.DateTimeFormatOptions) =>
  (dateInput?: string | Date | null, locale?: string): string => {
    const date = normalizeToDate(dateInput)
    if (!date) return ''
    return date.toLocaleDateString(locale, options)
  }

/**
 * Formats a date as a short weekday plus short month and day (e.g. `Mon, Jan 5`).
 *
 * @internal
 */
export const formatDateShortWithWeekday = createDateFormatter({
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

/**
 * Formats a date as a short weekday, short month, day, and year (e.g. `Mon, Jan 5, 2025`).
 *
 * @internal
 */
export const formatDateShortWithWeekdayAndYear = createDateFormatter({
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Formats a date as a short month and day (e.g. `Jan 5`).
 *
 * @internal
 */
export const formatDateShort = createDateFormatter({
  month: 'short',
  day: 'numeric',
})

/**
 * Formats a date as a short month, day, and year (e.g. `Jan 5, 2025`).
 *
 * @internal
 */
export const formatDateShortWithYear = createDateFormatter({
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Formats a date as a long month and day (e.g. `January 5`).
 *
 * @internal
 */
export const formatDateLong = createDateFormatter({
  month: 'long',
  day: 'numeric',
})

/**
 * Formats a date as a long month, day, and year (e.g. `January 5, 2025`).
 *
 * @internal
 */
export const formatDateLongWithYear = createDateFormatter({
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/**
 * Splits a date into separate locale-formatted time and date strings.
 *
 * @param dateInput - The date value to format.
 * @param locale - Optional BCP 47 locale tag passed to `toLocaleString`.
 * @returns An object with `time` (e.g. `3:45 PM EST`) and `date` (e.g. `Mon, Jan 5`).
 * Both fields are empty strings when the input cannot be parsed.
 * @internal
 */
export const formatDateWithTime = (
  dateInput?: string | Date | null,
  locale?: string,
): { time: string; date: string } => {
  const date = normalizeToDate(dateInput)
  if (!date) return { time: '', date: '' }

  const time = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })

  const dateString = date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return { time, date: dateString }
}

/**
 * Formats a pay period start and end date for display as separate fields.
 *
 * @remarks Start date renders with the long month and day; end date renders
 * with the short month, day, and year.
 *
 * @param startDateInput - Pay period start date.
 * @param endDateInput - Pay period end date.
 * @param locale - Optional BCP 47 locale tag passed to `toLocaleDateString`.
 * @returns Formatted `startDate` and `endDate` strings. Both fields are empty
 * strings when either input cannot be parsed.
 * @internal
 */
export const formatPayPeriod = (
  startDateInput?: string | Date | null,
  endDateInput?: string | Date | null,
  locale?: string,
): { startDate: string; endDate: string } => {
  const startDate = normalizeToDate(startDateInput)
  const endDate = normalizeToDate(endDateInput)

  if (!startDate || !endDate) {
    return { startDate: '', endDate: '' }
  }

  const startFormatted = startDate.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
  })

  const endFormatted = endDate.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return { startDate: startFormatted, endDate: endFormatted }
}

/**
 * Formats a pay period as a single en-dash–separated range string.
 *
 * @param startDateInput - Pay period start date.
 * @param endDateInput - Pay period end date.
 * @param locale - Optional BCP 47 locale tag passed to `toLocaleDateString`.
 * @param options - When `useShortMonth` is true, both ends use short month names.
 * Otherwise the start uses the long month name and the end uses short.
 * @returns The formatted range (e.g. `January 1–Jan 15, 2025`), or an empty
 * string when either input cannot be parsed.
 * @internal
 */
export const formatPayPeriodRange = (
  startDateInput?: string | Date | null,
  endDateInput?: string | Date | null,
  locale?: string,
  options?: { useShortMonth?: boolean },
): string => {
  const startDate = normalizeToDate(startDateInput)
  const endDate = normalizeToDate(endDateInput)

  if (!startDate || !endDate) return ''

  const monthFormat = options?.useShortMonth ? 'short' : 'long'

  const startFormatted = startDate.toLocaleDateString(locale, {
    month: monthFormat,
    day: 'numeric',
  })

  const endFormatted = endDate.toLocaleDateString(locale, {
    month: monthFormat,
    day: 'numeric',
    year: 'numeric',
  })

  return `${startFormatted}–${endFormatted}`
}

/**
 * Formats a `Date` as a `YYYY-MM-DD` string using the local year, month, and day.
 *
 * @param date - The date to format.
 * @returns A zero-padded `YYYY-MM-DD` string, or `null` when the input is an invalid date.
 * @internal
 */
export const formatDateToStringDate = (date: Date): string | null => {
  if (isNaN(date.getTime())) {
    return null
  }
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts any parseable date string to a `YYYY-MM-DD` ISO string using local time.
 *
 * @remarks Reads the local year, month, and day so the calendar date is
 * preserved regardless of the runtime timezone. Safe for dates parsed from
 * locale-format strings (e.g. `4/16/1998`) or ISO strings, both of which land
 * at local midnight when normalized.
 *
 * @param value - The date string to convert.
 * @returns A `YYYY-MM-DD` string, or `''` for nullish, empty, or unparseable input.
 * @internal
 */
export const normalizeToISOString = (value?: string | null): string => {
  if (!value) return ''
  const date = normalizeToDate(value)
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Normalizes a `Date` to local midnight, stripping any time-of-day component.
 *
 * @param date - The date to normalize, or `null`.
 * @returns A new `Date` at local midnight, or `null` when the input is missing or invalid.
 * @internal
 */
export const normalizeDateToLocal = (date: Date | null): Date | null => {
  if (!date || isNaN(date.getTime())) {
    return null
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/**
 * Number of milliseconds in one hour.
 *
 * @internal
 */
export const MS_PER_HOUR = 1000 * 60 * 60
const MS_PER_DAY = MS_PER_HOUR * 24

/**
 * Returns the number of hours from now until a deadline.
 *
 * @param deadline - Target date in the future (or past, for negative results).
 * @returns Hours until `deadline` (fractional, negative if `deadline` is in
 * the past), or `null` when the input cannot be parsed.
 * @internal
 */
export const getHoursUntil = (deadline?: Date | string | null): number | null => {
  const deadlineDate = normalizeToDate(deadline)
  if (!deadlineDate) return null

  const now = new Date()
  const timeDiffMs = deadlineDate.getTime() - now.getTime()
  return timeDiffMs / MS_PER_HOUR
}

/**
 * Returns the number of days from now until a deadline.
 *
 * @param deadline - Target date in the future (or past, for negative results).
 * @returns Days until `deadline` (fractional, negative if `deadline` is in
 * the past), or `null` when the input cannot be parsed.
 * @internal
 */
export const getDaysUntil = (deadline?: Date | string | null): number | null => {
  const deadlineDate = normalizeToDate(deadline)
  if (!deadlineDate) return null

  const now = new Date()
  const timeDiffMs = deadlineDate.getTime() - now.getTime()
  return timeDiffMs / MS_PER_DAY
}

/**
 * Returns whether a date falls on Saturday or Sunday.
 *
 * @param date - The date to test.
 * @returns `true` if `date` is a weekend day.
 * @internal
 */
const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Returns a new `Date` offset from the input by a given number of days.
 *
 * @param date - The base date. Not mutated.
 * @param days - Number of days to add (negative values subtract).
 * @returns A new `Date` shifted by `days`.
 * @internal
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Returns a new `Date` offset by a given number of business days (Monday–Friday).
 *
 * @remarks Skips Saturdays and Sundays when counting. The result is normalized
 * to local midnight. Does not account for holidays.
 *
 * @param startDate - The base date. Not mutated.
 * @param businessDays - Number of business days to add.
 * @returns A new `Date` shifted forward by `businessDays` weekdays.
 * @internal
 */
export const addBusinessDays = (startDate: Date, businessDays: number): Date => {
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

/**
 * Formats numeric month and day as a zero-padded `MM-DD` string.
 *
 * @param month - Month number, 1–12.
 * @param day - Day-of-month number, 1–31.
 * @returns A `MM-DD` string, or `undefined` when either argument is missing.
 * @internal
 */
export function formatMonthDay(month?: number, day?: number): string | undefined {
  if (month == null || day == null) return undefined
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Returns the number of days in a given month (1-indexed).
 *
 * @remarks Uses a non-leap year, so February always returns 28.
 *
 * @param month - Month number, 1–12.
 * @returns The number of days in that month.
 * @internal
 */
export function getDaysInMonth(month: number): number {
  return new Date(2023, month, 0).getDate()
}
