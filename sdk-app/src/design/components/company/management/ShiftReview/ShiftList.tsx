import { useState } from 'react'
import classNames from 'classnames'
import {
  formatDayWithWeekday,
  formatHours,
  formatMinutes,
  formatPeriodRange,
  formatTimeInZone,
  formatTimeZoneAbbreviation,
  pluralize,
} from '../TimeTracking/formatters'
import { BulkActionResultAlert } from '../TimeTracking/BulkActionResultAlert'
import type { BulkActionResult, SelectOption, TimesheetStatus } from '../TimeTracking/types'
import type { ShiftIssue, ShiftListRow, ShiftStatusFilter } from './types'
import styles from './ShiftList.module.scss'
import PencilIcon from '@/assets/icons/pencil.svg?react'
import TrashCanIcon from '@/assets/icons/trashcan.svg?react'
import { DataView, DateRangeFilter, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import type { UseDateRangeFilterResult } from '@/hooks/useDateRangeFilter/useDateRangeFilter'

const ISSUE_BADGES: Record<ShiftIssue, { label: string; status: 'error' | 'warning' }> = {
  missedClockOut: { label: 'Missed clock-out', status: 'error' },
  missedMealBreak: { label: 'Missed meal break', status: 'error' },
  missedRestBreak: { label: 'Missed rest break', status: 'error' },
  shortenedBreak: { label: 'Shortened break', status: 'warning' },
}

const STATUS_BADGES: Record<
  TimesheetStatus,
  { label: string; status: 'success' | 'warning' | 'error' }
> = {
  pending: { label: 'Pending', status: 'warning' },
  approved: { label: 'Approved', status: 'success' },
  rejected: { label: 'Rejected', status: 'error' },
}

const STATUS_FILTER_OPTIONS: Array<{ value: ShiftStatusFilter; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const ALL_EMPLOYEES = 'all'

export interface ShiftListProps {
  rows: ShiftListRow[]
  dateRangeFilter: UseDateRangeFilterResult
  statusFilter: ShiftStatusFilter
  employeeOptions: SelectOption[]
  employeeFilter: string | null
  selectedShiftIds: string[]
  canApproveSelection: boolean
  canUnapproveSelection: boolean
  actionResult?: BulkActionResult | null
  pagination?: PaginationControlProps
  isFetching?: boolean
  errorMessage?: string | null
  onStatusFilterChange: (status: ShiftStatusFilter) => void
  onEmployeeFilterChange: (employeeUuid: string | null) => void
  onSelectedShiftIdsChange: (shiftIds: string[]) => void
  onApproveSelected: () => void
  onUnapproveSelected: () => void
  onAddShift: () => void
  onEditShift: (shiftId: string) => void
  onDeleteShift: (shiftId: string) => void
  onDismissActionResult?: () => void
}

export function ShiftList({
  rows,
  dateRangeFilter,
  statusFilter,
  employeeOptions,
  employeeFilter,
  selectedShiftIds,
  canApproveSelection,
  canUnapproveSelection,
  actionResult,
  pagination,
  isFetching,
  errorMessage,
  onStatusFilterChange,
  onEmployeeFilterChange,
  onSelectedShiftIdsChange,
  onApproveSelected,
  onUnapproveSelected,
  onAddShift,
  onEditShift,
  onDeleteShift,
  onDismissActionResult,
}: ShiftListProps) {
  const Components = useComponentContext()
  const [shiftPendingDeletion, setShiftPendingDeletion] = useState<ShiftListRow | null>(null)
  const startDate = dateRangeFilter.startDate
    ? formatDateToStringDate(dateRangeFilter.startDate)
    : null
  const endDate = dateRangeFilter.endDate ? formatDateToStringDate(dateRangeFilter.endDate) : null
  const rangeLabel = startDate && endDate ? formatPeriodRange(startDate, endDate) : null
  const rangeSuffix = rangeLabel ? ` started ${rangeLabel}` : ''
  const shiftNoun = selectedShiftIds.length === 1 ? 'shift' : 'shifts'

  const dataViewProps = useDataView<ShiftListRow>({
    data: rows,
    pagination,
    isFetching,
    getIsItemSelected: row => selectedShiftIds.includes(row.id),
    onSelect: (row, checked) => {
      onSelectedShiftIdsChange(
        checked ? [...selectedShiftIds, row.id] : selectedShiftIds.filter(id => id !== row.id),
      )
    },
    onSelectAll: (checked, visibleRows) => {
      const visibleIds = visibleRows.map(row => row.id)
      const otherIds = selectedShiftIds.filter(id => !visibleIds.includes(id))
      onSelectedShiftIdsChange(checked ? [...otherIds, ...visibleIds] : otherIds)
    },
    columns: [
      {
        key: 'employee',
        title: 'Employee',
        render: row => (
          <div className={styles.stack}>
            <Components.Text weight="medium">{row.employeeName}</Components.Text>
            {row.jobTitle ? (
              <Components.Text size="sm" variant="supporting">
                {row.jobTitle}
              </Components.Text>
            ) : null}
          </div>
        ),
      },
      {
        key: 'date',
        title: 'Date',
        render: row => formatDayWithWeekday(row.date),
      },
      {
        key: 'shift',
        title: 'Shift',
        render: row => {
          const zone = formatTimeZoneAbbreviation(row.startTime, row.timeZone)
          const endLabel = row.endTime
            ? formatTimeInZone(row.endTime, row.timeZone)
            : row.issues.includes('missedClockOut')
              ? 'No clock-out'
              : 'In progress'
          return `${formatTimeInZone(row.startTime, row.timeZone)} – ${endLabel} ${zone}`
        },
      },
      {
        key: 'breaks',
        title: 'Breaks',
        render: row =>
          row.breakCount === 0 ? (
            '—'
          ) : (
            <div className={styles.stack}>
              <Components.Text>{formatMinutes(row.breakMinutes)}</Components.Text>
              <Components.Text size="sm" variant="supporting">
                {pluralize(row.breakCount, 'break')}
              </Components.Text>
            </div>
          ),
      },
      {
        key: 'hours',
        title: 'Hours',
        justify: 'end',
        render: row => {
          const premium = [
            row.hours.overtime > 0 ? `${formatHours(row.hours.overtime)} OT` : null,
            row.hours.doubleOvertime > 0 ? `${formatHours(row.hours.doubleOvertime)} DOT` : null,
          ].filter(Boolean)
          return (
            <div className={classNames(styles.stack, styles.stackEnd)}>
              <Components.Text>{formatHours(row.hours.total)}</Components.Text>
              {premium.length > 0 ? (
                <Components.Text size="sm" variant="supporting">
                  {premium.join(' · ')}
                </Components.Text>
              ) : null}
            </div>
          )
        },
      },
      {
        key: 'status',
        title: 'Status',
        render: row => (
          <div className={styles.badges}>
            <Components.Badge status={STATUS_BADGES[row.status].status}>
              {STATUS_BADGES[row.status].label}
            </Components.Badge>
            {row.issues.map(issue => (
              <Components.Badge key={issue} status={ISSUE_BADGES[issue].status}>
                {ISSUE_BADGES[issue].label}
              </Components.Badge>
            ))}
          </div>
        ),
      },
    ],
    itemMenu: row => (
      <HamburgerMenu
        triggerLabel={`Actions for ${row.employeeName}’s shift on ${formatDayWithWeekday(row.date)}`}
        items={[
          {
            label: 'Edit shift',
            icon: <PencilIcon aria-hidden />,
            onClick: () => {
              onEditShift(row.id)
            },
          },
          {
            label: 'Delete shift',
            icon: <TrashCanIcon aria-hidden />,
            onClick: () => {
              setShiftPendingDeletion(row)
            },
          },
        ]}
      />
    ),
    emptyState: () => (
      <EmptyData
        title="No shifts"
        description={
          statusFilter === 'all'
            ? `No shifts${rangeSuffix}.`
            : `No ${STATUS_BADGES[statusFilter].label.toLowerCase()} shifts${rangeSuffix}.`
        }
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={20} alignItems="stretch">
      <div className={styles.header}>
        <Flex flexDirection="column" gap={4} alignItems="stretch">
          <Components.Heading as="h2">Shifts</Components.Heading>
          {rangeLabel ? (
            <Components.Text variant="supporting">{`Shifts started ${rangeLabel}`}</Components.Text>
          ) : null}
        </Flex>
        <Components.Button variant="secondary" onClick={onAddShift}>
          Add shift
        </Components.Button>
      </div>

      {actionResult ? (
        <BulkActionResultAlert
          result={actionResult}
          itemNoun="shift"
          onDismiss={onDismissActionResult}
        />
      ) : null}

      {errorMessage ? (
        <Components.Alert status="error" label="Shifts couldn’t be loaded">
          {errorMessage}
        </Components.Alert>
      ) : null}

      <Flex flexDirection="column" gap={12} alignItems="stretch">
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <Components.Select
              label="Status"
              shouldVisuallyHideLabel
              placeholder="All statuses"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={value => {
                onStatusFilterChange(value as ShiftStatusFilter)
              }}
            />
            <Components.ComboBox
              label="Employee"
              shouldVisuallyHideLabel
              placeholder="All employees"
              options={[{ value: ALL_EMPLOYEES, label: 'All employees' }, ...employeeOptions]}
              value={employeeFilter ?? ALL_EMPLOYEES}
              onChange={value => {
                onEmployeeFilterChange(value === ALL_EMPLOYEES ? null : value)
              }}
            />
            <DateRangeFilter
              startDate={dateRangeFilter.startDate}
              endDate={dateRangeFilter.endDate}
              onStartDateChange={dateRangeFilter.handleStartDateChange}
              onEndDateChange={dateRangeFilter.handleEndDateChange}
              onClear={dateRangeFilter.handleClearFilter}
              startDateLabel="From"
              endDateLabel="To"
              applyLabel="Apply"
              cancelLabel="Cancel"
              resetLabel="Reset"
              selectDatesLabel="Select dates"
              getTriggerLabel={selection => `Filter by shift date, ${selection}`}
              maxEndDate={dateRangeFilter.getMaxEndDate()}
              minStartDate={dateRangeFilter.getMinStartDate()}
            />
          </div>
          <div
            className={classNames(
              styles.actions,
              selectedShiftIds.length === 0 && styles.actionsHidden,
            )}
            aria-hidden={selectedShiftIds.length === 0}
          >
            {canApproveSelection || !canUnapproveSelection ? (
              <Components.Button
                variant="secondary"
                isDisabled={!canApproveSelection}
                onClick={onApproveSelected}
              >
                {`Approve ${shiftNoun}`}
              </Components.Button>
            ) : null}
            {canUnapproveSelection ? (
              <Components.Button variant="secondary" onClick={onUnapproveSelected}>
                {`Unapprove ${shiftNoun}`}
              </Components.Button>
            ) : null}
          </div>
        </div>
        <DataView label="Shifts" {...dataViewProps} />
      </Flex>

      <Components.Dialog
        isOpen={shiftPendingDeletion !== null}
        title="Delete this shift?"
        primaryActionLabel="Delete shift"
        closeActionLabel="Cancel"
        isDestructive
        onClose={() => {
          setShiftPendingDeletion(null)
        }}
        onPrimaryActionClick={() => {
          if (shiftPendingDeletion) onDeleteShift(shiftPendingDeletion.id)
          setShiftPendingDeletion(null)
        }}
      >
        {`This removes the shift and its breaks from ${shiftPendingDeletion?.employeeName ?? 'the employee'}’s timesheet. This action cannot be undone.`}
      </Components.Dialog>
    </Flex>
  )
}
