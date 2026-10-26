import { useDepartmentsGetAllSuspense } from '@gusto/embedded-api/react-query/departmentsGetAll'
import { useTranslation } from 'react-i18next'
import type { PayScheduleAssignment } from '@gusto/embedded-api/models/components/payscheduleassignment'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { usePaySchedulesGetAssignmentsSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAssignments'
import { PayScheduleAssignmentType } from '@gusto/embedded-api/models/components/payscheduleassignment'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import { PayScheduleEmployeeOverviewPresentation } from './PayScheduleEmployeeOverviewPresentation'
import { useAssignableEmployees } from './PayScheduleAssignment/useAssignableEmployees'
import { getCompanyDepartments } from './PayScheduleAssignment/departmentAccess'
import {
  PayScheduleDepartmentOverviewPresentation,
  type PayScheduleDepartmentRow,
} from './PayScheduleDepartmentOverviewPresentation'
import { PayScheduleOverviewPresentation } from './PayScheduleOverviewPresentation'
import type { PayScheduleCompensationRow } from './PayScheduleCompensationOverviewPresentation'
import { PayScheduleCompensationOverviewPresentation } from './PayScheduleCompensationOverviewPresentation'
import { BaseLayout } from '@/components/Base'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export interface PayScheduleOverviewProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
  enableAutoPilot?: boolean
  enableMultipleSchedules?: boolean
}

/** @internal */
export function PayScheduleOverview({
  companyId,
  onEvent,
  enableAutoPilot,
  enableMultipleSchedules,
}: PayScheduleOverviewProps) {
  const { data: paySchedules } = usePaySchedulesGetAllSuspense({ companyId })
  const { data: assignments } = usePaySchedulesGetAssignmentsSuspense({ companyId })
  const schedules = paySchedules.payScheduleShowResponse ?? []
  const assignment = assignments.payScheduleAssignment

  const editSchedule = (schedule: PayScheduleShow) => {
    onEvent(componentEvents.PAY_SCHEDULE_UPDATE, { uuid: schedule.uuid })
  }
  const editAutoPilot = (schedule: PayScheduleShow) => {
    onEvent(componentEvents.PAY_SCHEDULE_AUTO_PILOT_EDIT, { schedule })
  }
  const manageAssignment = () => {
    onEvent(componentEvents.PAY_SCHEDULE_MANAGE_ASSIGNMENT)
  }

  if (assignment?.type === PayScheduleAssignmentType.ByEmployee) {
    return (
      <PayScheduleEmployeeOverview
        companyId={companyId}
        assignment={assignment}
        schedules={schedules}
        enableAutoPilot={enableAutoPilot}
        enableMultipleSchedules={enableMultipleSchedules}
        onEditSchedule={editSchedule}
        onManageAssignment={manageAssignment}
        onEditAutoPilot={editAutoPilot}
      />
    )
  }

  if (assignment?.type === PayScheduleAssignmentType.ByDepartment) {
    return (
      <PayScheduleDepartmentOverview
        companyId={companyId}
        assignment={assignment}
        schedules={schedules}
        enableAutoPilot={enableAutoPilot}
        enableMultipleSchedules={enableMultipleSchedules}
        onEditSchedule={editSchedule}
        onManageAssignment={manageAssignment}
        onEditAutoPilot={editAutoPilot}
      />
    )
  }

  if (assignment?.type === PayScheduleAssignmentType.HourlySalaried) {
    /**
     * A uuid the assignment references but `paySchedulesGetAll` doesn't return has no schedule
     * to name, edit, or hand to the AutoPilot dialog, so its row is dropped rather than
     * rendered half-populated.
     */
    const rows = (
      [
        { compensationType: 'salaried', uuid: assignment.salariedPayScheduleUuid },
        { compensationType: 'hourly', uuid: assignment.hourlyPayScheduleUuid },
      ] as const
    ).flatMap<PayScheduleCompensationRow>(({ compensationType, uuid }) => {
      const schedule = schedules.find(s => s.uuid === uuid)
      return schedule ? [{ compensationType, schedule }] : []
    })

    return (
      <PayScheduleCompensationOverviewPresentation
        rows={rows}
        enableAutoPilot={enableAutoPilot}
        enableMultipleSchedules={enableMultipleSchedules}
        onEditSchedule={editSchedule}
        onManageAssignment={manageAssignment}
        onEditAutoPilot={editAutoPilot}
      />
    )
  }

  /**
   * Prefer the schedule with employees assigned to it over an unassigned leftover — relevant
   * if enableMultipleSchedules was previously on and is now off, leaving more than one schedule
   * behind. PaySchedule.tsx only routes here once it's confirmed at least one schedule exists.
   */
  const schedule = ensureRequired(schedules.find(s => s.active) ?? schedules[0])

  return (
    <PayScheduleOverviewPresentation
      schedule={schedule}
      enableAutoPilot={enableAutoPilot}
      enableMultipleSchedules={enableMultipleSchedules}
      onEditSchedule={() => {
        editSchedule(schedule)
      }}
      onManageAssignment={manageAssignment}
      onEditAutoPilot={() => {
        editAutoPilot(schedule)
      }}
    />
  )
}

function PayScheduleDepartmentOverview({
  companyId,
  assignment,
  schedules,
  ...props
}: {
  companyId: string
  assignment: PayScheduleAssignment
  schedules: PayScheduleShow[]
} & Omit<React.ComponentProps<typeof PayScheduleDepartmentOverviewPresentation>, 'rows'>) {
  const { data } = useDepartmentsGetAllSuspense({ companyUuid: companyId })
  const { t } = useTranslation('Company.Management.PaySchedule')
  const rows = getCompanyDepartments(data.departmentList).flatMap<PayScheduleDepartmentRow>(
    department => {
      const uuid =
        assignment.departments?.find(selection => selection.departmentUuid === department.uuid)
          ?.payScheduleUuid ?? assignment.defaultPayScheduleUuid
      const schedule = schedules.find(schedule => schedule.uuid === uuid)
      return schedule
        ? [{ departmentName: department.title ?? t('unnamedDepartment'), schedule }]
        : []
    },
  )
  const defaultSchedule = schedules.find(
    schedule => schedule.uuid === assignment.defaultPayScheduleUuid,
  )
  if (defaultSchedule)
    rows.push({ departmentName: t('uncategorizedEmployees'), schedule: defaultSchedule })
  return <PayScheduleDepartmentOverviewPresentation rows={rows} {...props} />
}

function PayScheduleEmployeeOverview({
  companyId,
  assignment,
  schedules,
  ...props
}: {
  companyId: string
  assignment: PayScheduleAssignment
  schedules: PayScheduleShow[]
} & Omit<React.ComponentProps<typeof PayScheduleEmployeeOverviewPresentation>, 'rows'>) {
  const roster = useAssignableEmployees(companyId)
  if (roster.status === 'loading') return <BaseLayout isLoading />
  if (roster.accessDenied)
    return <PayScheduleEmployeeOverviewPresentation rows={[]} accessDenied {...props} />
  const counts = new Map<string, number>()
  for (const employee of roster.employees) {
    const uuid =
      assignment.employees?.find(entry => entry.employeeUuid === employee.uuid)?.payScheduleUuid ??
      assignment.defaultPayScheduleUuid
    if (uuid) counts.set(uuid, (counts.get(uuid) ?? 0) + 1)
  }
  const rows = schedules.flatMap(schedule => {
    const employeeCount = counts.get(schedule.uuid) ?? 0
    return employeeCount > 0 ? [{ schedule, employeeCount }] : []
  })
  return <PayScheduleEmployeeOverviewPresentation rows={rows} {...props} />
}
