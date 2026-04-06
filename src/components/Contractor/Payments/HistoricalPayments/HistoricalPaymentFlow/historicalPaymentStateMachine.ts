import { reduce, state, transition } from 'robot3'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import {
  HistoricalPaymentSuccessContextual,
  type HistoricalPaymentFlowContextInterface,
} from './HistoricalPaymentFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

type EventPayloads = {
  [componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATE]: undefined
  [componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED]: ContractorPaymentGroup
  [componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT]: { uuid?: string | null }
}

export const historicalPaymentFlowBreadcrumbsNodes: BreadcrumbNodes = {
  createHistoricalPayment: {
    parent: null,
    item: {
      id: 'createHistoricalPayment',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.HistoricalPayments.CreateHistoricalPayment',
    },
  },
} as const

export const historicalPaymentMachine = {
  createHistoricalPayment: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED,
      'success',
      reduce(
        (
          ctx: HistoricalPaymentFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED
          >,
        ): HistoricalPaymentFlowContextInterface => {
          return {
            ...ctx,
            component: HistoricalPaymentSuccessContextual,
            createdPaymentGroupId: ev.payload.uuid,
          }
        },
      ),
    ),
    transition(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT,
      'done',
      reduce(
        (
          ctx: HistoricalPaymentFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT
          >,
        ): HistoricalPaymentFlowContextInterface => {
          return {
            ...ctx,
            component: null,
            alerts: undefined,
          }
        },
      ),
    ),
  ),
  success: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT,
      'done',
      reduce(
        (
          ctx: HistoricalPaymentFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_EXIT
          >,
        ): HistoricalPaymentFlowContextInterface => {
          return {
            ...ctx,
            component: null,
            alerts: undefined,
          }
        },
      ),
    ),
  ),
  done: state<MachineTransition>(),
}
