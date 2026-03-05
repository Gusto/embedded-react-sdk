import { Suspense, useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { OffCycleCreation } from '../OffCycleCreation'
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

export function OffCycleCreationContextual() {
  const { companyId, onEvent } = useFlow<OffCycleFlowContextInterface>()
  return <OffCycleCreation companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

export function OffCycleExecutionContextual() {
  const { companyId, payrollUuid, onEvent, breadcrumbs } = useFlow<OffCycleFlowContextInterface>()

  const prefixBreadcrumbs = useMemo(() => {
    const offCycleCreationBreadcrumb = breadcrumbs?.['createOffCyclePayroll']?.[0]
    return offCycleCreationBreadcrumb ? [offCycleCreationBreadcrumb] : undefined
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
