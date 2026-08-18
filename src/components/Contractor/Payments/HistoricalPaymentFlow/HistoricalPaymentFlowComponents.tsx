import { CreateHistoricalPayment } from '../CreateHistoricalPayment/CreateHistoricalPayment'
import { HistoricalPaymentSummary } from '../HistoricalPaymentSummary/HistoricalPaymentSummary'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link HistoricalPaymentFlow}.
 *
 * @alpha
 */
export interface HistoricalPaymentFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

/** @internal */
export interface HistoricalPaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  createdPaymentGroupId?: string
}

/** @internal */
export function CreateHistoricalPaymentContextual() {
  const { companyId, onEvent } = useFlow<HistoricalPaymentFlowContextInterface>()
  return <CreateHistoricalPayment onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

/** @internal */
export function HistoricalPaymentSummaryContextual() {
  const { createdPaymentGroupId, companyId, onEvent } =
    useFlow<HistoricalPaymentFlowContextInterface>()

  return (
    <HistoricalPaymentSummary
      onEvent={onEvent}
      paymentGroupId={ensureRequired(createdPaymentGroupId)}
      companyId={ensureRequired(companyId)}
    />
  )
}
