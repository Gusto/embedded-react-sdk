import { useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import {
  PayrollExecutionFlow,
  type PayrollExecutionFlowProps,
} from '../PayrollExecutionFlow/PayrollExecutionFlow'
import { TransitionCreation } from '../TransitionCreation'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { BaseComponent } from '@/components/Base/Base'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'
import { ensureRequired } from '@/helpers/ensureRequired'

export interface TransitionFlowContextInterface extends FlowContextInterface {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
  payrollUuid?: string
}

export interface TransitionFlowProps {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
  payrollUuid?: string
  onEvent: OnEventType<EventType, unknown>
}

export function TransitionCreationContextual() {
  const { companyId, startDate, endDate, payScheduleUuid, onEvent } =
    useFlow<TransitionFlowContextInterface>()
  return (
    <TransitionCreation
      companyId={ensureRequired(companyId)}
      startDate={ensureRequired(startDate)}
      endDate={ensureRequired(endDate)}
      payScheduleUuid={ensureRequired(payScheduleUuid)}
      onEvent={onEvent}
    />
  )
}

export function TransitionExecutionContextual() {
  const { companyId, payrollUuid, onEvent, breadcrumbs } = useFlow<TransitionFlowContextInterface>()

  const transitionCreationBreadcrumb = breadcrumbs?.['createTransitionPayroll']?.[0]
  const prefixBreadcrumbs = useMemo(() => {
    return transitionCreationBreadcrumb ? [transitionCreationBreadcrumb] : undefined
  }, [transitionCreationBreadcrumb])

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  return (
    <BaseComponent onEvent={onEvent}>
      <TransitionExecutionWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </BaseComponent>
  )
}

type TransitionExecutionWithDataProps = Pick<
  PayrollExecutionFlowProps,
  'companyId' | 'payrollId' | 'onEvent' | 'prefixBreadcrumbs'
>

function TransitionExecutionWithData({
  companyId,
  payrollId,
  ...rest
}: TransitionExecutionWithDataProps) {
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
