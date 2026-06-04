import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { FederalTaxesContextInterface } from './FederalTaxesComponents'
import {
  FederalTaxesCardContextual,
  FederalTaxesEditFormContextual,
} from './FederalTaxesComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce(
  (ctx: FederalTaxesContextInterface): FederalTaxesContextInterface => ({
    ...ctx,
    component: FederalTaxesCardContextual as ComponentType,
  }),
)

export const federalTaxesStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED,
      'editFederalTaxes',
      reduce(
        (ctx: FederalTaxesContextInterface): FederalTaxesContextInterface => ({
          ...ctx,
          component: FederalTaxesEditFormContextual as ComponentType,
        }),
      ),
    ),
  ),
  editFederalTaxes: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_SUBMITTED,
      'card',
      returnToCard,
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_EDIT_FORM_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
