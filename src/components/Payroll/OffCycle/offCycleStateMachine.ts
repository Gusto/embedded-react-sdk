import { state, transition, reduce, guard } from 'robot3'
import {
  OffCycleExecutionContextual,
  OffCycleReasonSelectionContextual,
  type OffCycleFlowContextInterface,
} from './OffCycleFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

export const offCycleBreadcrumbsNodes: BreadcrumbNodes = {
  createOffCyclePayroll: {
    parent: null,
    item: {
      id: 'createOffCyclePayroll',
      label: 'createOffCyclePayroll.breadcrumbLabel',
      namespace: 'Payroll.OffCycle',
    },
  },
}

function toReasonSelectionReducer(ctx: OffCycleFlowContextInterface): OffCycleFlowContextInterface {
  return {
    ...ctx,
    component: OffCycleReasonSelectionContextual,
    payrollUuid: undefined,
    currentBreadcrumbId: 'createOffCyclePayroll',
    progressBarType: 'breadcrumbs',
  }
}

const reasonSelectionBreadcrumbTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'createOffCyclePayroll',
  guard(
    (_ctx: OffCycleFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'createOffCyclePayroll',
  ),
  reduce(toReasonSelectionReducer),
)

export const offCycleMachine = {
  createOffCyclePayroll: state<MachineTransition>(
    transition(
      componentEvents.OFF_CYCLE_CREATED,
      'execution',
      reduce(
        (
          ctx: OffCycleFlowContextInterface,
          ev: { payload?: { payrollUuid?: string } },
        ): OffCycleFlowContextInterface => ({
          ...ctx,
          payrollUuid: ev.payload?.payrollUuid,
          component: OffCycleExecutionContextual,
          progressBarType: null,
        }),
      ),
    ),
  ),

  execution: state<MachineTransition>(reasonSelectionBreadcrumbTransition),
}
