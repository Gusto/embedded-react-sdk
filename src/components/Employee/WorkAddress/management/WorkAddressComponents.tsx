import { WorkAddressCard } from './WorkAddressCard'
import { WorkAddressEditForm } from './WorkAddressEditForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export interface WorkAddressContextInterface extends FlowContextInterface {
  employeeId?: string
}

/** @internal */
export function WorkAddressCardContextual() {
  const { employeeId, onEvent } = useFlow<WorkAddressContextInterface>()
  return <WorkAddressCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

/** @internal */
export function WorkAddressEditFormContextual() {
  const { employeeId, onEvent } = useFlow<WorkAddressContextInterface>()
  return <WorkAddressEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
