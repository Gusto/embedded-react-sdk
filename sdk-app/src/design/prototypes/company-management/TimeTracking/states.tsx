import type { PrototypeComponent } from '../../prototypeTypes'
import { TimeTrackingOverview } from '../../../components/company/management/TimeTracking/TimeTrackingOverview'
import { PayPeriodTimesheets } from '../../../components/company/management/TimeTracking/PayPeriodTimesheets'
import { EmployeeTimesheet } from '../../../components/company/management/TimeTracking/EmployeeTimesheet'
import { ShiftEditForm } from '../../../components/company/management/TimeTracking/ShiftEditForm'
import { OvertimePolicyForm } from '../../../components/company/management/TimeTracking/OvertimePolicyForm'
import { BreakPolicyForm } from '../../../components/company/management/TimeTracking/BreakPolicyForm'
import { PolicyEmployeeAssignment } from '../../../components/company/management/TimeTracking/PolicyEmployeeAssignment'
import {
  addDaysToDateString,
  zonedToUtcIso,
} from '../../../components/company/management/TimeTracking/timeZones'
import type {
  AssignableEmployee,
  BreakPolicy,
  BreakRule,
  BulkActionResult,
  EmployeeTimesheetRow,
  HoursBreakdown,
  OvertimePolicy,
  PayClassification,
  PayPeriodSummary,
  Shift,
  StatusCounts,
  TimesheetStatus,
} from '../../../components/company/management/TimeTracking/types'

const noop = () => {}
const TIME_ZONE = 'America/Los_Angeles'

function hours(partial: Partial<HoursBreakdown>): HoursBreakdown {
  const base = { regular: 0, overtime: 0, doubleOvertime: 0, unclassified: 0, ...partial }
  return { ...base, total: base.regular + base.overtime + base.doubleOvertime + base.unclassified }
}

function counts(partial: Partial<StatusCounts>): StatusCounts {
  return { pending: 0, approved: 0, rejected: 0, ...partial }
}

const californiaOvertime: OvertimePolicy = {
  id: 'ot-ca',
  version: 'v1',
  name: 'California overtime',
  weeklyThreshold: 40,
  dailyThreshold: 8,
  doubleOvertimeThreshold: 12,
  consecutiveDaysThreshold: 7,
  employeeUuids: ['emp-1', 'emp-2', 'emp-3'],
}

const federalOvertime: OvertimePolicy = {
  id: 'ot-federal',
  version: 'v1',
  name: 'Standard overtime',
  weeklyThreshold: 40,
  dailyThreshold: null,
  doubleOvertimeThreshold: null,
  consecutiveDaysThreshold: null,
  employeeUuids: ['emp-4', 'emp-5'],
}

const mealRule: BreakRule = {
  id: 'rule-meal',
  breakType: 'meal',
  durationMinutes: 30,
  afterHoursWorkedMinutes: 300,
  isPaid: false,
}

const restRule: BreakRule = {
  id: 'rule-rest',
  breakType: 'rest',
  durationMinutes: 10,
  afterHoursWorkedMinutes: 240,
  isPaid: true,
}

const californiaBreaks: BreakPolicy = {
  id: 'bp-ca',
  version: 'v1',
  name: 'California meal and rest',
  jurisdiction: 'CA',
  payPremium: true,
  rules: [mealRule, restRule],
  employeeUuids: ['emp-1', 'emp-2', 'emp-3'],
}

const oregonBreaks: BreakPolicy = {
  id: 'bp-or',
  version: 'v1',
  name: 'Oregon meal break',
  jurisdiction: 'OR',
  payPremium: false,
  rules: [{ ...mealRule, id: 'rule-or-meal' }],
  employeeUuids: ['emp-4'],
}

function period(
  id: string,
  startDate: string,
  endDate: string,
  overrides: Partial<PayPeriodSummary> = {},
): PayPeriodSummary {
  return {
    id,
    startDate,
    endDate,
    checkDate: null,
    isCurrent: false,
    isPayrollProcessed: true,
    employeeCount: 6,
    timesheetCount: 54,
    statusCounts: counts({ approved: 54 }),
    hours: hours({ regular: 412, overtime: 18.5, doubleOvertime: 2 }),
    ...overrides,
  }
}

const currentPeriod = period('current', '2026-10-01', '2026-10-15', {
  checkDate: '2026-10-20',
  isCurrent: true,
  isPayrollProcessed: false,
  timesheetCount: 38,
  statusCounts: counts({ pending: 14, approved: 22, rejected: 2 }),
  hours: hours({ regular: 268.5, overtime: 9.25, doubleOvertime: 1.5 }),
})

const pastPeriods: PayPeriodSummary[] = [
  period('p-sep-2', '2026-09-16', '2026-09-30', {
    checkDate: '2026-10-05',
    isPayrollProcessed: false,
    statusCounts: counts({ approved: 51, pending: 3 }),
  }),
  period('p-sep-1', '2026-09-01', '2026-09-15', { checkDate: '2026-09-20' }),
  period('p-aug-2', '2026-08-16', '2026-08-31', { checkDate: '2026-09-04' }),
  period('p-aug-1', '2026-08-01', '2026-08-15', {
    checkDate: '2026-08-20',
    timesheetCount: 0,
    employeeCount: 0,
    statusCounts: counts({}),
    hours: hours({}),
  }),
]

const processedPeriod = pastPeriods[1]!

function row(
  overrides: Partial<EmployeeTimesheetRow> & { employeeUuid: string; name: string },
): EmployeeTimesheetRow {
  return {
    jobTitle: 'Barista',
    status: 'pending',
    statusCounts: counts({ pending: 6 }),
    shiftCount: 6,
    hours: hours({ regular: 46.5, overtime: 1.5 }),
    overtimePolicyName: 'California overtime',
    ...overrides,
  }
}

const classifiedRows: EmployeeTimesheetRow[] = [
  row({
    employeeUuid: 'emp-1',
    name: 'Alex Rivera',
    jobTitle: 'Shift lead',
    statusCounts: counts({ pending: 4, approved: 3 }),
    shiftCount: 7,
    hours: hours({ regular: 52, overtime: 5.25, doubleOvertime: 1.5 }),
  }),
  row({
    employeeUuid: 'emp-2',
    name: 'Jordan Lee',
    status: 'approved',
    statusCounts: counts({ approved: 6 }),
    hours: hours({ regular: 48 }),
  }),
  row({
    employeeUuid: 'emp-3',
    name: 'Priya Natarajan',
    jobTitle: 'Line cook',
    status: 'rejected',
    statusCounts: counts({ rejected: 2, approved: 4 }),
    hours: hours({ regular: 44, overtime: 2.5 }),
  }),
  row({
    employeeUuid: 'emp-4',
    name: 'Sam Okafor',
    statusCounts: counts({ pending: 5 }),
    shiftCount: 5,
    hours: hours({ regular: 38.5 }),
    overtimePolicyName: 'Standard overtime',
  }),
  row({
    employeeUuid: 'emp-5',
    name: 'Taylor Brooks-Hernandez',
    jobTitle: 'Weekend dishwasher and prep',
    statusCounts: counts({ pending: 4 }),
    shiftCount: 4,
    hours: hours({ regular: 30, overtime: 1.5 }),
    overtimePolicyName: 'Standard overtime',
  }),
  row({
    employeeUuid: 'emp-6',
    name: 'Morgan Chen',
    status: null,
    statusCounts: counts({}),
    shiftCount: 0,
    hours: hours({}),
  }),
]

const unclassifiedRows: EmployeeTimesheetRow[] = classifiedRows.map(r => ({
  ...r,
  hours: hours({ unclassified: r.hours.total }),
}))

const allApprovedRows = classifiedRows.map(r =>
  r.shiftCount === 0
    ? r
    : { ...r, status: 'approved' as const, statusCounts: counts({ approved: r.shiftCount }) },
)

const partialBulkResult: BulkActionResult = {
  action: 'approved',
  succeeded: [
    { id: 'emp-1', label: 'Alex Rivera' },
    { id: 'emp-4', label: 'Sam Okafor' },
  ],
  failed: [
    {
      id: 'emp-5',
      label: 'Taylor Brooks-Hernandez',
      messages: ['Cannot change timesheet status after payroll has been processed.'],
    },
    {
      id: 'emp-3',
      label: 'Priya Natarajan',
      messages: ['Supplied Version 9f3c… is invalid.'],
    },
  ],
}

const successBulkResult: BulkActionResult = {
  action: 'approved',
  succeeded: classifiedRows.slice(0, 5).map(r => ({ id: r.employeeUuid, label: r.name })),
  failed: [],
}

interface ShiftFixture {
  id: string
  date: string
  start: string
  end: string | null
  breaks?: Array<{ start: string; end: string | null; rule: BreakRule | null }>
  entries?: Array<{ classification: PayClassification; hours: number }>
  status?: TimesheetStatus
  synced?: boolean
  breakPolicy?: BreakPolicy | null
}

function shift({
  id,
  date,
  start,
  end,
  breaks = [],
  entries,
  status = 'pending',
  synced = false,
  breakPolicy = californiaBreaks,
}: ShiftFixture): Shift {
  const resolvedEntries = (entries ?? [{ classification: 'Regular', hours: 8 }]).map(
    (entry, index) => ({
      id: `${id}-entry-${index}`,
      ...entry,
    }),
  )
  const breakdown = hours(
    resolvedEntries.reduce<Partial<HoursBreakdown>>((acc, entry) => {
      const key =
        entry.classification === 'Regular'
          ? 'regular'
          : entry.classification === 'Overtime'
            ? 'overtime'
            : entry.classification === 'Double overtime'
              ? 'doubleOvertime'
              : 'unclassified'
      return { ...acc, [key]: (acc[key] ?? 0) + entry.hours }
    }, {}),
  )
  return {
    id,
    version: `${id}-v1`,
    date,
    timeZone: TIME_ZONE,
    startTime: zonedToUtcIso(date, start, TIME_ZONE),
    endTime: end
      ? zonedToUtcIso(end < start ? addDaysToDateString(date, 1) : date, end, TIME_ZONE)
      : null,
    breaks: breaks.map((b, index) => ({
      id: `${id}-break-${index}`,
      startTime: zonedToUtcIso(date, b.start, TIME_ZONE),
      endTime: b.end ? zonedToUtcIso(date, b.end, TIME_ZONE) : null,
      ruleId: b.rule?.id ?? null,
      breakType: b.rule?.breakType ?? null,
      isPaid: b.rule?.isPaid ?? null,
    })),
    entries: resolvedEntries,
    hours: breakdown,
    status,
    syncedToPayrollAt: synced ? '2026-09-18T17:00:00Z' : null,
    breakPolicy: breakPolicy
      ? {
          name: breakPolicy.name,
          jurisdiction: breakPolicy.jurisdiction,
          payPremium: breakPolicy.payPremium,
          rules: breakPolicy.rules,
        }
      : null,
  }
}

const standardBreaks = [
  { start: '11:00', end: '11:10', rule: restRule },
  { start: '13:00', end: '13:30', rule: mealRule },
]

const reviewShifts: Shift[] = [
  shift({
    id: 's-1',
    date: '2026-10-01',
    start: '08:00',
    end: '16:30',
    breaks: standardBreaks,
    status: 'approved',
  }),
  shift({
    id: 's-2',
    date: '2026-10-02',
    start: '08:00',
    end: '16:30',
    breaks: standardBreaks,
    status: 'approved',
  }),
  shift({
    id: 's-3',
    date: '2026-10-05',
    start: '07:00',
    end: '20:00',
    breaks: standardBreaks,
    entries: [
      { classification: 'Regular', hours: 8 },
      { classification: 'Overtime', hours: 3.5 },
      { classification: 'Double overtime', hours: 1 },
    ],
    status: 'approved',
  }),
  shift({
    id: 's-4',
    date: '2026-10-06',
    start: '08:00',
    end: '17:15',
    breaks: standardBreaks,
    entries: [
      { classification: 'Regular', hours: 8 },
      { classification: 'Overtime', hours: 0.75 },
    ],
  }),
  shift({
    id: 's-5',
    date: '2026-10-07',
    start: '08:00',
    end: '16:30',
    breaks: [standardBreaks[1]!],
  }),
  shift({ id: 's-6', date: '2026-10-08', start: '08:00', end: '16:30', breaks: standardBreaks }),
  shift({
    id: 's-7',
    date: '2026-10-09',
    start: '08:00',
    end: '16:30',
    breaks: [],
    status: 'rejected',
    entries: [{ classification: 'Regular', hours: 8.5 }],
  }),
]

const ongoingShifts: Shift[] = [
  ...reviewShifts.slice(3),
  shift({
    id: 's-live',
    date: '2026-10-12',
    start: '08:00',
    end: null,
    breaks: [{ start: '11:00', end: null, rule: restRule }],
    entries: [],
  }),
]

const unclassifiedShifts: Shift[] = reviewShifts.slice(3).map(s => ({
  ...s,
  entries: [{ id: `${s.id}-u`, classification: 'Unclassified', hours: s.hours.total }],
  hours: hours({ unclassified: s.hours.total }),
}))

const lockedShifts: Shift[] = reviewShifts.map(s => ({
  ...s,
  status: 'approved' as const,
  syncedToPayrollAt: '2026-09-18T17:00:00Z',
}))

const statusFailure: BulkActionResult = {
  action: 'approved',
  succeeded: [{ id: 's-5', label: 'Wed, Oct 7' }],
  failed: [
    {
      id: 's-4',
      label: 'Tue, Oct 6',
      messages: ['Supplied Version 72deb67e is invalid.'],
    },
  ],
}

const overnightShift = shift({
  id: 's-overnight',
  date: '2026-10-09',
  start: '22:00',
  end: '06:30',
  breaks: [{ start: '02:00', end: '02:30', rule: mealRule }],
})

function employee(
  uuid: string,
  name: string,
  overrides: Partial<AssignableEmployee> = {},
): AssignableEmployee {
  return {
    uuid,
    name,
    jobTitle: 'Barista',
    compensationLabel: 'Hourly',
    ineligibleReason: null,
    currentPolicyId: null,
    currentPolicyName: null,
    ...overrides,
  }
}

const assignableEmployees: AssignableEmployee[] = [
  employee('emp-1', 'Alex Rivera', {
    jobTitle: 'Shift lead',
    currentPolicyId: 'ot-ca',
    currentPolicyName: 'California overtime',
  }),
  employee('emp-2', 'Jordan Lee', {
    currentPolicyId: 'ot-ca',
    currentPolicyName: 'California overtime',
  }),
  employee('emp-3', 'Priya Natarajan', {
    jobTitle: 'Line cook',
    compensationLabel: 'Salaried, non-exempt',
    currentPolicyId: 'ot-ca',
    currentPolicyName: 'California overtime',
  }),
  employee('emp-4', 'Sam Okafor', {
    currentPolicyId: 'ot-federal',
    currentPolicyName: 'Standard overtime',
  }),
  employee('emp-5', 'Taylor Brooks-Hernandez', {
    currentPolicyId: 'ot-federal',
    currentPolicyName: 'Standard overtime',
  }),
  employee('emp-6', 'Morgan Chen'),
  employee('emp-7', 'Casey Patel', {
    jobTitle: 'General manager',
    compensationLabel: 'Salaried, exempt',
    ineligibleReason: 'Exempt employees aren’t eligible for overtime or break rules.',
  }),
  employee('emp-8', 'Riley Owens', {
    jobTitle: 'Owner',
    compensationLabel: 'Owner',
    ineligibleReason: 'Owners aren’t eligible for overtime or break rules.',
  }),
  employee('emp-9', 'Drew Kim', {
    jobTitle: null,
    compensationLabel: 'Not set up',
    ineligibleReason: 'Add a job and compensation before assigning a policy.',
  }),
]

const breakAssignableEmployees = assignableEmployees.map(e => {
  const policy = [californiaBreaks, oregonBreaks].find(p => p.employeeUuids.includes(e.uuid))
  return { ...e, currentPolicyId: policy?.id ?? null, currentPolicyName: policy?.name ?? null }
})

const overviewHandlers = {
  onPayScheduleChange: noop,
  onReviewPeriod: noop,
  onAddOvertimePolicy: noop,
  onEditOvertimePolicy: noop,
  onAssignOvertimePolicy: noop,
  onAddBreakPolicy: noop,
  onEditBreakPolicy: noop,
  onAssignBreakPolicy: noop,
}

const rosterHandlers = {
  onBack: noop,
  onReviewEmployee: noop,
  onApproveEmployees: noop,
  onRejectEmployees: noop,
  onDismissBulkResult: noop,
}

const timesheetHandlers = {
  onBackToOverview: noop,
  onBackToPeriod: noop,
  onEditShift: noop,
  onChangeStatus: noop,
  onDismissStatusResult: noop,
}

export const components: PrototypeComponent[] = [
  {
    slug: 'overview',
    name: 'Overview',
    description:
      'Main time tracking page — current pay period at a glance, timesheet history, and the overtime and break policies with setup CTAs.',
    configurations: [
      {
        slug: 'populated',
        name: 'Populated',
        description: 'Open pay period with hours to review, past periods, and policies set up.',
        render: () => (
          <TimeTrackingOverview
            currentPeriod={currentPeriod}
            pastPeriods={pastPeriods}
            overtimePolicies={[californiaOvertime, federalOvertime]}
            breakPolicies={[californiaBreaks, oregonBreaks]}
            unassignedEmployeeCount={0}
            {...overviewHandlers}
          />
        ),
      },
      {
        slug: 'needs-setup',
        name: 'Needs setup',
        description: 'No policies yet — prompts the admin to add an overtime policy first.',
        render: () => (
          <TimeTrackingOverview
            currentPeriod={{
              ...currentPeriod,
              timesheetCount: 0,
              employeeCount: 0,
              statusCounts: counts({}),
              hours: hours({}),
            }}
            pastPeriods={[]}
            overtimePolicies={[]}
            breakPolicies={[]}
            unassignedEmployeeCount={6}
            {...overviewHandlers}
          />
        ),
      },
      {
        slug: 'unassigned-employees',
        name: 'Unassigned employees',
        description:
          'Policies exist, but some eligible employees aren’t on an overtime policy yet.',
        render: () => (
          <TimeTrackingOverview
            currentPeriod={currentPeriod}
            pastPeriods={pastPeriods}
            overtimePolicies={[californiaOvertime]}
            breakPolicies={[californiaBreaks]}
            unassignedEmployeeCount={2}
            {...overviewHandlers}
          />
        ),
      },
      {
        slug: 'multiple-pay-schedules',
        name: 'Multiple pay schedules',
        description: 'A pay schedule picker appears when the company has more than one schedule.',
        render: () => (
          <TimeTrackingOverview
            currentPeriod={currentPeriod}
            pastPeriods={pastPeriods}
            overtimePolicies={[californiaOvertime, federalOvertime]}
            breakPolicies={[californiaBreaks]}
            unassignedEmployeeCount={0}
            paySchedules={[
              { value: 'ps-1', label: 'Hourly — every other week' },
              { value: 'ps-2', label: 'Salaried — twice per month' },
            ]}
            selectedPayScheduleId="ps-1"
            {...overviewHandlers}
          />
        ),
      },
      {
        slug: 'loading-timesheets',
        name: 'Loading timesheets',
        description: 'Pay periods have loaded but the time sheet request is in flight.',
        render: () => (
          <TimeTrackingOverview
            currentPeriod={currentPeriod}
            pastPeriods={pastPeriods}
            overtimePolicies={[californiaOvertime]}
            breakPolicies={[californiaBreaks]}
            unassignedEmployeeCount={0}
            isLoadingTimesheets
            {...overviewHandlers}
          />
        ),
      },
      {
        slug: 'policies-unavailable',
        name: 'Policies API unavailable',
        description: 'The partner doesn’t have the policy APIs enabled, so both lists return 404.',
        render: () => (
          <TimeTrackingOverview
            currentPeriod={currentPeriod}
            pastPeriods={pastPeriods}
            overtimePolicies={[]}
            breakPolicies={[]}
            overtimePoliciesError="The overtime policies API isn’t enabled for this partner (404). It’s gated behind a per-partner feature flag."
            breakPoliciesError="The break policies API isn’t enabled for this partner (404). It’s gated behind a per-partner feature flag."
            unassignedEmployeeCount={0}
            {...overviewHandlers}
          />
        ),
      },
      {
        slug: 'no-current-period',
        name: 'No current period',
        description: 'No open pay period and no history yet — a brand-new company.',
        render: () => (
          <TimeTrackingOverview
            currentPeriod={null}
            pastPeriods={[]}
            overtimePolicies={[californiaOvertime]}
            breakPolicies={[]}
            unassignedEmployeeCount={0}
            {...overviewHandlers}
          />
        ),
      },
    ],
  },
  {
    slug: 'pay-period-review',
    name: 'Pay period review',
    description:
      'Roster of everyone with hours in a pay period — filter by person and status, see per-person totals, and bulk approve.',
    configurations: [
      {
        slug: 'needs-review',
        name: 'Needs review',
        description: 'Mixed statuses with regular, overtime, and double overtime hours.',
        render: () => (
          <PayPeriodTimesheets period={currentPeriod} rows={classifiedRows} {...rosterHandlers} />
        ),
      },
      {
        slug: 'filtered-to-pending',
        name: 'Filtered to needs review',
        description: 'Status filter preset to only show people with hours to review.',
        render: () => (
          <PayPeriodTimesheets
            period={currentPeriod}
            rows={classifiedRows}
            initialStatusFilter="pending"
            {...rosterHandlers}
          />
        ),
      },
      {
        slug: 'unclassified-hours',
        name: 'Unclassified hours',
        description:
          'Unclassified partner — only total hours are submitted; overtime is split at payroll sync.',
        render: () => (
          <PayPeriodTimesheets period={currentPeriod} rows={unclassifiedRows} {...rosterHandlers} />
        ),
      },
      {
        slug: 'bulk-approve-partial',
        name: 'Bulk approve — partial failure',
        description: 'Some approvals succeeded and some failed, with a reason for each failure.',
        render: () => (
          <PayPeriodTimesheets
            period={currentPeriod}
            rows={classifiedRows}
            bulkResult={partialBulkResult}
            {...rosterHandlers}
          />
        ),
      },
      {
        slug: 'bulk-approve-success',
        name: 'Bulk approve — success',
        description: 'Everything selected was approved.',
        render: () => (
          <PayPeriodTimesheets
            period={currentPeriod}
            rows={allApprovedRows}
            bulkResult={successBulkResult}
            {...rosterHandlers}
          />
        ),
      },
      {
        slug: 'submitting',
        name: 'Submitting',
        description: 'A bulk approval is in progress.',
        render: () => (
          <PayPeriodTimesheets
            period={currentPeriod}
            rows={classifiedRows}
            isSubmitting
            {...rosterHandlers}
          />
        ),
      },
      {
        slug: 'payroll-processed',
        name: 'Payroll processed',
        description: 'A past period after payroll ran — read-only, no selection or status actions.',
        render: () => (
          <PayPeriodTimesheets
            period={processedPeriod}
            rows={allApprovedRows}
            {...rosterHandlers}
          />
        ),
      },
      {
        slug: 'empty',
        name: 'No hours',
        description: 'No one has tracked time in this pay period yet.',
        render: () => <PayPeriodTimesheets period={currentPeriod} rows={[]} {...rosterHandlers} />,
      },
    ],
  },
  {
    slug: 'employee-timesheet',
    name: 'Employee timesheet',
    description:
      'One person’s shifts for a pay period — entries, breaks, the rules applied, and approve / reject / return to pending per shift.',
    configurations: [
      {
        slug: 'mixed-statuses',
        name: 'Mixed statuses',
        description: 'Approved, pending, and rejected shifts with overtime and double overtime.',
        render: () => (
          <EmployeeTimesheet
            period={currentPeriod}
            employeeName="Alex Rivera"
            jobTitle="Shift lead"
            shifts={reviewShifts}
            overtimePolicy={californiaOvertime}
            {...timesheetHandlers}
          />
        ),
      },
      {
        slug: 'shift-in-progress',
        name: 'Shift in progress',
        description: 'Today’s shift hasn’t ended and the employee is on a break.',
        render: () => (
          <EmployeeTimesheet
            period={currentPeriod}
            employeeName="Alex Rivera"
            jobTitle="Shift lead"
            shifts={ongoingShifts}
            overtimePolicy={californiaOvertime}
            {...timesheetHandlers}
          />
        ),
      },
      {
        slug: 'unclassified',
        name: 'Unclassified hours',
        description: 'Hours are submitted as totals and classified when synced to payroll.',
        render: () => (
          <EmployeeTimesheet
            period={currentPeriod}
            employeeName="Sam Okafor"
            jobTitle="Barista"
            shifts={unclassifiedShifts}
            overtimePolicy={federalOvertime}
            {...timesheetHandlers}
          />
        ),
      },
      {
        slug: 'status-change-failed',
        name: 'Status change failed',
        description: 'One shift approved, another failed because it changed since the page loaded.',
        render: () => (
          <EmployeeTimesheet
            period={currentPeriod}
            employeeName="Alex Rivera"
            jobTitle="Shift lead"
            shifts={reviewShifts}
            overtimePolicy={californiaOvertime}
            statusResult={statusFailure}
            {...timesheetHandlers}
          />
        ),
      },
      {
        slug: 'no-policies',
        name: 'No policies assigned',
        description: 'The employee isn’t on an overtime or break policy.',
        render: () => (
          <EmployeeTimesheet
            period={currentPeriod}
            employeeName="Morgan Chen"
            jobTitle="Barista"
            shifts={reviewShifts.slice(4).map(s => ({ ...s, breakPolicy: null }))}
            overtimePolicy={null}
            {...timesheetHandlers}
          />
        ),
      },
      {
        slug: 'payroll-processed',
        name: 'Payroll processed',
        description: 'Hours were synced and paid — no edits or status changes.',
        render: () => (
          <EmployeeTimesheet
            period={processedPeriod}
            employeeName="Alex Rivera"
            jobTitle="Shift lead"
            shifts={lockedShifts}
            overtimePolicy={californiaOvertime}
            {...timesheetHandlers}
          />
        ),
      },
      {
        slug: 'empty',
        name: 'No shifts',
        description: 'The employee didn’t track any time this pay period.',
        render: () => (
          <EmployeeTimesheet
            period={currentPeriod}
            employeeName="Morgan Chen"
            jobTitle="Barista"
            shifts={[]}
            overtimePolicy={californiaOvertime}
            {...timesheetHandlers}
          />
        ),
      },
    ],
  },
  {
    slug: 'shift-edit',
    name: 'Edit shift',
    description:
      'Correct clock-in/out times, breaks, and hours. Overlapping breaks, breaks outside the shift, and hours that don’t fit are blocked before saving.',
    configurations: [
      {
        slug: 'typical',
        name: 'Typical shift',
        description: 'A pending shift with a rest and meal break. Try overlapping the breaks.',
        render: () => (
          <ShiftEditForm
            shift={reviewShifts[3]!}
            employeeName="Alex Rivera"
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'overnight',
        name: 'Overnight shift',
        description: 'Clock-out and breaks after midnight roll onto the next day.',
        render: () => (
          <ShiftEditForm
            shift={overnightShift}
            employeeName="Priya Natarajan"
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'unclassified',
        name: 'Unclassified hours',
        description: 'One “hours worked” entry with a shortcut to use the calculated shift length.',
        render: () => (
          <ShiftEditForm
            shift={unclassifiedShifts[0]!}
            employeeName="Sam Okafor"
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'approved',
        name: 'Approved shift',
        description: 'Editing an already-approved shift.',
        render: () => (
          <ShiftEditForm
            shift={reviewShifts[0]!}
            employeeName="Alex Rivera"
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'no-break-policy',
        name: 'No break policy',
        description: 'Breaks can still be recorded but can’t be tied to a rule.',
        render: () => (
          <ShiftEditForm
            shift={{
              ...reviewShifts[5]!,
              breakPolicy: null,
              breaks: reviewShifts[5]!.breaks.map(b => ({ ...b, ruleId: null, breakType: null })),
            }}
            employeeName="Morgan Chen"
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'server-error',
        name: 'Server error',
        description: 'The API rejected the save — e.g. the shift overlaps another one.',
        render: () => (
          <ShiftEditForm
            shift={reviewShifts[3]!}
            employeeName="Alex Rivera"
            serverErrors={['These hours overlap with time you already entered.']}
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
    ],
  },
  {
    slug: 'overtime-policy-form',
    name: 'Overtime policy form',
    description:
      'Create or edit an overtime policy with weekly, daily, double overtime, and consecutive-day thresholds. Invalid combinations are blocked.',
    configurations: [
      {
        slug: 'create',
        name: 'Create',
        description:
          'New policy with the federal 40-hour default. Try double overtime without daily.',
        render: () => <OvertimePolicyForm onSubmit={noop} onCancel={noop} />,
      },
      {
        slug: 'edit-all-rules',
        name: 'Edit — all rules',
        description:
          'Editing a California-style policy; warns that changes apply to the whole workweek.',
        render: () => (
          <OvertimePolicyForm policy={californiaOvertime} onSubmit={noop} onCancel={noop} />
        ),
      },
      {
        slug: 'edit-weekly-only',
        name: 'Edit — weekly only',
        description: 'Editing a weekly-only policy.',
        render: () => (
          <OvertimePolicyForm policy={federalOvertime} onSubmit={noop} onCancel={noop} />
        ),
      },
      {
        slug: 'server-error',
        name: 'Server error',
        description: 'The company has no pay schedule yet, so overtime policies can’t be created.',
        render: () => (
          <OvertimePolicyForm
            serverErrors={['You must set up a pay schedule before using overtime policies.']}
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
    ],
  },
  {
    slug: 'break-policy-form',
    name: 'Break policy form',
    description:
      'Create or edit a state break policy with meal and rest rules and an optional premium.',
    configurations: [
      {
        slug: 'create',
        name: 'Create',
        description: 'New policy — choose a state and set meal and rest rules.',
        render: () => <BreakPolicyForm onSubmit={noop} onCancel={noop} />,
      },
      {
        slug: 'edit',
        name: 'Edit',
        description: 'State is fixed once created; warns about breaks already taken today.',
        render: () => <BreakPolicyForm policy={californiaBreaks} onSubmit={noop} onCancel={noop} />,
      },
      {
        slug: 'break-already-taken',
        name: 'Blocked — break already taken',
        description: 'The save was rejected because someone already recorded a break today.',
        render: () => (
          <BreakPolicyForm
            policy={californiaBreaks}
            serverErrors={[
              'You can only remove an employee from a break rule before a break has been recorded for them on this date. Remove the existing break or try again tomorrow.',
            ]}
            onSubmit={noop}
            onCancel={noop}
          />
        ),
      },
    ],
  },
  {
    slug: 'assign-employees',
    name: 'Assign employees',
    description:
      'Assign or reassign employees to a policy. Only eligible employees can be selected; everyone else is listed with the reason.',
    configurations: [
      {
        slug: 'overtime',
        name: 'Overtime policy',
        description:
          'Employees on this policy can’t be unchecked — they move by joining another policy.',
        render: () => (
          <PolicyEmployeeAssignment
            kind="overtime"
            policyId="ot-ca"
            policyName="California overtime"
            employees={assignableEmployees}
            onSave={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'new-overtime-policy',
        name: 'New overtime policy',
        description:
          'Right after creating a policy — selecting someone moves them off their current one.',
        render: () => (
          <PolicyEmployeeAssignment
            kind="overtime"
            policyId="ot-new"
            policyName="Washington overtime"
            employees={assignableEmployees}
            onSave={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'break',
        name: 'Break policy',
        description: 'Break policies support both adding and removing employees.',
        render: () => (
          <PolicyEmployeeAssignment
            kind="break"
            policyId="bp-ca"
            policyName="California meal and rest"
            employees={breakAssignableEmployees}
            onSave={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'server-error',
        name: 'Server error',
        description: 'The API rejected an assignment because a break was already recorded today.',
        render: () => (
          <PolicyEmployeeAssignment
            kind="break"
            policyId="bp-ca"
            policyName="California meal and rest"
            employees={breakAssignableEmployees}
            serverErrors={[
              'You can only assign a different break rule before a break has been recorded for the employee on this date. Remove the existing break or try again tomorrow.',
            ]}
            onSave={noop}
            onCancel={noop}
          />
        ),
      },
      {
        slug: 'none-eligible',
        name: 'No eligible employees',
        description: 'Everyone is exempt, an owner, or not set up yet.',
        render: () => (
          <PolicyEmployeeAssignment
            kind="overtime"
            policyId="ot-ca"
            policyName="California overtime"
            employees={assignableEmployees.filter(e => e.ineligibleReason !== null)}
            onSave={noop}
            onCancel={noop}
          />
        ),
      },
    ],
  },
]
