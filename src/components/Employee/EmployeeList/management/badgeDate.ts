import { formatDateLong, formatDateLongWithYear } from '@/helpers/dateFormatting'

/**
 * Formats a status-badge date, omitting the year when it matches the current
 * year and including it otherwise.
 *
 * @internal
 */
export function formatBadgeDate(date: Date): string {
  const isSameYear = date.getFullYear() === new Date().getFullYear()
  return isSameYear ? formatDateLong(date) : formatDateLongWithYear(date)
}

/**
 * Midnight-today as an epoch timestamp, for comparing date-only values against
 * "today or later" without a time-of-day component skewing the result.
 *
 * @internal
 */
export function startOfToday(): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.getTime()
}
