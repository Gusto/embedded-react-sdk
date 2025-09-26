import { PayrollLanding } from '../PayrollLanding/PayrollLanding'
import { PayrollConfiguration } from '../PayrollConfiguration/PayrollConfiguration'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'

export type PayrollFlowDefaultValues = Record<string, unknown>

export interface PayrollFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: PayrollFlowDefaultValues
}

export interface PayrollFlowContextInterface extends FlowContextInterface {
  companyId: string
  defaultValues?: PayrollFlowDefaultValues
  payrollId?: string
  employeeId?: string
}

export function PayrollLandingContextual() {
  const { companyId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return <PayrollLanding onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function PayrollConfigurationContextual() {
  const { companyId, payrollId, onEvent } = useFlow<PayrollFlowContextInterface>()
  if (!payrollId) {
    throw new Error('PayrollConfiguration requires payrollId')
  }
  return (
    <PayrollConfiguration
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={payrollId}
    />
  )
}

export function PayrollOverviewContextual() {
  const { companyId, payrollId, onEvent } = useFlow<PayrollFlowContextInterface>()
  if (!payrollId) {
    throw new Error('PayrollOverview requires payrollId')
  }
  return (
    <PayrollOverview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={payrollId}
    />
  )
}

export function PayrollEditEmployeeContextual() {
  const { companyId, payrollId, employeeId, onEvent } = useFlow<PayrollFlowContextInterface>()
  if (!payrollId || !employeeId) {
    throw new Error('PayrollEditEmployee requires payrollId and employeeId')
  }
  return (
    <PayrollEditEmployee
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={payrollId}
      employeeId={employeeId}
    />
  )
}

export function PayrollReceiptsContextual() {
  const { payrollId, onEvent } = useFlow<PayrollFlowContextInterface>()
  if (!payrollId) {
    throw new Error('PayrollReceipts requires payrollId')
  }
  return <PayrollReceipts onEvent={onEvent} payrollId={payrollId} />
}
