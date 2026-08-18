import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { DescriptionList } from '../../../common/DescriptionList'
import type { PayScheduleType } from './PayScheduleTypeSelection'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu/HamburgerMenu'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ScheduleFields {
  scheduleId: string
  scheduleName: string
  frequency: string
  autoPilot: boolean
}

export type SingleSummary = ScheduleFields

export interface CompensationRow extends ScheduleFields {
  id: 'salaried' | 'hourly'
  classification: 'Salaried' | 'Hourly'
  employeeCount: number
  canEditAutoPilot: boolean
}

export interface DepartmentRow extends ScheduleFields {
  id: string
  departmentName: string
  employeeCount: number
}

export interface ByEmployeeRow extends ScheduleFields {
  id: string
  employeeCount: number
}

export type PaySchedulesListData =
  | { type: 'single'; summary: SingleSummary }
  | { type: 'compensation'; rows: CompensationRow[] }
  | { type: 'department'; rows: DepartmentRow[] }
  | { type: 'byEmployee'; rows: ByEmployeeRow[] }
  | { type: 'empty' }

interface PaySchedulesListProps {
  data: PaySchedulesListData
  assignmentType?: PayScheduleType | null
  onManage?: () => void
  onEditSchedule?: (scheduleId: string) => void
  onEditAutoPilot?: (scheduleId: string) => void
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
  data,
  assignmentType,
  onManage,
  onEditSchedule,
  onEditAutoPilot,
}: PaySchedulesListProps) {
  const Components = useComponentContext()

  const manageAction =
    onManage != null ? (
      <Components.Button variant="secondary" onClick={onManage}>
        Manage
      </Components.Button>
    ) : null

  return (
    <Components.Box
      withPadding={data.type === 'single'}
      header={
        <Flex flexDirection="row" justifyContent="space-between" alignItems="center">
          <Flex flexDirection="column" gap={2}>
            <Components.Heading as="h3">Pay schedule</Components.Heading>
            <Components.Text variant="supporting">
              {assignmentModeDescription(assignmentType)}
            </Components.Text>
          </Flex>
          {manageAction}
        </Flex>
      }
    >
      {data.type === 'single' ? (
        <SingleView
          summary={data.summary}
          onEditSchedule={onEditSchedule}
          onEditAutoPilot={onEditAutoPilot}
        />
      ) : data.type === 'compensation' ? (
        <CompensationView
          rows={data.rows}
          onEditSchedule={onEditSchedule}
          onEditAutoPilot={onEditAutoPilot}
        />
      ) : data.type === 'department' ? (
        <DepartmentView
          rows={data.rows}
          onEditSchedule={onEditSchedule}
          onEditAutoPilot={onEditAutoPilot}
        />
      ) : data.type === 'byEmployee' ? (
        <ByEmployeeView
          rows={data.rows}
          onEditSchedule={onEditSchedule}
          onEditAutoPilot={onEditAutoPilot}
        />
      ) : (
        <EmptyState />
      )}
    </Components.Box>
  )
}

function SingleView({
  summary,
  onEditSchedule,
  onEditAutoPilot,
}: {
  summary: SingleSummary
  onEditSchedule?: (scheduleId: string) => void
  onEditAutoPilot?: (scheduleId: string) => void
}) {
  const Components = useComponentContext()

  const editAction = onEditSchedule ? (
    <Components.Button
      variant="tertiary"
      onClick={() => {
        onEditSchedule(summary.scheduleId)
      }}
    >
      Edit
    </Components.Button>
  ) : undefined

  const autoPilotAction = onEditAutoPilot ? (
    <Components.Button
      variant="tertiary"
      onClick={() => {
        onEditAutoPilot(summary.scheduleId)
      }}
    >
      Edit
    </Components.Button>
  ) : undefined

  return (
    <DescriptionList
      items={[
        {
          term: 'Name',
          description: summary.scheduleName || '—',
          action: editAction,
        },
        {
          term: 'Frequency',
          description: summary.frequency,
        },
        {
          term: 'AutoPilot',
          description: summary.autoPilot ? 'Enabled' : 'Disabled',
          action: autoPilotAction,
        },
      ]}
    />
  )
}

function AutoPilotBadge({ enabled }: { enabled: boolean }) {
  const Components = useComponentContext()
  return (
    <Components.Badge status={enabled ? 'success' : 'info'}>
      {enabled ? 'Enabled' : 'Disabled'}
    </Components.Badge>
  )
}

function scheduleRowMenu(
  scheduleId: string,
  onEditSchedule?: (scheduleId: string) => void,
  onEditAutoPilot?: (scheduleId: string) => void,
) {
  const items: Array<{ label: string; onClick: () => void }> = []
  if (onEditSchedule) {
    items.push({
      label: 'Edit schedule',
      onClick: () => {
        onEditSchedule(scheduleId)
      },
    })
  }
  if (onEditAutoPilot) {
    items.push({
      label: 'AutoPilot',
      onClick: () => {
        onEditAutoPilot(scheduleId)
      },
    })
  }
  if (items.length === 0) return null
  return <HamburgerMenu triggerLabel="Row actions" items={items} />
}

function CompensationView({
  rows,
  onEditSchedule,
  onEditAutoPilot,
}: {
  rows: CompensationRow[]
  onEditSchedule?: (scheduleId: string) => void
  onEditAutoPilot?: (scheduleId: string) => void
}) {
  const dataViewProps = useDataView<CompensationRow>({
    data: rows,
    columns: [
      {
        title: 'Schedule',
        render: row => (
          <>
            {row.classification}
            <ScheduleSubline name={row.scheduleName} />
          </>
        ),
      },
      { title: 'Frequency', render: row => row.frequency },
      { title: 'Employees', render: row => formatEmployeeCount(row.employeeCount) },
      { title: 'AutoPilot', render: row => <AutoPilotBadge enabled={row.autoPilot} /> },
    ],
    itemMenu: row =>
      scheduleRowMenu(
        row.scheduleId,
        onEditSchedule,
        row.canEditAutoPilot ? onEditAutoPilot : undefined,
      ),
  })

  return <DataView label="Pay schedules by compensation type" isWithinBox {...dataViewProps} />
}

function DepartmentView({
  rows,
  onEditSchedule,
  onEditAutoPilot,
}: {
  rows: DepartmentRow[]
  onEditSchedule?: (scheduleId: string) => void
  onEditAutoPilot?: (scheduleId: string) => void
}) {
  const dataViewProps = useDataView<DepartmentRow>({
    data: rows,
    columns: [
      { title: 'Department', render: row => row.departmentName },
      { title: 'Schedule', render: row => row.scheduleName || '—' },
      { title: 'Frequency', render: row => row.frequency },
      { title: 'Employees', render: row => formatEmployeeCount(row.employeeCount) },
      { title: 'AutoPilot', render: row => <AutoPilotBadge enabled={row.autoPilot} /> },
    ],
    itemMenu: row => scheduleRowMenu(row.scheduleId, onEditSchedule, onEditAutoPilot),
  })

  return <DataView label="Pay schedules by department" isWithinBox {...dataViewProps} />
}

function ByEmployeeView({
  rows,
  onEditSchedule,
  onEditAutoPilot,
}: {
  rows: ByEmployeeRow[]
  onEditSchedule?: (scheduleId: string) => void
  onEditAutoPilot?: (scheduleId: string) => void
}) {
  const dataViewProps = useDataView<ByEmployeeRow>({
    data: rows,
    columns: [
      { title: 'Schedule', render: row => row.scheduleName || '—' },
      { title: 'Frequency', render: row => row.frequency },
      { title: 'Employees', render: row => formatEmployeeCount(row.employeeCount) },
      { title: 'AutoPilot', render: row => <AutoPilotBadge enabled={row.autoPilot} /> },
    ],
    itemMenu: row => scheduleRowMenu(row.scheduleId, onEditSchedule, onEditAutoPilot),
  })

  return <DataView label="Pay schedules by employee" isWithinBox {...dataViewProps} />
}

function ScheduleSubline({ name }: { name: string }) {
  const Components = useComponentContext()
  if (!name) return null
  return (
    <Components.Text variant="supporting" size="sm">
      {name}
    </Components.Text>
  )
}
