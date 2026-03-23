import { useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { OffCycleCreation } from '../OffCycleCreation'
import {
  PayrollExecutionFlow,
  type PayrollExecutionFlowProps,
} from '../PayrollExecutionFlow/PayrollExecutionFlow'
import type { OffCycleReason } from '../OffCycleReasonSelection'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'
import { BaseComponent } from '@/components/Base/Base'

export interface OffCycleFlowContextInterface extends FlowContextInterface {
  companyId: string
  payrollUuid?: string
  payrollType?: OffCycleReason
}

export interface OffCycleFlowProps {
  companyId: string
  payrollType?: OffCycleReason
  onEvent: OnEventType<EventType, unknown>
}

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

export function OffCycleExecutionContextual() {
  const { companyId, payrollUuid, onEvent, breadcrumbs } = useFlow<OffCycleFlowContextInterface>()

  const offCycleCreationBreadcrumb = breadcrumbs?.['createOffCyclePayroll']?.[0]
  const prefixBreadcrumbs = useMemo(() => {
    return offCycleCreationBreadcrumb ? [offCycleCreationBreadcrumb] : undefined
  }, [offCycleCreationBreadcrumb])

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  return (
    <BaseComponent onEvent={onEvent}>
      <OffCycleExecutionWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </BaseComponent>
  )
}

type OffCycleExecutionWithDataProps = Pick<
  PayrollExecutionFlowProps,
  'companyId' | 'payrollId' | 'onEvent' | 'prefixBreadcrumbs'
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
      {...rest}
    />
  )
}
