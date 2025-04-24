import { state, transition, reduce } from 'robot3'
import type { LocationsContextInterface, EventPayloads } from './locationsStateMachine'
import { LocationFormContextual, LocationsListContextual } from './locationsStateMachine'
import { companyEvents, componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

export const cancelTransition = transition(
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
