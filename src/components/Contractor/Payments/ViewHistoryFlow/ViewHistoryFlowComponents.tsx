import { PaymentHistory } from '../PaymentHistory/PaymentHistory'
import { PaymentStatement } from '../PaymentStatement/PaymentStatement'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link ViewHistoryFlow}.
 *
 * @public
 */
export interface ViewHistoryFlowProps extends BaseComponentInterface<never> {
  /** Identifier of the payment group to inspect. */
  paymentId: string
}

/** @internal */
export interface ViewHistoryFlowContextInterface extends FlowContextInterface {
  currentPaymentId?: string
  currentContractorUuid?: string
}

/** @internal */
export function PaymentHistoryContextual() {
  const { currentPaymentId, onEvent } = useFlow<ViewHistoryFlowContextInterface>()
  return <PaymentHistory onEvent={onEvent} paymentId={ensureRequired(currentPaymentId)} />
}

/** @internal */
export function PaymentStatementContextual() {
  const { currentPaymentId, currentContractorUuid, onEvent } =
    useFlow<ViewHistoryFlowContextInterface>()
  return (
    <PaymentStatement
      onEvent={onEvent}
      paymentGroupId={ensureRequired(currentPaymentId)}
      contractorUuid={ensureRequired(currentContractorUuid)}
    />
  )
}
