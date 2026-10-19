import type { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { DepartmentSelection } from './AssignmentDepartmentStepPresentation'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

/**
 * The assignment types this flow supports. `by_employee` exists in the API
 * but has no step implementation, so it is unrepresentable here.
 *
 * @internal
 */
export type SupportedAssignmentType = Extract<
  PayScheduleAssignmentBodyType,
  'single' | 'hourly_salaried' | 'by_department'
>

/**
 * Draft selections retained when moving between assignment steps.
 *
 * @internal
 */
export type AssignmentDraft = Partial<DepartmentSelection> & {
  assignmentType?: SupportedAssignmentType
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
}

/**
 * Internal state-machine event; never forwarded to component consumers.
 *
 * @internal
 */
export const assignmentDraftUpdated = 'assignmentDraftUpdated'

/** @internal */
export interface PayScheduleAssignmentContextInterface extends FlowContextInterface {
  updateDraft: (selection: AssignmentDraft) => void
  companyId: string
  assignmentType?: SupportedAssignmentType
  defaultPayScheduleUuid?: string
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
  departments?: DepartmentSelection['departments']
  component: React.ComponentType | null
}
