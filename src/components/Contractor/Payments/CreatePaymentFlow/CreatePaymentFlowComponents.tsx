import { CreatePayment } from '../CreatePayment/CreatePayment'
import { PaymentSummaryInternal } from '../PaymentSummary/PaymentSummary'
import type { InternalAlert } from '../types'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link CreatePaymentFlow}.
 *
 * @public
 */
export interface CreatePaymentFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

/** @internal */
export interface CreatePaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  createdPaymentGroupId?: string
  alerts?: InternalAlert[]
}

/** @internal */
export function CreatePaymentContextual() {
  const { companyId, onEvent } = useFlow<CreatePaymentFlowContextInterface>()
  return <CreatePayment onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

/** @internal */
export function PaymentSummaryContextual() {
  const { createdPaymentGroupId, companyId, onEvent, alerts } =
    useFlow<CreatePaymentFlowContextInterface>()

  return (
    <PaymentSummaryInternal
      onEvent={onEvent}
      paymentGroupId={ensureRequired(createdPaymentGroupId)}
      companyId={ensureRequired(companyId)}
      alerts={alerts}
    />
  )
}
