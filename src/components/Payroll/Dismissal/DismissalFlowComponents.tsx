import { useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  PayrollExecutionInternalFlow,
  type PayrollExecutionInternalFlowProps,
} from '../PayrollExecutionFlow/PayrollExecutionFlow'
import { DismissalPayPeriodSelection } from './DismissalPayPeriodSelection/DismissalPayPeriodSelection'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'
import { BaseComponent } from '@/components/Base/Base'

/** @internal */
export interface DismissalFlowContextInterface extends FlowContextInterface {
  /** The associated company identifier. */
  companyId: string
  /** The terminated employee whose final payroll is being run. */
  employeeId?: string
  /** The dismissal payroll identifier, set once a pay period has been selected and the payroll created. */
  payrollUuid?: string
}

/**
 * Props for {@link DismissalFlow}.
 *
 * @public
 */
export interface DismissalFlowProps {
  /** The associated company identifier. */
  companyId: string
  /** The terminated employee whose final payroll is being run. */
  employeeId?: string
  /** Handler for events emitted by the flow. See {@link DismissalFlow} for the event table. */
  onEvent: OnEventType<EventType, unknown>
  /** Optional dismissal payroll identifier. When provided, the flow skips pay period selection and starts directly at payroll execution. */
  payrollId?: string
}

/** @internal */
export function DismissalPayPeriodSelectionContextual() {
  const { companyId, employeeId, onEvent } = useFlow<DismissalFlowContextInterface>()
  return (
    <DismissalPayPeriodSelection
      companyId={ensureRequired(companyId)}
      employeeId={employeeId}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function DismissalExecutionContextual() {
  const { companyId, payrollUuid, onEvent, header } = useFlow<DismissalFlowContextInterface>()

  const payPeriodSelectionBreadcrumb =
    header?.type === 'breadcrumbs' ? header.breadcrumbs?.['payPeriodSelection']?.[0] : undefined
  const prefixBreadcrumbs = useMemo(() => {
    return payPeriodSelectionBreadcrumb ? [payPeriodSelectionBreadcrumb] : undefined
  }, [payPeriodSelectionBreadcrumb])

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  return (
    <BaseComponent onEvent={onEvent}>
      <DismissalExecutionWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </BaseComponent>
  )
}

type DismissalExecutionWithDataProps = Pick<
  PayrollExecutionInternalFlowProps,
  'companyId' | 'payrollId' | 'onEvent' | 'prefixBreadcrumbs'
>

function DismissalExecutionWithData({
  companyId,
  payrollId,
  ...rest
}: DismissalExecutionWithDataProps) {
  const { data } = usePayrollsGetSuspense({ companyId, payrollId })
  const initialPayPeriod = data.payrollShow?.payPeriod

  return (
    <PayrollExecutionInternalFlow
      companyId={companyId}
      payrollId={payrollId}
      initialPayPeriod={initialPayPeriod}
      isDismissalPayroll
      {...rest}
    />
  )
}
