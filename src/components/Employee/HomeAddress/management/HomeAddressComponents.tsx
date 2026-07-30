import { HomeAddressCard } from './HomeAddressCard'
import { HomeAddressEditForm } from './HomeAddressEditForm'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

/** @internal */
export interface HomeAddressContextInterface extends FlowContextInterface {
  employeeId?: string
}

/** @internal */
export function CardContextual() {
  const { employeeId, onEvent, LoaderComponent } = useFlow<HomeAddressContextInterface>()
  return (
    <HomeAddressCard
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}

/** @internal */
export function HomeAddressEditFormContextual() {
  const { employeeId, onEvent, LoaderComponent } = useFlow<HomeAddressContextInterface>()
  return (
    <HomeAddressEditForm
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
      LoaderComponent={LoaderComponent}
    />
  )
}
