/* eslint-disable react-refresh/only-export-components */
import { useState, type ComponentProps } from 'react'
import type { PrototypeComponent } from '../../prototypeTypes'
import { ShiftList } from '../../../components/company/management/ShiftReview/ShiftList'
import { ShiftReviewTabs } from '../../../components/company/management/ShiftReview/ShiftReviewTabs'
import { TimeTrackingPolicies } from '../../../components/company/management/TimeTracking/TimeTrackingPolicies'
import type {
  ShiftIssue,
  ShiftListRow,
} from '../../../components/company/management/ShiftReview/types'
import type {
  BreakPolicy,
  BreakRule,
  HoursBreakdown,
  OvertimePolicy,
  TimesheetStatus,
} from '../../../components/company/management/TimeTracking/types'
import { zonedToUtcIso } from '../../../components/company/management/TimeTracking/timeZones'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import type { UseDateRangeFilterResult } from '@/hooks/useDateRangeFilter/useDateRangeFilter'

const noop = () => {}
const TIME_ZONE = 'America/Los_Angeles'

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
  rules: [{ ...mealRule, id: 'rule-or-meal', afterHoursWorkedMinutes: 360 }],
  employeeUuids: ['emp-4'],
}

const populatedPolicies = (
  <TimeTrackingPolicies
    onAddOvertimePolicy={noop}
    onEditOvertimePolicy={noop}
    onAddBreakPolicy={noop}
    onEditBreakPolicy={noop}
    overtimePolicies={[californiaOvertime, federalOvertime]}
    breakPolicies={[californiaBreaks, oregonBreaks]}
  />
)

function hours(partial: Partial<HoursBreakdown>): HoursBreakdown {
  const base = { regular: 0, overtime: 0, doubleOvertime: 0, unclassified: 0, ...partial }
  return { ...base, total: base.regular + base.overtime + base.doubleOvertime + base.unclassified }
}

interface MockShift {
  id: string
  employeeName: string
  jobTitle?: string
  date: string
  start: string
  end: string | null
  breakMinutes?: number[]
  hours: Partial<HoursBreakdown>
  status?: TimesheetStatus
  syncedAt?: string
  issues?: ShiftIssue[]
}

function shift(mock: MockShift): ShiftListRow {
  const breaks = mock.breakMinutes ?? []
  return {
    id: mock.id,
    employeeName: mock.employeeName,
    jobTitle: mock.jobTitle ?? null,
    date: mock.date,
    timeZone: TIME_ZONE,
    startTime: zonedToUtcIso(mock.date, mock.start, TIME_ZONE),
    endTime: mock.end ? zonedToUtcIso(mock.date, mock.end, TIME_ZONE) : null,
    breakCount: breaks.length,
    breakMinutes: breaks.reduce((sum, minutes) => sum + minutes, 0),
    hours: hours(mock.hours),
    status: mock.status ?? 'pending',
    syncedToPayrollAt: mock.syncedAt ? zonedToUtcIso(mock.syncedAt, '16:12', TIME_ZONE) : null,
    issues: mock.issues ?? [],
  }
}

const mixedShifts: ShiftListRow[] = [
  shift({
    id: 's1',
    employeeName: 'Alex Rivera',
    jobTitle: 'Barista',
    date: '2026-11-04',
    start: '07:00',
    end: null,
    hours: {},
  }),
  shift({
    id: 's2',
    employeeName: 'Jordan Lee',
    jobTitle: 'Shift lead',
    date: '2026-11-03',
    start: '09:00',
    end: '17:30',
    breakMinutes: [30],
    hours: { regular: 8 },
  }),
  shift({
    id: 's3',
    employeeName: 'Sam Patel',
    jobTitle: 'Barista',
    date: '2026-11-03',
    start: '06:00',
    end: '17:00',
    breakMinutes: [20, 10],
    hours: { regular: 8, overtime: 2.5 },
    issues: ['shortenedBreak'],
  }),
  shift({
    id: 's4',
    employeeName: 'Casey Morgan',
    jobTitle: 'Line cook',
    date: '2026-11-02',
    start: '11:00',
    end: '19:00',
    hours: { regular: 8 },
    issues: ['missedMealBreak', 'missedRestBreak'],
  }),
  shift({
    id: 's5',
    employeeName: 'Taylor Kim',
    jobTitle: 'Dishwasher',
    date: '2026-11-01',
    start: '16:00',
    end: null,
    hours: {},
    issues: ['missedClockOut'],
  }),
  shift({
    id: 's6',
    employeeName: 'Jordan Lee',
    jobTitle: 'Shift lead',
    date: '2026-10-30',
    start: '05:00',
    end: '19:00',
    breakMinutes: [30, 10, 10],
    hours: { regular: 8, overtime: 4, doubleOvertime: 1.5 },
    status: 'approved',
  }),
  shift({
    id: 's7',
    employeeName: 'Alex Rivera',
    jobTitle: 'Barista',
    date: '2026-10-28',
    start: '08:00',
    end: '12:00',
    hours: { regular: 4 },
    status: 'rejected',
  }),
  shift({
    id: 's8',
    employeeName: 'Sam Patel',
    jobTitle: 'Barista',
    date: '2026-10-23',
    start: '09:00',
    end: '17:30',
    breakMinutes: [30],
    hours: { regular: 8 },
    status: 'approved',
    syncedAt: '2026-10-27',
  }),
]

function pagination(totalCount: number, totalPages = 1): PaginationControlProps {
  return {
    currentPage: 1,
    totalPages,
    totalCount,
    itemsPerPage: 25,
    handleFirstPage: noop,
    handlePreviousPage: noop,
    handleNextPage: noop,
    handleLastPage: noop,
    handleItemsPerPageChange: noop,
  }
}

const dateRangeFilter: UseDateRangeFilterResult = {
  startDate: new Date(2026, 9, 22),
  endDate: new Date(2026, 10, 4),
  isModified: false,
  handleStartDateChange: noop,
  handleEndDateChange: noop,
  handleClearFilter: noop,
  getApiDateParams: () => ({ startDate: '2026-10-22', endDate: '2026-11-04' }),
  getMaxEndDate: () => undefined,
  getMinStartDate: () => undefined,
}

const employeeOptions = [...new Set(mixedShifts.map(row => row.employeeName))].map(name => ({
  value: name,
  label: name,
}))

const listHandlers = {
  dateRangeFilter,
  employeeOptions,
  employeeFilter: null,
  selectedShiftIds: [],
  canApproveSelection: false,
  canUnapproveSelection: false,
  onStatusFilterChange: noop,
  onEmployeeFilterChange: noop,
  onSelectedShiftIdsChange: noop,
  onApproveSelected: noop,
  onUnapproveSelected: noop,
  onAddShift: noop,
  onEditShift: noop,
  onDeleteShift: noop,
}

type ShiftListMockProps = Partial<ComponentProps<typeof ShiftList>> & { rows: ShiftListRow[] }

function InteractiveShiftList({
  rows,
  employeeFilter: initialEmployeeFilter = null,
  selectedShiftIds: initialSelectedShiftIds = [],
  ...props
}: ShiftListMockProps) {
  const [employeeFilter, setEmployeeFilter] = useState(initialEmployeeFilter)
  const [selectedShiftIds, setSelectedShiftIds] = useState(initialSelectedShiftIds)
  const visibleRows = employeeFilter
    ? rows.filter(row => row.employeeName === employeeFilter)
    : rows
  const approvableSelection = rows.filter(
    row => selectedShiftIds.includes(row.id) && !row.syncedToPayrollAt,
  )
  return (
    <ShiftList
      {...listHandlers}
      statusFilter="all"
      pagination={pagination(visibleRows.length)}
      canApproveSelection={approvableSelection.some(row => row.status !== 'approved')}
      canUnapproveSelection={approvableSelection.some(row => row.status === 'approved')}
      {...props}
      rows={visibleRows}
      employeeFilter={employeeFilter}
      selectedShiftIds={selectedShiftIds}
      onEmployeeFilterChange={setEmployeeFilter}
      onSelectedShiftIdsChange={setSelectedShiftIds}
    />
  )
}

export const components: PrototypeComponent[] = [
  {
    slug: 'shift-list',
    name: 'Shift list',
    description:
      'Every employee shift that started in the selected dates, one row per time sheet. Filters, sorting, and paging are server-side.',
    configurations: [
      {
        slug: 'mixed',
        name: 'Mixed statuses and issues',
        render: () => <InteractiveShiftList rows={mixedShifts} />,
      },
      {
        slug: 'some-selected',
        name: 'Some shifts selected',
        render: () => (
          <InteractiveShiftList
            rows={mixedShifts}
            selectedShiftIds={mixedShifts
              .filter(row => row.status === 'pending')
              .map(row => row.id)}
          />
        ),
      },
      {
        slug: 'approved-selected',
        name: 'Approved shifts selected',
        render: () => (
          <InteractiveShiftList
            rows={mixedShifts}
            selectedShiftIds={mixedShifts
              .filter(row => row.status === 'approved' && !row.syncedToPayrollAt)
              .map(row => row.id)}
          />
        ),
      },
      {
        slug: 'action-partial-failure',
        name: 'Some approvals failed',
        render: () => (
          <InteractiveShiftList
            rows={mixedShifts}
            actionResult={{
              action: 'approved',
              succeeded: [
                { id: 's2', label: 'Jordan Lee · Tue, Nov 3' },
                { id: 's3', label: 'Sam Patel · Tue, Nov 3' },
              ],
              failed: [
                {
                  id: 's1',
                  label: 'Alex Rivera · Wed, Nov 4',
                  messages: ['Time sheet must have a shift end time to be approved.'],
                },
              ],
            }}
          />
        ),
      },
      {
        slug: 'delete-succeeded',
        name: 'Shift deleted',
        render: () => (
          <InteractiveShiftList
            rows={mixedShifts}
            actionResult={{
              action: 'deleted',
              succeeded: [{ id: 'x1', label: 'Jordan Lee · Mon, Nov 2' }],
              failed: [],
            }}
          />
        ),
      },
      {
        slug: 'employee-filter',
        name: 'Filtered by employee',
        render: () => <InteractiveShiftList rows={mixedShifts} employeeFilter="Jordan Lee" />,
      },
      {
        slug: 'pending-filter',
        name: 'Filtered to pending',
        render: () => {
          const pending = mixedShifts.filter(row => row.status === 'pending')
          return (
            <ShiftList
              {...listHandlers}
              rows={pending}
              statusFilter="pending"
              pagination={pagination(pending.length)}
            />
          )
        },
      },
      {
        slug: 'many-pages',
        name: 'Multiple pages',
        render: () => (
          <ShiftList
            {...listHandlers}
            rows={mixedShifts}
            statusFilter="all"
            pagination={pagination(212, 9)}
          />
        ),
      },
      {
        slug: 'fetching',
        name: 'Refetching after a filter change',
        render: () => (
          <ShiftList
            {...listHandlers}
            rows={mixedShifts}
            statusFilter="all"
            isFetching
            pagination={{ ...pagination(mixedShifts.length), isFetching: true }}
          />
        ),
      },
      {
        slug: 'empty',
        name: 'No shifts',
        render: () => <ShiftList {...listHandlers} rows={[]} statusFilter="all" />,
      },
      {
        slug: 'empty-filtered',
        name: 'No shifts for status',
        render: () => <ShiftList {...listHandlers} rows={[]} statusFilter="rejected" />,
      },
      {
        slug: 'error',
        name: 'Load error',
        render: () => (
          <ShiftList
            {...listHandlers}
            rows={[]}
            statusFilter="all"
            errorMessage="The time tracking API isn’t enabled for this partner (404)."
          />
        ),
      },
    ],
  },
  {
    slug: 'tabs',
    name: 'Shifts and policies tabs',
    description: 'Top-level tabs. Policies reuse the time tracking prototype’s policy tables.',
    configurations: [
      {
        slug: 'shifts',
        name: 'Shifts tab',
        render: () => (
          <ShiftReviewTabs
            selectedTab="shifts"
            onTabChange={noop}
            shifts={<InteractiveShiftList rows={mixedShifts} />}
            policies={populatedPolicies}
          />
        ),
      },
      {
        slug: 'policies',
        name: 'Policies tab',
        render: () => (
          <ShiftReviewTabs
            selectedTab="policies"
            onTabChange={noop}
            shifts={<InteractiveShiftList rows={mixedShifts} />}
            policies={populatedPolicies}
          />
        ),
      },
      {
        slug: 'policy-saved',
        name: 'Policy saved',
        render: () => (
          <ShiftReviewTabs
            selectedTab="policies"
            successMessage="California overtime updated."
            onTabChange={noop}
            onDismissSuccess={noop}
            shifts={<InteractiveShiftList rows={mixedShifts} />}
            policies={populatedPolicies}
          />
        ),
      },
    ],
  },
]
