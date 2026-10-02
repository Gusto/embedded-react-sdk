import { reduce, state, transition } from 'robot3'
import {
  TaxPaymentDetailContextual,
  TaxPaymentsListContextual,
  type TaxPaymentsFlowContextInterface,
} from './TaxPaymentsFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineEventType, MachineTransition } from '@/types/Helpers'

type EventPayloads = {
  [componentEvents.TAX_PAYMENT_VIEW]: { taxPaymentId: string }
  [componentEvents.TAX_PAYMENT_BACK]: undefined
}

/**
 * Hub machine for {@link TaxPaymentsFlow}: the list is the hub and each tax payment detail is a
 * spoke. There is no final state, since the user can move between them freely.
 *
 * @internal
 */
export const taxPaymentsMachine = {
  list: state<MachineTransition>(
    transition(
      componentEvents.TAX_PAYMENT_VIEW,
      'detail',
      reduce(
        (
          ctx: TaxPaymentsFlowContextInterface,
          ev: MachineEventType<EventPayloads, typeof componentEvents.TAX_PAYMENT_VIEW>,
        ): TaxPaymentsFlowContextInterface => ({
          ...ctx,
          component: TaxPaymentDetailContextual,
          currentTaxPaymentId: ev.payload.taxPaymentId,
        }),
      ),
    ),
  ),
  detail: state<MachineTransition>(
    transition(
      componentEvents.TAX_PAYMENT_BACK,
      'list',
      reduce((ctx: TaxPaymentsFlowContextInterface): TaxPaymentsFlowContextInterface => ({
        ...ctx,
        component: TaxPaymentsListContextual,
        currentTaxPaymentId: undefined,
      })),
    ),
  ),
}
