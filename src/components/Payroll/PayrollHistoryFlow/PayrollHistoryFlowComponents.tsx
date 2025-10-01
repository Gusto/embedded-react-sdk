import { PayrollHistory } from '../PayrollHistory/PayrollHistory'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import { useFlow } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface PayrollHistoryFlowProps
  extends BaseComponentInterface<'Payroll.PayrollHistoryFlow'> {
  companyId: string
}

export interface PayrollHistoryFlowContextInterface {
  component: (() => React.JSX.Element) | null
  companyId: string
  onEvent: (type: string, payload: unknown) => void
  payrollId?: string
  previousState?: 'history' | 'overview'
}

export function PayrollHistoryContextual() {
  const { companyId, onEvent } = useFlow<PayrollHistoryFlowContextInterface>()
  return <PayrollHistory companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

export function PayrollHistoryOverviewContextual() {
  const { companyId, payrollId, onEvent } = useFlow<PayrollHistoryFlowContextInterface>()

  if (!payrollId) {
    throw new Error('PayrollHistoryOverview requires payrollId')
  }
  return (
    <PayrollOverview
      companyId={ensureRequired(companyId)}
      payrollId={payrollId}
      onEvent={onEvent}
      showBackButton={true}
    />
  )
}

export function PayrollHistoryReceiptsContextual() {
  const { payrollId, onEvent } = useFlow<PayrollHistoryFlowContextInterface>()

  if (!payrollId) {
    throw new Error('PayrollHistoryReceipts requires payrollId')
  }

  return <PayrollReceipts onEvent={onEvent} payrollId={payrollId} showBackButton={true} />
}
