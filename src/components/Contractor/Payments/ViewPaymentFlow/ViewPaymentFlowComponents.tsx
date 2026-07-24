import { PaymentHistory } from '../PaymentHistory/PaymentHistory'
import { PaymentStatement } from '../PaymentStatement/PaymentStatement'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link ViewPaymentFlow}.
 *
 * @alpha
 */
export interface ViewPaymentFlowProps extends BaseComponentInterface<never> {
  /** Identifier of the payment group to inspect. */
  paymentId: string
}

/** @internal */
export interface ViewPaymentFlowContextInterface extends FlowContextInterface {
  currentPaymentId?: string
  currentContractorUuid?: string
}

/** @internal */
export function PaymentHistoryContextual() {
  const { currentPaymentId, onEvent } = useFlow<ViewPaymentFlowContextInterface>()
  return <PaymentHistory onEvent={onEvent} paymentId={ensureRequired(currentPaymentId)} />
}

/** @internal */
export function PaymentStatementContextual() {
  const { currentPaymentId, currentContractorUuid, onEvent } =
    useFlow<ViewPaymentFlowContextInterface>()
  return (
    <PaymentStatement
      onEvent={onEvent}
      paymentGroupId={ensureRequired(currentPaymentId)}
      contractorUuid={ensureRequired(currentContractorUuid)}
    />
  )
}
