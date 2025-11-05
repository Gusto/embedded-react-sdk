/**
 * Normalizes any date input (string, Date, or undefined) to a Date object.
 * Handles YYYY-MM-DD strings by parsing them in local timezone to avoid timezone issues.
 * Also handles ISO timestamp strings for compatibility.
 * Returns null for invalid inputs.
 */
const normalizeToDate = (dateInput?: string | Date | null): Date | null => {
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

export const formatDateShortWithWeekday = createDateFormatter({
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

export const formatDateShortWithWeekdayAndYear = createDateFormatter({
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const formatDateShort = createDateFormatter({
  month: 'short',
  day: 'numeric',
})

export const formatDateShortWithYear = createDateFormatter({
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export const formatDateLong = createDateFormatter({
  month: 'long',
  day: 'numeric',
})

export const formatDateLongWithYear = createDateFormatter({
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

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

export const formatDateToStringDate = (date: Date): string | null => {
  if (isNaN(date.getTime())) {
    return null
  }
  return date.toISOString().split('T')[0] || null
}

/**
 * Normalizes Date to local midnight, handling timezone issues from any adapter.
 */
export const normalizeDateToLocal = (date: Date | null): Date | null => {
  if (!date || isNaN(date.getTime())) {
    return null
  }

  const isoString = date.toISOString()
  const [datePart] = isoString.split('T')
  if (!datePart) return null

  const parts = datePart.split('-')
  if (parts.length !== 3) return null
  const numbers = parts.map(Number)
  const year = numbers[0]!
  const month = numbers[1]!
  const day = numbers[2]!
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  return new Date(year, month - 1, day)
}
