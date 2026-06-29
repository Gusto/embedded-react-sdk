import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { StateTaxesContextInterface, StateTaxesSuccessAlertCode } from './StateTaxesComponents'
import { StateTaxesCardContextual, StateTaxesEditFormContextual } from './StateTaxesComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce((ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
  ...ctx,
  component: StateTaxesCardContextual as ComponentType,
  successAlert: null,
}))

const returnToCardWithAlert = (alert: StateTaxesSuccessAlertCode) =>
  reduce((ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
    ...ctx,
    component: StateTaxesCardContextual as ComponentType,
    successAlert: alert,
  }))

/** @internal */
export const stateTaxesStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_REQUESTED,
      'editStateTaxes',
      reduce((ctx: StateTaxesContextInterface): StateTaxesContextInterface => ({
        ...ctx,
        component: StateTaxesEditFormContextual as ComponentType,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_ALERT_DISMISSED,
      'card',
      returnToCard,
    ),
  ),
  editStateTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_UPDATED,
      'card',
      returnToCardWithAlert('stateTaxesUpdated'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_STATE_TAXES_EDIT_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
