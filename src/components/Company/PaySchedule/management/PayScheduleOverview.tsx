import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import { PayScheduleOverviewPresentation } from './PayScheduleOverviewPresentation'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

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
  const schedules = paySchedules.payScheduleShowResponse ?? []
  // Prefer the schedule with employees assigned to it over an unassigned leftover — relevant if
  // enableMultipleSchedules was previously on and is now off, leaving more than one schedule behind.
  const schedule = schedules.find(s => s.active) ?? schedules[0]

  return (
    <PayScheduleOverviewPresentation
      schedule={schedule}
      enableAutoPilot={enableAutoPilot}
      enableMultipleSchedules={enableMultipleSchedules}
      onEditSchedule={() => {
        onEvent(componentEvents.PAY_SCHEDULE_UPDATE, { uuid: schedule?.uuid })
      }}
      onManageAssignment={() => {
        onEvent(componentEvents.PAY_SCHEDULE_MANAGE_ASSIGNMENT)
      }}
      onEditAutoPilot={() => {
        onEvent(componentEvents.AUTO_PILOT_EDIT, { uuid: schedule?.uuid })
      }}
    />
  )
}
