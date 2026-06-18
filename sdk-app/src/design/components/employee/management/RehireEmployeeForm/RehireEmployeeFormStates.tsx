import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { Location } from '@gusto/embedded-api-v-2025-11-15/models/components/location'
import { RehireEmployeeForm } from './RehireEmployeeForm'

export interface RehireEmployeeFormDemoProps {
  employee: Pick<Employee, 'firstName' | 'lastName' | 'uuid'>
  workLocations: Location[]
  isPending?: boolean
}

/**
 * Renders RehireEmployeeForm for state demos with no-op submit/cancel
 * handlers.
 */
export function RehireEmployeeFormDemo(props: RehireEmployeeFormDemoProps) {
  return <RehireEmployeeForm {...props} onCancel={() => {}} onSubmit={() => {}} />
}
