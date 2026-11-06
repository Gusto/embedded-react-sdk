import { TaxPaymentsList } from '../TaxPaymentsList/TaxPaymentsList'
import { TaxPaymentDetail } from '../TaxPaymentDetail/TaxPaymentDetail'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link TaxPaymentsFlow}.
 *
 * @alpha
 */
export interface TaxPaymentsFlowProps extends BaseComponentInterface<never> {
  /** Identifier of the company whose tax payments are shown. */
  companyId: string
}

/** @internal */
export interface TaxPaymentsFlowContextInterface extends FlowContextInterface {
  companyId: string
  currentTaxPaymentId?: string
}

/** @internal */
export function TaxPaymentsListContextual() {
  const { companyId, onEvent } = useFlow<TaxPaymentsFlowContextInterface>()
  return <TaxPaymentsList companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

/** @internal */
export function TaxPaymentDetailContextual() {
  const { companyId, currentTaxPaymentId, onEvent } = useFlow<TaxPaymentsFlowContextInterface>()
  return (
    <TaxPaymentDetail
      companyId={ensureRequired(companyId)}
      taxPaymentId={ensureRequired(currentTaxPaymentId)}
      onEvent={onEvent}
    />
  )
}
