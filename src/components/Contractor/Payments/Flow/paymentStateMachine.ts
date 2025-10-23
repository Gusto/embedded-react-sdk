import { transition, reduce, state } from 'robot3'
import {
  PaymentHistoryContextual,
  CreatePaymentContextual,
  OverviewContextual,
} from './PaymentFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { FlowContextInterface } from '@/components/Flow/useFlow'

type EventPayloads = {
  [componentEvents.CREATE_PAYMENT_SELECTED]: undefined
  [componentEvents.PAYMENT_CONFIGURED]: {
    paymentGroupId: string
  }
  [componentEvents.PAYMENT_BACK]: undefined
  [componentEvents.PAYMENT_SUBMITTED]: undefined
  [componentEvents.DATE_SELECTED]: {
    date: string
  }
  [componentEvents.BACK_TO_LIST]: undefined
}

export interface PaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  paymentGroupId?: string
  selectedDate?: string
}

const createReducer =
  (overrides: Partial<PaymentFlowContextInterface>) =>
  (ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => ({
    ...ctx,
    ...overrides,
  })

export const paymentMachine = {
  paymentHistory: state<MachineTransition>(
    transition(
      componentEvents.CREATE_PAYMENT_SELECTED,
      'createPayment',
      reduce(
        createReducer({
          component: CreatePaymentContextual,
        }),
      ),
    ),
  ),
  createPayment: state<MachineTransition>(
    transition(
      componentEvents.PAYMENT_CONFIGURED,
      'overview',
      reduce(
        (
          ctx: PaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.PAYMENT_CONFIGURED>,
        ): PaymentFlowContextInterface => ({
          ...ctx,
          component: OverviewContextual,
          paymentGroupId: ev.payload.paymentGroupId,
        }),
      ),
    ),
    transition(
      componentEvents.BACK_TO_LIST,
      'paymentHistory',
      reduce(
        createReducer({
          component: PaymentHistoryContextual,
        }),
      ),
    ),
  ),
  overview: state<MachineTransition>(
    transition(
      componentEvents.PAYMENT_BACK,
      'createPayment',
      reduce(
        createReducer({
          component: CreatePaymentContextual,
        }),
      ),
    ),
    transition(
      componentEvents.PAYMENT_SUBMITTED,
      'paymentHistory',
      reduce(
        createReducer({
          component: PaymentHistoryContextual,
        }),
      ),
    ),
  ),
  detail: state<MachineTransition>(
    transition(
      componentEvents.BACK_TO_LIST,
      'paymentHistory',
      reduce(
        (ctx: PaymentFlowContextInterface): PaymentFlowContextInterface => ({
          ...ctx,
          component: PaymentHistoryContextual,
          selectedDate: undefined,
        }),
      ),
    ),
  ),
}
