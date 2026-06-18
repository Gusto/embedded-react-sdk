import { useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsGet'
import { OffCycleCreation } from '../OffCycleCreation'
import {
  PayrollExecutionFlow,
  type PayrollExecutionFlowProps,
} from '../PayrollExecutionFlow/PayrollExecutionFlow'
import type { OffCycleReason } from '../OffCycleReasonSelection'
import { isDismissalPayroll } from '../helpers'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'
import { BaseComponent } from '@/components/Base/Base'

/**
 * Flow context shared across the off-cycle payroll flow steps.
 *
 * @public
 */
export interface OffCycleFlowContextInterface extends FlowContextInterface {
  /** The associated company identifier. */
  companyId: string
  /** Identifier of the off-cycle payroll created during the flow; set once creation completes. */
  payrollUuid?: string
  /** Pre-selected off-cycle reason (bonus or correction). */
  payrollType?: OffCycleReason
  /** Whether to show reimbursement fields throughout the execution steps. Defaults to true. */
  withReimbursements?: boolean
}

/**
 * Props for {@link OffCycleFlow}.
 *
 * @public
 */
export interface OffCycleFlowProps {
  /** The associated company identifier. */
  companyId: string
  /** Optional pre-selected off-cycle reason. When provided, the creation form starts with this reason selected. */
  payrollType?: OffCycleReason
  /** Callback invoked when the flow emits an event. See the events table on {@link OffCycleFlow}. */
  onEvent: OnEventType<EventType, unknown>
  /** Optional flag to show/hide reimbursement fields throughout the flow. Defaults to true. */
  withReimbursements?: boolean
}

/** @internal */
export function OffCycleCreationContextual() {
  const { companyId, payrollType, onEvent } = useFlow<OffCycleFlowContextInterface>()
  return (
    <OffCycleCreation
      companyId={ensureRequired(companyId)}
      payrollType={payrollType}
      onEvent={onEvent}
    />
  )
}

/** @internal */
export function OffCycleExecutionContextual() {
  const { companyId, payrollUuid, onEvent, withReimbursements, header } =
    useFlow<OffCycleFlowContextInterface>()

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  const offCycleRootBreadcrumb =
    header?.type === 'breadcrumbs' ? header.breadcrumbs?.['createOffCyclePayroll']?.[0] : undefined
  const prefixBreadcrumbs = useMemo(
    () => (offCycleRootBreadcrumb ? [offCycleRootBreadcrumb] : undefined),
    [offCycleRootBreadcrumb],
  )

  return (
    <BaseComponent onEvent={onEvent}>
      <OffCycleExecutionWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        withReimbursements={withReimbursements}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </BaseComponent>
  )
}

type OffCycleExecutionWithDataProps = Pick<
  PayrollExecutionFlowProps,
  'companyId' | 'payrollId' | 'onEvent' | 'prefixBreadcrumbs' | 'withReimbursements'
>

function OffCycleExecutionWithData({
  companyId,
  payrollId,
  ...rest
}: OffCycleExecutionWithDataProps) {
  const { data } = usePayrollsGetSuspense({ companyId, payrollId })
  const initialPayPeriod = data.payrollShow?.payPeriod

  return (
    <PayrollExecutionFlow
      companyId={companyId}
      payrollId={payrollId}
      initialPayPeriod={initialPayPeriod}
      isDismissalPayroll={isDismissalPayroll(data.payrollShow?.offCycleReason)}
      {...rest}
    />
  )
}
