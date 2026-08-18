import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { DescriptionList } from '../../../common/DescriptionList'
import type { PayScheduleType } from './PayScheduleTypeSelection'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface PaySchedulesListRow {
  id: string
  name: string
  frequency: string
  autoPilot: boolean
  employeeCount: number
}

interface PaySchedulesListProps {
  rows: PaySchedulesListRow[]
  assignmentType?: PayScheduleType | null
  onManage?: () => void
  onEdit?: (row: PaySchedulesListRow) => void
  onEditAutoPilot?: (row: PaySchedulesListRow) => void
  onManageEmployees?: (row: PaySchedulesListRow) => void
}

function EmptyState() {
  return (
    <EmptyData
      title="No pay schedules yet"
      description="Add a pay schedule to start paying employees on a recurring cadence."
    />
  )
}

function formatEmployeeCount(count: number): string {
  return `${count} ${count === 1 ? 'employee' : 'employees'}`
}

function assignmentModeDescription(type: PayScheduleType | null | undefined): string {
  switch (type) {
    case PayScheduleAssignmentBodyType.Single:
      return 'You have assigned everyone to be on one pay schedule.'
    case PayScheduleAssignmentBodyType.HourlySalaried:
      return 'You have assigned separate pay schedules for hourly and salaried employees.'
    case PayScheduleAssignmentBodyType.ByEmployee:
      return 'You have assigned pay schedules per employee.'
    case PayScheduleAssignmentBodyType.ByDepartment:
      return 'You have assigned separate pay schedules by department.'
    default:
      return 'Choose when and how employees get paid — each schedule can have its own settings and frequency.'
  }
}

export function PaySchedulesList({
  rows,
  assignmentType,
  onManage,
  onEdit,
  onEditAutoPilot,
  onManageEmployees,
}: PaySchedulesListProps) {
  const Components = useComponentContext()
  const hasMultiple = rows.length > 1
  const singleRow = rows.length === 1 ? rows[0]! : undefined
  const title = hasMultiple ? 'Pay schedules' : 'Pay schedule'

  const dataViewProps = useDataView<PaySchedulesListRow>({
    data: rows,
    columns: [
      {
        title: 'Schedule',
        render: row => (
          <>
            {row.name || '—'}
            <Components.Text variant="supporting" size="sm">
              {row.frequency}
            </Components.Text>
          </>
        ),
      },
      {
        title: 'AutoPilot',
        render: row => (
          <Components.Badge status={row.autoPilot ? 'success' : 'info'}>
            {row.autoPilot ? 'Enabled' : 'Disabled'}
          </Components.Badge>
        ),
      },
      {
        title: 'Employees',
        render: row => formatEmployeeCount(row.employeeCount),
      },
    ],
    itemMenu: row => (
      <HamburgerMenu
        triggerLabel="Pay schedule actions"
        items={[
          { label: 'Edit', onClick: () => onEdit?.(row) },
          { label: 'AutoPilot', onClick: () => onEditAutoPilot?.(row) },
          { label: 'Manage employees', onClick: () => onManageEmployees?.(row) },
        ]}
      />
    ),
    emptyState: () => <EmptyState />,
  })

  const manageAction =
    onManage != null ? (
      <Components.Button variant="secondary" onClick={onManage}>
        Manage
      </Components.Button>
    ) : null

  const singleEditAction =
    singleRow && onEdit ? (
      <Components.Button
        variant="tertiary"
        onClick={() => {
          onEdit(singleRow)
        }}
      >
        Edit
      </Components.Button>
    ) : undefined

  const singleAutoPilotAction =
    singleRow && onEditAutoPilot ? (
      <Components.Button
        variant="tertiary"
        onClick={() => {
          onEditAutoPilot(singleRow)
        }}
      >
        Edit
      </Components.Button>
    ) : undefined

  return (
    <Flex flexDirection="column" gap={12} alignItems="stretch">
      <Components.Text variant="supporting">
        {assignmentModeDescription(assignmentType)}
      </Components.Text>
      <Components.Box
        withPadding={!hasMultiple}
        header={
          <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
            <Components.Heading as="h3">{title}</Components.Heading>
            {manageAction}
          </Flex>
        }
      >
        {hasMultiple ? (
          <DataView label="Pay schedules" isWithinBox {...dataViewProps} />
        ) : singleRow ? (
          <DescriptionList
            items={[
              {
                term: 'Pay schedule',
                description: singleRow.name || '—',
                action: singleEditAction,
              },
              {
                term: 'Frequency',
                description: singleRow.frequency,
              },
              {
                term: 'AutoPilot',
                description: singleRow.autoPilot ? 'Enabled' : 'Disabled',
                action: singleAutoPilotAction,
              },
              {
                term: 'Employees',
                description: formatEmployeeCount(singleRow.employeeCount),
              },
            ]}
          />
        ) : (
          <EmptyState />
        )}
      </Components.Box>
    </Flex>
  )
}
