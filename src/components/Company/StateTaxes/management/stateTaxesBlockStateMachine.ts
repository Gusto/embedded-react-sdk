import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { StateTaxesBlockContextInterface } from './StateTaxesComponents'
import { StateTaxesCardContextual, StateTaxesEditScreenContextual } from './StateTaxesComponents'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

/**
 * Back affordance rendered above the state taxes surface.
 *
 * @remarks
 * Uses this block's own `company/management/stateTaxes/editCancelled` rather than the generic
 * `componentEvents.CANCEL`. That distinction is load-bearing here rather than theoretical: the
 * surface's own machine transitions on bare `CANCEL` to return a state's requirements form or
 * its tax rate history to the list, and `Flow` re-emits that upward. A `CANCEL` transition here
 * would therefore close the whole block whenever a user backed out of one state.
 *
 * @internal
 */
const editHeader: FlowHeaderConfig = {
  type: 'minimal',
  back: {
    labelKey: 'header.backCta',
    namespace: 'Company.Management.StateTaxes',
    event: componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED,
  },
}

const returnToCardWithPendingAlert = reduce(
  (ctx: StateTaxesBlockContextInterface): StateTaxesBlockContextInterface => ({
    ...ctx,
    component: StateTaxesCardContextual as ComponentType,
    header: null,
    successAlert: ctx.pendingAlert ?? null,
    pendingAlert: null,
  }),
)

const recordPendingAlert = (alert: StateTaxesBlockContextInterface['pendingAlert']) =>
  reduce((ctx: StateTaxesBlockContextInterface): StateTaxesBlockContextInterface => ({
    ...ctx,
    pendingAlert: alert,
  }))

/**
 * Card to the state taxes surface and back.
 *
 * @remarks
 * A save is a *self*-transition: a company often updates several states, or schedules several
 * rates, in one visit, so returning to the card on each would eject the user mid-task. The save
 * records that something changed and the alert surfaces when they leave via the back header —
 * the sole exit, since the management list carries no Continue.
 *
 * Deliberately declares no transition on `componentEvents.CANCEL`; see {@link editHeader}.
 *
 * @internal
 */
export const stateTaxesBlockStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED,
      'stateTaxes',
      reduce((ctx: StateTaxesBlockContextInterface): StateTaxesBlockContextInterface => ({
        ...ctx,
        component: StateTaxesEditScreenContextual as ComponentType,
        header: editHeader,
        successAlert: null,
        pendingAlert: null,
      })),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_ALERT_DISMISSED,
      'card',
      reduce((ctx: StateTaxesBlockContextInterface): StateTaxesBlockContextInterface => ({
        ...ctx,
        component: StateTaxesCardContextual as ComponentType,
        successAlert: null,
      })),
    ),
  ),
  stateTaxes: state<MachineTransition>(
    transition(
      componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_UPDATED,
      'stateTaxes',
      recordPendingAlert('stateTaxesUpdated'),
    ),
    transition(
      componentEvents.COMPANY_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED,
      'card',
      returnToCardWithPendingAlert,
    ),
  ),
}
