import { state, transition, reduce } from 'robot3'
import type { ComponentType } from 'react'
import type { LocationsContextInterface, EventPayloads } from './locationsComponents'
import { LocationFormContextual } from './locationsComponents'
import { companyEvents, componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

/**
 * Builds the list/add/edit machine, given the list screen to open and return to.
 *
 * @remarks
 * Onboarding and management differ only in that screen — onboarding's list carries a Continue
 * button and management's does not — so taking it as the single parameter lets both surfaces
 * share these transitions rather than maintaining two near-identical copies.
 *
 * Naming the list component once also keeps the first screen from drifting from the return
 * screen, which is why {@link createLocationsMachine} seeds the initial context itself rather
 * than leaving each caller to repeat the component. Same shape as
 * `createStateTaxesMachine`.
 *
 * The `CANCEL` transitions here are deliberate and belong to *this* machine: they return the
 * add/edit form to the list. Any machine hosting this one must not declare its own `CANCEL`
 * transition, since `Flow` re-emits these upward.
 *
 * @param listContextual - The list screen this flow opens on and returns to.
 * @returns The machine states, keyed by state name.
 * @internal
 */
export function createLocationsMachine(listContextual: ComponentType) {
  const returnToList = reduce((ctx: LocationsContextInterface): LocationsContextInterface => ({
    ...ctx,
    component: listContextual,
    locationId: undefined,
  }))

  const cancelTransition = transition(componentEvents.CANCEL, 'index', returnToList)

  return {
    index: state<MachineTransition>(
      transition(
        companyEvents.COMPANY_LOCATION_EDIT,
        'locationEdit',
        reduce(
          (
            ctx: LocationsContextInterface,
            ev: MachineEventType<EventPayloads, typeof companyEvents.COMPANY_LOCATION_EDIT>,
          ): LocationsContextInterface => ({
            ...ctx,
            component: LocationFormContextual as ComponentType,
            locationId: ev.payload.uuid,
          }),
        ),
      ),
      transition(
        companyEvents.COMPANY_LOCATION_CREATE,
        'locationAdd',
        reduce((ctx: LocationsContextInterface): LocationsContextInterface => ({
          ...ctx,
          component: LocationFormContextual as ComponentType,
        })),
      ),
    ),
    locationAdd: state<MachineTransition>(
      transition(companyEvents.COMPANY_LOCATION_CREATED, 'index', returnToList),
      cancelTransition,
    ),
    locationEdit: state<MachineTransition>(
      transition(companyEvents.COMPANY_LOCATION_UPDATED, 'index', returnToList),
      cancelTransition,
    ),
  }
}
