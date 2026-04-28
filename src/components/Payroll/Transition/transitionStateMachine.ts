import { state, transition, reduce, guard } from 'robot3'
import {
  TransitionCreationContextual,
  TransitionExecutionContextual,
  type TransitionFlowContextInterface,
} from './TransitionFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { patchBreadcrumbsHeader } from '@/helpers/breadcrumbHelpers'

export const transitionBreadcrumbsNodes: BreadcrumbNodes = {
  createTransitionPayroll: {
    parent: null,
    item: {
      id: 'createTransitionPayroll',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.Transition',
      onNavigate: ((ctx: TransitionFlowContextInterface) => ({
        ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: 'createTransitionPayroll' }),
        component: TransitionCreationContextual,
        payrollUuid: undefined,
      })) as (context: unknown) => unknown,
    },
  },
}

function toCreationReducer(ctx: TransitionFlowContextInterface): TransitionFlowContextInterface {
  return {
    ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: 'createTransitionPayroll' }),
    component: TransitionCreationContextual,
    payrollUuid: undefined,
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
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          payrollUuid: ev.payload?.payrollUuid,
          component: TransitionExecutionContextual,
        }),
      ),
    ),
  ),

  execution: state<MachineTransition>(creationBreadcrumbTransition),
}
