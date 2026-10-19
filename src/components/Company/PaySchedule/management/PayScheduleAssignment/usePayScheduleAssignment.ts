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

/** @internal */
export interface PayScheduleAssignmentContextInterface extends FlowContextInterface {
  companyId: string
  assignmentType?: SupportedAssignmentType
  defaultPayScheduleUuid?: string
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
  departments?: DepartmentSelection['departments']
  component: React.ComponentType | null
}
