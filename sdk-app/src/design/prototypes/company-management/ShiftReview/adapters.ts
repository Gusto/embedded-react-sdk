import type {
  ShiftIssue,
  ShiftListRow,
} from '../../../components/company/management/ShiftReview/types'
import type { Shift } from '../../../components/company/management/TimeTracking/types'
import { shiftCompliance } from '../../../components/company/management/TimeTracking/compliance'
import { durationMinutes } from '../../../components/company/management/TimeTracking/formatters'
import { toZonedParts } from '../../../components/company/management/TimeTracking/timeZones'
import { employeeName, toShift, type TimeTrackingEmployee } from '../TimeTracking/adapters'
import type { ApiTimeSheet } from '../TimeTracking/timeTrackingApi'

// The API has no exception flags, so break issues are derived from `effective_break_policy`.
function issuesFor(shift: Shift, now: Date): ShiftIssue[] {
  const today = toZonedParts(now.toISOString(), shift.timeZone).date
  const { missingBreaks, shortenedBreaks } = shiftCompliance(shift)
  const issues: ShiftIssue[] = []
  if (!shift.endTime && shift.date < today) issues.push('missedClockOut')
  if (missingBreaks.some(rule => rule.breakType === 'meal')) issues.push('missedMealBreak')
  if (missingBreaks.some(rule => rule.breakType === 'rest')) issues.push('missedRestBreak')
  if (shortenedBreaks.length > 0) issues.push('shortenedBreak')
  return issues
}

export function toShiftListRow(
  sheet: ApiTimeSheet,
  employee: TimeTrackingEmployee | undefined,
  now: Date,
): ShiftListRow {
  const shift = toShift(sheet)
  return {
    id: shift.id,
    employeeName: employee ? employeeName(employee) : 'Unknown employee',
    jobTitle: employee?.jobs?.find(job => job.uuid === sheet.job_uuid)?.title ?? null,
    date: shift.date,
    timeZone: shift.timeZone,
    startTime: shift.startTime,
    endTime: shift.endTime,
    breakCount: shift.breaks.length,
    breakMinutes: shift.breaks.reduce(
      (sum, shiftBreak) => sum + durationMinutes(shiftBreak.startTime, shiftBreak.endTime),
      0,
    ),
    hours: shift.hours,
    status: shift.status,
    syncedToPayrollAt: shift.syncedToPayrollAt,
    issues: issuesFor(shift, now),
  }
}
