import { useMemo, useState } from 'react'
import { DescriptionList } from '../../../common/DescriptionList'
import type {
  AppliedBreakPolicy,
  BulkActionResult,
  OvertimePolicy,
  PayPeriodSummary,
  Shift,
  TimesheetStatus,
} from './types'
import { BulkActionResultAlert } from './BulkActionResultAlert'
import {
  STATUS_BADGE,
  STATUS_LABELS,
  formatDayWithWeekday,
  formatHours,
  formatHoursOrDash,
  formatPeriodRange,
  formatTimeInZone,
  formatTimeZoneAbbreviation,
  summarizeBreakRule,
  summarizeDoubleOvertime,
  summarizeOvertimePolicy,
  sumHours,
} from './formatters'
import { DataView, EmptyData, Flex, Grid, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface EmployeeTimesheetProps {
  period: PayPeriodSummary
  employeeName: string
  jobTitle: string | null
  shifts: Shift[]
  overtimePolicy: OvertimePolicy | null
  statusResult?: BulkActionResult | null
  isSubmitting?: boolean
  onDismissStatusResult?: () => void
  onBackToOverview: () => void
  onBackToPeriod: () => void
  onEditShift: (shiftId: string) => void
  onChangeStatus: (shiftIds: string[], status: TimesheetStatus) => void
}

function isShiftLocked(shift: Shift, period: PayPeriodSummary): boolean {
  return period.isPayrollProcessed || shift.syncedToPayrollAt !== null
}

function statusActions(shift: Shift): Array<{ label: string; status: TimesheetStatus }> {
  switch (shift.status) {
    case 'pending':
      return [
        { label: 'Approve', status: 'approved' },
        { label: 'Reject', status: 'rejected' },
      ]
    case 'approved':
      return [
        { label: 'Return to pending', status: 'pending' },
        { label: 'Reject', status: 'rejected' },
      ]
    case 'rejected':
      return [
        { label: 'Approve', status: 'approved' },
        { label: 'Return to pending', status: 'pending' },
      ]
  }
}

export function EmployeeTimesheet({
  period,
  employeeName,
  jobTitle,
  shifts,
  overtimePolicy,
  statusResult,
  isSubmitting,
  onDismissStatusResult,
  onBackToOverview,
  onBackToPeriod,
  onEditShift,
  onChangeStatus,
}: EmployeeTimesheetProps) {
  const Components = useComponentContext()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const totals = sumHours(shifts.map(shift => shift.hours))
  const editableShifts = shifts.filter(shift => !isShiftLocked(shift, period))
  const pendingShiftIds = editableShifts
    .filter(shift => shift.status !== 'approved')
    .map(shift => shift.id)
  const selectedIds = [...selected].filter(id => editableShifts.some(shift => shift.id === id))
  const breakPolicies = useMemo(() => distinctBreakPolicies(shifts), [shifts])

  const changeStatus = (ids: string[], status: TimesheetStatus) => {
    onChangeStatus(ids, status)
    setSelected(new Set())
  }

  const dataViewProps = useDataView<Shift>({
    data: shifts,
    columns: [
      {
        key: 'date',
        title: 'Date',
        render: shift => formatDayWithWeekday(shift.date),
      },
      {
        key: 'shift',
        title: 'Shift',
        render: shift => (
          <Flex flexDirection="column" gap={2}>
            <Components.Text>
              {shift.endTime
                ? `${formatTimeInZone(shift.startTime, shift.timeZone)} – ${formatTimeInZone(shift.endTime, shift.timeZone)}`
                : `${formatTimeInZone(shift.startTime, shift.timeZone)} – In progress`}
            </Components.Text>
            <Components.Text size="sm" variant="supporting">
              {formatTimeZoneAbbreviation(shift.startTime, shift.timeZone)}
            </Components.Text>
          </Flex>
        ),
      },
      {
        key: 'breaks',
        title: 'Breaks',
        render: shift =>
          shift.breaks.length === 0 ? (
            '—'
          ) : (
            <Flex flexDirection="column" gap={2}>
              {shift.breaks.map(shiftBreak => (
                <Components.Text key={shiftBreak.id} size="sm">
                  {`${breakTypeLabel(shiftBreak.breakType)} ${formatTimeInZone(shiftBreak.startTime, shift.timeZone)} – ${formatTimeInZone(shiftBreak.endTime, shift.timeZone)}`}
                </Components.Text>
              ))}
            </Flex>
          ),
      },
      {
        key: 'hours',
        title: 'Hours',
        justify: 'end',
        render: shift => (
          <Flex flexDirection="column" gap={2} alignItems="flex-end">
            <Components.Text>{formatHours(shift.hours.total)}</Components.Text>
            {shift.hours.overtime + shift.hours.doubleOvertime > 0 ? (
              <Components.Text size="sm" variant="supporting">
                {[
                  shift.hours.overtime > 0 ? `${shift.hours.overtime.toFixed(2)} OT` : null,
                  shift.hours.doubleOvertime > 0
                    ? `${shift.hours.doubleOvertime.toFixed(2)} DOT`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Components.Text>
            ) : null}
          </Flex>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        render: shift => (
          <Flex flexDirection="column" gap={2}>
            <Components.Badge status={STATUS_BADGE[shift.status]}>
              {STATUS_LABELS[shift.status]}
            </Components.Badge>
            {shift.syncedToPayrollAt ? (
              <Components.Text size="sm" variant="supporting">
                Synced to payroll
              </Components.Text>
            ) : null}
          </Flex>
        ),
      },
    ],
    onSelect: (shift, checked) => {
      setSelected(prev => {
        const next = new Set(prev)
        if (checked) next.add(shift.id)
        else next.delete(shift.id)
        return next
      })
    },
    onSelectAll: (checked, visible) => {
      setSelected(
        checked
          ? new Set(visible.filter(shift => !isShiftLocked(shift, period)).map(shift => shift.id))
          : new Set(),
      )
    },
    getIsItemSelected: shift => selected.has(shift.id),
    itemMenu: shift =>
      isShiftLocked(shift, period) ? null : (
        <HamburgerMenu
          triggerLabel={`Actions for ${formatDayWithWeekday(shift.date)}`}
          items={[
            {
              label: 'Edit shift',
              onClick: () => {
                onEditShift(shift.id)
              },
            },
            ...statusActions(shift).map(action => ({
              label: action.label,
              onClick: () => {
                changeStatus([shift.id], action.status)
              },
            })),
          ]}
        />
      ),
    emptyState: () => (
      <EmptyData
        title="No shifts this pay period"
        description={`${employeeName} hasn’t tracked any hours for this pay period.`}
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={20} alignItems="stretch">
      <Components.Breadcrumbs
        breadcrumbs={[
          { id: 'overview', label: 'Time tracking', isClickable: true },
          {
            id: 'period',
            label: formatPeriodRange(period.startDate, period.endDate),
            isClickable: true,
          },
          { id: 'employee', label: employeeName },
        ]}
        currentBreadcrumbId="employee"
        onClick={id => {
          if (id === 'overview') onBackToOverview()
          if (id === 'period') onBackToPeriod()
        }}
      />

      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-end" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">{employeeName}</Components.Heading>
          <Components.Text variant="supporting">
            {[jobTitle, formatPeriodRange(period.startDate, period.endDate)]
              .filter(Boolean)
              .join(' · ')}
          </Components.Text>
        </Flex>
        {editableShifts.length > 0 ? (
          <Flex flexDirection="row" gap={8} justifyContent="flex-end">
            {selectedIds.length > 0 ? (
              <>
                <Components.Button
                  variant="secondary"
                  isDisabled={isSubmitting}
                  onClick={() => {
                    changeStatus(selectedIds, 'pending')
                  }}
                >
                  Return to pending
                </Components.Button>
                <Components.Button
                  variant="secondary"
                  isDisabled={isSubmitting}
                  onClick={() => {
                    changeStatus(selectedIds, 'rejected')
                  }}
                >
                  {`Reject (${selectedIds.length})`}
                </Components.Button>
                <Components.Button
                  isLoading={isSubmitting}
                  onClick={() => {
                    changeStatus(selectedIds, 'approved')
                  }}
                >
                  {`Approve (${selectedIds.length})`}
                </Components.Button>
              </>
            ) : (
              <Components.Button
                isLoading={isSubmitting}
                isDisabled={pendingShiftIds.length === 0}
                onClick={() => {
                  changeStatus(pendingShiftIds, 'approved')
                }}
              >
                Approve all hours
              </Components.Button>
            )}
          </Flex>
        ) : null}
      </Flex>

      {period.isPayrollProcessed ? (
        <Components.Alert status="info" label="Payroll for this pay period has been processed">
          <Components.Text>
            These hours have been paid and can no longer be changed.
          </Components.Text>
        </Components.Alert>
      ) : null}

      {statusResult ? (
        <BulkActionResultAlert result={statusResult} onDismiss={onDismissStatusResult} />
      ) : null}

      <Components.Box withPadding>
        <Grid gap={16} gridTemplateColumns={{ base: '1fr 1fr', small: 'repeat(5, 1fr)' }}>
          <HoursStat label="Regular" hours={totals.regular} />
          <HoursStat label="Overtime" hours={totals.overtime} />
          <HoursStat label="Double overtime" hours={totals.doubleOvertime} />
          <HoursStat label="Not yet classified" hours={totals.unclassified} />
          <HoursStat label="Total" hours={totals.total} isEmphasized />
        </Grid>
      </Components.Box>

      <DataView label={`Shifts for ${employeeName}`} {...dataViewProps} />

      <RulesApplied overtimePolicy={overtimePolicy} breakPolicies={breakPolicies} />
    </Flex>
  )
}

function HoursStat({
  label,
  hours,
  isEmphasized,
}: {
  label: string
  hours: number
  isEmphasized?: boolean
}) {
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Text variant="supporting" size="sm">
        {label}
      </Components.Text>
      <Components.Text size="lg" weight={isEmphasized ? 'bold' : 'semibold'}>
        {formatHoursOrDash(hours)}
      </Components.Text>
    </Flex>
  )
}

function breakTypeLabel(breakType: 'meal' | 'rest' | null): string {
  if (breakType === 'meal') return 'Meal'
  if (breakType === 'rest') return 'Rest'
  return 'Break'
}

function distinctBreakPolicies(shifts: Shift[]): AppliedBreakPolicy[] {
  const byName = new Map<string, AppliedBreakPolicy>()
  for (const shift of shifts) {
    if (shift.breakPolicy && !byName.has(shift.breakPolicy.name)) {
      byName.set(shift.breakPolicy.name, shift.breakPolicy)
    }
  }
  return [...byName.values()]
}

function RulesApplied({
  overtimePolicy,
  breakPolicies,
}: {
  overtimePolicy: OvertimePolicy | null
  breakPolicies: AppliedBreakPolicy[]
}) {
  const Components = useComponentContext()

  return (
    <Components.Box
      withPadding
      header={
        <Flex flexDirection="column" gap={2}>
          <Components.Heading as="h3">Rules applied</Components.Heading>
          <Components.Text variant="supporting">
            The overtime and break rules used to calculate these hours.
          </Components.Text>
        </Flex>
      }
    >
      <DescriptionList
        items={[
          {
            term: 'Overtime policy',
            description: overtimePolicy ? (
              <Flex flexDirection="column" gap={2}>
                <Components.Text>{overtimePolicy.name}</Components.Text>
                <Components.Text size="sm" variant="supporting">
                  {`Overtime: ${summarizeOvertimePolicy(overtimePolicy)}`}
                </Components.Text>
                <Components.Text size="sm" variant="supporting">
                  {`Double overtime: ${summarizeDoubleOvertime(overtimePolicy)}`}
                </Components.Text>
              </Flex>
            ) : (
              <Components.Text>Not assigned</Components.Text>
            ),
          },
          {
            term: 'Break policy',
            description:
              breakPolicies.length === 0 ? (
                <Components.Text>Not assigned</Components.Text>
              ) : (
                <Flex flexDirection="column" gap={8}>
                  {breakPolicies.map(policy => (
                    <Flex key={policy.name} flexDirection="column" gap={2}>
                      <Components.Text>
                        {policy.jurisdiction
                          ? `${policy.name} (${policy.jurisdiction})`
                          : policy.name}
                      </Components.Text>
                      {policy.rules.map(rule => (
                        <Components.Text key={rule.breakType} size="sm" variant="supporting">
                          {summarizeBreakRule(rule)}
                        </Components.Text>
                      ))}
                      <Components.Text size="sm" variant="supporting">
                        {policy.payPremium
                          ? 'A premium is paid when a required break is missed.'
                          : 'No premium for missed breaks.'}
                      </Components.Text>
                    </Flex>
                  ))}
                </Flex>
              ),
          },
        ]}
      />
    </Components.Box>
  )
}
