import type { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { EmployeeSelection } from './AssignmentEmployeeStepPresentation'
import type { DepartmentSelection } from './AssignmentDepartmentStepPresentation'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

/**
 * The assignment types supported by the management flow.
 *
 * @internal
 */
export type SupportedAssignmentType = Extract<
  PayScheduleAssignmentBodyType,
  'single' | 'hourly_salaried' | 'by_department' | 'by_employee'
>

/**
 * Draft selections retained when moving between assignment steps.
 *
 * @internal
 */
export type AssignmentDraft = Partial<DepartmentSelection & EmployeeSelection> & {
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
  employees?: EmployeeSelection['employees']
  component: React.ComponentType | null
}
