import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { HomeAddressContextInterface } from './HomeAddressComponents'
import { CardContextual, HomeAddressEditFormContextual } from './HomeAddressComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce(
  (ctx: HomeAddressContextInterface): HomeAddressContextInterface => ({
    ...ctx,
    component: CardContextual as ComponentType,
  }),
)

export const homeAddressStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_REQUESTED,
      'editHomeAddress',
      reduce(
        (ctx: HomeAddressContextInterface): HomeAddressContextInterface => ({
          ...ctx,
          component: HomeAddressEditFormContextual as ComponentType,
        }),
      ),
    ),
  ),
  editHomeAddress: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_HOME_ADDRESS_MANAGEMENT_EDIT_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
