import { state, transition, reduce } from 'robot3'
import type { LocationsContextInterface, EventPayloads } from './locationsStateMachine'
import { LocationFormContextual, LocationsListContextual } from './locationsStateMachine'
import { companyEvents, componentEvents } from '@/shared/constants'
import type { MachineEventType } from '@/types/Helpers'

// Helper function to log state transitions
const logTransition = (fromState: string, toState: string, event: string, payload?: unknown) => {
  // eslint-disable-next-line no-console
  console.log(`[Locations State Machine] ${fromState} -> ${toState} (${event})`, payload)
}

// Helper function to log event received
const logEvent = (event: string, payload?: unknown) => {
  // eslint-disable-next-line no-console
  console.log(`[Locations State Machine] Event: ${event}`, payload)
}

export const cancelTransition = transition(
  componentEvents.CANCEL,
  'index',
  reduce((ctx: LocationsContextInterface) => {
    logTransition('current', 'index', componentEvents.CANCEL)
    return {
      ...ctx,
      component: LocationsListContextual,
      locationId: undefined,
    }
  }),
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
        ): LocationsContextInterface => {
          logEvent(companyEvents.COMPANY_LOCATION_EDIT, ev.payload)
          logTransition('index', 'locationEdit', companyEvents.COMPANY_LOCATION_EDIT, ev.payload)
          return {
            ...ctx,
            component: LocationFormContextual,
            locationId: ev.payload.uuid,
          }
        },
      ),
    ),
    transition(
      companyEvents.COMPANY_LOCATION_CREATE,
      'locationAdd',
      reduce((ctx: LocationsContextInterface): LocationsContextInterface => {
        logEvent(companyEvents.COMPANY_LOCATION_CREATE)
        logTransition('index', 'locationAdd', companyEvents.COMPANY_LOCATION_CREATE)
        return {
          ...ctx,
          component: LocationFormContextual,
        }
      }),
    ),
  ),
  locationAdd: state(
    transition(
      companyEvents.COMPANY_LOCATION_CREATED,
      'index',
      reduce((ctx: LocationsContextInterface) => {
        logEvent(companyEvents.COMPANY_LOCATION_CREATED)
        logTransition('locationAdd', 'index', companyEvents.COMPANY_LOCATION_CREATED)
        return { ...ctx, component: LocationsListContextual }
      }),
    ),
    cancelTransition,
  ),
  locationEdit: state(
    transition(
      companyEvents.COMPANY_LOCATION_UPDATED,
      'index',
      reduce((ctx: LocationsContextInterface) => {
        logEvent(companyEvents.COMPANY_LOCATION_UPDATED)
        logTransition('locationEdit', 'index', companyEvents.COMPANY_LOCATION_UPDATED)
        return {
          ...ctx,
          component: LocationsListContextual,
          locationId: undefined,
        }
      }),
    ),
    cancelTransition,
  ),
}
