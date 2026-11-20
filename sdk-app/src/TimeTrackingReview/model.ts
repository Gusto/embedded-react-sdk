export type ShiftStatus = 'pending' | 'approved' | 'rejected'

export interface ApiBreak {
  uuid: string
  break_rule_uuid: string | null
  start_time: string
  end_time: string | null
}

export interface ApiShift {
  uuid: string
  version: string
  status: ShiftStatus
  time_zone: string
  entity_type: 'Employee' | 'Contractor'
  entity_uuid: string
  job_uuid: string | null
  shift_started_at: string
  shift_ended_at: string | null
  synced_to_payroll_at: string | null
  created_at: string
  updated_at: string
  entries: Array<{ uuid: string; hours_worked: string; pay_classification: string }>
  breaks: ApiBreak[]
}

export interface ApiPaySchedule {
  uuid: string
  name: string | null
  custom_name: string | null
  frequency: string
  active: boolean
  workweek_start_day: string | null
}

export interface ApiPayPeriod {
  start_date: string
  end_date: string
  pay_schedule_uuid: string
  payroll: {
    payroll_uuid: string
    check_date: string
    processed: boolean
    payroll_deadline: string
    payroll_type: string
  } | null
}

export interface ApiAssignments {
  type: string
  default_pay_schedule_uuid: string | null
  hourly_pay_schedule_uuid: string | null
  salaried_pay_schedule_uuid: string | null
  employees?: Array<{ employee_uuid: string; pay_schedule_uuid: string | null }>
  departments?: Array<{ department_uuid: string; pay_schedule_uuid: string | null }>
}

export interface ApiEmployee {
  uuid: string
  first_name: string
  preferred_first_name: string | null
  last_name: string
  department_uuid: string | null
  terminated: boolean
  jobs: Array<{
    uuid: string
    title: string | null
    primary: boolean
    current_compensation_uuid: string
    compensations: Array<{ uuid: string; flsa_status: string; payment_unit: string }>
  }>
}

export interface ApiBreakRule {
  uuid: string
  break_type: 'meal' | 'rest'
  break_duration_in_minutes: number
  for_hours_worked_in_minutes: number
  minimum_time_required_in_minutes: number | null
  is_paid: boolean
}

export interface ApiBreakPolicy {
  uuid: string
  name: string
  version: string
  jurisdiction: string | null
  pay_premium: boolean
  rules: ApiBreakRule[]
  assigned_employees: Array<{ uuid: string }>
}

export interface ApiOvertimePolicy {
  uuid: string
  name: string
  version: string
  weekly_overtime_hours_threshold: number | null
  daily_overtime_hours_threshold: number | null
  double_overtime_hours_threshold: number | null
  work_week_consecutive_days_threshold: number | null
  assigned_employees: Array<{ uuid: string }>
}

export function employeeName(employee: ApiEmployee) {
  return `${employee.preferred_first_name || employee.first_name} ${employee.last_name}`
}

export function primaryJob(employee: ApiEmployee) {
  return employee.jobs.find(job => job.primary) ?? employee.jobs[0]
}

export function flsaStatus(employee: ApiEmployee): string {
  const job = primaryJob(employee)
  if (!job) return 'Unknown'
  const current =
    job.compensations.find(c => c.uuid === job.current_compensation_uuid) ?? job.compensations[0]
  return current?.flsa_status ?? 'Unknown'
}

export type SyncEffect = 'all' | 'overtime-only' | 'unclear'

/** From the appendix: hourly nonexempt hours sync; salaried nonexempt regular hours are filtered out. */
export function syncEffect(flsa: string): SyncEffect {
  if (flsa === 'Nonexempt' || flsa === 'Commission Only Nonexempt') return 'all'
  if (flsa === 'Salaried Nonexempt') return 'overtime-only'
  return 'unclear'
}

const HOURLY_FLSA_STATUSES = new Set(['Nonexempt', 'Commission Only Nonexempt'])

/** Same resolution order as the Pay Period Shifts explorer. Current assignments only: no history. */
export function resolvePaySchedule(employee: ApiEmployee, config: ApiAssignments): string | null {
  const override = config.employees?.find(e => e.employee_uuid === employee.uuid)?.pay_schedule_uuid
  if (override) return override
  switch (config.type) {
    case 'single':
      return config.default_pay_schedule_uuid
    case 'hourly_salaried':
      return HOURLY_FLSA_STATUSES.has(flsaStatus(employee))
        ? config.hourly_pay_schedule_uuid
        : config.salaried_pay_schedule_uuid
    case 'by_department': {
      const department = config.departments?.find(
        d => d.department_uuid === employee.department_uuid,
      )
      return department?.pay_schedule_uuid ?? config.default_pay_schedule_uuid
    }
    default:
      return config.default_pay_schedule_uuid
  }
}

export function scheduleLabel(schedule: ApiPaySchedule) {
  return schedule.custom_name || schedule.name || schedule.frequency
}

export function periodKey(period: Pick<ApiPayPeriod, 'start_date' | 'end_date'>) {
  return `${period.start_date}_${period.end_date}`
}

export function addDays(date: string, days: number) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d! + days)).toISOString().slice(0, 10)
}

export function overlaps(a: ApiPayPeriod, b: ApiPayPeriod) {
  return a.start_date <= b.end_date && b.start_date <= a.end_date
}

const partsCache = new Map<string, Intl.DateTimeFormat>()
function partsFormatter(timeZone: string) {
  let formatter = partsCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    partsCache.set(timeZone, formatter)
  }
  return formatter
}

export function zonedParts(iso: string, timeZone: string) {
  const parts = Object.fromEntries(
    partsFormatter(timeZone)
      .formatToParts(new Date(iso))
      .map(part => [part.type, part.value]),
  )
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  }
}

export function zonedToUtcIso(date: string, time: string, timeZone: string) {
  const guess = Date.parse(`${date}T${time}:00Z`)
  const seen = zonedParts(new Date(guess).toISOString(), timeZone)
  const offset = Date.parse(`${seen.date}T${seen.time}:00Z`) - guess
  return new Date(guess - offset).toISOString().replace('.000Z', 'Z')
}

export function localStartDate(shift: ApiShift) {
  return zonedParts(shift.shift_started_at, shift.time_zone).date
}

export function formatTime(iso: string, timeZone: string) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone, hour: 'numeric', minute: '2-digit' })
}

export function formatDay(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatShortDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatPeriod(period: Pick<ApiPayPeriod, 'start_date' | 'end_date'>) {
  const sameYear = period.start_date.slice(0, 4) === period.end_date.slice(0, 4)
  const end = new Date(`${period.end_date}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const start = sameYear
    ? formatShortDate(period.start_date)
    : new Date(`${period.start_date}T12:00:00Z`).toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
  return `${start} – ${end}`
}

export function workedHours(shift: ApiShift) {
  return shift.entries.reduce((sum, entry) => sum + Number(entry.hours_worked || 0), 0)
}

export function minutesBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 60000)
}

export interface BreakIssue {
  rule: ApiBreakRule
  kind: 'missing' | 'short'
}

export function breakIssues(shift: ApiShift, policy: ApiBreakPolicy | undefined): BreakIssue[] {
  if (!policy || !shift.shift_ended_at) return []
  const shiftMinutes = minutesBetween(shift.shift_started_at, shift.shift_ended_at)
  return policy.rules.flatMap(rule => {
    const threshold = rule.minimum_time_required_in_minutes ?? rule.for_hours_worked_in_minutes
    const required =
      shiftMinutes < threshold
        ? 0
        : Math.max(1, Math.floor(shiftMinutes / rule.for_hours_worked_in_minutes))
    const taken = shift.breaks.filter(b => b.break_rule_uuid === rule.uuid)
    return Array.from({ length: required }, (_, index): BreakIssue | null => {
      const match = taken[index]
      if (!match) return { rule, kind: 'missing' }
      if (
        match.end_time &&
        minutesBetween(match.start_time, match.end_time) < rule.break_duration_in_minutes
      )
        return { rule, kind: 'short' }
      return null
    }).filter(issue => issue !== null)
  })
}

export function breakIssueLabel(issues: BreakIssue[]) {
  const counts = new Map<string, number>()
  for (const issue of issues) {
    const key = `${issue.kind === 'missing' ? 'Missed' : 'Short'} ${issue.rule.break_type}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts].map(([key, n]) => (n > 1 ? `${key} ×${n}` : key)).join(', ')
}

export function crossesMidnight(shift: ApiShift) {
  if (!shift.shift_ended_at) return false
  return zonedParts(shift.shift_ended_at, shift.time_zone).date !== localStartDate(shift)
}

export type ReviewState = 'open' | 'pending' | 'rejected' | 'sent' | 'changed' | 'unsent'

export function reviewState(shift: ApiShift): ReviewState {
  if (!shift.shift_ended_at) return 'open'
  if (shift.status === 'pending') return 'pending'
  if (shift.status === 'rejected') return 'rejected'
  if (!shift.synced_to_payroll_at) return 'unsent'
  return Date.parse(shift.updated_at) > Date.parse(shift.synced_to_payroll_at) ? 'changed' : 'sent'
}

export const REVIEW_STATE_LABEL: Record<ReviewState, string> = {
  open: 'Still clocked in',
  pending: 'Pending',
  rejected: 'Rejected',
  unsent: 'Approved · not sent',
  sent: 'Approved · sent',
  changed: 'Approved · changed since send?',
}

export function willSync(shift: ApiShift) {
  return shift.status === 'approved' && shift.shift_ended_at !== null
}

export function formatHours(hours: number) {
  return hours.toFixed(2)
}

export const EFFECT_LABEL: Record<SyncEffect, string> = {
  all: 'All hours sync',
  'overtime-only': 'Only overtime syncs',
  unclear: 'Unclear if synced',
}

export interface Person {
  employee: ApiEmployee
  name: string
  title: string
  flsa: string
  effect: SyncEffect
  scheduleUuid: string | null
  breakPolicy: ApiBreakPolicy | undefined
  overtimePolicy: ApiOvertimePolicy | undefined
}

export interface Eligibility {
  eligible: boolean
  label: string
  reason: string | null
}

/** Mirrors the first prototype's adapter: nonexempt and salaried nonexempt are eligible. */
export function eligibility(employee: ApiEmployee): Eligibility {
  const job = primaryJob(employee)
  const compensation =
    job?.compensations.find(c => c.uuid === job.current_compensation_uuid) ?? job?.compensations[0]
  const hourly = compensation?.payment_unit === 'Hour'
  switch (compensation?.flsa_status) {
    case 'Nonexempt':
      return {
        eligible: true,
        label: hourly ? 'Hourly, overtime eligible' : 'Salaried, overtime eligible',
        reason: null,
      }
    case 'Salaried Nonexempt':
      return { eligible: true, label: 'Salaried, overtime eligible', reason: null }
    case 'Exempt':
      return { eligible: false, label: 'Salaried, exempt', reason: 'Exempt pay type' }
    case 'Owner':
      return { eligible: false, label: 'Owner', reason: 'Owner' }
    case 'Commission Only Exempt':
    case 'Commission Only Nonexempt':
      return { eligible: false, label: 'Commission only', reason: 'Commission-only pay type' }
    default:
      return { eligible: false, label: 'Not set up', reason: 'Missing job or compensation' }
  }
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function currentWorkweekStart(workweekStartDay: string, today: string) {
  const target = WEEKDAYS.indexOf(workweekStartDay)
  if (target < 0) return null
  const day = new Date(`${today}T12:00:00Z`).getUTCDay()
  return addDays(today, -((day - target + 7) % 7))
}

export function breakRuleLabel(rule: ApiBreakRule) {
  return `${rule.break_type === 'meal' ? 'Meal' : 'Rest'} · ${rule.break_duration_in_minutes} min · ${rule.is_paid ? 'paid' : 'unpaid'}`
}

export function hoursLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export interface OvertimeEstimate {
  regular: number
  overtime: number
  double: number
}

/** Client-side guess at the classification the API only does at sync time. Ignores the 7th-day rule. */
export function estimateOvertime(
  shifts: ApiShift[],
  policy: ApiOvertimePolicy | undefined,
  workweekStartDay: string | null,
): OvertimeEstimate | null {
  if (!policy) return null
  const byDay = new Map<string, number>()
  for (const shift of shifts) {
    if (!shift.shift_ended_at) continue
    const day = localStartDate(shift)
    byDay.set(day, (byDay.get(day) ?? 0) + workedHours(shift))
  }
  const daily = policy.daily_overtime_hours_threshold
  const double = policy.double_overtime_hours_threshold
  const weeklyRegular = new Map<string, number>()
  const total: OvertimeEstimate = { regular: 0, overtime: 0, double: 0 }
  for (const [day, hours] of byDay) {
    const dt = double ? Math.max(0, hours - double) : 0
    const ot = daily ? Math.max(0, Math.min(hours, double ?? Infinity) - daily) : 0
    total.double += dt
    total.overtime += ot
    const week = (workweekStartDay && currentWorkweekStart(workweekStartDay, day)) || day
    weeklyRegular.set(week, (weeklyRegular.get(week) ?? 0) + hours - ot - dt)
  }
  const weekly = policy.weekly_overtime_hours_threshold
  for (const regular of weeklyRegular.values()) {
    const over = weekly ? Math.max(0, regular - weekly) : 0
    total.overtime += over
    total.regular += regular - over
  }
  return total
}
