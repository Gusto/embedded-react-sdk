import { PaymentsListInternal } from '../PaymentsList/PaymentsList'
import { CreatePaymentInternalFlow } from '../CreatePaymentFlow/CreatePaymentFlow'
import { ViewHistoryInternalFlow } from '../ViewHistoryFlow/ViewHistoryFlow'
import type { InternalAlert } from '../types'
import { InformationRequestsFlow } from '@/components/InformationRequests'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

/**
 * Props for {@link PaymentFlow}.
 *
 * @public
 */
export interface PaymentFlowProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

/** @internal */
export interface PaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  currentPaymentId?: string
  alerts?: InternalAlert[]
}

/** @internal */
export function PaymentListContextual() {
  const { companyId, onEvent, alerts } = useFlow<PaymentFlowContextInterface>()
  return (
    <PaymentsListInternal onEvent={onEvent} companyId={ensureRequired(companyId)} alerts={alerts} />
  )
}

function useLandingPrefixBreadcrumbs() {
  const { header } = useFlow<PaymentFlowContextInterface>()
  const landingBreadcrumb =
    header?.type === 'breadcrumbs' ? header.breadcrumbs?.landing?.[0] : undefined
  return landingBreadcrumb ? [landingBreadcrumb] : undefined
}

/** @internal */
export function CreatePaymentFlowContextual() {
  const { companyId, onEvent } = useFlow<PaymentFlowContextInterface>()
  const prefixBreadcrumbs = useLandingPrefixBreadcrumbs()

  return (
    <CreatePaymentInternalFlow
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
      prefixBreadcrumbs={prefixBreadcrumbs}
    />
  )
}

/** @internal */
export function ViewHistoryFlowContextual() {
  const { currentPaymentId, onEvent } = useFlow<PaymentFlowContextInterface>()
  const prefixBreadcrumbs = useLandingPrefixBreadcrumbs()

  return (
    <ViewHistoryInternalFlow
      paymentId={ensureRequired(currentPaymentId)}
      onEvent={onEvent}
      prefixBreadcrumbs={prefixBreadcrumbs}
    />
  )
}

/** @internal */
export function InformationRequestsContextual() {
  const { companyId, onEvent } = useFlow<PaymentFlowContextInterface>()
  return (
    <InformationRequestsFlow
      companyId={ensureRequired(companyId)}
      withAlert={false}
      onEvent={onEvent}
    />
  )
}
