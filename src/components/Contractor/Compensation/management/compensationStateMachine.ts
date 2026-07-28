import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { CompensationContextInterface } from './CompensationComponents'
import { CardContextual, CompensationEditFormContextual } from './CompensationComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce((ctx: CompensationContextInterface): CompensationContextInterface => ({
  ...ctx,
  component: CardContextual as ComponentType,
  successAlert: null,
}))

const returnToCardWithAlert = (alert: CompensationContextInterface['successAlert']) =>
  reduce((ctx: CompensationContextInterface): CompensationContextInterface => ({
    ...ctx,
    component: CardContextual as ComponentType,
    successAlert: alert,
  }))

/** @internal */
export const compensationStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_REQUESTED,
      'editCompensation',
      reduce((ctx: CompensationContextInterface): CompensationContextInterface => ({
        ...ctx,
        component: CompensationEditFormContextual as ComponentType,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_ALERT_DISMISSED,
      'card',
      returnToCard,
    ),
  ),
  editCompensation: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_UPDATED,
      'card',
      returnToCardWithAlert('compensationUpdated'),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
