import { state, transition, reduce } from 'robot3'
import type { PayrollFlowContextInterface } from '../PayrollFlow/PayrollFlowComponents'
import {
  payrollExecutionMachine,
  getPayrollExecutionBreadcrumbsNodes,
  calculatedTransition,
  alreadyProcessedTransition,
  employeeEditTransition,
  blockersViewAllTransition,
} from '../PayrollExecutionFlow/payrollExecutionMachine'
import { TransitionPayrollContextual } from './TransitionFlowComponents'
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

/**
 * Records the created transition payroll's UUID and flips the active breadcrumb to configuration
 * while keeping the entry compound node ({@link TransitionPayroll}) mounted, which internally
 * advances from its creation screen to configuration.
 */
const transitionCreatedTransition = transition(
  componentEvents.TRANSITION_CREATED,
  'transitionPayroll',
  reduce(
    (
      ctx: PayrollFlowContextInterface,
      ev: { payload?: { payrollUuid?: string } },
    ): PayrollFlowContextInterface => ({
      ...updateBreadcrumbs('configuration', ctx, {
        startDate: ctx.payPeriod?.startDate ?? '',
        endDate: ctx.payPeriod?.endDate ?? '',
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
 * The entry state `transitionPayroll` renders {@link TransitionPayroll} as a compound node. The
 * remaining states reuse the shared {@link payrollExecutionMachine} state map by object spread —
 * the first machine in the codebase to compose another machine's states this way (the existing
 * pattern is component nesting). The entry state reuses that machine's onward transition consts
 * (`calculatedTransition`, etc.) so the configuration events bubbled up from {@link TransitionPayroll}
 * route into the shared overview / edit-employee / blockers states.
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
