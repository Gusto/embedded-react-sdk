import type { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

/** @internal */
export interface PayScheduleAssignmentContextInterface extends FlowContextInterface {
  companyId: string
  assignmentType?: PayScheduleAssignmentBodyType
  defaultPayScheduleUuid?: string
  component: React.ComponentType | null
}
