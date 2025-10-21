import { transition, reduce, state } from 'robot3'
import {
  ContractorPaymentPaymentHistoryContextual,
  ContractorPaymentCreatePaymentContextual,
  ContractorPaymentOverviewContextual,
} from './ContractorPaymentFlowComponents'
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

export interface ContractorPaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  paymentGroupId?: string
  selectedDate?: string
}

const createReducer =
  (overrides: Partial<ContractorPaymentFlowContextInterface>) =>
  (ctx: ContractorPaymentFlowContextInterface): ContractorPaymentFlowContextInterface => ({
    ...ctx,
    ...overrides,
  })

export const contractorPaymentMachine = {
  paymentHistory: state<MachineTransition>(
    transition(
      componentEvents.CREATE_PAYMENT_SELECTED,
      'createPayment',
      reduce(
        createReducer({
          component: ContractorPaymentCreatePaymentContextual,
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
          ctx: ContractorPaymentFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.PAYMENT_CONFIGURED>,
        ): ContractorPaymentFlowContextInterface => ({
          ...ctx,
          component: ContractorPaymentOverviewContextual,
          paymentGroupId: ev.payload.paymentGroupId,
        }),
      ),
    ),
    transition(
      componentEvents.BACK_TO_LIST,
      'paymentHistory',
      reduce(
        createReducer({
          component: ContractorPaymentPaymentHistoryContextual,
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
          component: ContractorPaymentCreatePaymentContextual,
        }),
      ),
    ),
    transition(
      componentEvents.PAYMENT_SUBMITTED,
      'paymentHistory',
      reduce(
        createReducer({
          component: ContractorPaymentPaymentHistoryContextual,
        }),
      ),
    ),
  ),
  detail: state<MachineTransition>(
    transition(
      componentEvents.BACK_TO_LIST,
      'paymentHistory',
      reduce(
        (ctx: ContractorPaymentFlowContextInterface): ContractorPaymentFlowContextInterface => ({
          ...ctx,
          component: ContractorPaymentPaymentHistoryContextual,
          selectedDate: undefined,
        }),
      ),
    ),
  ),
}
