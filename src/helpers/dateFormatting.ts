export const formatDateNamedWeekdayShortPlusDate = (date?: string) => {
  if (!date) return ''
  const parsedDate = parseDateStringToLocal(date)
  if (!parsedDate) return ''
  return parsedDate.toLocaleDateString('en-US', {
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
 * Parses a YYYY-MM-DD date string into a Date object in the local timezone.
 * This avoids timezone offset issues that occur when using `new Date(dateString)`.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone, or null if invalid
 *
 * @example
 * // Instead of: new Date('2023-12-25') // Creates UTC midnight, may shift due to timezone
 * // Use: parseDateStringToLocal('2023-12-25') // Creates local date correctly
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
  const year = numbers[0]!
  const month = numbers[1]!
  const day = numbers[2]!

  // Validate the parsed values
  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  // Create Date object in local timezone by passing components directly
  // Note: month is 0-indexed in Date constructor
  return new Date(year, month - 1, day)
}
