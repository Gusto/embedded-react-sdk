import type { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

/**
 * The assignment types this flow supports. `by_employee` and `by_department` exist in the API
 * but have no step implementations, so they're unrepresentable here.
 *
 * @internal
 */
export type SupportedAssignmentType = Extract<
  PayScheduleAssignmentBodyType,
  'single' | 'hourly_salaried'
>

/** @internal */
export interface PayScheduleAssignmentContextInterface extends FlowContextInterface {
  companyId: string
  assignmentType?: SupportedAssignmentType
  defaultPayScheduleUuid?: string
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
  component: React.ComponentType | null
}
