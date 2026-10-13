import type {
  AssignableEmployee,
  BreakPolicy,
  BreakRule,
  EmployeeTimesheetRow,
  HoursBreakdown,
  OvertimePolicy,
  PayPeriodSummary,
  Shift,
  StatusCounts,
  TimesheetStatus,
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
} from '../../../components/company/management/TimeTracking/timeZones'
import {
  ruleIdFromFormValue,
  type ShiftFormValues,
} from '../../../components/company/management/TimeTracking/shiftForm'
import type {
  ApiBreakPolicy,
  ApiBreakRule,
  ApiOvertimePolicy,
  ApiTimeSheet,
  ApiTimeSheetEntry,
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

function currentCompensation(employee: TimeTrackingEmployee) {
  const job = primaryJob(employee)
  return (
    job?.compensations?.find(c => c.uuid === job.currentCompensationUuid) ?? job?.compensations?.[0]
  )
}

export function jobTitle(employee: TimeTrackingEmployee): string | null {
  return primaryJob(employee)?.title ?? null
}

function compensationDetails(employee: TimeTrackingEmployee): {
  label: string
  ineligibleReason: string | null
} {
  const compensation = currentCompensation(employee)
  const flsa = compensation?.flsaStatus
  const isHourly = compensation?.paymentUnit === 'Hour'
  switch (flsa) {
    case FlsaStatus.NONEXEMPT:
      return { label: isHourly ? 'Hourly' : 'Salaried, non-exempt', ineligibleReason: null }
    case FlsaStatus.SALARIED_NONEXEMPT:
      return { label: 'Salaried, non-exempt', ineligibleReason: null }
    case FlsaStatus.EXEMPT:
      return {
        label: 'Salaried, exempt',
        ineligibleReason: 'Exempt employees aren’t eligible for overtime or break rules.',
      }
    case FlsaStatus.OWNER:
      return {
        label: 'Owner',
        ineligibleReason: 'Owners aren’t eligible for overtime or break rules.',
      }
    case FlsaStatus.COMMISSION_ONLY_EXEMPT:
    case FlsaStatus.COMMISSION_ONLY_NONEXEMPT:
      return {
        label: 'Commission only',
        ineligibleReason: 'Commission-only employees aren’t eligible for overtime or break rules.',
      }
    default:
      return {
        label: 'Not set up',
        ineligibleReason: 'Add a job and compensation before assigning a policy.',
      }
  }
}

export function isEligibleForPolicies(employee: TimeTrackingEmployee): boolean {
  return !employee.terminated && compensationDetails(employee).ineligibleReason === null
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

export function sheetsInPeriod(
  sheets: ApiTimeSheet[],
  period: { startDate: string; endDate: string },
): ApiTimeSheet[] {
  return sheets.filter(sheet => {
    const date = shiftDate(sheet)
    return date >= period.startDate && date <= period.endDate
  })
}

export function toPayPeriodSummaries(
  periods: TimeTrackingPayPeriod[],
  sheets: ApiTimeSheet[],
  today: string,
): PayPeriodSummary[] {
  return periods
    .filter(period => period.startDate && period.endDate && period.startDate <= today)
    .map(period => {
      const startDate = period.startDate!
      const endDate = period.endDate!
      const periodSheets = sheetsInPeriod(sheets, { startDate, endDate })
      return {
        id: payPeriodId(period),
        startDate,
        endDate,
        checkDate: period.payroll?.checkDate ?? null,
        isCurrent: startDate <= today && today <= endDate,
        isPayrollProcessed: period.payroll?.processed ?? false,
        employeeCount: new Set(periodSheets.map(sheet => sheet.entity_uuid)).size,
        timesheetCount: periodSheets.length,
        statusCounts: countStatuses(periodSheets),
        hours: hoursFromEntries(periodSheets.flatMap(sheet => sheet.entries)),
      }
    })
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}

export function aggregateStatus(counts: StatusCounts): TimesheetStatus | null {
  if (counts.pending > 0) return 'pending'
  if (counts.rejected > 0) return 'rejected'
  if (counts.approved > 0) return 'approved'
  return null
}

function overtimePolicyNameFor(employeeUuid: string, policies: OvertimePolicy[]): string | null {
  return policies.find(policy => policy.employeeUuids.includes(employeeUuid))?.name ?? null
}

/** Includes eligible employees with no hours so a missing timesheet is visible during review. */
export function toEmployeeRows(
  periodSheets: ApiTimeSheet[],
  employees: TimeTrackingEmployee[],
  overtimePolicies: OvertimePolicy[],
): EmployeeTimesheetRow[] {
  const sheetsByEmployee = new Map<string, ApiTimeSheet[]>()
  for (const sheet of periodSheets) {
    sheetsByEmployee.set(sheet.entity_uuid, [
      ...(sheetsByEmployee.get(sheet.entity_uuid) ?? []),
      sheet,
    ])
  }
  const employeesByUuid = new Map(employees.map(employee => [employee.uuid, employee]))
  const uuids = new Set([
    ...sheetsByEmployee.keys(),
    ...employees.filter(isEligibleForPolicies).map(employee => employee.uuid),
  ])

  return [...uuids]
    .map(uuid => {
      const employee = employeesByUuid.get(uuid)
      const employeeSheets = sheetsByEmployee.get(uuid) ?? []
      const statusCounts = countStatuses(employeeSheets)
      return {
        employeeUuid: uuid,
        name: employee ? employeeName(employee) : 'Unknown employee',
        jobTitle: employee ? jobTitle(employee) : null,
        status: aggregateStatus(statusCounts),
        statusCounts,
        shiftCount: employeeSheets.length,
        hours: sumHours(employeeSheets.map(sheet => hoursFromEntries(sheet.entries))),
        overtimePolicyName: overtimePolicyNameFor(uuid, overtimePolicies),
      }
    })
    .sort((a, b) => {
      if ((a.shiftCount === 0) !== (b.shiftCount === 0)) return a.shiftCount === 0 ? 1 : -1
      return a.name.localeCompare(b.name)
    })
}

export function toAssignableEmployees(
  employees: TimeTrackingEmployee[],
  policies: Array<{ id: string; name: string; employeeUuids: string[] }>,
): AssignableEmployee[] {
  return employees
    .filter(employee => !employee.terminated)
    .map(employee => {
      const details = compensationDetails(employee)
      const current = policies.find(policy => policy.employeeUuids.includes(employee.uuid))
      return {
        uuid: employee.uuid,
        name: employeeName(employee),
        jobTitle: jobTitle(employee),
        compensationLabel: details.label,
        ineligibleReason: details.ineligibleReason,
        currentPolicyId: current?.id ?? null,
        currentPolicyName: current?.name ?? null,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function countUnassignedForOvertime(
  employees: TimeTrackingEmployee[],
  overtimePolicies: OvertimePolicy[],
): number {
  const assigned = new Set(overtimePolicies.flatMap(policy => policy.employeeUuids))
  return employees.filter(
    employee => isEligibleForPolicies(employee) && !assigned.has(employee.uuid),
  ).length
}

/** Pads the pay-period window by a day on each side so shifts in any US time zone are fetched. */
export function timeSheetRangeFor(periods: PayPeriodSummary[]) {
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

/** Nested-attributes PATCH: omitted entries/breaks are kept by the API, so removals need `_destroy`. */
export function toShiftUpdateBody(shift: Shift, values: ShiftFormValues): TimeSheetUpdateBody {
  const resolve = (time: string) =>
    resolveShiftTime(shift.date, values.clockIn, time, shift.timeZone)
  const keptBreakIds = new Set(values.breaks.map(b => b.id).filter(Boolean))
  const keptEntryIds = new Set(values.entries.map(e => e.id).filter(Boolean))

  return {
    version: shift.version,
    shift_started_at: resolve(values.clockIn),
    ...(values.isOngoing ? {} : { shift_ended_at: resolve(values.clockOut) }),
    breaks: [
      ...values.breaks.map(shiftBreak => ({
        ...(shiftBreak.id ? { uuid: shiftBreak.id } : {}),
        start_time: resolve(shiftBreak.start),
        end_time: shiftBreak.end ? resolve(shiftBreak.end) : null,
        break_rule_uuid: ruleIdFromFormValue(shiftBreak.ruleId),
      })),
      ...shift.breaks
        .filter(shiftBreak => !keptBreakIds.has(shiftBreak.id))
        .map(shiftBreak => ({ uuid: shiftBreak.id, _destroy: true })),
    ],
    entries: [
      ...values.entries.map(entry => ({
        ...(entry.id ? { uuid: entry.id } : {}),
        hours_worked: entry.hours,
        pay_classification: entry.classification,
      })),
      ...shift.entries
        .filter(entry => !keptEntryIds.has(entry.id))
        .map(entry => ({ uuid: entry.id, _destroy: true })),
    ],
  }
}
