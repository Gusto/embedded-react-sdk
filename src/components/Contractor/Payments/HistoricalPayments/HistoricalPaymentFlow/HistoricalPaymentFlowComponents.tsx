import { CreateHistoricalPayment } from '../CreateHistoricalPayment/CreateHistoricalPayment'
import { HistoricalPaymentSuccess } from '../CreateHistoricalPayment/HistoricalPaymentSuccess'
import type { InternalAlert } from '../types'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import type { BreadcrumbTrail } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface HistoricalPaymentFlowProps extends BaseComponentInterface {
  companyId: string
}

export interface HistoricalPaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  breadcrumbs?: BreadcrumbTrail
  createdPaymentGroupId?: string
  alerts?: InternalAlert[]
}

export function CreateHistoricalPaymentContextual() {
  const { companyId, onEvent } = useFlow<HistoricalPaymentFlowContextInterface>()
  return <CreateHistoricalPayment onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function HistoricalPaymentSuccessContextual() {
  const { companyId, createdPaymentGroupId, onEvent } =
    useFlow<HistoricalPaymentFlowContextInterface>()
  return (
    <HistoricalPaymentSuccess
      paymentGroupId={ensureRequired(createdPaymentGroupId)}
      companyId={ensureRequired(companyId)}
      onEvent={onEvent}
    />
  )
}
