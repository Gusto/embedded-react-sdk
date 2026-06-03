import { WorkAddressCard } from './WorkAddressCard'
import { WorkAddressEditForm } from './WorkAddressEditForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface WorkAddressContextInterface extends FlowContextInterface {
  employeeId?: string
}

export function WorkAddressCardContextual() {
  const { employeeId, onEvent } = useFlow<WorkAddressContextInterface>()
  return <WorkAddressCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function WorkAddressEditFormContextual() {
  const { employeeId, onEvent } = useFlow<WorkAddressContextInterface>()
  return <WorkAddressEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
