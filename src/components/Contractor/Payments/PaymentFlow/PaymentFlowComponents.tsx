import { PaymentsList } from '../PaymentsList/PaymentsList'
import { CreatePayment } from '../CreatePayment/CreatePayment'
import { PaymentHistory } from '../PaymentHistory/PaymentHistory'
import { PaymentStatement } from '../PaymentStatement/PaymentStatement'
import { PaymentSummary } from '../PaymentSummary'
import type { InternalAlert } from '../types'
import { InformationRequestsFlow } from '@/components/InformationRequests'
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
  currentContractorUuid?: string
  createdPaymentGroupId?: string
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

export function PaymentStatementContextual() {
  const { currentPaymentId, currentContractorUuid, onEvent } =
    useFlow<PaymentFlowContextInterface>()
  return (
    <PaymentStatement
      onEvent={onEvent}
      paymentGroupId={ensureRequired(currentPaymentId)}
      contractorUuid={ensureRequired(currentContractorUuid)}
    />
  )
}

export function PaymentSummaryContextual() {
  const { createdPaymentGroupId, companyId, onEvent } = useFlow<PaymentFlowContextInterface>()

  return (
    <PaymentSummary
      onEvent={onEvent}
      paymentGroupId={ensureRequired(createdPaymentGroupId)}
      companyId={ensureRequired(companyId)}
    />
  )
}

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
