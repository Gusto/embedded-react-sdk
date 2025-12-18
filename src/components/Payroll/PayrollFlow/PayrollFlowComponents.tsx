import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import { PayrollLanding } from '../PayrollLanding/PayrollLanding'
import { PayrollConfiguration } from '../PayrollConfiguration/PayrollConfiguration'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import { PayrollBlocker } from '../PayrollBlocker/PayrollBlocker'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { BreadcrumbTrail } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface PayrollFlowProps extends BaseComponentInterface {
  companyId: string
  withReimbursements?: boolean
}

export type PayrollFlowAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
  onDismiss?: () => void
}

export interface PayrollFlowContextInterface extends FlowContextInterface {
  companyId: string
  payrollUuid?: string
  employeeId?: string
  firstName?: string
  lastName?: string
  alerts?: PayrollFlowAlert[]
  breadcrumbs?: BreadcrumbTrail
  payPeriod?: PayrollPayPeriodType
  withReimbursements: boolean
}

export function PayrollLandingContextual() {
  const { companyId, onEvent, withReimbursements } = useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollLanding
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      withReimbursements={withReimbursements}
    />
  )
}

export function PayrollConfigurationContextual() {
  const { companyId, payrollUuid, onEvent, withReimbursements } =
    useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollConfiguration
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      withReimbursements={withReimbursements}
    />
  )
}

export function PayrollOverviewContextual() {
  const { companyId, payrollUuid, onEvent, alerts, withReimbursements } =
    useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollOverview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      alerts={alerts}
      withReimbursements={withReimbursements}
    />
  )
}

export function PayrollEditEmployeeContextual() {
  const { companyId, payrollUuid, employeeId, onEvent, withReimbursements } =
    useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollEditEmployee
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      employeeId={ensureRequired(employeeId)}
      withReimbursements={withReimbursements}
    />
  )
}

export function PayrollReceiptsContextual() {
  const { payrollUuid, onEvent, withReimbursements } = useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollReceipts
      onEvent={onEvent}
      payrollId={ensureRequired(payrollUuid)}
      withReimbursements={withReimbursements}
    />
  )
}

export function PayrollBlockerContextual() {
  const { companyId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return <PayrollBlocker onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

export function SaveAndExitCta() {
  const { onEvent, ctaConfig } = useFlow<PayrollFlowContextInterface>()
  const { Button } = useComponentContext()
  const namespace = ctaConfig?.namespace || 'common'
  useI18n([namespace])
  const { t } = useTranslation(namespace)

  if (!ctaConfig?.labelKey) return null

  return (
    <Button
      onClick={() => {
        onEvent(componentEvents.PAYROLL_EXIT_FLOW)
      }}
      variant="secondary"
    >
      {t(ctaConfig.labelKey as never)}
    </Button>
  )
}
