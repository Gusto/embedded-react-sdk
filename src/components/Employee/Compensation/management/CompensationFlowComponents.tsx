import type { Job } from '@gusto/embedded-api/models/components/job'
import type { Compensation } from '@gusto/embedded-api/models/components/compensation'
import { ListView } from './ListView'
import { EditCompensation } from './EditCompensation'
import { AddJob } from './AddJob'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, type EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [componentEvents.EMPLOYEE_COMPENSATION_EDIT]: { jobId: string; compensationId: string }
  [componentEvents.EMPLOYEE_COMPENSATION_CHANGE_CANCELLED]: {
    jobId?: string
    compensationId: string
  }
  [componentEvents.EMPLOYEE_COMPENSATION_UPDATED]: Compensation
  [componentEvents.EMPLOYEE_COMPENSATION_CANCEL]: undefined
  [componentEvents.EMPLOYEE_JOB_ADD]: undefined
  [componentEvents.EMPLOYEE_JOB_CREATED]: Job
  [componentEvents.EMPLOYEE_JOB_UPDATED]: Job
  [componentEvents.EMPLOYEE_JOB_DELETED]: { jobId: string }
}

export interface ManagementCompensationFlowContextInterface extends FlowContextInterface {
  employeeId: string
  hireDate: string
  currentJobId: string | null
  currentCompensationId: string | null
}

export function ListViewContextual() {
  const { employeeId, onEvent } = useFlow<ManagementCompensationFlowContextInterface>()
  return <ListView employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function EditCompensationContextual() {
  const { employeeId, currentJobId, currentCompensationId, onEvent } =
    useFlow<ManagementCompensationFlowContextInterface>()

  // After EditCompensation's submit chain emits EMPLOYEE_COMPENSATION_UPDATED,
  // pop back to the list. The flow's state machine listens for the same event.
  const handleEvent: OnEventType<EventType, unknown> = (event, data) => {
    onEvent(event, data)
  }

  return (
    <EditCompensation
      employeeId={ensureRequired(employeeId)}
      jobId={ensureRequired(currentJobId ?? undefined)}
      compensationId={ensureRequired(currentCompensationId ?? undefined)}
      onCancel={() => {
        onEvent(componentEvents.EMPLOYEE_COMPENSATION_CANCEL)
      }}
      onEvent={handleEvent}
    />
  )
}

export function AddJobContextual() {
  const { employeeId, hireDate, onEvent } = useFlow<ManagementCompensationFlowContextInterface>()

  const handleEvent: OnEventType<EventType, unknown> = (event, data) => {
    onEvent(event, data)
  }

  return (
    <AddJob
      employeeId={ensureRequired(employeeId)}
      hireDate={ensureRequired(hireDate)}
      onCancel={() => {
        onEvent(componentEvents.EMPLOYEE_COMPENSATION_CANCEL)
      }}
      onEvent={handleEvent}
    />
  )
}
