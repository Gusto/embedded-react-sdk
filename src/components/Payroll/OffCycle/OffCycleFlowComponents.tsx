import { Suspense, useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  PayrollExecutionFlow,
  type PayrollExecutionFlowProps,
} from '../PayrollExecutionFlow/PayrollExecutionFlow'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface OffCycleFlowContextInterface extends FlowContextInterface {
  companyId: string
  payrollUuid?: string
}

export interface OffCycleFlowProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

// TODO: Wire to OffCycleCreation component in follow-up PR
export function OffCycleCreationContextual() {
  return <div>Off-Cycle Creation placeholder</div>
}

export function OffCycleExecutionContextual() {
  const { companyId, payrollUuid, onEvent, breadcrumbs } = useFlow<OffCycleFlowContextInterface>()

  const prefixBreadcrumbs = useMemo(() => {
    const reasonSelectionBreadcrumb = breadcrumbs?.['createOffCyclePayroll']?.[0]
    return reasonSelectionBreadcrumb ? [reasonSelectionBreadcrumb] : undefined
  }, [breadcrumbs])

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  return (
    <Suspense>
      <OffCycleExecutionWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </Suspense>
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
