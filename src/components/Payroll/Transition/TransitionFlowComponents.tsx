import { useMemo } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/payrollsGet'
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

/**
 * Flow context shape carried through the transition payroll state machine.
 *
 * @public
 */
export interface TransitionFlowContextInterface extends FlowContextInterface {
  /** Company the transition payroll belongs to. */
  companyId: string
  /** Start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** End date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** UUID of the pay schedule the transition is associated with. */
  payScheduleUuid: string
  /** UUID of the created transition payroll, populated once creation completes. */
  payrollUuid?: string
}

/**
 * Props for {@link TransitionFlow}.
 *
 * @public
 */
export interface TransitionFlowProps {
  /** Company running the transition payroll. */
  companyId: string
  /** Start date of the transition pay period (YYYY-MM-DD). */
  startDate: string
  /** End date of the transition pay period (YYYY-MM-DD). */
  endDate: string
  /** UUID of the pay schedule the transition is associated with. */
  payScheduleUuid: string
  /** UUID of an existing transition payroll. When provided, the flow skips creation and resumes in execution. */
  payrollUuid?: string
  /** Callback invoked for each event emitted by the flow and its child steps. */
  onEvent: OnEventType<EventType, unknown>
}

/** @internal */
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

/** @internal */
export function TransitionExecutionContextual() {
  const { companyId, payrollUuid, onEvent, header } = useFlow<TransitionFlowContextInterface>()

  const transitionCreationBreadcrumb =
    header?.indicator === 'breadcrumbs'
      ? header.breadcrumbs?.['createTransitionPayroll']?.[0]
      : undefined
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
