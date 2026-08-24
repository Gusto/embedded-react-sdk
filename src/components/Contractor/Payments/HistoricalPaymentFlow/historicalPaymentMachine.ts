import type { ContractorPaymentGroup } from '@gusto/embedded-api/models/components/contractorpaymentgroup'
import {
  HistoricalPaymentSummaryContextual,
  type HistoricalPaymentFlowContextInterface,
} from './HistoricalPaymentFlowComponents'
import { reduce, state, transition } from '@/lib/state-machine'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'

type EventPayloads = {
  [componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CREATED]: ContractorPaymentGroup
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
 * Unlike `createPaymentMachine`, neither state contributes its own breadcrumb item -- each of this
 * flow's own screens has its own Back button instead. `updateBreadcrumbs` here only keeps
 * `currentBreadcrumbId` in sync so a parent flow's injected `prefixBreadcrumbs` (see
 * `HistoricalPaymentInternalFlow`) stays visible as the active trail across both states.
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
