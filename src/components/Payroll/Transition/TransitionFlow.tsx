import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { transitionMachine, transitionBreadcrumbsNodes } from './transitionStateMachine'
import {
  TransitionCreationContextual,
  TransitionExecutionContextual,
  type TransitionFlowContextInterface,
  type TransitionFlowProps,
} from './TransitionFlowComponents'
import { Flow } from '@/components/Flow/Flow'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export function TransitionFlow({
  companyId,
  startDate,
  endDate,
  payScheduleUuid,
  payrollUuid,
  onEvent,
}: TransitionFlowProps) {
  const hasExistingPayroll = Boolean(payrollUuid)
  const initialState = hasExistingPayroll ? 'execution' : 'createTransitionPayroll'
  const initialComponent = hasExistingPayroll
    ? TransitionExecutionContextual
    : TransitionCreationContextual

  const transitionFlowMachine = useMemo(
    () =>
      createMachine(
        initialState,
        transitionMachine,
        (initialContext: TransitionFlowContextInterface) => ({
          ...initialContext,
          component: initialComponent,
          companyId,
          startDate,
          endDate,
          payScheduleUuid,
          payrollUuid,
          breadcrumbs: buildBreadcrumbs(transitionBreadcrumbsNodes),
          currentBreadcrumbId: hasExistingPayroll ? undefined : 'createTransitionPayroll',
          progressBarType: hasExistingPayroll ? null : ('breadcrumbs' as const),
        }),
      ),
    [companyId, startDate, endDate, payScheduleUuid, payrollUuid],
  )

  return <Flow machine={transitionFlowMachine} onEvent={onEvent} />
}
