import type { Garnishment } from '@gusto/embedded-api/models/components/garnishment'
import { IncludeDeductionsFormComponent } from './IncludeDeductionsFormComponent/IncludeDeductionsFormComponent'
import { DeductionsListComponent } from './DeductionsListComponent/DeductionsListComponent'
import { DeductionFormComponent } from './DeductionFormComponent/DeductionFormComponent'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { componentEvents } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_YES]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_INCLUDE_NO]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_ADD]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_CREATED]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_UPDATED]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_DELETED]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_EDIT]: Garnishment
  [componentEvents.EMPLOYEE_DEDUCTION_CANCEL]: undefined
  [componentEvents.EMPLOYEE_DEDUCTION_DONE]: undefined
  [componentEvents.CANCEL]: undefined
}

export interface DeductionsContextInterface extends FlowContextInterface {
  employeeId: string
  currentDeduction?: Garnishment | null
  startWithAdd?: boolean
  hasExistingDeductions?: boolean
}

export function IncludeDeductionsFormContextual() {
  const { employeeId, onEvent } = useFlow<DeductionsContextInterface>()
  return (
    <IncludeDeductionsFormComponent onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
  )
}

export function DeductionsListContextual() {
  const { employeeId, onEvent } = useFlow<DeductionsContextInterface>()
  return <DeductionsListComponent onEvent={onEvent} employeeId={ensureRequired(employeeId)} />
}

export function DeductionFormContextual() {
  const { employeeId, onEvent, currentDeduction } = useFlow<DeductionsContextInterface>()
  const mode = currentDeduction ? 'EDIT' : 'ADD'

  return (
    <DeductionFormComponent
      onEvent={onEvent}
      employeeId={ensureRequired(employeeId)}
      deduction={currentDeduction}
      mode={mode}
    />
  )
}
