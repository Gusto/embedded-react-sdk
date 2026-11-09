import type {
  BreakRule,
  HoursBreakdown,
  OvertimePolicy,
  PayPeriodSummary,
  StatusCounts,
} from './types'
import {
  formatDateLong,
  formatDateShortWithWeekday,
  formatDateShortWithYear,
  formatDateWithTime,
  formatPayPeriodRange,
} from '@/helpers/dateFormatting'

export const EMPTY_HOURS: HoursBreakdown = {
  regular: 0,
  overtime: 0,
  doubleOvertime: 0,
  unclassified: 0,
  total: 0,
}

export const EMPTY_STATUS_COUNTS: StatusCounts = { pending: 0, approved: 0, rejected: 0 }

export function sumHours(items: HoursBreakdown[]): HoursBreakdown {
  return items.reduce<HoursBreakdown>(
    (acc, hours) => ({
      regular: acc.regular + hours.regular,
      overtime: acc.overtime + hours.overtime,
      doubleOvertime: acc.doubleOvertime + hours.doubleOvertime,
      unclassified: acc.unclassified + hours.unclassified,
      total: acc.total + hours.total,
    }),
    EMPTY_HOURS,
  )
}

export function formatHours(hours: number): string {
  return hours.toFixed(2)
}

export function formatHoursWithUnit(hours: number): string {
  return `${hours.toFixed(2)} hrs`
}

export function formatDate(dateOnly: string | null): string {
  return formatDateShortWithYear(dateOnly) || '—'
}

export function formatLongDate(dateOnly: string | null): string {
  return formatDateLong(dateOnly) || '—'
}

export function formatDayWithWeekday(dateOnly: string): string {
  return formatDateShortWithWeekday(dateOnly) || dateOnly
}

export function formatPeriodRange(startDate: string, endDate: string): string {
  return formatPayPeriodRange(startDate, endDate, undefined, { useShortMonth: true })
}

export function formatPeriodOption(period: PayPeriodSummary): string {
  return `${formatPeriodRange(period.startDate, period.endDate)} – ${period.payScheduleName}`
}

export function formatSyncedAt(iso: string): string {
  const { date, time } = formatDateWithTime(iso)
  return `${date} at ${time}`
}

/** Matches Gusto's lowercase "9:00am" shift times. */
export function formatTimeInZone(iso: string | null, timeZone: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone })
    .format(new Date(iso))
    .replace(' ', '')
    .toLowerCase()
}

export function formatTimeZoneAbbreviation(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' }).formatToParts(
    new Date(iso),
  )
  return parts.find(part => part.type === 'timeZoneName')?.value ?? timeZone
}

export function durationMinutes(startIso: string, endIso: string | null): number {
  if (!endIso) return 0
  return Math.max(0, Math.round((Date.parse(endIso) - Date.parse(startIso)) / 60000))
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`
}

export function breakTypeLabel(breakType: 'meal' | 'rest' | null, isPaid: boolean | null): string {
  const kind = breakType === 'meal' ? 'Meal break' : breakType === 'rest' ? 'Rest break' : 'Break'
  if (isPaid === null) return kind
  return `${kind} (${isPaid ? 'paid' : 'unpaid'})`
}

export function summarizeWeeklyOvertime(policy: OvertimePolicy): string {
  return `More than ${policy.weeklyThreshold} hours/week`
}

export function summarizeDailyOvertime(policy: OvertimePolicy): string {
  return policy.dailyThreshold !== null ? `More than ${policy.dailyThreshold} hours/day` : 'N/A'
}

export function summarizeDoubleOvertime(policy: OvertimePolicy): string {
  return policy.doubleOvertimeThreshold !== null
    ? `More than ${policy.doubleOvertimeThreshold} hours/day`
    : 'N/A'
}

export function summarizeConsecutiveDays(policy: OvertimePolicy): string {
  return policy.consecutiveDaysThreshold !== null
    ? `Day ${policy.consecutiveDaysThreshold} in a row`
    : 'N/A'
}

export function summarizeBreakRule(rule: BreakRule): string {
  const kind = rule.breakType === 'meal' ? 'meal' : 'rest'
  const paid = rule.isPaid ? 'paid' : 'unpaid'
  return `${formatMinutes(rule.durationMinutes)} ${paid} ${kind} break every ${formatMinutes(rule.afterHoursWorkedMinutes)}`
}

/** Mirrors Gusto's break popover copy so the rule that applied is explained in place. */
export function describeBreakRequirement(rule: BreakRule): string {
  const kind = rule.breakType === 'meal' ? 'meal' : 'rest'
  return `Assigned break policy requires a minimum ${rule.durationMinutes} minute ${kind} break for shifts that are at least ${formatMinutes(rule.afterHoursWorkedMinutes)}.`
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function formatEmployeeCount(count: number): string {
  return pluralize(count, 'employee')
}
