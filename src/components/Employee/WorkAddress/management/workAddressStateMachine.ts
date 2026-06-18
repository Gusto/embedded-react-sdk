import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { WorkAddressContextInterface } from './WorkAddressComponents'
import { WorkAddressCardContextual, WorkAddressEditFormContextual } from './WorkAddressComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce(
  (ctx: WorkAddressContextInterface): WorkAddressContextInterface => ({
    ...ctx,
    component: WorkAddressCardContextual as ComponentType,
  }),
)

/** @internal */
export const workAddressStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_REQUESTED,
      'editWorkAddress',
      reduce(
        (ctx: WorkAddressContextInterface): WorkAddressContextInterface => ({
          ...ctx,
          component: WorkAddressEditFormContextual as ComponentType,
        }),
      ),
    ),
  ),
  // The edit surface is modal-style: editing/changing/deleting a row closes
  // the modal but keeps the user on the edit screen so they can manage
  // additional rows. Only the explicit Back action returns to the card.
  editWorkAddress: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_WORK_ADDRESS_EDIT_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
