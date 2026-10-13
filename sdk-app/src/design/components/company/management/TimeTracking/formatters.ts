import type {
  BreakRule,
  HoursBreakdown,
  OvertimePolicy,
  StatusCounts,
  TimesheetStatus,
} from './types'
import { normalizeToDate } from '@/helpers/dateFormatting'

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
  return `${hours.toFixed(2)} hrs`
}

export function formatHoursOrDash(hours: number): string {
  return hours > 0 ? formatHours(hours) : '—'
}

const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const dateWithYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
})

export function formatDate(dateOnly: string | null): string {
  const date = normalizeToDate(dateOnly)
  return date ? dateWithYearFormatter.format(date) : '—'
}

export function formatDayWithWeekday(dateOnly: string): string {
  const date = normalizeToDate(dateOnly)
  return date ? weekdayFormatter.format(date) : dateOnly
}

export function formatPeriodRange(startDate: string, endDate: string): string {
  const start = normalizeToDate(startDate)
  const end = normalizeToDate(endDate)
  if (!start || !end) return `${startDate} – ${endDate}`
  return `${dateFormatter.format(start)} – ${dateWithYearFormatter.format(end)}`
}

export function formatTimeInZone(iso: string | null, timeZone: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso))
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

export const STATUS_LABELS: Record<TimesheetStatus, string> = {
  pending: 'Needs review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export const STATUS_BADGE: Record<TimesheetStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

export function summarizeOvertimePolicy(policy: OvertimePolicy): string {
  const parts = [`Over ${policy.weeklyThreshold} hrs/week`]
  if (policy.dailyThreshold !== null) parts.push(`over ${policy.dailyThreshold} hrs/day`)
  if (policy.consecutiveDaysThreshold !== null) {
    parts.push(`day ${policy.consecutiveDaysThreshold} in a row`)
  }
  return parts.join(', ')
}

export function summarizeDoubleOvertime(policy: OvertimePolicy): string {
  return policy.doubleOvertimeThreshold !== null
    ? `Over ${policy.doubleOvertimeThreshold} hrs/day`
    : 'Not set'
}

export function summarizeBreakRule(rule: BreakRule): string {
  const kind = rule.breakType === 'meal' ? 'Meal' : 'Rest'
  const paid = rule.isPaid ? 'paid' : 'unpaid'
  return `${kind}: ${formatMinutes(rule.durationMinutes)} ${paid} after ${formatMinutes(rule.afterHoursWorkedMinutes)}`
}

export function formatEmployeeCount(count: number): string {
  return `${count} ${count === 1 ? 'employee' : 'employees'}`
}
