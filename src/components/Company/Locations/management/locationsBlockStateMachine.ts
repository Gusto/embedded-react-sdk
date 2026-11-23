import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { LocationsBlockContextInterface } from './LocationsComponents'
import { LocationsCardContextual, LocationsEditScreenContextual } from './LocationsComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the address sub-flow.
 *
 * @remarks
 * Uses this block's own `company/management/locations/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. That distinction is load-bearing here rather than theoretical: the
 * sub-flow's own machine *does* transition on bare `CANCEL` to return its add/edit form to the
 * list, and `Flow` re-emits that upward. A `CANCEL` transition here would therefore close the
 * whole block whenever a user cancelled a single address form.
 *
 * The header persists across the sub-flow's list and form screens, because this machine never
 * leaves the `locations` state while the user moves between them.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.Locations',
    event: componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_CANCELLED,
  },
}

const returnToCardWithPendingAlert = reduce(
  (ctx: LocationsBlockContextInterface): LocationsBlockContextInterface => ({
    ...ctx,
    component: LocationsCardContextual as ComponentType,
    header: null,
    successAlert: ctx.pendingAlert ?? null,
    pendingAlert: null,
  }),
)

const recordPendingAlert = (alert: LocationsBlockContextInterface['pendingAlert']) =>
  reduce((ctx: LocationsBlockContextInterface): LocationsBlockContextInterface => ({
    ...ctx,
    pendingAlert: alert,
  }))

/**
 * Card to the address sub-flow and back.
 *
 * @remarks
 * Unlike the single-form blocks, a save here is a *self*-transition: a company usually adds
 * several addresses in one visit, so returning to the card on each one would eject the user
 * mid-task. The save only records that something changed, and the alert surfaces when they
 * actually leave via the back header — the sole exit, since the management list carries no
 * Continue.
 *
 * The self-transition spreads `...ctx` and leaves `component` untouched, so the inner `Flow`
 * reconciles in place rather than remounting and losing the sub-flow's position.
 *
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 *
 * @internal
 */
export const locationsBlockStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_REQUESTED,
      'locations',
      reduce((ctx: LocationsBlockContextInterface): LocationsBlockContextInterface => ({
        ...ctx,
        component: LocationsEditScreenContextual as ComponentType,
        header: editHeader,
        successAlert: null,
        pendingAlert: null,
      })),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_ALERT_DISMISSED,
      'card',
      reduce((ctx: LocationsBlockContextInterface): LocationsBlockContextInterface => ({
        ...ctx,
        component: LocationsCardContextual as ComponentType,
        successAlert: null,
      })),
    ),
  ),
  locations: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_UPDATED,
      'locations',
      recordPendingAlert('locationsUpdated'),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_LOCATIONS_EDIT_CANCELLED,
      'card',
      returnToCardWithPendingAlert,
    ),
  ),
}
