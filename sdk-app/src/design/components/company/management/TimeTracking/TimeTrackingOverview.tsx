import type { ReactNode } from 'react'
import type { BreakPolicy, OvertimePolicy, PayPeriodSummary, SelectOption } from './types'
import {
  formatDate,
  formatEmployeeCount,
  formatHours,
  formatPeriodRange,
  summarizeBreakRule,
  summarizeDoubleOvertime,
  summarizeOvertimePolicy,
} from './formatters'
import { DataView, EmptyData, Flex, Grid, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface TimeTrackingOverviewProps {
  currentPeriod: PayPeriodSummary | null
  pastPeriods: PayPeriodSummary[]
  overtimePolicies: OvertimePolicy[]
  breakPolicies: BreakPolicy[]
  overtimePoliciesError?: string | null
  breakPoliciesError?: string | null
  unassignedEmployeeCount: number
  isLoadingTimesheets?: boolean
  paySchedules?: SelectOption[]
  selectedPayScheduleId?: string
  onPayScheduleChange?: (payScheduleId: string) => void
  onReviewPeriod: (periodId: string) => void
  onAddOvertimePolicy: () => void
  onEditOvertimePolicy: (policyId: string) => void
  onAssignOvertimePolicy: (policyId: string) => void
  onAddBreakPolicy: () => void
  onEditBreakPolicy: (policyId: string) => void
  onAssignBreakPolicy: (policyId: string) => void
}

export function TimeTrackingOverview({
  currentPeriod,
  pastPeriods,
  overtimePolicies,
  breakPolicies,
  overtimePoliciesError,
  breakPoliciesError,
  unassignedEmployeeCount,
  isLoadingTimesheets,
  paySchedules,
  selectedPayScheduleId,
  onPayScheduleChange,
  onReviewPeriod,
  onAddOvertimePolicy,
  onEditOvertimePolicy,
  onAssignOvertimePolicy,
  onAddBreakPolicy,
  onEditBreakPolicy,
  onAssignBreakPolicy,
}: TimeTrackingOverviewProps) {
  const Components = useComponentContext()
  const needsOvertimeSetup = !overtimePoliciesError && overtimePolicies.length === 0

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Flex flexDirection="row" justifyContent="space-between" alignItems="flex-end" gap={16}>
        <Flex flexDirection="column" gap={4}>
          <Components.Heading as="h2">Time tracking</Components.Heading>
          <Components.Text variant="supporting">
            Review hours for each pay period and manage the overtime and break rules applied to
            them.
          </Components.Text>
        </Flex>
        {paySchedules && paySchedules.length > 1 && onPayScheduleChange ? (
          <Components.Select
            label="Pay schedule"
            placeholder="Select a pay schedule"
            options={paySchedules}
            value={selectedPayScheduleId}
            onChange={onPayScheduleChange}
          />
        ) : null}
      </Flex>

      {needsOvertimeSetup ? (
        <Components.Alert
          status="info"
          label="Set up an overtime policy to start tracking time"
          action={
            <Components.Button onClick={onAddOvertimePolicy}>Add overtime policy</Components.Button>
          }
        >
          <Components.Text>
            Employees must be assigned to an overtime policy before their hours can be submitted.
          </Components.Text>
        </Components.Alert>
      ) : unassignedEmployeeCount > 0 ? (
        <Components.Alert
          status="warning"
          label={`${formatEmployeeCount(unassignedEmployeeCount)} ${unassignedEmployeeCount === 1 ? 'isn’t' : 'aren’t'} assigned to an overtime policy`}
        >
          <Components.Text>
            Hours can’t be submitted for these employees until they’re assigned to an overtime
            policy.
          </Components.Text>
        </Components.Alert>
      ) : null}

      <CurrentPeriodCard
        period={currentPeriod}
        isLoading={isLoadingTimesheets}
        onReview={onReviewPeriod}
      />

      <TimesheetHistory periods={pastPeriods} onReviewPeriod={onReviewPeriod} />

      <OvertimePoliciesSection
        policies={overtimePolicies}
        error={overtimePoliciesError}
        onAdd={onAddOvertimePolicy}
        onEdit={onEditOvertimePolicy}
        onAssign={onAssignOvertimePolicy}
      />

      <BreakPoliciesSection
        policies={breakPolicies}
        error={breakPoliciesError}
        onAdd={onAddBreakPolicy}
        onEdit={onEditBreakPolicy}
        onAssign={onAssignBreakPolicy}
      />
    </Flex>
  )
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description: ReactNode
  action?: ReactNode
}) {
  const Components = useComponentContext()
  return (
    <Flex flexDirection="row" justifyContent="space-between" alignItems="center" gap={16}>
      <Flex flexDirection="column" gap={2}>
        <Components.Heading as="h3">{title}</Components.Heading>
        <Components.Text variant="supporting">{description}</Components.Text>
      </Flex>
      {action}
    </Flex>
  )
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  const Components = useComponentContext()
  return (
    <Flex flexDirection="column" gap={4}>
      <Components.Text variant="supporting" size="sm">
        {label}
      </Components.Text>
      <Components.Text size="lg" weight="semibold">
        {value}
      </Components.Text>
    </Flex>
  )
}

function CurrentPeriodCard({
  period,
  isLoading,
  onReview,
}: {
  period: PayPeriodSummary | null
  isLoading?: boolean
  onReview: (periodId: string) => void
}) {
  const Components = useComponentContext()

  if (!period) {
    return (
      <Components.Box
        withPadding
        header={
          <SectionHeader title="Current pay period" description="No open pay period found." />
        }
      >
        <EmptyData
          title="No current pay period"
          description="Timesheets appear here once a pay schedule has an open pay period."
        />
      </Components.Box>
    )
  }

  return (
    <Components.Box
      withPadding
      header={
        <SectionHeader
          title="Current pay period"
          description={`${formatPeriodRange(period.startDate, period.endDate)} · Payday ${formatDate(period.checkDate)}`}
          action={
            <Components.Button
              onClick={() => {
                onReview(period.id)
              }}
            >
              Review timesheets
            </Components.Button>
          }
        />
      }
    >
      {isLoading ? (
        <Components.Text variant="supporting">Loading timesheets…</Components.Text>
      ) : (
        <Grid gap={16} gridTemplateColumns={{ base: '1fr 1fr', small: 'repeat(4, 1fr)' }}>
          <Stat label="Needs review" value={period.statusCounts.pending} />
          <Stat label="Approved" value={period.statusCounts.approved} />
          <Stat label="Rejected" value={period.statusCounts.rejected} />
          <Stat label="Total hours" value={formatHours(period.hours.total)} />
        </Grid>
      )}
    </Components.Box>
  )
}

function PeriodStatusBadge({ period }: { period: PayPeriodSummary }) {
  const Components = useComponentContext()
  if (period.isPayrollProcessed) {
    return <Components.Badge status="info">Payroll processed</Components.Badge>
  }
  if (period.timesheetCount === 0) {
    return <Components.Badge status="info">No hours</Components.Badge>
  }
  if (period.statusCounts.pending > 0) {
    return (
      <Components.Badge status="warning">{`${period.statusCounts.pending} need review`}</Components.Badge>
    )
  }
  if (period.statusCounts.rejected > 0) {
    return (
      <Components.Badge status="error">{`${period.statusCounts.rejected} rejected`}</Components.Badge>
    )
  }
  return <Components.Badge status="success">All approved</Components.Badge>
}

function TimesheetHistory({
  periods,
  onReviewPeriod,
}: {
  periods: PayPeriodSummary[]
  onReviewPeriod: (periodId: string) => void
}) {
  const Components = useComponentContext()

  const dataViewProps = useDataView<PayPeriodSummary>({
    data: periods,
    columns: [
      { title: 'Pay period', render: row => formatPeriodRange(row.startDate, row.endDate) },
      { title: 'Payday', render: row => formatDate(row.checkDate) },
      { title: 'Employees', render: row => row.employeeCount },
      { title: 'Total hours', render: row => formatHours(row.hours.total), justify: 'end' },
      { title: 'Status', render: row => <PeriodStatusBadge period={row} /> },
    ],
    itemMenu: row => (
      <HamburgerMenu
        triggerLabel="Pay period actions"
        items={[
          {
            label: 'View timesheets',
            onClick: () => {
              onReviewPeriod(row.id)
            },
          },
        ]}
      />
    ),
    emptyState: () => (
      <EmptyData
        title="No past pay periods"
        description="Timesheets from previous pay periods will appear here for your records."
      />
    ),
  })

  return (
    <Components.Box
      withPadding={false}
      header={
        <SectionHeader
          title="Timesheet history"
          description="Timesheets from previous pay periods."
        />
      }
    >
      <DataView label="Timesheet history" isWithinBox {...dataViewProps} />
    </Components.Box>
  )
}

function PolicyUnavailable({ message }: { message: string }) {
  const Components = useComponentContext()
  return (
    <Components.Alert status="warning" label="Policies couldn’t be loaded">
      <Components.Text>{message}</Components.Text>
    </Components.Alert>
  )
}

function OvertimePoliciesSection({
  policies,
  error,
  onAdd,
  onEdit,
  onAssign,
}: {
  policies: OvertimePolicy[]
  error?: string | null
  onAdd: () => void
  onEdit: (policyId: string) => void
  onAssign: (policyId: string) => void
}) {
  const Components = useComponentContext()

  const dataViewProps = useDataView<OvertimePolicy>({
    data: policies,
    columns: [
      { title: 'Policy', render: row => row.name },
      { title: 'Overtime after', render: row => summarizeOvertimePolicy(row) },
      { title: 'Double overtime', render: row => summarizeDoubleOvertime(row) },
      { title: 'Employees', render: row => formatEmployeeCount(row.employeeUuids.length) },
    ],
    itemMenu: row => (
      <HamburgerMenu
        triggerLabel="Overtime policy actions"
        items={[
          {
            label: 'Edit policy',
            onClick: () => {
              onEdit(row.id)
            },
          },
          {
            label: 'Manage employees',
            onClick: () => {
              onAssign(row.id)
            },
          },
        ]}
      />
    ),
    emptyState: () => (
      <EmptyData
        title="No overtime policies yet"
        description="Add an overtime policy to set when hours count as overtime or double overtime."
      >
        <Components.Button variant="secondary" onClick={onAdd}>
          Add overtime policy
        </Components.Button>
      </EmptyData>
    ),
  })

  return (
    <Components.Box
      withPadding={Boolean(error)}
      header={
        <SectionHeader
          title="Overtime policies"
          description="When hours become overtime or double overtime."
          action={
            policies.length > 0 ? (
              <Components.Button variant="secondary" onClick={onAdd}>
                Add policy
              </Components.Button>
            ) : undefined
          }
        />
      }
    >
      {error ? (
        <PolicyUnavailable message={error} />
      ) : (
        <DataView label="Overtime policies" isWithinBox {...dataViewProps} />
      )}
    </Components.Box>
  )
}

function BreakPoliciesSection({
  policies,
  error,
  onAdd,
  onEdit,
  onAssign,
}: {
  policies: BreakPolicy[]
  error?: string | null
  onAdd: () => void
  onEdit: (policyId: string) => void
  onAssign: (policyId: string) => void
}) {
  const Components = useComponentContext()

  const dataViewProps = useDataView<BreakPolicy>({
    data: policies,
    columns: [
      { title: 'Policy', render: row => row.name },
      { title: 'State', render: row => row.jurisdiction ?? 'All states' },
      {
        title: 'Rules',
        render: row => (
          <Flex flexDirection="column" gap={2}>
            {row.rules.map(rule => (
              <Components.Text key={rule.breakType} size="sm">
                {summarizeBreakRule(rule)}
              </Components.Text>
            ))}
          </Flex>
        ),
      },
      { title: 'Premium', render: row => (row.payPremium ? 'Paid' : 'Not paid') },
      { title: 'Employees', render: row => formatEmployeeCount(row.employeeUuids.length) },
    ],
    itemMenu: row => (
      <HamburgerMenu
        triggerLabel="Break policy actions"
        items={[
          {
            label: 'Edit policy',
            onClick: () => {
              onEdit(row.id)
            },
          },
          {
            label: 'Manage employees',
            onClick: () => {
              onAssign(row.id)
            },
          },
        ]}
      />
    ),
    emptyState: () => (
      <EmptyData
        title="No break policies yet"
        description="Add a break policy to set meal and rest break rules for a state."
      >
        <Components.Button variant="secondary" onClick={onAdd}>
          Add break policy
        </Components.Button>
      </EmptyData>
    ),
  })

  return (
    <Components.Box
      withPadding={Boolean(error)}
      header={
        <SectionHeader
          title="Break policies"
          description="Meal and rest break rules, by state."
          action={
            policies.length > 0 ? (
              <Components.Button variant="secondary" onClick={onAdd}>
                Add policy
              </Components.Button>
            ) : undefined
          }
        />
      }
    >
      {error ? (
        <PolicyUnavailable message={error} />
      ) : (
        <DataView label="Break policies" isWithinBox {...dataViewProps} />
      )}
    </Components.Box>
  )
}
