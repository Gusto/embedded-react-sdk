import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { AddressContextInterface } from './AddressComponents'
import { CardContextual, AddressEditFormContextual } from './AddressComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce((ctx: AddressContextInterface): AddressContextInterface => ({
  ...ctx,
  component: CardContextual as ComponentType,
  successAlert: null,
}))

const returnToCardWithAlert = (alert: AddressContextInterface['successAlert']) =>
  reduce((ctx: AddressContextInterface): AddressContextInterface => ({
    ...ctx,
    component: CardContextual as ComponentType,
    successAlert: alert,
  }))

/** @internal */
export const addressStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_REQUESTED,
      'editAddress',
      reduce((ctx: AddressContextInterface): AddressContextInterface => ({
        ...ctx,
        component: AddressEditFormContextual as ComponentType,
        successAlert: null,
      })),
    ),
    transition(componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_ALERT_DISMISSED, 'card', returnToCard),
  ),
  editAddress: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_UPDATED,
      'card',
      returnToCardWithAlert('addressUpdated'),
    ),
    transition(componentEvents.CONTRACTOR_MANAGEMENT_ADDRESS_EDIT_CANCELLED, 'card', returnToCard),
  ),
}
