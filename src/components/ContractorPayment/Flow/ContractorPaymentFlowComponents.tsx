import { ContractorPaymentCreatePayment } from '../CreatePayment/CreatePayment'
import { ContractorPaymentPaymentHistory } from '../PaymentHistory/PaymentHistory'
import { Overview } from '../Overview/Overview'
import { ContractorPaymentDetail } from '../Detail/Detail'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

export type ContractorPaymentFlowDefaultValues = Record<string, unknown>

export interface ContractorPaymentFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: ContractorPaymentFlowDefaultValues
}

export interface ContractorPaymentFlowContextInterface extends FlowContextInterface {
  companyId: string
  paymentGroupId?: string
  selectedDate?: string
  defaultValues?: ContractorPaymentFlowDefaultValues
}

export function ContractorPaymentPaymentHistoryContextual() {
  const { companyId, onEvent } = useFlow<ContractorPaymentFlowContextInterface>()
  return <ContractorPaymentPaymentHistory onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function ContractorPaymentCreatePaymentContextual() {
  const { companyId, paymentGroupId, onEvent } = useFlow<ContractorPaymentFlowContextInterface>()
  return (
    <ContractorPaymentCreatePayment
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      paymentGroupId={paymentGroupId}
    />
  )
}

export function ContractorPaymentOverviewContextual() {
  const { companyId, paymentGroupId, onEvent } = useFlow<ContractorPaymentFlowContextInterface>()
  return (
    <Overview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      paymentGroupId={ensureRequired(paymentGroupId)}
    />
  )
}

export function ContractorPaymentDetailContextual() {
  const { companyId, selectedDate, onEvent } = useFlow<ContractorPaymentFlowContextInterface>()
  return (
    <ContractorPaymentDetail
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      date={ensureRequired(selectedDate)}
    />
  )
}
