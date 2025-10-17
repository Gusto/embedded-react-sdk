import type { ReactNode } from 'react'
import { PayrollLanding } from '../PayrollLanding/PayrollLanding'
import { PayrollConfiguration } from '../PayrollConfiguration/PayrollConfiguration'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import { PayrollBlocker } from '../PayrollBlocker/PayrollBlocker'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { BreadcrumbTrail } from '@/components/Common/UI/Breadcrumbs/BreadcrumbsTypes'

export type PayrollFlowDefaultValues = Record<string, unknown>

export interface PayrollFlowProps extends BaseComponentInterface {
  companyId: string
  defaultValues?: PayrollFlowDefaultValues
}

export type PayrollFlowAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
}

export interface PayrollFlowContextInterface extends FlowContextInterface {
  companyId: string
  defaultValues?: PayrollFlowDefaultValues
  payrollId?: string
  employeeId?: string
  firstName?: string
  lastName?: string
  alerts?: PayrollFlowAlert[]
  breadcrumbs?: BreadcrumbTrail
}

export function PayrollLandingContextual() {
  const { companyId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return <PayrollLanding onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function PayrollConfigurationContextual() {
  const { companyId, payrollId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollConfiguration
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollId)}
    />
  )
}

export function PayrollOverviewContextual() {
  const { companyId, payrollId, onEvent, alerts } = useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollOverview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollId)}
      alerts={alerts}
    />
  )
}

export function PayrollEditEmployeeContextual() {
  const { companyId, payrollId, employeeId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollEditEmployee
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollId)}
      employeeId={ensureRequired(employeeId)}
    />
  )
}

export function PayrollReceiptsContextual() {
  const { payrollId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return <PayrollReceipts onEvent={onEvent} payrollId={ensureRequired(payrollId)} />
}

export function PayrollBlockerContextual() {
  const { companyId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return <PayrollBlocker onEvent={onEvent} companyId={ensureRequired(companyId)} />
}
