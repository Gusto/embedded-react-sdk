import { PaymentsList } from '../PaymentsList/PaymentsList'
import { CreatePayment } from '../CreatePayment/CreatePayment'
import { PaymentHistory } from '../PaymentHistory/PaymentHistory'
import type { InternalAlert } from '../types'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import type { BreadcrumbTrail } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface PaymentFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface PaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  breadcrumbs?: BreadcrumbTrail
  currentPaymentId?: string
  alerts?: InternalAlert[]
}

export function PaymentListContextual() {
  const { companyId, onEvent, alerts } = useFlow<PaymentFlowContextInterface>()
  return <PaymentsList onEvent={onEvent} companyId={ensureRequired(companyId)} alerts={alerts} />
}

export function CreatePaymentContextual() {
  const { companyId, onEvent } = useFlow<PaymentFlowContextInterface>()
  return <CreatePayment onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function PaymentHistoryContextual() {
  const { currentPaymentId, onEvent } = useFlow<PaymentFlowContextInterface>()
  return <PaymentHistory onEvent={onEvent} paymentId={ensureRequired(currentPaymentId)} />
}
