export type TimesheetStatus = 'pending' | 'approved' | 'rejected'

export type PayClassification = 'Regular' | 'Overtime' | 'Double overtime' | 'Unclassified'

export interface HoursBreakdown {
  regular: number
  overtime: number
  doubleOvertime: number
  unclassified: number
  total: number
}

export interface StatusCounts {
  pending: number
  approved: number
  rejected: number
}

/** Mirrors the grouping of Gusto's pay period dropdown. */
export type PayPeriodPhase = 'readyToReview' | 'active' | 'payrollRun'

export interface PayPeriodSummary {
  id: string
  startDate: string
  endDate: string
  checkDate: string | null
  payScheduleName: string
  phase: PayPeriodPhase
  isPayrollProcessed: boolean
  employeeCount: number
  timesheetCount: number
  statusCounts: StatusCounts
  /** Every timesheet in the period is approved; employees with no hours have nothing to approve. */
  isAllApproved: boolean
  hours: HoursBreakdown
  lastSyncedAt: string | null
}

export type TimesheetFlag = 'missedClockOut' | 'breakViolation'

export interface EmployeeTimesheetRow {
  employeeUuid: string
  name: string
  jobTitle: string | null
  isApproved: boolean
  hasHours: boolean
  isLocked: boolean
  statusCounts: StatusCounts
  hours: HoursBreakdown
  flags: TimesheetFlag[]
}

export interface ShiftBreak {
  id: string
  startTime: string
  endTime: string | null
  ruleId: string | null
  breakType: 'meal' | 'rest' | null
  isPaid: boolean | null
}

export interface ShiftEntry {
  id: string
  classification: PayClassification
  hours: number
}

export interface Shift {
  id: string
  version: string
  date: string
  timeZone: string
  startTime: string
  endTime: string | null
  jobId: string | null
  breaks: ShiftBreak[]
  entries: ShiftEntry[]
  hours: HoursBreakdown
  status: TimesheetStatus
  syncedToPayrollAt: string | null
  breakPolicy: AppliedBreakPolicy | null
}

export interface AppliedBreakPolicy {
  name: string
  jurisdiction: string | null
  payPremium: boolean
  rules: BreakRule[]
}

export interface TimesheetDay {
  date: string
  shifts: Shift[]
  hours: HoursBreakdown
  isFuture: boolean
  isPast: boolean
  isLocked: boolean
  isOverDailyThreshold: boolean
}

export interface EmployeeJob {
  id: string
  title: string
}

export interface OvertimePolicy {
  id: string
  version: string
  name: string
  weeklyThreshold: number
  dailyThreshold: number | null
  doubleOvertimeThreshold: number | null
  consecutiveDaysThreshold: number | null
  employeeUuids: string[]
}

export interface BreakRule {
  id?: string
  breakType: 'meal' | 'rest'
  durationMinutes: number
  afterHoursWorkedMinutes: number
  isPaid: boolean
}

export interface BreakPolicy {
  id: string
  version: string
  name: string
  jurisdiction: string | null
  payPremium: boolean
  rules: BreakRule[]
  employeeUuids: string[]
}

export type PolicyKind = 'overtime' | 'break'

export interface TimeTrackingPerson {
  uuid: string
  name: string
  jobTitle: string | null
  employmentType: string
  workState: string | null
  ineligibleReason: string | null
  overtimePolicyId: string | null
  breakPolicyId: string | null
}

export interface BulkActionResult {
  action: 'approved' | 'rejected' | 'pending' | 'deleted'
  succeeded: Array<{ id: string; label: string }>
  failed: Array<{ id: string; label: string; messages: string[] }>
}

export interface SelectOption {
  value: string
  label: string
}
