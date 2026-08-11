import { reduce, state, transition } from 'robot3'
import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import {
  HistoricalPaymentSummaryContextual,
  type HistoricalPaymentFlowContextInterface,
} from './HistoricalPaymentFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

type EventPayloads = {
  [componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED]: ContractorPaymentGroup
}

/** @internal */
export const historicalPaymentBreadcrumbsNodes: BreadcrumbNodes = {
  createHistoricalPayment: {
    parent: null,
    item: {
      id: 'createHistoricalPayment',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.CreateHistoricalPayment',
      onNavigate: ((ctx: HistoricalPaymentFlowContextInterface) => ({
        ...updateBreadcrumbs('createHistoricalPayment', ctx),
      })) as (context: unknown) => unknown,
    },
  },
  historicalPaymentSummary: {
    parent: null,
    item: {
      id: 'historicalPaymentSummary',
      label: 'breadcrumbLabel',
      namespace: 'Contractor.Payments.HistoricalPaymentSummary',
    },
  },
}

/**
 * Flow machine for {@link HistoricalPaymentFlow}.
 *
 * @remarks
 * `historicalPaymentSummary` is a plain zero-transition state, not a robot3 `final()` state:
 * `HistoricalPaymentFlow` can be mounted directly by a partner, so `contractor/historicalPayments/exit`
 * bubbles up via `onEvent` without a local transition, keeping the summary screen interactive if the
 * host doesn't unmount the component immediately (see SDK-1169).
 *
 * @internal
 */
export const historicalPaymentMachine = {
  createHistoricalPayment: state<MachineTransition>(
    transition(
      componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED,
      'historicalPaymentSummary',
      reduce(
        (
          ctx: HistoricalPaymentFlowContextInterface,
          ev: MachineEventType<
            EventPayloads,
            typeof componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED
          >,
        ): HistoricalPaymentFlowContextInterface => {
          return {
            ...updateBreadcrumbs('historicalPaymentSummary', ctx),
            component: HistoricalPaymentSummaryContextual,
            createdPaymentGroupId: ev.payload.uuid,
          }
        },
      ),
    ),
  ),
  historicalPaymentSummary: state<MachineTransition>(),
}
