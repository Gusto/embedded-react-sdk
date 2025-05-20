import { LocationsList } from './LocationsList'
import { LocationForm } from './LocationForm/LocationForm'
import type { companyEvents } from '@/shared/constants'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'

export type EventPayloads = {
  [companyEvents.COMPANY_LOCATION_DONE]: undefined
  [companyEvents.COMPANY_LOCATION_EDIT]: { uuid: string }
  [companyEvents.COMPANY_LOCATION_CREATE]: undefined
}

export interface LocationsContextInterface extends FlowContextInterface {
  companyId: string
  locationId?: string
}

export function LocationsListContextual() {
  const { companyId, onEvent } = useFlow<LocationsContextInterface>()
  return <LocationsList companyId={ensureRequired(companyId)} onEvent={onEvent} />
}
export function LocationFormContextual() {
  const { onEvent, locationId, companyId } = useFlow<LocationsContextInterface>()
  return (
    <LocationForm companyId={ensureRequired(companyId)} locationId={locationId} onEvent={onEvent} />
  )
}
