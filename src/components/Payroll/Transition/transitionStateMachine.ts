import { state, transition, reduce } from 'robot3'
import {
  payrollExecutionMachine,
  getPayrollExecutionBreadcrumbsNodes,
  calculatedTransition,
  alreadyProcessedTransition,
  employeeEditTransition,
  blockersViewAllTransition,
} from '../PayrollExecutionFlow/payrollExecutionMachine'
import {
  TransitionPayrollContextual,
  type TransitionFlowContextInterface,
} from './TransitionFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type {
  BreadcrumbNode,
  BreadcrumbNodes,
} from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { updateBreadcrumbs } from '@/helpers/breadcrumbHelpers'

const executionBreadcrumbsNodes = getPayrollExecutionBreadcrumbsNodes()
const sharedConfigurationNode = executionBreadcrumbsNodes.configuration!

/**
 * Breadcrumb nodes for the transition payroll macro flow: the creation crumb merged with the
 * shared payroll-execution crumbs. `configuration` is nested under the creation crumb so the
 * "Transition Payroll" crumb persists in the trail once the flow advances past creation, matching
 * the display-only prefix the flow rendered before this refactor.
 *
 * @internal
 */
export const transitionBreadcrumbsNodes: BreadcrumbNodes = {
  // Display-only creation crumb (no `onNavigate`, matching the non-navigable prefix the flow
  // rendered before this refactor).
  createTransitionPayroll: {
    parent: null,
    item: {
      id: 'createTransitionPayroll',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.Transition',
    },
  },
  ...executionBreadcrumbsNodes,
  configuration: {
    ...sharedConfigurationNode,
    parent: 'createTransitionPayroll',
  },
} satisfies Record<string, BreadcrumbNode>

// Records the created payroll's UUID and moves the breadcrumb to configuration, keeping
// TransitionPayroll mounted so it advances its own screen from creation to configuration.
const transitionCreatedTransition = transition(
  componentEvents.TRANSITION_CREATED,
  'transitionPayroll',
  reduce(
    (
      ctx: TransitionFlowContextInterface,
      ev: { payload?: { payrollUuid?: string } },
    ): TransitionFlowContextInterface => ({
      ...updateBreadcrumbs('configuration', ctx, {
        startDate: ctx.startDate,
        endDate: ctx.endDate,
      }),
      component: TransitionPayrollContextual,
      payrollUuid: ev.payload?.payrollUuid ?? ctx.payrollUuid,
    }),
  ),
)

/**
 * Macro state machine for {@link TransitionFlow}.
 *
 * @remarks
 * The entry state renders {@link TransitionPayroll}; the rest of the states are the shared
 * {@link payrollExecutionMachine} states, reused via object spread. The entry state reuses that
 * machine's onward transitions so configuration events route into overview / edit-employee /
 * blockers.
 *
 * @internal
 */
export const transitionMachine = {
  transitionPayroll: state<MachineTransition>(
    transitionCreatedTransition,
    calculatedTransition,
    alreadyProcessedTransition,
    employeeEditTransition,
    blockersViewAllTransition,
  ),
  ...payrollExecutionMachine,
}
