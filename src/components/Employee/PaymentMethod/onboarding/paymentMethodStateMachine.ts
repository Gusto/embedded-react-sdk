import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { PaymentMethodContextInterface } from '../shared/PaymentMethodComponents'
import {
  ListViewContextual,
  BankFormContextual,
  SplitViewContextual,
} from '../shared/PaymentMethodComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

export const paymentMethodStateMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE,
      'add',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: BankFormContextual as ComponentType,
        }),
      ),
    ),
    transition(
      componentEvents.EMPLOYEE_SPLIT_PAYMENT,
      'split',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: SplitViewContextual as ComponentType,
        }),
      ),
    ),
  ),
  add: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATED,
      'list',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: ListViewContextual as ComponentType,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'list',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: ListViewContextual as ComponentType,
        }),
      ),
    ),
  ),
  split: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_UPDATED,
      'list',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: ListViewContextual as ComponentType,
        }),
      ),
    ),
    transition(
      componentEvents.CANCEL,
      'list',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: ListViewContextual as ComponentType,
        }),
      ),
    ),
  ),
}
