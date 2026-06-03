import { HomeAddressCard } from './HomeAddressCard'
import { HomeAddressEditForm } from './HomeAddressEditForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface HomeAddressContextInterface extends FlowContextInterface {
  employeeId?: string
}

export function CardContextual() {
  const { employeeId, onEvent } = useFlow<HomeAddressContextInterface>()
  return <HomeAddressCard employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}

export function HomeAddressEditFormContextual() {
  const { employeeId, onEvent } = useFlow<HomeAddressContextInterface>()
  return <HomeAddressEditForm employeeId={ensureRequired(employeeId)} onEvent={onEvent} />
}
