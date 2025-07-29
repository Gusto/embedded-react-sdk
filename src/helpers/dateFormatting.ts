export const formatDateNamedWeekdayShortPlusDate = (date?: string, locale?: string) => {
  if (!date) return ''
  const parsedDate = parseDateStringToLocal(date)
  if (!parsedDate) return ''
  return parsedDate.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateToStringDate = (date: Date) => {
  // Handle invalid dates gracefully
  if (isNaN(date.getTime())) {
    return null
  }
  return date.toISOString().split('T')[0]
}

/**
 * Parses YYYY-MM-DD string to local Date, avoiding timezone issues from `new Date(dateString)`.
 */
export const parseDateStringToLocal = (dateString: string): Date | null => {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null
  }

  const parts = dateString.split('-')
  if (parts.length !== 3) {
    return null
  }

  const numbers = parts.map(Number)
  const year = numbers[0]
  const month = numbers[1]
  const day = numbers[2]
  if (year === undefined || month === undefined || day === undefined) {
    return null
  }

  // Validate date components
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  // Create Date in local timezone (month is 0-indexed)
  return new Date(year, month - 1, day)
}

/**
 * Normalizes Date to local midnight, handling timezone issues from any adapter.
 */
export const normalizeDateToLocal = (date: Date | null): Date | null => {
  if (!date || isNaN(date.getTime())) {
    return null
  }

  // Use ISO string to get the intended date, then parse components
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
