import { PaymentsList } from '../PaymentsList/PaymentsList'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
// import { ensureRequired } from '@/helpers/ensureRequired'
import type { BreadcrumbTrail } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface PaymentFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface PaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  breadcrumbs?: BreadcrumbTrail
}

export function PaymentListContextual() {
  const { companyId, onEvent } = useFlow<PaymentFlowContextInterface>()
  return <PaymentsList onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function CreatePaymentContextual() {
  return <div>CreatePaymentContextual</div>
}

export function EditPaymentContextual() {
  return <div>EditPaymentContextual</div>
}

export function ReviewAndSubmitPaymentContextual() {
  return <div>ReviewAndSubmitPaymentContextual</div>
}

export function PaymentHistoryContextual() {
  return <div>PaymentHistoryContextual</div>
}
