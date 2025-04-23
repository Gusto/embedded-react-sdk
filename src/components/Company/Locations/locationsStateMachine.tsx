import { transition, state, reduce } from 'robot3'
import { LocationsList } from './LocationsList'
import { LocationForm } from './LocationForm/LocationForm'
import { companyEvents, componentEvents } from '@/shared/constants'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import type { FlowContextInterface } from '@/components/Flow/useFlow'
import type { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
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

const cancelTransition = transition(
  componentEvents.CANCEL,
  'index',
  reduce((ctx: LocationsContextInterface) => ({
    ...ctx,
    component: LocationsListContextual,
    locationId: undefined,
  })),
)

export const locationsStateMachine = {
  index: state(
    transition(
      companyEvents.COMPANY_LOCATION_EDIT,
      'locationEdit',
      reduce(
        (
          ctx: LocationsContextInterface,
          ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_LOCATION_EDIT>,
        ): LocationsContextInterface => ({
          ...ctx,
          component: LocationFormContextual,
          locationId: ev.payload.uuid,
        }),
      ),
    ),
    transition(
      companyEvents.COMPANY_LOCATION_CREATE,
      'locationAdd',
      reduce(
        (ctx: LocationsContextInterface): LocationsContextInterface => ({
          ...ctx,
          component: LocationFormContextual,
        }),
      ),
    ),
  ),
  locationAdd: state(
    transition(
      companyEvents.COMPANY_LOCATION_CREATED,
      'index',
      reduce((ctx: LocationsContextInterface) => ({ ...ctx, component: LocationsListContextual })),
    ),
    cancelTransition,
  ),
  locationEdit: state(
    transition(
      companyEvents.COMPANY_LOCATION_UPDATED,
      'index',
      reduce((ctx: LocationsContextInterface) => ({
        ...ctx,
        component: LocationsListContextual,
        locationId: undefined,
      })),
    ),
    cancelTransition,
  ),
}
