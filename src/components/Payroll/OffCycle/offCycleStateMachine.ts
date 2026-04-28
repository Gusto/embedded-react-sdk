import { state, transition, reduce, guard } from 'robot3'
import {
  OffCycleCreationContextual,
  OffCycleExecutionContextual,
  type OffCycleFlowContextInterface,
} from './OffCycleFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import { patchBreadcrumbsHeader } from '@/helpers/breadcrumbHelpers'

export const offCycleBreadcrumbsNodes: BreadcrumbNodes = {
  createOffCyclePayroll: {
    parent: null,
    item: {
      id: 'createOffCyclePayroll',
      label: 'createOffCyclePayroll.breadcrumbLabel',
      namespace: 'Payroll.OffCycle',
      onNavigate: ((ctx: OffCycleFlowContextInterface) => ({
        ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: 'createOffCyclePayroll' }),
        component: OffCycleCreationContextual,
        payrollUuid: undefined,
      })) as (context: unknown) => unknown,
    },
  },
}

function toCreationReducer(ctx: OffCycleFlowContextInterface): OffCycleFlowContextInterface {
  return {
    ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: 'createOffCyclePayroll' }),
    component: OffCycleCreationContextual,
    payrollUuid: undefined,
  }
}

const creationBreadcrumbTransition = transition(
  componentEvents.BREADCRUMB_NAVIGATE,
  'createOffCyclePayroll',
  guard(
    (_ctx: OffCycleFlowContextInterface, ev: { payload: { key: string } }) =>
      ev.payload.key === 'createOffCyclePayroll',
  ),
  reduce(toCreationReducer),
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
          ...patchBreadcrumbsHeader(ctx, { currentBreadcrumbId: undefined }),
          payrollUuid: ev.payload?.payrollUuid,
          component: OffCycleExecutionContextual,
        }),
      ),
    ),
  ),

  execution: state<MachineTransition>(creationBreadcrumbTransition),
}
