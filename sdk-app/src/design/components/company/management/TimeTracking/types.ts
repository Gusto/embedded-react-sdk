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

export interface PayPeriodSummary {
  id: string
  startDate: string
  endDate: string
  checkDate: string | null
  isCurrent: boolean
  isPayrollProcessed: boolean
  employeeCount: number
  timesheetCount: number
  statusCounts: StatusCounts
  hours: HoursBreakdown
}

export interface EmployeeTimesheetRow {
  employeeUuid: string
  name: string
  jobTitle: string | null
  status: TimesheetStatus | null
  statusCounts: StatusCounts
  shiftCount: number
  hours: HoursBreakdown
  overtimePolicyName: string | null
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

export interface AssignableEmployee {
  uuid: string
  name: string
  jobTitle: string | null
  compensationLabel: string
  ineligibleReason: string | null
  currentPolicyId: string | null
  currentPolicyName: string | null
}

export interface BulkActionResult {
  action: 'approved' | 'rejected' | 'pending'
  succeeded: Array<{ id: string; label: string }>
  failed: Array<{ id: string; label: string; messages: string[] }>
}

export interface SelectOption {
  value: string
  label: string
}
