import { transition, state, reduce } from 'robot3'
import { LocationsList } from './LocationsList/LocationsList'
import { LocationForm } from './LocationForm/LocationForm'
import { companyEvents } from '@/shared/constants'
import { useFlowParams, type UseFlowParamsProps } from '@/components/Flow/hooks/useFlowParams'
import { FlowContextInterface } from '@/components/Flow'
import { MachineEventType } from '@/types/Helpers'

type EventPayloads = {
  [companyEvents.COMPANY_LOCATION_DONE]: Location //TODO: not sure yet
  [companyEvents.COMPANY_EDIT_LOCATION]: Location
  [companyEvents.COMPANY_ADD_LOCATION]: Location
}

export interface LocationsContextInterface extends FlowContextInterface {
  companyId: string
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
  // const { companyId, onEvent } = useLocationsFlowParams({
  //   component: 'LocationsForm',
  //   requiredParams: ['companyId'],
  // })
  return <LocationForm />
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
        ): LocationsContextInterface => ({ ...ctx, component: LocationFormContextual }),
      ),
    ),
  ),
  locationEdit: state(),
}
