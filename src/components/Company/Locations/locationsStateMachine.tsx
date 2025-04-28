import { LocationsList } from './LocationsList'
import { LocationForm } from './LocationForm/LocationForm'
import type { companyEvents } from '@/shared/constants'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

export type EventPayloads = {
  [companyEvents.COMPANY_LOCATION_DONE]: undefined
  [companyEvents.COMPANY_LOCATION_EDIT]: { uuid: string }
  [companyEvents.COMPANY_LOCATION_CREATE]: undefined
}

export interface LocationsContextInterface extends FlowContextInterface {
  companyId: string
  locationId?: string
}

function useLocationsFlowParams(props: UseFlowParamsProps<LocationsContextInterface>) {
  return useFlowParams(props)
}

export function LocationsListContextual() {
  const { companyId, onEvent } = useLocationsFlowParams({
    component: 'LocationsList',
    requiredParams: ['companyId'],
  })
  return <LocationsList companyId={companyId} onEvent={onEvent} />
}
export function LocationFormContextual() {
  const { onEvent, locationId, companyId } = useLocationsFlowParams({
    component: 'LocationsForm',
    requiredParams: ['companyId'],
  })
  return <LocationForm companyId={companyId} locationId={locationId} onEvent={onEvent} />
}
