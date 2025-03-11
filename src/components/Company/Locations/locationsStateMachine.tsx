import { transition, state, reduce } from 'robot3'
import { LocationsList } from './LocationsList'
import { LocationForm } from './LocationForm/LocationForm'
import { companyEvents } from '@/shared/constants'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { FlowContextInterface } from '@/components/Flow'
import { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [companyEvents.COMPANY_LOCATION_DONE]: Location //TODO: not sure yet
  [companyEvents.COMPANY_EDIT_LOCATION]: { uuid: string }
  [companyEvents.COMPANY_ADD_LOCATION]: Location
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
  const { onEvent, locationId } = useLocationsFlowParams({
    component: 'LocationsForm',
    requiredParams: ['locationId'],
  })
  return <LocationForm locationId={locationId} onEvent={onEvent} />
}

export const locationsStateMachine = {
  index: state(
    transition(
      companyEvents.COMPANY_EDIT_LOCATION,
      'locationEdit',
      reduce(
        (
          ctx: LocationsContextInterface,
          ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_EDIT_LOCATION>,
        ): LocationsContextInterface => ({
          ...ctx,
          component: LocationFormContextual,
          locationId: ev.payload.uuid,
        }),
      ),
    ),
  ),
  locationEdit: state(),
}
