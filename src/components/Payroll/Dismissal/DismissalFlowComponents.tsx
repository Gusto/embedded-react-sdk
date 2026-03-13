import { Suspense, useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  PayrollExecutionFlow,
  type PayrollExecutionFlowProps,
} from '../PayrollExecutionFlow/PayrollExecutionFlow'
import { DismissalPayPeriodSelection } from './DismissalPayPeriodSelection/DismissalPayPeriodSelection'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface DismissalFlowContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
  payrollUuid?: string
}

export interface DismissalFlowProps {
  companyId: string
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
  payrollId?: string
}

export function DismissalPayPeriodSelectionContextual() {
  const { companyId, employeeId, onEvent } = useFlow<DismissalFlowContextInterface>()
  return (
    <DismissalPayPeriodSelection
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      onEvent={onEvent}
    />
  )
}

export function DismissalExecutionContextual() {
  const { companyId, payrollUuid, onEvent, breadcrumbs } = useFlow<DismissalFlowContextInterface>()

  const payPeriodSelectionBreadcrumb = breadcrumbs?.['payPeriodSelection']?.[0]
  const prefixBreadcrumbs = useMemo(() => {
    return payPeriodSelectionBreadcrumb ? [payPeriodSelectionBreadcrumb] : undefined
  }, [payPeriodSelectionBreadcrumb])

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  return (
    <Suspense>
      <DismissalExecutionWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </Suspense>
  )
}

type DismissalExecutionWithDataProps = Pick<
  PayrollExecutionFlowProps,
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
    <PayrollExecutionFlow
      companyId={companyId}
      payrollId={payrollId}
      initialPayPeriod={initialPayPeriod}
      {...rest}
    />
  )
}
