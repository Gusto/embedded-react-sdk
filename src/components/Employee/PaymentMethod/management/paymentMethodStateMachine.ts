import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type {
  PaymentMethodContextInterface,
  PaymentMethodSuccessAlertCode,
} from './PaymentMethodComponents'
import { CardContextual, BankFormContextual, SplitViewContextual } from './PaymentMethodComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

const returnToList = reduce(
  (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
    ...ctx,
    component: CardContextual as ComponentType,
    successAlert: null,
  }),
)

const returnToListWithAlert = (alert: PaymentMethodSuccessAlertCode) =>
  reduce(
    (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
      ...ctx,
      component: CardContextual as ComponentType,
      successAlert: alert,
    }),
  )

export const paymentMethodStateMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_ADD_REQUESTED,
      'add',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: BankFormContextual as ComponentType,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_SPLIT_REQUESTED,
      'split',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: SplitViewContextual as ComponentType,
          successAlert: null,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_CARD_BANK_ACCOUNT_DELETED,
      'list',
      returnToListWithAlert('bankAccountDeleted'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_ALERT_DISMISSED,
      'list',
      returnToList,
    ),
  ),
  add: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_SUBMITTED,
      'list',
      returnToListWithAlert('bankAccountAdded'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_BANK_FORM_CANCELLED,
      'list',
      returnToList,
    ),
  ),
  split: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_SUBMITTED,
      'list',
      returnToListWithAlert('splitUpdated'),
    ),
    transition(
      componentEvents.EMPLOYEE_MANAGEMENT_PAYMENT_METHOD_SPLIT_FORM_CANCELLED,
      'list',
      returnToList,
    ),
  ),
}
