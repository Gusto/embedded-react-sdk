import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { PaymentMethodContextInterface } from './PaymentMethodComponents'
import { CardContextual, PaymentMethodEditFormContextual } from './PaymentMethodComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToCard = reduce(
  (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
    ...ctx,
    component: CardContextual as ComponentType,
    successAlert: null,
  }),
)

const returnToCardWithAlert = (alert: PaymentMethodContextInterface['successAlert']) =>
  reduce((ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
    ...ctx,
    component: CardContextual as ComponentType,
    successAlert: alert,
  }))

/** @internal */
export const paymentMethodStateMachine = {
  card: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
      'editPaymentMethod',
      reduce((ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
        ...ctx,
        component: PaymentMethodEditFormContextual as ComponentType,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_EDIT_REQUESTED,
      'editPaymentMethod',
      reduce((ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
        ...ctx,
        component: PaymentMethodEditFormContextual as ComponentType,
        successAlert: null,
      })),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_CARD_REMOVED,
      'card',
      returnToCardWithAlert('bankAccountRemoved'),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_ALERT_DISMISSED,
      'card',
      returnToCard,
    ),
  ),
  editPaymentMethod: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED,
      'card',
      returnToCardWithAlert('bankAccountAdded'),
    ),
    transition(
      componentEvents.CONTRACTOR_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED,
      'card',
      returnToCard,
    ),
  ),
}
