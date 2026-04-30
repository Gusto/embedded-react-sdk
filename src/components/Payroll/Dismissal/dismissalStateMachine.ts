import { state, transition, reduce, guard } from 'robot3'
import {
  DismissalPayPeriodSelectionContextual,
  DismissalExecutionContextual,
  type DismissalFlowContextInterface,
} from './DismissalFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { patchBreadcrumbsHeader } from '@/helpers/breadcrumbHelpers'

function toPayPeriodSelectionReducer(
  ctx: DismissalFlowContextInterface,
): DismissalFlowContextInterface {
  return {
    ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: 'payPeriodSelection' }),
    component: DismissalPayPeriodSelectionContextual,
    payrollUuid: undefined,
  }
}

export const dismissalBreadcrumbsNodes: BreadcrumbNodes = {
  payPeriodSelection: {
    parent: null,
    item: {
      id: 'payPeriodSelection',
      label: 'breadcrumbLabel',
      namespace: 'Payroll.Dismissal',
      onNavigate: toPayPeriodSelectionReducer as (context: unknown) => unknown,
    },
  },
}

const payPeriodSelectionBreadcrumbTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'payPeriodSelection',
  guard(
    (_ctx: DismissalFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'payPeriodSelection',
  ),
  reduce(toPayPeriodSelectionReducer),
)

export const dismissalMachine = {
  payPeriodSelection: state<MachineTransition>(
    transition(
      componentEvents.DISMISSAL_PAY_PERIOD_SELECTED,
      'execution',
      reduce(
        (
          ctx: DismissalFlowContextInterface,
          ev: { payload?: { payrollUuid?: string } },
        ): DismissalFlowContextInterface => ({
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          payrollUuid: ev.payload?.payrollUuid,
          component: DismissalExecutionContextual,
        }),
      ),
    ),
  ),

  execution: state<MachineTransition>(payPeriodSelectionBreadcrumbTransition),
}
