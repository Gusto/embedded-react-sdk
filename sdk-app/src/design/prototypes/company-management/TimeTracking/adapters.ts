import type {
  BreakPolicy,
  BreakRule,
  EmployeeJob,
  EmployeeTimesheetRow,
  HoursBreakdown,
  OvertimePolicy,
  PayPeriodPhase,
  PayPeriodSummary,
  Shift,
  StatusCounts,
  TimesheetDay,
  TimeTrackingPerson,
} from '../../../components/company/management/TimeTracking/types'
import {
  EMPTY_HOURS,
  EMPTY_STATUS_COUNTS,
  sumHours,
} from '../../../components/company/management/TimeTracking/formatters'
import {
  addDaysToDateString,
  resolveShiftTime,
  toZonedParts,
  zonedToUtcIso,
} from '../../../components/company/management/TimeTracking/timeZones'
import { shiftCompliance } from '../../../components/company/management/TimeTracking/compliance'
import {
  addMinutesToTime,
  ruleIdFromFormValue,
  type ShiftFormValues,
  type ShiftSubmitValues,
} from '../../../components/company/management/TimeTracking/shiftForm'
import type {
  ApiBreakPolicy,
  ApiBreakRule,
  ApiOvertimePolicy,
  ApiTimeSheet,
  ApiTimeSheetEntry,
  TimeSheetCreateBody,
  TimeSheetUpdateBody,
} from './timeTrackingApi'
import { FlsaStatus } from '@/shared/constants'

export interface TimeTrackingEmployee {
  uuid: string
  firstName: string
  lastName: string
  preferredFirstName?: string | null
  terminated?: boolean
  jobs?: Array<{
    uuid: string
    title: string | null
    primary?: boolean
    currentCompensationUuid?: string | null
    compensations?: Array<{ uuid: string; flsaStatus?: string; paymentUnit?: string }>
  }>
}

export interface TimeTrackingPayPeriod {
  startDate?: string
  endDate?: string
  payScheduleUuid?: string
  payroll?: { checkDate?: string; processed?: boolean }
}

export function employeeName(employee: TimeTrackingEmployee): string {
  return `${employee.preferredFirstName || employee.firstName} ${employee.lastName}`.trim()
}

function primaryJob(employee: TimeTrackingEmployee) {
  return employee.jobs?.find(job => job.primary) ?? employee.jobs?.[0]
}

export function jobsOf(employee: TimeTrackingEmployee | undefined): EmployeeJob[] {
  return (employee?.jobs ?? []).map(job => ({ id: job.uuid, title: job.title ?? 'Untitled job' }))
}

export function primaryJobId(employee: TimeTrackingEmployee | undefined): string | null {
  return employee ? (primaryJob(employee)?.uuid ?? null) : null
}

function currentCompensation(employee: TimeTrackingEmployee) {
  const job = primaryJob(employee)
  return (
    job?.compensations?.find(c => c.uuid === job.currentCompensationUuid) ?? job?.compensations?.[0]
  )
}

function compensationDetails(employee: TimeTrackingEmployee): {
  employmentType: string
  ineligibleReason: string | null
} {
  const compensation = currentCompensation(employee)
  const isHourly = compensation?.paymentUnit === 'Hour'
  switch (compensation?.flsaStatus) {
    case FlsaStatus.NONEXEMPT:
      return {
        employmentType: isHourly ? 'Hourly, overtime eligible' : 'Salaried, overtime eligible',
        ineligibleReason: null,
      }
    case FlsaStatus.SALARIED_NONEXEMPT:
      return { employmentType: 'Salaried, overtime eligible', ineligibleReason: null }
    case FlsaStatus.EXEMPT:
      return { employmentType: 'Salaried, exempt', ineligibleReason: 'Ineligible pay type' }
    case FlsaStatus.OWNER:
      return { employmentType: 'Owner', ineligibleReason: 'Ineligible pay type' }
    case FlsaStatus.COMMISSION_ONLY_EXEMPT:
    case FlsaStatus.COMMISSION_ONLY_NONEXEMPT:
      return { employmentType: 'Commission only', ineligibleReason: 'Ineligible pay type' }
    default:
      return { employmentType: 'Not set up', ineligibleReason: 'Missing job or compensation' }
  }
}

const CLASSIFICATION_KEY = {
  Regular: 'regular',
  Overtime: 'overtime',
  'Double overtime': 'doubleOvertime',
  Unclassified: 'unclassified',
} as const

export function hoursFromEntries(entries: ApiTimeSheetEntry[]): HoursBreakdown {
  return entries.reduce<HoursBreakdown>((acc, entry) => {
    const hours = Number(entry.hours_worked) || 0
    const key = CLASSIFICATION_KEY[entry.pay_classification]
    return { ...acc, [key]: acc[key] + hours, total: acc.total + hours }
  }, EMPTY_HOURS)
}

function toBreakRule(rule: ApiBreakRule): BreakRule {
  return {
    id: rule.uuid,
    breakType: rule.break_type,
    durationMinutes: rule.break_duration_in_minutes,
    afterHoursWorkedMinutes: rule.for_hours_worked_in_minutes,
    isPaid: rule.is_paid,
  }
}

export function shiftDate(sheet: ApiTimeSheet): string {
  return toZonedParts(sheet.shift_started_at, sheet.time_zone).date
}

export function toShift(sheet: ApiTimeSheet): Shift {
  const policy = sheet.effective_break_policy ?? null
  const rules = policy?.rules.map(toBreakRule) ?? []
  return {
    id: sheet.uuid,
    version: sheet.version,
    date: shiftDate(sheet),
    timeZone: sheet.time_zone,
    startTime: sheet.shift_started_at,
    endTime: sheet.shift_ended_at,
    jobId: sheet.job_uuid,
    breaks: (sheet.breaks ?? []).map(shiftBreak => {
      const rule = rules.find(r => r.id === shiftBreak.break_rule_uuid)
      return {
        id: shiftBreak.uuid,
        startTime: shiftBreak.start_time,
        endTime: shiftBreak.end_time,
        ruleId: shiftBreak.break_rule_uuid,
        breakType: rule?.breakType ?? null,
        isPaid: rule?.isPaid ?? null,
      }
    }),
    entries: sheet.entries.map(entry => ({
      id: entry.uuid,
      classification: entry.pay_classification,
      hours: Number(entry.hours_worked) || 0,
    })),
    hours: hoursFromEntries(sheet.entries),
    status: sheet.status,
    syncedToPayrollAt: sheet.synced_to_payroll_at,
    breakPolicy: policy
      ? {
          name: policy.name,
          jurisdiction: policy.jurisdiction,
          payPremium: policy.pay_premium,
          rules,
        }
      : null,
  }
}

export function toOvertimePolicy(policy: ApiOvertimePolicy): OvertimePolicy {
  return {
    id: policy.uuid,
    version: policy.version,
    name: policy.name,
    weeklyThreshold: policy.weekly_overtime_hours_threshold,
    dailyThreshold: policy.daily_overtime_hours_threshold,
    doubleOvertimeThreshold: policy.double_overtime_hours_threshold,
    consecutiveDaysThreshold: policy.work_week_consecutive_days_threshold,
    employeeUuids: policy.assigned_employees.map(e => e.uuid),
  }
}

export function toBreakPolicy(policy: ApiBreakPolicy): BreakPolicy {
  return {
    id: policy.uuid,
    version: policy.version,
    name: policy.name,
    jurisdiction: policy.jurisdiction,
    payPremium: policy.pay_premium,
    rules: policy.rules.map(toBreakRule),
    employeeUuids: policy.assigned_employees.map(e => e.uuid),
  }
}

export function payPeriodId(period: TimeTrackingPayPeriod): string {
  return `${period.payScheduleUuid ?? ''}:${period.startDate ?? ''}`
}

function countStatuses(sheets: ApiTimeSheet[]): StatusCounts {
  return sheets.reduce<StatusCounts>(
    (acc, sheet) => ({ ...acc, [sheet.status]: acc[sheet.status] + 1 }),
    EMPTY_STATUS_COUNTS,
  )
}

function latestSync(sheets: ApiTimeSheet[]): string | null {
  return sheets.reduce<string | null>(
    (latest, sheet) =>
      sheet.synced_to_payroll_at && (!latest || sheet.synced_to_payroll_at > latest)
        ? sheet.synced_to_payroll_at
        : latest,
    null,
  )
}

export function sheetsInPeriod(
  sheets: ApiTimeSheet[],
  period: { startDate: string; endDate: string },
): ApiTimeSheet[] {
  return sheets.filter(sheet => {
    const date = shiftDate(sheet)
    return date >= period.startDate && date <= period.endDate
  })
}

function phaseFor(period: TimeTrackingPayPeriod, today: string): PayPeriodPhase {
  if (period.payroll?.processed) return 'payrollRun'
  return period.endDate! >= today ? 'active' : 'readyToReview'
}

const PHASE_ORDER: Record<PayPeriodPhase, number> = { readyToReview: 0, active: 1, payrollRun: 2 }

/** Ordered like Gusto's dropdown: ready to review, then active, then payroll already run. */
export function toPayPeriodSummaries(
  periods: TimeTrackingPayPeriod[],
  sheets: ApiTimeSheet[],
  today: string,
  scheduleNames: Record<string, string>,
): PayPeriodSummary[] {
  return periods
    .filter(period => period.startDate && period.endDate && period.startDate <= today)
    .map(period => {
      const startDate = period.startDate!
      const endDate = period.endDate!
      const periodSheets = sheetsInPeriod(sheets, { startDate, endDate })
      const isAllApproved = periodSheets.every(sheet => sheet.status === 'approved')
      return {
        id: payPeriodId(period),
        startDate,
        endDate,
        checkDate: period.payroll?.checkDate ?? null,
        payScheduleName: scheduleNames[period.payScheduleUuid ?? ''] ?? 'Pay schedule',
        phase: phaseFor(period, today),
        isPayrollProcessed: period.payroll?.processed ?? false,
        employeeCount: new Set(periodSheets.map(sheet => sheet.entity_uuid)).size,
        timesheetCount: periodSheets.length,
        statusCounts: countStatuses(periodSheets),
        isAllApproved,
        hours: hoursFromEntries(periodSheets.flatMap(sheet => sheet.entries)),
        lastSyncedAt: latestSync(periodSheets),
      }
    })
    .sort(
      (a, b) =>
        PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase] || b.startDate.localeCompare(a.startDate),
    )
}

function groupByEmployee(sheets: ApiTimeSheet[]): Map<string, ApiTimeSheet[]> {
  const grouped = new Map<string, ApiTimeSheet[]>()
  for (const sheet of sheets) {
    grouped.set(sheet.entity_uuid, [...(grouped.get(sheet.entity_uuid) ?? []), sheet])
  }
  return grouped
}

export function isSheetApprovable(sheet: ApiTimeSheet): boolean {
  return !sheet.synced_to_payroll_at
}

/** People on time tracking are those assigned to an overtime policy, plus anyone with hours. */
export function toEmployeeRows(
  periodSheets: ApiTimeSheet[],
  employees: TimeTrackingEmployee[],
  overtimePolicies: OvertimePolicy[],
  today: string,
): EmployeeTimesheetRow[] {
  const sheetsByEmployee = groupByEmployee(periodSheets)
  const employeesByUuid = new Map(employees.map(employee => [employee.uuid, employee]))
  const uuids = new Set([
    ...sheetsByEmployee.keys(),
    ...overtimePolicies.flatMap(policy => policy.employeeUuids),
  ])

  return [...uuids]
    .map(uuid => {
      const employee = employeesByUuid.get(uuid)
      const sheets = sheetsByEmployee.get(uuid) ?? []
      const statusCounts = countStatuses(sheets)
      return {
        employeeUuid: uuid,
        name: employee ? employeeName(employee) : 'Unknown employee',
        jobTitle: employee ? (primaryJob(employee)?.title ?? null) : null,
        isApproved: sheets.length > 0 && statusCounts.approved === sheets.length,
        hasHours: sheets.length > 0,
        isLocked: sheets.length > 0 && sheets.every(sheet => !isSheetApprovable(sheet)),
        statusCounts,
        hours: sumHours(sheets.map(sheet => hoursFromEntries(sheet.entries))),
        flags: [
          ...(sheets.some(sheet => sheet.shift_ended_at === null && shiftDate(sheet) < today)
            ? (['missedClockOut'] as const)
            : []),
          ...(sheets.some(sheet => {
            const { missingBreaks, shortenedBreaks } = shiftCompliance(toShift(sheet))
            return missingBreaks.length + shortenedBreaks.length > 0
          })
            ? (['breakViolation'] as const)
            : []),
        ],
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function toTimesheetDays(
  period: { startDate: string; endDate: string },
  shifts: Shift[],
  today: string,
  overtimePolicy: OvertimePolicy | null,
): TimesheetDay[] {
  const days: TimesheetDay[] = []
  for (let date = period.startDate; date <= period.endDate; date = addDaysToDateString(date, 1)) {
    const dayShifts = shifts
      .filter(shift => shift.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
    const hours = sumHours(dayShifts.map(shift => shift.hours))
    days.push({
      date,
      shifts: dayShifts,
      hours,
      isFuture: date > today,
      isPast: date < today,
      isLocked: dayShifts.length > 0 && dayShifts.every(shift => shift.syncedToPayrollAt !== null),
      isOverDailyThreshold:
        overtimePolicy?.dailyThreshold != null && hours.total > overtimePolicy.dailyThreshold,
    })
  }
  return days
}

export function toPeople(
  employees: TimeTrackingEmployee[],
  overtimePolicies: OvertimePolicy[],
  breakPolicies: BreakPolicy[],
  workStates: Record<string, string> = {},
): TimeTrackingPerson[] {
  return employees
    .filter(employee => !employee.terminated)
    .map(employee => {
      const details = compensationDetails(employee)
      return {
        uuid: employee.uuid,
        name: employeeName(employee),
        jobTitle: primaryJob(employee)?.title ?? null,
        employmentType: details.employmentType,
        workState: workStates[employee.uuid] ?? null,
        ineligibleReason: details.ineligibleReason,
        overtimePolicyId:
          overtimePolicies.find(policy => policy.employeeUuids.includes(employee.uuid))?.id ?? null,
        breakPolicyId:
          breakPolicies.find(policy => policy.employeeUuids.includes(employee.uuid))?.id ?? null,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function currentWorkweekStart(
  today: string,
  workweekStartDay: string | null,
): string | null {
  const startIndex = workweekStartDay ? WEEKDAYS.indexOf(workweekStartDay) : -1
  if (startIndex < 0) return null
  const [year, month, day] = today.split('-').map(Number)
  const todayIndex = new Date(Date.UTC(year!, month! - 1, day!)).getUTCDay()
  return addDaysToDateString(today, -((todayIndex - startIndex + 7) % 7))
}

/** Pads the window by a day on each side so shifts in any US time zone are fetched. */
export function timeSheetRangeFor(periods: Array<{ startDate: string; endDate: string }>) {
  if (periods.length === 0) return null
  const start = periods.reduce(
    (min, p) => (p.startDate < min ? p.startDate : min),
    periods[0]!.startDate,
  )
  const end = periods.reduce((max, p) => (p.endDate > max ? p.endDate : max), periods[0]!.endDate)
  return {
    shiftStartedAfter: `${addDaysToDateString(start, -1)}T00:00:00Z`,
    shiftStartedBefore: `${addDaysToDateString(end, 1)}T23:59:59Z`,
  }
}

function breakTimes(
  date: string,
  values: ShiftFormValues,
  shiftBreak: ShiftFormValues['breaks'][number],
  timeZone: string,
) {
  const resolve = (time: string) => resolveShiftTime(date, values.startTime, time, timeZone)
  return {
    start_time: resolve(shiftBreak.start),
    end_time:
      shiftBreak.lengthMinutes !== undefined
        ? resolve(addMinutesToTime(shiftBreak.start, shiftBreak.lengthMinutes))
        : null,
    break_rule_uuid: ruleIdFromFormValue(shiftBreak.ruleId),
  }
}

/** Unclassified partners send one entry per shift; Gusto applies overtime rules on sync. */
function unclassifiedEntry(hoursWorked: number) {
  return { hours_worked: hoursWorked, pay_classification: 'Unclassified' as const }
}

/** Nested-attributes PATCH: omitted entries/breaks are kept by the API, so removals need `_destroy`. */
export function toShiftUpdateBody(shift: Shift, values: ShiftSubmitValues): TimeSheetUpdateBody {
  const resolve = (time: string) =>
    resolveShiftTime(shift.date, values.startTime, time, shift.timeZone)
  const keptBreakIds = new Set(values.breaks.map(b => b.id).filter(Boolean))
  const [keptEntry, ...extraEntries] = shift.entries

  return {
    version: shift.version,
    shift_started_at: zonedToUtcIso(shift.date, values.startTime, shift.timeZone),
    ...(values.isOngoing ? {} : { shift_ended_at: resolve(values.endTime) }),
    ...(values.jobId ? { job_uuid: values.jobId } : {}),
    breaks: [
      ...values.breaks.map(shiftBreak => ({
        ...(shiftBreak.id ? { uuid: shiftBreak.id } : {}),
        ...breakTimes(shift.date, values, shiftBreak, shift.timeZone),
      })),
      ...shift.breaks
        .filter(shiftBreak => !keptBreakIds.has(shiftBreak.id))
        .map(shiftBreak => ({ uuid: shiftBreak.id, _destroy: true })),
    ],
    ...(values.hoursWorked === null
      ? {}
      : {
          entries: [
            {
              ...(keptEntry ? { uuid: keptEntry.id } : {}),
              ...unclassifiedEntry(values.hoursWorked),
            },
            ...extraEntries.map(entry => ({ uuid: entry.id, _destroy: true })),
          ],
        }),
  }
}

export function toShiftCreateBody(
  employeeUuid: string,
  date: string,
  timeZone: string,
  values: ShiftSubmitValues,
): TimeSheetCreateBody {
  return {
    entity_uuid: employeeUuid,
    entity_type: 'Employee',
    status: 'pending',
    job_uuid: values.jobId || null,
    time_zone: timeZone,
    shift_started_at: zonedToUtcIso(date, values.startTime, timeZone),
    shift_ended_at: values.isOngoing
      ? null
      : resolveShiftTime(date, values.startTime, values.endTime, timeZone),
    entries: values.hoursWorked === null ? [] : [unclassifiedEntry(values.hoursWorked)],
    breaks: values.breaks.map(shiftBreak => breakTimes(date, values, shiftBreak, timeZone)),
  }
}
