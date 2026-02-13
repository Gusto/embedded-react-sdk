import { useMemo } from 'react'
import { OffCycleReasonSelection } from '../OffCycleReasonSelection'
import { PayrollExecutionFlow } from '../PayrollExecutionFlow/PayrollExecutionFlow'
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

export function OffCycleReasonSelectionContextual() {
  const { companyId, onEvent } = useFlow<OffCycleFlowContextInterface>()
  return <OffCycleReasonSelection companyId={ensureRequired(companyId)} onEvent={onEvent} />
}

export function OffCycleExecutionContextual() {
  const { companyId, payrollUuid, onEvent, breadcrumbs } = useFlow<OffCycleFlowContextInterface>()

  const prefixBreadcrumbs = useMemo(() => {
    const reasonSelectionBreadcrumb = breadcrumbs?.['createOffCyclePayroll']?.[0]
    return reasonSelectionBreadcrumb ? [reasonSelectionBreadcrumb] : undefined
  }, [breadcrumbs])

  return (
    <PayrollExecutionFlow
      companyId={ensureRequired(companyId)}
      payrollId={ensureRequired(payrollUuid)}
      onEvent={onEvent}
      prefixBreadcrumbs={prefixBreadcrumbs}
    />
  )
}
