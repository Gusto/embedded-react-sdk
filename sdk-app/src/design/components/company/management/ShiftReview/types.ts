import type { HoursBreakdown, TimesheetStatus } from '../TimeTracking/types'

export type ShiftIssue = 'missedClockOut' | 'missedMealBreak' | 'missedRestBreak' | 'shortenedBreak'

/** One time sheet from the API — a single shift, approved or rejected on its own. */
export interface ShiftListRow {
  id: string
  employeeName: string
  jobTitle: string | null
  date: string
  timeZone: string
  startTime: string
  endTime: string | null
  breakCount: number
  breakMinutes: number
  hours: HoursBreakdown
  status: TimesheetStatus
  syncedToPayrollAt: string | null
  issues: ShiftIssue[]
}

export type ShiftStatusFilter = TimesheetStatus | 'all'
