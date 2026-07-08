import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import { PayrollLanding } from '../PayrollLanding/PayrollLanding'
import { PayrollConfiguration } from '../PayrollConfiguration/PayrollConfiguration'
import { PayrollOverview } from '../PayrollOverview/PayrollOverview'
import { PayrollEditEmployee } from '../PayrollEditEmployee/PayrollEditEmployee'
import { PayrollReceipts } from '../PayrollReceipts/PayrollReceipts'
import { PayrollBlockerList } from '../PayrollBlocker'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { ensureRequired } from '@/helpers/ensureRequired'
import type { BreadcrumbTrail } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * Props accepted by {@link PayrollFlow}.
 *
 * @public
 */
export interface PayrollFlowProps extends BaseComponentInterface<never> {
  /** Identifier of the company whose payroll is being run. */
  companyId: string
  /** Whether reimbursement fields are shown in the payroll configuration and overview. Defaults to `true`. */
  withReimbursements?: boolean
  /** Optional custom component that replaces the default wire-details confirmation UI. */
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
}

/**
 * An alert banner rendered above payroll content in {@link PayrollOverview} and
 * {@link PayrollConfiguration}.
 *
 * @public
 */
export type PayrollFlowAlert = {
  /** Visual severity of the alert. */
  type: 'error' | 'info' | 'success'
  /** Short heading text displayed in the alert. */
  title: string
  /** Optional body content rendered below the title. */
  content?: ReactNode
  /** Called when the user dismisses the alert. When omitted, the alert is not dismissible. */
  onDismiss?: () => void
  /** Stable key used to track alert identity across renders (e.g. for animations or deduplication). */
  alertKey?: string
}

/** @internal */
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
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  showPayrollCancelledAlert?: boolean
  hasPayrollSubmissionStarted?: boolean
  executionInitialState?: 'configuration' | 'overview'
  transitionStartDate?: string
  transitionEndDate?: string
  transitionPayScheduleUuid?: string
}

/** @internal */
export function PayrollLandingContextual() {
  const {
    companyId,
    onEvent,
    withReimbursements,
    ConfirmWireDetailsComponent,
    showPayrollCancelledAlert,
  } = useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollLanding
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      withReimbursements={withReimbursements}
      ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
      showPayrollCancelledAlert={showPayrollCancelledAlert}
    />
  )
}

/** @internal */
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

/** @internal */
export function PayrollOverviewContextual() {
  const {
    companyId,
    payrollUuid,
    onEvent,
    alerts,
    withReimbursements,
    ConfirmWireDetailsComponent,
  } = useFlow<PayrollFlowContextInterface>()
  return (
    <PayrollOverview
      onEvent={onEvent}
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      alerts={alerts}
      withReimbursements={withReimbursements}
      ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
    />
  )
}

/** @internal */
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

/** @internal */
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

/** @internal */
export function PayrollBlockerContextual() {
  const { companyId, onEvent } = useFlow<PayrollFlowContextInterface>()
  return <PayrollBlockerList onEvent={onEvent} companyId={ensureRequired(companyId)} />
}

/** @internal */
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
