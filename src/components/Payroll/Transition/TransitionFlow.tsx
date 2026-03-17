import { useMemo } from 'react'
import { createMachine } from 'robot3'
import { transitionMachine, transitionBreadcrumbsNodes } from './transitionStateMachine'
import {
  TransitionCreationContextual,
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
  onEvent,
}: TransitionFlowProps) {
  const transitionFlowMachine = useMemo(
    () =>
      createMachine(
        'createTransitionPayroll',
        transitionMachine,
        (initialContext: TransitionFlowContextInterface) => ({
          ...initialContext,
          component: TransitionCreationContextual,
          companyId,
          startDate,
          endDate,
          payScheduleUuid,
          breadcrumbs: buildBreadcrumbs(transitionBreadcrumbsNodes),
          currentBreadcrumbId: 'createTransitionPayroll',
          progressBarType: 'breadcrumbs' as const,
        }),
      ),
    [companyId, startDate, endDate, payScheduleUuid],
  )

  return <Flow machine={transitionFlowMachine} onEvent={onEvent} />
}
