import { useMemo, useState } from 'react'
import type {
  BulkActionResult,
  EmployeeTimesheetRow,
  PayPeriodSummary,
  TimesheetStatus,
} from './types'
import { BulkActionResultAlert } from './BulkActionResultAlert'
import {
  STATUS_BADGE,
  STATUS_LABELS,
  formatDate,
  formatHours,
  formatHoursOrDash,
  formatPeriodRange,
  sumHours,
} from './formatters'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

type StatusFilter = 'all' | TimesheetStatus

const STATUS_FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: STATUS_LABELS.pending },
  { value: 'approved', label: STATUS_LABELS.approved },
  { value: 'rejected', label: STATUS_LABELS.rejected },
]

const ALL_EMPLOYEES = 'all'

export interface PayPeriodTimesheetsProps {
  period: PayPeriodSummary
  rows: EmployeeTimesheetRow[]
  bulkResult?: BulkActionResult | null
  isSubmitting?: boolean
  initialStatusFilter?: StatusFilter
  onDismissBulkResult?: () => void
  onBack: () => void
  onReviewEmployee: (employeeUuid: string) => void
  onApproveEmployees: (employeeUuids: string[]) => void
  onRejectEmployees: (employeeUuids: string[]) => void
}

function hasActionableHours(row: EmployeeTimesheetRow): boolean {
  return row.statusCounts.pending > 0 || row.statusCounts.rejected > 0
}

export function PayPeriodTimesheets({
  period,
  rows,
  bulkResult,
  isSubmitting,
  initialStatusFilter = 'all',
  onDismissBulkResult,
  onBack,
  onReviewEmployee,
  onApproveEmployees,
  onRejectEmployees,
}: PayPeriodTimesheetsProps) {
  const Components = useComponentContext()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatusFilter)
  const [employeeFilter, setEmployeeFilter] = useState<string>(ALL_EMPLOYEES)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const isLocked = period.isPayrollProcessed
  const hasUnclassifiedHours = rows.some(row => row.hours.unclassified > 0)
  const hasClassifiedHours = rows.some(row => row.hours.total - row.hours.unclassified > 0)

  const visibleRows = useMemo(
    () =>
      rows.filter(row => {
        if (employeeFilter !== ALL_EMPLOYEES && row.employeeUuid !== employeeFilter) return false
        if (statusFilter === 'all') return true
        return row.statusCounts[statusFilter] > 0
      }),
    [rows, employeeFilter, statusFilter],
  )

  const employeeOptions = useMemo(
    () => [
      { value: ALL_EMPLOYEES, label: 'All employees' },
      ...rows.map(row => ({ value: row.employeeUuid, label: row.name })),
    ],
    [rows],
  )

  const actionableUuids = rows.filter(hasActionableHours).map(row => row.employeeUuid)
  const selectedUuids = [...selected].filter(uuid => rows.some(row => row.employeeUuid === uuid))
  const totals = sumHours(visibleRows.map(row => row.hours))

  const runAndClear = (action: (uuids: string[]) => void, uuids: string[]) => {
    action(uuids)
    setSelected(new Set())
  }

  const selection = isLocked
    ? { onSelect: undefined }
    : {
        onSelect: (row: EmployeeTimesheetRow, checked: boolean) => {
          setSelected(prev => {
            const next = new Set(prev)
            if (checked) next.add(row.employeeUuid)
            else next.delete(row.employeeUuid)
            return next
          })
        },
        onSelectAll: (checked: boolean, visible: EmployeeTimesheetRow[]) => {
          setSelected(checked ? new Set(visible.map(row => row.employeeUuid)) : new Set())
        },
        getIsItemSelected: (row: EmployeeTimesheetRow) => selected.has(row.employeeUuid),
      }

  const dataViewProps = useDataView<EmployeeTimesheetRow>({
    data: visibleRows,
    columns: [
      {
        key: 'employee',
        title: 'Employee',
        render: row => (
          <Flex flexDirection="column" gap={2}>
            <Components.Text weight="medium">{row.name}</Components.Text>
            {row.jobTitle ? (
              <Components.Text size="sm" variant="supporting">
                {row.jobTitle}
              </Components.Text>
            ) : null}
          </Flex>
        ),
      },
      { key: 'shifts', title: 'Shifts', render: row => row.shiftCount },
      ...(hasClassifiedHours
        ? [
            {
              key: 'regular',
              title: 'Regular',
              justify: 'end' as const,
              render: (row: EmployeeTimesheetRow) => formatHoursOrDash(row.hours.regular),
            },
            {
              key: 'overtime',
              title: 'Overtime',
              justify: 'end' as const,
              render: (row: EmployeeTimesheetRow) => formatHoursOrDash(row.hours.overtime),
            },
            {
              key: 'doubleOvertime',
              title: 'Double OT',
              justify: 'end' as const,
              render: (row: EmployeeTimesheetRow) => formatHoursOrDash(row.hours.doubleOvertime),
            },
          ]
        : []),
      {
        key: 'total',
        title: 'Total',
        justify: 'end',
        render: row => formatHours(row.hours.total),
      },
      {
        key: 'status',
        title: 'Status',
        render: row =>
          row.status ? (
            <Components.Badge status={STATUS_BADGE[row.status]}>
              {STATUS_LABELS[row.status]}
            </Components.Badge>
          ) : (
            <Components.Badge status="info">No hours</Components.Badge>
          ),
      },
    ],
    ...selection,
    itemMenu: row => (
      <HamburgerMenu
        triggerLabel={`Actions for ${row.name}`}
        items={[
          {
            label: 'Review timesheet',
            onClick: () => {
              onReviewEmployee(row.employeeUuid)
            },
          },
          ...(!isLocked && hasActionableHours(row)
            ? [
                {
                  label: 'Approve hours',
                  onClick: () => {
                    onApproveEmployees([row.employeeUuid])
                  },
                },
              ]
            : []),
          ...(!isLocked && row.statusCounts.approved + row.statusCounts.pending > 0
            ? [
                {
                  label: 'Reject hours',
                  onClick: () => {
                    onRejectEmployees([row.employeeUuid])
                  },
                },
              ]
            : []),
        ]}
      />
    ),
    emptyState: () =>
      rows.length === 0 ? (
        <EmptyData
          title="No hours for this pay period"
          description="Hours your team tracks during this pay period will appear here for review."
        />
      ) : (
        <EmptyData
          title="No timesheets match these filters"
          description="Try a different person or status."
        />
      ),
  })

  return (
    <Flex flexDirection="column" gap={20} alignItems="stretch">
      <Components.Breadcrumbs
        breadcrumbs={[
          { id: 'overview', label: 'Time tracking', isClickable: true },
          { id: 'period', label: formatPeriodRange(period.startDate, period.endDate) },
        ]}
        currentBreadcrumbId="period"
        onClick={id => {
          if (id === 'overview') onBack()
        }}
      />

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-end" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">
            {`Timesheets for ${formatPeriodRange(period.startDate, period.endDate)}`}
          </Components.Heading>
          <Components.Text variant="supporting">{`Payday ${formatDate(period.checkDate)}`}</Components.Text>
        </Flex>
        {!isLocked ? (
          <Flex flexDirection="row" gap={8} justifyContent="flex-end">
            {selectedUuids.length > 0 ? (
              <>
                <Components.Button
                  variant="secondary"
                  isDisabled={isSubmitting}
                  onClick={() => {
                    runAndClear(onRejectEmployees, selectedUuids)
                  }}
                >
                  {`Reject selected (${selectedUuids.length})`}
                </Components.Button>
                <Components.Button
                  isLoading={isSubmitting}
                  onClick={() => {
                    runAndClear(onApproveEmployees, selectedUuids)
                  }}
                >
                  {`Approve selected (${selectedUuids.length})`}
                </Components.Button>
              </>
            ) : (
              <Components.Button
                isLoading={isSubmitting}
                isDisabled={actionableUuids.length === 0}
                onClick={() => {
                  runAndClear(onApproveEmployees, actionableUuids)
                }}
              >
                Approve all
              </Components.Button>
            )}
          </Flex>
        ) : null}
      </Flex>

      {isLocked ? (
        <Components.Alert status="info" label="Payroll for this pay period has been processed">
          <Components.Text>
            These hours have been paid, so timesheets can no longer be approved, rejected, or
            edited.
          </Components.Text>
        </Components.Alert>
      ) : null}

      {bulkResult ? (
        <BulkActionResultAlert result={bulkResult} onDismiss={onDismissBulkResult} />
      ) : null}

      {hasUnclassifiedHours ? (
        <Components.Alert status="info" label="Overtime is calculated when hours sync to payroll">
          <Components.Text>
            Totals show all hours worked. Regular, overtime, and double overtime are split using
            each employee’s overtime policy when approved hours sync to payroll.
          </Components.Text>
        </Components.Alert>
      ) : null}

      <Flex flexDirection="row" gap={16} alignItems="flex-end">
        <Components.Select
          label="Employee"
          placeholder="All employees"
          options={employeeOptions}
          value={employeeFilter}
          onChange={setEmployeeFilter}
        />
        <Components.Select
          label="Status"
          placeholder="All statuses"
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={value => {
            setStatusFilter(value as StatusFilter)
          }}
        />
      </Flex>

      <Components.Text variant="supporting">
        {[
          `${visibleRows.length} ${visibleRows.length === 1 ? 'person' : 'people'}`,
          hasClassifiedHours ? `${formatHoursOrDash(totals.regular)} regular` : null,
          totals.overtime > 0 ? `${formatHours(totals.overtime)} overtime` : null,
          totals.doubleOvertime > 0
            ? `${formatHours(totals.doubleOvertime)} double overtime`
            : null,
          `${formatHours(totals.total)} total`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Components.Text>

      <DataView label="Employee timesheets" {...dataViewProps} />
    </Flex>
  )
}
