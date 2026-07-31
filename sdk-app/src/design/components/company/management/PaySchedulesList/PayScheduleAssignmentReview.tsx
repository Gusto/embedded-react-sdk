import { useMemo } from 'react'
import type { PayScheduleAssignmentPreview } from '@gusto/embedded-api/models/components/payscheduleassignmentpreview'
import type { PayScheduleAssignmentEmployeeChange } from '@gusto/embedded-api/models/components/payscheduleassignmentemployeechange'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { PayScheduleType } from './PayScheduleTypeSelection'
import { ActionsLayout, DataView, Flex, useDataView } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { FlsaStatus } from '@/shared/constants'

export interface PayScheduleAssignmentReviewProps {
  preview: PayScheduleAssignmentPreview | null
  assignmentType: PayScheduleType
  employeesList: Employee[]
  isLoading: boolean
  isSubmitting: boolean
  onConfirm: () => void
  onBack: () => void
}

function compensationTypeLabel(employee: Employee | undefined): string {
  if (!employee) return '—'
  const flsaStatus = employee.jobs?.[0]?.compensations?.[0]?.flsaStatus
  switch (flsaStatus) {
    case FlsaStatus.EXEMPT:
    case FlsaStatus.COMMISSION_ONLY_EXEMPT:
      return 'Salaried / Exempt'
    case FlsaStatus.NONEXEMPT:
      return 'Hourly / Nonexempt'
    case FlsaStatus.SALARIED_NONEXEMPT:
    case FlsaStatus.COMMISSION_ONLY_NONEXEMPT:
      return 'Salaried / Nonexempt'
    case FlsaStatus.OWNER:
      return 'Owner'
    default:
      return '—'
  }
}

export function PayScheduleAssignmentReview({
  preview,
  assignmentType,
  employeesList,
  isLoading,
  isSubmitting,
  onConfirm,
  onBack,
}: PayScheduleAssignmentReviewProps) {
  const Components = useComponentContext()
  const dateFormatter = useDateFormatter()

  const employeesByUuid = useMemo(
    () => new Map(employeesList.map(e => [e.uuid, e])),
    [employeesList],
  )

  const sortedChanges: PayScheduleAssignmentEmployeeChange[] = useMemo(() => {
    const rows = preview?.employeeChanges ?? []
    return [...rows].sort((a, b) =>
      (a.lastName ?? '').toLowerCase().localeCompare((b.lastName ?? '').toLowerCase()),
    )
  }, [preview?.employeeChanges])

  const isSingle = assignmentType === PayScheduleAssignmentBodyType.Single
  const hasChanges = sortedChanges.length > 0

  const columns = useMemo(() => {
    const cols: Array<{
      title: string
      render: (change: PayScheduleAssignmentEmployeeChange) => React.ReactNode
    }> = [
      {
        title: 'Name',
        render: change => `${change.firstName ?? ''} ${change.lastName ?? ''}`.trim() || '—',
      },
      {
        title: 'Type',
        render: change =>
          compensationTypeLabel(
            change.employeeUuid ? employeesByUuid.get(change.employeeUuid) : undefined,
          ),
      },
    ]
    if (!isSingle) {
      cols.push({
        title: 'New schedule',
        render: change => change.payFrequency ?? '—',
      })
    }
    cols.push({
      title: 'First pay date',
      render: change => {
        const checkDate = change.firstPayPeriod?.checkDate
        return checkDate ? dateFormatter.formatShort(checkDate) : '—'
      },
    })
    cols.push({
      title: 'Transition period',
      render: change => {
        const period = change.transitionPayPeriod
        if (!period?.startDate || !period.endDate) return 'No transition needed'
        return `${dateFormatter.formatShort(period.startDate)} – ${dateFormatter.formatShort(period.endDate)}`
      },
    })
    return cols
  }, [isSingle, employeesByUuid, dateFormatter])

  const dataViewProps = useDataView<PayScheduleAssignmentEmployeeChange>({
    data: sortedChanges,
    columns,
  })

  if (isLoading) {
    return (
      <Flex flexDirection="column" alignItems="center" justifyContent="center" gap={16}>
        <Components.LoadingSpinner />
        <Components.Text>Loading preview…</Components.Text>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={24} alignItems="stretch">
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">
          {hasChanges ? 'Review and submit your changes' : 'There are no changes to review.'}
        </Components.Heading>
        <Components.Text variant="supporting">
          {hasChanges
            ? 'Review the names and dates below before confirming your changes.'
            : 'If you intended to make changes, please go back and make them.'}
        </Components.Text>
      </Flex>
      {hasChanges && (
        <Flex flexDirection="column" gap={8} alignItems="stretch">
          <Components.Text variant="supporting" size="sm">
            <strong>Transition period</strong>: when you change an employee&rsquo;s pay schedule,
            there may be a gap between their last day on the old schedule and their first day on the
            new schedule. A transition payroll lets you pay employees for any workdays that fall
            during this gap.
          </Components.Text>
          <DataView label="Pay schedule assignment changes" {...dataViewProps} />
        </Flex>
      )}
      <ActionsLayout>
        <Components.Button variant="secondary" onClick={onBack}>
          Back
        </Components.Button>
        <Components.Button onClick={onConfirm} isLoading={isSubmitting}>
          Submit
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
