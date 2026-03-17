import { state, transition, reduce, guard } from 'robot3'
import {
  TransitionCreationContextual,
  TransitionExecutionContextual,
  type TransitionFlowContextInterface,
} from './TransitionFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

export const transitionBreadcrumbsNodes: BreadcrumbNodes = {
  createTransitionPayroll: {
    parent: null,
    item: {
      id: 'createTransitionPayroll',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.Transition',
      onNavigate: ((ctx: TransitionFlowContextInterface) => ({
        ...ctx,
        component: TransitionCreationContextual,
        payrollUuid: undefined,
        currentBreadcrumbId: 'createTransitionPayroll',
        progressBarType: 'breadcrumbs',
      })) as (context: unknown) => unknown,
    },
  },
}

function toCreationReducer(ctx: TransitionFlowContextInterface): TransitionFlowContextInterface {
  return {
    ...ctx,
    component: TransitionCreationContextual,
    payrollUuid: undefined,
    currentBreadcrumbId: 'createTransitionPayroll',
    progressBarType: 'breadcrumbs',
  }
}

const creationBreadcrumbTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'createTransitionPayroll',
  guard(
    (_ctx: TransitionFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'createTransitionPayroll',
  ),
  reduce(toCreationReducer),
)

export const transitionMachine = {
  createTransitionPayroll: state<MachineTransition>(
    transition(
      componentEvents.TRANSITION_CREATED,
      'execution',
      reduce(
        (
          ctx: TransitionFlowContextInterface,
          ev: { payload?: { payrollUuid?: string } },
        ): TransitionFlowContextInterface => ({
          ...ctx,
          payrollUuid: ev.payload?.payrollUuid,
          component: TransitionExecutionContextual,
          progressBarType: null,
        }),
      ),
    ),
  ),

  execution: state<MachineTransition>(creationBreadcrumbTransition),
}
