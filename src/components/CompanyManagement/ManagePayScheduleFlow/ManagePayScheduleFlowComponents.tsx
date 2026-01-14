import type { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { ManagePayScheduleLanding } from '../ManagePayScheduleLanding/ManagePayScheduleLanding'
import { ManagePayScheduleTypeSelection } from '../ManagePayScheduleTypeSelection/ManagePayScheduleTypeSelection'
import { ManagePayScheduleAssignment } from '../ManagePayScheduleAssignment/ManagePayScheduleAssignment'
import type { AssignmentData } from '../ManagePayScheduleAssignment/ManagePayScheduleAssignment'
import { ManagePayScheduleReview } from '../ManagePayScheduleReview/ManagePayScheduleReview'
import { ManagePayScheduleCreateEdit } from '../ManagePayScheduleCreateEdit/ManagePayScheduleCreateEdit'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

type PayScheduleType =
  (typeof PayScheduleAssignmentBodyType)[keyof typeof PayScheduleAssignmentBodyType]

export interface ManagePayScheduleFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface ManagePayScheduleFlowContextInterface extends FlowContextInterface {
  companyId: string
  selectedType?: PayScheduleType
  assignmentData?: AssignmentData
  editPayScheduleUuid?: string
  returnContext?: string
  successAlert?: { messageKey: 'assignmentsUpdated' | 'scheduleUpdated' }
}

export function ManagePayScheduleLandingContextual() {
  const { companyId, onEvent, successAlert } = useFlow<ManagePayScheduleFlowContextInterface>()
  return (
    <ManagePayScheduleLanding
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      successAlert={successAlert}
    />
  )
}

export function ManagePayScheduleTypeSelectionContextual() {
  const { companyId, onEvent, selectedType } = useFlow<ManagePayScheduleFlowContextInterface>()
  return (
    <ManagePayScheduleTypeSelection
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      currentType={selectedType}
    />
  )
}

export function ManagePayScheduleAssignmentContextual() {
  const { companyId, onEvent, selectedType } = useFlow<ManagePayScheduleFlowContextInterface>()
  return (
    <ManagePayScheduleAssignment
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      assignmentType={ensureRequired(selectedType)}
    />
  )
}

export function ManagePayScheduleReviewContextual() {
  const { companyId, onEvent, assignmentData } = useFlow<ManagePayScheduleFlowContextInterface>()
  return (
    <ManagePayScheduleReview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      assignmentData={ensureRequired(assignmentData)}
    />
  )
}

export function ManagePayScheduleCreateEditContextual() {
  const { companyId, onEvent, editPayScheduleUuid } =
    useFlow<ManagePayScheduleFlowContextInterface>()
  return (
    <ManagePayScheduleCreateEdit
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payScheduleUuid={editPayScheduleUuid}
    />
  )
}
