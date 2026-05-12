import { reduce, state, transition } from 'robot3'
import type { ComponentType } from 'react'
import type { PaymentMethodContextInterface } from '../shared/PaymentMethodComponents'
import {
  InitialViewContextual,
  ListViewContextual,
  AddViewContextual,
  SplitViewContextual,
} from '../shared/PaymentMethodComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'

export const paymentMethodStateMachine = {
  initial: state<MachineTransition>(
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
  ),
  list: state<MachineTransition>(
    transition(
      componentEvents.EMPLOYEE_BANK_ACCOUNT_CREATE,
      'add',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: AddViewContextual as ComponentType,
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
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_RESET,
      'initial',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: InitialViewContextual as ComponentType,
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
    transition(
      componentEvents.EMPLOYEE_PAYMENT_METHOD_RESET,
      'initial',
      reduce(
        (ctx: PaymentMethodContextInterface): PaymentMethodContextInterface => ({
          ...ctx,
          component: InitialViewContextual as ComponentType,
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
